"""
Endpoints de progresso do plano de ação — checkboxes persistentes no banco

POST /api/v1/progresso/{analise_id}  → salva ou atualiza estado de um item
GET  /api/v1/progresso/{analise_id}  → retorna todos os itens marcados da análise
"""

import uuid
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

from database import get_db
from models.analise import Analise
from models.plano_acao_progresso import PlanoAcaoProgresso
from routers.auth import get_usuario_atual

router = APIRouter(
    prefix="/api/v1/progresso",
    tags=["Progresso Plano de Ação"]
)


# ── Schema de entrada ─────────────────────────────────────────────────────────

class ProgressoInput(BaseModel):
    periodo: Literal["30", "60", "90"]
    indice_acao: int
    marcado: bool


# ── POST /api/v1/progresso/{analise_id} ───────────────────────────────────────

@router.post("/{analise_id}")
def salvar_progresso(
    analise_id: UUID,
    dados: ProgressoInput,
    usuario=Depends(get_usuario_atual),
    db: Session = Depends(get_db)
):
    """
    Salva ou atualiza o estado de um checkbox do plano de ação.
    Usa UPSERT: se o item já existe, atualiza; se não, cria.
    """
    # Verifica se a análise existe e pertence ao usuário
    analise = db.query(Analise).filter(Analise.id == analise_id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    if str(analise.usuario_id) != str(usuario.id):
        raise HTTPException(status_code=403, detail="Acesso negado")

    # Busca registro existente
    item = db.query(PlanoAcaoProgresso).filter(
        PlanoAcaoProgresso.analise_id == analise_id,
        PlanoAcaoProgresso.usuario_id == usuario.id,
        PlanoAcaoProgresso.periodo == dados.periodo,
        PlanoAcaoProgresso.indice_acao == dados.indice_acao,
    ).first()

    if item:
        # Atualiza
        item.marcado = dados.marcado
    else:
        # Cria novo
        item = PlanoAcaoProgresso(
            id=uuid.uuid4(),
            analise_id=analise_id,
            usuario_id=usuario.id,
            periodo=dados.periodo,
            indice_acao=dados.indice_acao,
            marcado=dados.marcado,
        )
        db.add(item)

    db.commit()
    return {"ok": True}


# ── GET /api/v1/progresso/{analise_id} ────────────────────────────────────────

@router.get("/{analise_id}")
def buscar_progresso(
    analise_id: UUID,
    usuario=Depends(get_usuario_atual),
    db: Session = Depends(get_db)
):
    """
    Retorna todos os itens marcados de uma análise para o usuário autenticado.
    O frontend usa isso para restaurar o estado dos checkboxes.
    """
    # Verifica se a análise existe e pertence ao usuário
    analise = db.query(Analise).filter(Analise.id == analise_id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    if str(analise.usuario_id) != str(usuario.id):
        raise HTTPException(status_code=403, detail="Acesso negado")

    itens = db.query(PlanoAcaoProgresso).filter(
        PlanoAcaoProgresso.analise_id == analise_id,
        PlanoAcaoProgresso.usuario_id == usuario.id,
    ).all()

    return [
        {
            "periodo": i.periodo,
            "indice_acao": i.indice_acao,
            "marcado": i.marcado,
        }
        for i in itens
    ]
