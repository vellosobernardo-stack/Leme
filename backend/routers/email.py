"""
Router para processamento de e-mails de abandono e reengajamento
Features: E-mail de abandono, E-mail de 30 dias

Endpoints:
- POST /email/processar-abandonos - Processa sessões abandonadas
- POST /email/processar-30-dias - Processa análises para reengajamento
- POST /email/processar-todos - Processa abandonos + 30 dias (usado pelo cron)
- POST /email/teste/{sessao_id} - Envia e-mail de teste para uma sessão
- POST /email/teste-30d/{analise_id} - Envia e-mail de 30 dias de teste
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from services.abandono_job import processar_abandonos, processar_abandono_manual
from services.reengajamento_job import processar_reengajamento_30_dias, enviar_email_30d_manual

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
        "mensagem": "Processamento de abandonos concluído",
        "estatisticas": stats,
    }


@router.post("/processar-30-dias")
async def endpoint_processar_30_dias(db: Session = Depends(get_db)):
    """
    Processa análises concluídas há 30 dias e envia e-mails de reengajamento.
    
    Retorna estatísticas de quantos e-mails foram enviados.
    """
    
    stats = await processar_reengajamento_30_dias(db)
    
    return {
        "mensagem": "Processamento de 30 dias concluído",
        "estatisticas": stats,
    }


@router.post("/processar-todos")
async def endpoint_processar_todos(db: Session = Depends(get_db)):
    """
    Processa todos os tipos de e-mail: abandonos + 30 dias.
    
    Este é o endpoint principal para o cron job.
    """
    
    stats_abandonos = await processar_abandonos(db)
    stats_30d = await processar_reengajamento_30_dias(db)
    
    return {
        "mensagem": "Processamento completo concluído",
        "estatisticas": {
            "abandonos": stats_abandonos,
            "reengajamento_30d": stats_30d,
        },
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


@router.post("/teste-30d/{analise_id}")
async def endpoint_enviar_teste_30d(
    analise_id: str,
    db: Session = Depends(get_db),
):
    """
    Envia um e-mail de 30 dias de teste para uma análise específica.
    
    Útil para testar o template sem esperar 30 dias.
    
    Args:
        analise_id: ID da análise
    """
    
    sucesso = await enviar_email_30d_manual(db, analise_id)
    
    if sucesso:
        return {"mensagem": "E-mail de 30 dias enviado com sucesso"}
    else:
        raise HTTPException(status_code=400, detail="Falha ao enviar e-mail. Verifique o ID da análise e as configurações do Brevo.")