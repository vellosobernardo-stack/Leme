"""
Router para gerenciamento de sessões de análise
Feature: E-mail de abandono

Endpoints:
- POST /sessao/iniciar - Cria sessão quando usuário começa análise
- PATCH /sessao/{id}/concluir - Marca sessão como concluída
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid

from database import get_db
from models.sessao import SessaoAnalise

router = APIRouter(
    prefix="/sessao",
    tags=["Sessão"]
)


# ========== SCHEMAS ==========

class SessaoIniciarRequest(BaseModel):
    """Dados para iniciar uma sessão"""
    nome_empresa: str
    email: EmailStr


class SessaoIniciarResponse(BaseModel):
    """Resposta ao iniciar sessão"""
    sessao_id: str
    mensagem: str


class SessaoConcluirRequest(BaseModel):
    """Dados para concluir uma sessão"""
    analise_id: str


class SessaoResponse(BaseModel):
    """Resposta padrão de sessão"""
    id: str
    nome_empresa: str
    email: str
    status: str
    created_at: datetime


# ========== ENDPOINTS ==========

@router.post("/iniciar", response_model=SessaoIniciarResponse)
def iniciar_sessao(dados: SessaoIniciarRequest, db: Session = Depends(get_db)):
    """
    Cria uma nova sessão de análise.
    
    Chamado quando o usuário clica "Começar Análise" após preencher
    nome da empresa e e-mail.
    
    Isso permite rastrear abandonos e enviar e-mails de recuperação.
    """
    
    # Cria a sessão
    sessao = SessaoAnalise(
        nome_empresa=dados.nome_empresa,
        email=dados.email.lower().strip(),
        status="iniciada"
    )
    
    db.add(sessao)
    db.commit()
    db.refresh(sessao)
    
    return SessaoIniciarResponse(
        sessao_id=str(sessao.id),
        mensagem="Sessão iniciada com sucesso"
    )


@router.patch("/{sessao_id}/concluir")
def concluir_sessao(
    sessao_id: str, 
    dados: SessaoConcluirRequest, 
    db: Session = Depends(get_db)
):
    """
    Marca uma sessão como concluída e vincula à análise gerada.
    
    Chamado após o usuário completar todas as perguntas e a análise
    ser salva no banco.
    
    Isso cancela os e-mails de abandono para essa sessão.
    """
    
    try:
        sessao_uuid = uuid.UUID(sessao_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de sessão inválido")
    
    sessao = db.query(SessaoAnalise).filter(SessaoAnalise.id == sessao_uuid).first()
    
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    # Determina o status correto
    if sessao.status in ["abandono_email_1", "abandono_email_2"]:
        # Usuário voltou após receber e-mail de abandono
        sessao.status = "recuperada"
    else:
        sessao.status = "concluida"
    
    try:
        sessao.analise_id = uuid.UUID(dados.analise_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de análise inválido")
    
    sessao.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {
        "mensagem": "Sessão concluída com sucesso",
        "status": sessao.status
    }


@router.get("/{sessao_id}", response_model=SessaoResponse)
def buscar_sessao(sessao_id: str, db: Session = Depends(get_db)):
    """
    Busca uma sessão pelo ID.
    Útil para debug e verificação.
    """
    
    try:
        sessao_uuid = uuid.UUID(sessao_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de sessão inválido")
    
    sessao = db.query(SessaoAnalise).filter(SessaoAnalise.id == sessao_uuid).first()
    
    if not sessao:
        raise HTTPException(status_code=404, detail="Sessão não encontrada")
    
    return SessaoResponse(
        id=str(sessao.id),
        nome_empresa=sessao.nome_empresa,
        email=sessao.email,
        status=sessao.status,
        created_at=sessao.created_at
    )
