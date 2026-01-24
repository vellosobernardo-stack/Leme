"""
Router para processamento de e-mails de abandono
Feature: E-mail de abandono

Endpoints:
- POST /email/processar-abandonos - Processa todas as sessões abandonadas
- POST /email/teste/{sessao_id} - Envia e-mail de teste para uma sessão específica
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from services.abandono_job import processar_abandonos, processar_abandono_manual

router = APIRouter(
    prefix="/email",
    tags=["E-mail"]
)


@router.post("/processar-abandonos")
async def endpoint_processar_abandonos(db: Session = Depends(get_db)):
    """
    Processa todas as sessões abandonadas e envia e-mails.
    
    Este endpoint deve ser chamado periodicamente (ex: a cada 30 minutos)
    por um cron job ou scheduled task.
    
    Retorna estatísticas de quantos e-mails foram enviados.
    """
    
    stats = await processar_abandonos(db)
    
    return {
        "mensagem": "Processamento concluído",
        "estatisticas": stats,
    }


@router.post("/teste/{sessao_id}")
async def endpoint_enviar_teste(
    sessao_id: str,
    tipo: int = Query(1, description="Tipo do e-mail: 1 ou 2"),
    db: Session = Depends(get_db),
):
    """
    Envia um e-mail de teste para uma sessão específica.
    
    Útil para testar os templates sem esperar o tempo de abandono.
    
    Args:
        sessao_id: ID da sessão
        tipo: 1 para primeiro e-mail, 2 para segundo
    """
    
    if tipo not in [1, 2]:
        raise HTTPException(status_code=400, detail="Tipo deve ser 1 ou 2")
    
    sucesso = await processar_abandono_manual(db, sessao_id, tipo)
    
    if sucesso:
        return {"mensagem": f"E-mail {tipo} enviado com sucesso"}
    else:
        raise HTTPException(status_code=400, detail="Falha ao enviar e-mail. Verifique o ID da sessão e as configurações do Brevo.")
