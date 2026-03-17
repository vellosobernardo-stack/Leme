"""
Endpoints de histórico de análises — usuários Pro

GET /api/v1/historico/                          → lista todas as análises do usuário logado
GET /api/v1/historico/{id}                      → retorna dados completos de uma análise específica
GET /api/v1/historico/comparativo               → retorna atual + anterior + variações calculadas
GET /api/v1/historico/{id}/fatores-score        → retorna fatores positivos e negativos do score
PATCH /api/v1/historico/{id}/vincular           → vincula análise existente ao usuário logado
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.analise import Analise
from routers.auth import get_usuario_atual

router = APIRouter(
    prefix="/api/v1/historico",
    tags=["Histórico Pro"]
)


def get_usuario_pro(usuario=Depends(get_usuario_atual)):
    """Garante que o usuário está autenticado E tem Pro ativo."""
    if not usuario.pro_ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recurso exclusivo do plano Pro"
        )
    return usuario


def _analise_para_dict_resumido(a: Analise) -> dict:
    """Serializa os campos de indicadores de uma análise."""
    return {
        "analise_id": str(a.id),
        "score": float(a.score_saude) if a.score_saude is not None else None,
        "mes_referencia": a.mes_referencia,
        "ano_referencia": a.ano_referencia,
        "indicadores": {
            "margem_bruta":        float(a.margem_bruta)        if a.margem_bruta        is not None else None,
            "resultado_mes":       float(a.resultado_mes)       if a.resultado_mes       is not None else None,
            "folego_caixa":        a.folego_caixa,
            "ponto_equilibrio":    float(a.ponto_equilibrio)    if a.ponto_equilibrio    is not None else None,
            "ciclo_financeiro":    a.ciclo_financeiro,
            "capital_minimo":      float(a.capital_minimo)      if a.capital_minimo      is not None else None,
            "receita_funcionario": float(a.receita_funcionario) if a.receita_funcionario is not None else None,
            "peso_divida":         float(a.peso_divida)         if a.peso_divida         is not None else None,
        },
        "pontos_atencao": a.pontos_atencao or [],
        # Fase 5 — campos de IA (nullable: Free e análises antigas retornam null)
        "resumo_executivo":      a.resumo_executivo,
        "comparativo_setorial":  a.comparativo_setorial,
    }


def _calcular_variacoes(atual: dict, anterior: dict) -> dict:
    """
    Calcula a variação de cada indicador entre duas análises.
    Retorna o delta e o status ('melhorou' | 'piorou' | 'estavel').

    Regra de estável: variação absoluta < 2% do valor anterior.
    Para indicadores onde valor mais alto é melhor (margem_bruta, resultado_mes,
    folego_caixa, capital_minimo, receita_funcionario): subiu = melhorou.
    Para indicadores onde valor mais baixo é melhor (ponto_equilibrio,
    ciclo_financeiro, peso_divida): subiu = piorou.
    """
    # True = maior é melhor | False = menor é melhor
    direcao = {
        "margem_bruta":        True,
        "resultado_mes":       True,
        "folego_caixa":        True,
        "ponto_equilibrio":    False,
        "ciclo_financeiro":    False,
        "capital_minimo":      True,
        "receita_funcionario": True,
        "peso_divida":         False,
    }

    variacoes = {}
    ind_atual     = atual["indicadores"]
    ind_anterior  = anterior["indicadores"]

    for campo, maior_e_melhor in direcao.items():
        v_atual    = ind_atual.get(campo)
        v_anterior = ind_anterior.get(campo)

        if v_atual is None or v_anterior is None:
            variacoes[campo] = None
            continue

        delta = v_atual - v_anterior

        # Threshold de estável: 2% do valor anterior (mínimo absoluto de 0.01)
        threshold = max(abs(v_anterior) * 0.02, 0.01)

        if abs(delta) < threshold:
            status_var = "estavel"
        elif maior_e_melhor:
            status_var = "melhorou" if delta > 0 else "piorou"
        else:
            status_var = "melhorou" if delta < 0 else "piorou"

        variacoes[campo] = {
            "valor":  round(delta, 2),
            "status": status_var,
        }

    # Score separado (maior é sempre melhor)
    score_delta = None
    if atual["score"] is not None and anterior["score"] is not None:
        score_delta = round(atual["score"] - anterior["score"], 1)

    variacoes["score"] = score_delta

    return variacoes


# Pesos fixos de cada indicador no score (soma = 100)
# Usado para identificar quais indicadores mais impactaram o resultado.
PESOS_SCORE = {
    "margem_bruta":        20,
    "resultado_mes":       20,
    "folego_caixa":        15,
    "ponto_equilibrio":    15,
    "ciclo_financeiro":    10,
    "capital_minimo":      10,
    "receita_funcionario":  5,
    "peso_divida":         10,
}

# Benchmarks de referência para determinar se o indicador contribuiu positiva
# ou negativamente. Cada entrada: (benchmark, maior_e_melhor)
BENCHMARKS = {
    "margem_bruta":        (40.0,   True),   # % — acima de 40 é saudável
    "resultado_mes":       (0.0,    True),   # R$ — positivo é saudável
    "folego_caixa":        (60.0,   True),   # dias — acima de 60 é saudável
    "ponto_equilibrio":    (None,   False),  # comparado com receita — lógica abaixo
    "ciclo_financeiro":    (45.0,   False),  # dias — abaixo de 45 é saudável
    "capital_minimo":      (0.0,    True),   # R$ — positivo é saudável
    "receita_funcionario": (None,   True),   # sem benchmark fixo — ignora
    "peso_divida":         (50.0,   False),  # % — abaixo de 50 é saudável
}

LABELS_POSITIVO = {
    "margem_bruta":        "Margem bruta acima da média",
    "resultado_mes":       "Resultado do mês positivo",
    "folego_caixa":        "Caixa cobre mais de 60 dias",
    "ciclo_financeiro":    "Ciclo financeiro controlado",
    "capital_minimo":      "Capital de giro positivo",
    "peso_divida":         "Nível de endividamento saudável",
    "receita_funcionario": "Boa produtividade por funcionário",
    "ponto_equilibrio":    "Receita acima do ponto de equilíbrio",
}

LABELS_NEGATIVO = {
    "margem_bruta":        "Margem bruta abaixo do esperado",
    "resultado_mes":       "Resultado do mês negativo",
    "folego_caixa":        "Pouco fôlego de caixa",
    "ciclo_financeiro":    "Ciclo financeiro elevado",
    "capital_minimo":      "Capital de giro negativo",
    "peso_divida":         "Peso da dívida alto",
    "receita_funcionario": "Baixa receita por funcionário",
    "ponto_equilibrio":    "Receita abaixo do ponto de equilíbrio",
}


def _calcular_fatores_score(analise: Analise) -> dict:
    """
    Lógica determinística: verifica cada indicador contra seu benchmark
    e classifica como positivo ou negativo, com impacto proporcional ao peso.
    """
    positivos = []
    negativos = []

    indicadores = {
        "margem_bruta":        float(analise.margem_bruta)        if analise.margem_bruta        is not None else None,
        "resultado_mes":       float(analise.resultado_mes)       if analise.resultado_mes        is not None else None,
        "folego_caixa":        analise.folego_caixa,
        "ponto_equilibrio":    float(analise.ponto_equilibrio)    if analise.ponto_equilibrio     is not None else None,
        "ciclo_financeiro":    analise.ciclo_financeiro,
        "capital_minimo":      float(analise.capital_minimo)      if analise.capital_minimo       is not None else None,
        "receita_funcionario": float(analise.receita_funcionario) if analise.receita_funcionario  is not None else None,
        "peso_divida":         float(analise.peso_divida)         if analise.peso_divida          is not None else None,
    }

    for campo, valor in indicadores.items():
        if valor is None:
            continue

        benchmark, maior_e_melhor = BENCHMARKS[campo]
        peso = PESOS_SCORE[campo]

        # Ponto de equilíbrio: compara com receita (sem benchmark fixo em R$)
        if campo == "ponto_equilibrio":
            receita = float(analise.resultado_mes or 0) + float(analise.ponto_equilibrio or 0)
            if receita > 0:
                e_positivo = valor < receita  # PE abaixo da receita = saudável
            else:
                continue
        elif benchmark is None:
            continue  # receita_funcionario sem benchmark — pula
        elif maior_e_melhor:
            e_positivo = valor >= benchmark
        else:
            e_positivo = valor <= benchmark

        entrada = {
            "label":   LABELS_POSITIVO[campo] if e_positivo else LABELS_NEGATIVO[campo],
            "impacto": peso if e_positivo else -peso,
        }

        if e_positivo:
            positivos.append(entrada)
        else:
            negativos.append(entrada)

    # Ordena por impacto absoluto (maior primeiro)
    positivos.sort(key=lambda x: x["impacto"], reverse=True)
    negativos.sort(key=lambda x: x["impacto"])

    return {"positivos": positivos, "negativos": negativos}


# ── GET /api/v1/historico/ ────────────────────────────────────────────────────

@router.get("/")
def listar_historico(
    usuario=Depends(get_usuario_pro),
    db: Session = Depends(get_db)
):
    """
    Retorna todas as análises vinculadas ao usuário autenticado,
    ordenadas da mais recente para a mais antiga.
    """
    analises = (
        db.query(Analise)
        .filter(Analise.usuario_id == usuario.id)
        .order_by(Analise.created_at.desc())
        .all()
    )

    return [
        {
            "id": str(a.id),
            "nome_empresa": a.nome_empresa,
            "setor": a.setor,
            "mes_referencia": a.mes_referencia,
            "ano_referencia": a.ano_referencia,
            "score_saude": float(a.score_saude) if a.score_saude else None,
            "tendencia_status": a.tendencia_status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in analises
    ]


# ── GET /api/v1/historico/comparativo ────────────────────────────────────────
# ATENÇÃO: esta rota deve ser declarada ANTES de /{analise_id}
# para que o FastAPI não interprete "comparativo" como um UUID.

@router.get("/comparativo")
def buscar_comparativo(
    usuario=Depends(get_usuario_pro),
    db: Session = Depends(get_db)
):
    """
    Retorna as duas análises mais recentes do usuário lado a lado,
    com as variações de cada indicador já calculadas.

    Se o usuário tiver apenas 1 análise, retorna anterior=null e variacoes=null.
    """
    analises = (
        db.query(Analise)
        .filter(Analise.usuario_id == usuario.id)
        .order_by(Analise.created_at.desc())
        .limit(2)
        .all()
    )

    if not analises:
        raise HTTPException(status_code=404, detail="Nenhuma análise encontrada")

    atual_dict = _analise_para_dict_resumido(analises[0])

    if len(analises) == 1:
        return {
            "atual":    atual_dict,
            "anterior": None,
            "variacoes": None,
            "pontos_atencao_anteriores": [],
        }

    anterior_dict = _analise_para_dict_resumido(analises[1])
    variacoes     = _calcular_variacoes(atual_dict, anterior_dict)

    # Lista de títulos dos pontos de atenção da análise anterior
    pontos_atencao_anteriores = [
        p.get("titulo", "") for p in (analises[1].pontos_atencao or [])
        if p.get("titulo")
    ]

    return {
        "atual":    atual_dict,
        "anterior": anterior_dict,
        "variacoes": variacoes,
        "pontos_atencao_anteriores": pontos_atencao_anteriores,
    }


# ── GET /api/v1/historico/{id} ────────────────────────────────────────────────

@router.get("/{analise_id}")
def buscar_analise_completa(
    analise_id: UUID,
    usuario=Depends(get_usuario_pro),
    db: Session = Depends(get_db)
):
    """
    Retorna os dados completos de uma análise específica.
    Valida que a análise pertence ao usuário autenticado.
    """
    analise = db.query(Analise).filter(Analise.id == analise_id).first()

    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")

    if str(analise.usuario_id) != str(usuario.id):
        raise HTTPException(status_code=403, detail="Acesso negado")

    return {
        "id": str(analise.id),
        "nome_empresa": analise.nome_empresa,
        "email": analise.email,
        "setor": analise.setor,
        "estado": analise.estado,
        "mes_referencia": analise.mes_referencia,
        "ano_referencia": analise.ano_referencia,
        # Indicadores
        "margem_bruta": float(analise.margem_bruta) if analise.margem_bruta else None,
        "resultado_mes": float(analise.resultado_mes) if analise.resultado_mes else None,
        "folego_caixa": analise.folego_caixa,
        "ponto_equilibrio": float(analise.ponto_equilibrio) if analise.ponto_equilibrio else None,
        "ciclo_financeiro": analise.ciclo_financeiro,
        "capital_minimo": float(analise.capital_minimo) if analise.capital_minimo else None,
        "receita_funcionario": float(analise.receita_funcionario) if analise.receita_funcionario else None,
        "peso_divida": float(analise.peso_divida) if analise.peso_divida else None,
        # Destaque
        "valor_empresa_min": float(analise.valor_empresa_min) if analise.valor_empresa_min else None,
        "valor_empresa_max": float(analise.valor_empresa_max) if analise.valor_empresa_max else None,
        "retorno_investimento": float(analise.retorno_investimento) if analise.retorno_investimento else None,
        # Tendência e score
        "tendencia_receita": float(analise.tendencia_receita) if analise.tendencia_receita else None,
        "tendencia_status": analise.tendencia_status,
        "score_saude": float(analise.score_saude) if analise.score_saude else None,
        # Diagnóstico
        "pontos_fortes": analise.pontos_fortes or [],
        "pontos_atencao": analise.pontos_atencao or [],
        "plano_30_dias": analise.plano_30_dias or [],
        "plano_60_dias": analise.plano_60_dias or [],
        "plano_90_dias": analise.plano_90_dias or [],
        # Fase 5 — campos de IA
        "resumo_executivo":     analise.resumo_executivo,
        "comparativo_setorial": analise.comparativo_setorial,
        # Meta
        "created_at": analise.created_at.isoformat() if analise.created_at else None,
    }


# ── GET /api/v1/historico/{id}/fatores-score ─────────────────────────────────

@router.get("/{analise_id}/fatores-score")
def buscar_fatores_score(
    analise_id: UUID,
    usuario=Depends(get_usuario_pro),
    db: Session = Depends(get_db)
):
    """
    Retorna os fatores que mais impactaram positiva e negativamente o score.
    Lógica 100% determinística — sem chamada à IA.
    """
    analise = db.query(Analise).filter(Analise.id == analise_id).first()

    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")

    if str(analise.usuario_id) != str(usuario.id):
        raise HTTPException(status_code=403, detail="Acesso negado")

    return _calcular_fatores_score(analise)


# ── PATCH /api/v1/historico/{id}/vincular ────────────────────────────────────

@router.patch("/{analise_id}/vincular")
def vincular_analise(
    analise_id: UUID,
    usuario=Depends(get_usuario_pro),
    db: Session = Depends(get_db)
):
    """
    Vincula uma análise existente ao usuário autenticado.
    Útil para associar análise feita antes do login.
    Só vincula se a análise ainda não tiver dono.
    """
    analise = db.query(Analise).filter(Analise.id == analise_id).first()

    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")

    if analise.usuario_id is not None:
        # Já tem dono — só aceita se for o mesmo usuário
        if str(analise.usuario_id) != str(usuario.id):
            raise HTTPException(status_code=403, detail="Análise já pertence a outro usuário")
        return {"ok": True, "mensagem": "Análise já estava vinculada a este usuário"}

    analise.usuario_id = usuario.id
    db.commit()

    return {"ok": True, "mensagem": "Análise vinculada com sucesso"}