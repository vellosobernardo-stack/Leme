"""
Endpoints de histórico de análises — usuários Pro

GET /api/v1/historico/          → lista todas as análises do usuário logado
GET /api/v1/historico/{id}      → retorna dados completos de uma análise específica
PATCH /api/v1/historico/{id}/vincular → vincula análise existente ao usuário logado
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
        # Meta
        "created_at": analise.created_at.isoformat() if analise.created_at else None,
    }


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
