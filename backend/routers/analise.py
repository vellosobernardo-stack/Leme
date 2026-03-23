"""
Endpoints da API de Análise Financeira
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.orm import Session

from database import get_db
from models.analise import Analise
from schemas.analise import (
    DadosAnaliseInput,
    AnaliseResponse,
    AnaliseResumo,
    IndicadoresCalculados,
    DiagnosticoPlano,
    ValidacaoResponse
)
from services.indicadores import calcular_indicadores
from services.diagnostico import gerar_diagnostico
from services.email_service import enviar_email_pos_conclusao, enviar_email_pos_analise_pro
from services.ia_service import gerar_resumo_executivo, gerar_comparativo_setorial

router = APIRouter(
    prefix="/api/v1/analise",
    tags=["Análise Financeira"]
)


def _extrair_usuario_id_do_cookie(request: Request, db: Session) -> str | None:
    """
    Tenta extrair o usuario_id do JWT no cookie.
    Retorna o ID se for Pro ativo, None caso contrário.
    Nunca lança exceção — análise Free não pode ser bloqueada.
    """
    try:
        from routers.auth import get_usuario_atual
        from jose import jwt, JWTError
        from config import get_settings

        settings = get_settings()
        token = request.cookies.get("leme_token")
        if not token:
            return None

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        usuario_id = payload.get("sub")
        if not usuario_id:
            return None

        from models.usuario import Usuario
        usuario = db.query(Usuario).filter(Usuario.email == usuario_id).first()
        if usuario and usuario.pro_ativo:
            return str(usuario.id)

        return None
    except Exception:
        return None


@router.post("/nova", response_model=AnaliseResponse, status_code=status.HTTP_201_CREATED)
async def criar_analise(
    dados: DadosAnaliseInput,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Cria uma nova análise financeira.
    Se o usuário estiver logado como Pro, vincula automaticamente
    e dispara geração de conteúdo via IA (resumo executivo + comparativo setorial).
    """

    # 1. Calcular indicadores
    indicadores = calcular_indicadores(dados)

    # 2. Gerar diagnóstico e plano de ação
    diagnostico = gerar_diagnostico(dados, indicadores)

    # 3. Detectar usuario_id (Pro logado) — sem bloquear Free
    usuario_id = _extrair_usuario_id_do_cookie(request, db)
    import logging; logging.getLogger(__name__).warning("DEBUG usuario_id: %s", usuario_id)

    # 4. Criar registro no banco
    analise = Analise(
        # Identificação
        nome_empresa=dados.nome_empresa,
        email=dados.email,

        # Vínculo Pro (nullable — Free fica None)
        usuario_id=usuario_id,

        # Básico
        setor=dados.setor.value,
        estado=dados.estado,
        mes_referencia=dados.mes_referencia,
        ano_referencia=dados.ano_referencia,

        # Receita e Histórico
        receita_3_meses_atras=dados.receita_historico.tres_meses_atras,
        receita_2_meses_atras=dados.receita_historico.dois_meses_atras,
        receita_mes_passado=dados.receita_historico.mes_passado,
        receita_atual=dados.receita_atual,

        # Custos e Despesas
        custo_vendas=dados.custo_vendas,
        despesas_fixas=dados.despesas_fixas,

        # Caixa e Fluxo
        caixa_bancos=dados.caixa_bancos,
        contas_receber=dados.contas_receber,
        contas_pagar=dados.contas_pagar,

        # Condicionais
        tem_estoque=dados.tem_estoque,
        estoque=dados.estoque,
        tem_dividas=dados.tem_dividas,
        dividas_totais=dados.dividas_totais,
        tem_bens=dados.tem_bens,
        bens_equipamentos=dados.bens_equipamentos,

        # Equipe
        num_funcionarios=dados.num_funcionarios,

        # Indicadores calculados
        margem_bruta=indicadores.margem_bruta,
        resultado_mes=indicadores.resultado_mes,
        folego_caixa=indicadores.folego_caixa,
        ponto_equilibrio=indicadores.ponto_equilibrio,
        ciclo_financeiro=indicadores.ciclo_financeiro,
        capital_minimo=indicadores.capital_minimo,
        receita_funcionario=indicadores.receita_funcionario,
        peso_divida=indicadores.peso_divida,

        # Destaque
        valor_empresa_min=indicadores.valor_empresa_min,
        valor_empresa_max=indicadores.valor_empresa_max,
        retorno_investimento=indicadores.retorno_investimento,

        # Tendência
        tendencia_receita=indicadores.tendencia_receita,
        tendencia_status=indicadores.tendencia_status,

        # Score
        score_saude=indicadores.score_saude,

        # Diagnóstico e Plano de Ação
        pontos_fortes=diagnostico["pontos_fortes"],
        pontos_atencao=diagnostico["pontos_atencao"],
        plano_30_dias=diagnostico["plano_30_dias"],
        plano_60_dias=diagnostico["plano_60_dias"],
        plano_90_dias=diagnostico["plano_90_dias"],

        # Alertas
        alertas_coerencia=dados.get_alertas(),

        # Rastreamento de parceiro
        ref_parceiro=dados.ref_parceiro,
    )

    db.add(analise)
    db.commit()
    db.refresh(analise)

    # 5. Gerar conteúdo via IA — apenas para usuários Pro
    # Free não dispara nenhuma chamada à Claude API
    if usuario_id:
        # Montar dict de indicadores para os prompts
        indicadores_dict = {
            "margem_bruta": float(indicadores.margem_bruta) if indicadores.margem_bruta is not None else None,
            "resultado_mes": float(indicadores.resultado_mes) if indicadores.resultado_mes is not None else None,
            "folego_caixa": indicadores.folego_caixa,
            "ciclo_financeiro": indicadores.ciclo_financeiro,
            "peso_divida": float(indicadores.peso_divida) if indicadores.peso_divida is not None else None,
            "receita_funcionario": float(indicadores.receita_funcionario) if indicadores.receita_funcionario is not None else None,
        }

        # Prioridade do mês = primeiro item do plano de 30 dias
        plano_prioridade = ""
        if diagnostico["plano_30_dias"]:
            primeiro = diagnostico["plano_30_dias"][0]
            # plano_30_dias pode ser lista de strings ou lista de dicts
            if isinstance(primeiro, dict):
                plano_prioridade = primeiro.get("titulo", "") or primeiro.get("acao", "")
            else:
                plano_prioridade = str(primeiro)

        # 5a. Resumo executivo — buscar score anterior se houver análises passadas
        try:
            from models.usuario import Usuario
            from sqlalchemy import desc

            score_anterior = None
            analise_anterior = (
                db.query(Analise)
                .filter(
                    Analise.usuario_id == usuario_id,
                    Analise.id != analise.id
                )
                .order_by(desc(Analise.created_at))
                .first()
            )
            if analise_anterior and analise_anterior.score_saude is not None:
                score_anterior = int(analise_anterior.score_saude)

            resumo = await gerar_resumo_executivo(
                score=int(indicadores.score_saude),
                indicadores=indicadores_dict,
                pontos_atencao=diagnostico["pontos_atencao"],
                plano_prioridade=plano_prioridade,
                setor=dados.setor.value,
                score_anterior=score_anterior,
            )
            analise.resumo_executivo = resumo  # None se falhou — frontend usa fallback

        except Exception as e:
            import logging
            logging.getLogger(__name__).error("Erro ao gerar resumo executivo: %s", e)
            # Não bloquear a criação da análise por falha de IA

        # 5b. Comparativo setorial
        try:
            setorial = await gerar_comparativo_setorial(
                indicadores=indicadores_dict,
                setor=dados.setor.value,
            )
            analise.comparativo_setorial = setorial  # None se falhou — frontend não exibe a seção

        except Exception as e:
            import logging
            logging.getLogger(__name__).error("Erro ao gerar comparativo setorial: %s", e)
            # Não bloquear a criação da análise por falha de IA

        # Salvar os campos de IA no banco
        db.commit()
        db.refresh(analise)

        
        # Atualizar ultima_analise_em no usuário
        from models.usuario import Usuario as UsuarioModel
        usuario_obj = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
        if usuario_obj:
            from datetime import datetime, timezone
            usuario_obj.ultima_analise_em = datetime.now(timezone.utc)
            db.commit()

        # 5c. Disparar e-mail pós-análise Pro em background
        if analise.resumo_executivo:
            from models.usuario import Usuario as UsuarioModel
            usuario_obj = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
            if usuario_obj:
                background_tasks.add_task(
                    enviar_email_pos_analise_pro,
                    nome_empresa=analise.nome_empresa,
                    email=analise.email,
                    score=int(analise.score_saude),
                    mes_referencia=analise.mes_referencia,
                    ano_referencia=analise.ano_referencia,
                    resumo_executivo=analise.resumo_executivo,
                    analise_id=str(analise.id),
                )

    # 6. Disparar e-mail pós-conclusão em background
    background_tasks.add_task(
        enviar_email_pos_conclusao,
        nome_empresa=analise.nome_empresa,
        email=analise.email,
        analise_id=str(analise.id)
    )

    # 7. Montar resposta
    return AnaliseResponse(
        id=analise.id,
        nome_empresa=analise.nome_empresa,
        email=analise.email,
        setor=analise.setor,
        estado=analise.estado,
        mes_referencia=analise.mes_referencia,
        ano_referencia=analise.ano_referencia,
        indicadores=indicadores,
        diagnostico=DiagnosticoPlano(
            pontos_fortes=analise.pontos_fortes or [],
            pontos_atencao=analise.pontos_atencao or [],
            plano_30_dias=analise.plano_30_dias or [],
            plano_60_dias=analise.plano_60_dias or [],
            plano_90_dias=analise.plano_90_dias or []
        ),
        alertas_coerencia=analise.alertas_coerencia or [],
        metodo_entrada=analise.metodo_entrada,
        created_at=analise.created_at
    )


@router.get("/{analise_id}", response_model=AnaliseResponse)
def buscar_analise(
    analise_id: UUID,
    db: Session = Depends(get_db)
):
    """Busca uma análise pelo ID."""
    analise = db.query(Analise).filter(Analise.id == analise_id).first()

    if not analise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Análise não encontrada"
        )

    indicadores = IndicadoresCalculados(
        margem_bruta=float(analise.margem_bruta) if analise.margem_bruta else None,
        resultado_mes=float(analise.resultado_mes) if analise.resultado_mes else None,
        folego_caixa=analise.folego_caixa,
        ponto_equilibrio=float(analise.ponto_equilibrio) if analise.ponto_equilibrio else None,
        ciclo_financeiro=analise.ciclo_financeiro,
        capital_minimo=float(analise.capital_minimo) if analise.capital_minimo else None,
        receita_funcionario=float(analise.receita_funcionario) if analise.receita_funcionario else None,
        peso_divida=float(analise.peso_divida) if analise.peso_divida else None,
        valor_empresa_min=float(analise.valor_empresa_min) if analise.valor_empresa_min else None,
        valor_empresa_max=float(analise.valor_empresa_max) if analise.valor_empresa_max else None,
        retorno_investimento=float(analise.retorno_investimento) if analise.retorno_investimento else None,
        tendencia_receita=float(analise.tendencia_receita) if analise.tendencia_receita else None,
        tendencia_status=analise.tendencia_status,
        score_saude=float(analise.score_saude) if analise.score_saude else None
    )

    return AnaliseResponse(
        id=analise.id,
        nome_empresa=analise.nome_empresa,
        email=analise.email,
        setor=analise.setor,
        estado=analise.estado,
        mes_referencia=analise.mes_referencia,
        ano_referencia=analise.ano_referencia,
        indicadores=indicadores,
        diagnostico=DiagnosticoPlano(
            pontos_fortes=analise.pontos_fortes or [],
            pontos_atencao=analise.pontos_atencao or [],
            plano_30_dias=analise.plano_30_dias or [],
            plano_60_dias=analise.plano_60_dias or [],
            plano_90_dias=analise.plano_90_dias or []
        ),
        alertas_coerencia=analise.alertas_coerencia or [],
        metodo_entrada=analise.metodo_entrada,
        created_at=analise.created_at
    )


@router.get("/email/{email}", response_model=list[AnaliseResumo])
def listar_por_email(
    email: str,
    db: Session = Depends(get_db)
):
    """Lista todas as análises de um email."""
    analises = db.query(Analise).filter(
        Analise.email == email
    ).order_by(
        Analise.created_at.desc()
    ).all()

    return [
        AnaliseResumo(
            id=a.id,
            nome_empresa=a.nome_empresa,
            setor=a.setor,
            mes_referencia=a.mes_referencia,
            ano_referencia=a.ano_referencia,
            score_saude=float(a.score_saude) if a.score_saude else None,
            tendencia_status=a.tendencia_status,
            created_at=a.created_at
        )
        for a in analises
    ]


@router.post("/validar", response_model=ValidacaoResponse)
def validar_dados(dados: DadosAnaliseInput):
    """Valida os dados antes de criar a análise."""
    return ValidacaoResponse(
        valido=True,
        alertas=dados.get_alertas(),
        erros=[]
    )