"""
Job para processar sessões abandonadas e enviar e-mails de recuperação
Feature: E-mail de abandono

Este job deve ser executado periodicamente (ex: a cada 30 minutos)
para verificar sessões abandonadas e disparar os e-mails apropriados.

Pode ser executado via:
- Cron job
- Railway scheduled task
- Endpoint manual para testes
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_

from models.sessao import SessaoAnalise
from services.email_service import enviar_email_abandono_1, enviar_email_abandono_2


async def processar_abandonos(db: Session) -> dict:
    """
    Processa todas as sessões abandonadas e envia e-mails.
    
    Regras:
    - E-mail 1: sessões com status 'iniciada' criadas há 3-6 horas
    - E-mail 2: sessões com status 'abandono_email_1' criadas há 48+ horas
    
    Returns:
        Estatísticas de processamento
    """
    
    agora = datetime.utcnow()
    stats = {
        "email_1_enviados": 0,
        "email_1_falhas": 0,
        "email_2_enviados": 0,
        "email_2_falhas": 0,
    }
    
    # ========== E-MAIL 1: 3-6 horas após início ==========
    # Busca sessões iniciadas há mais de 3 horas mas menos de 48 horas
    # que ainda não receberam nenhum e-mail
    
    limite_minimo_email_1 = agora - timedelta(hours=3)
    limite_maximo_email_1 = agora - timedelta(hours=48)
    
    sessoes_email_1 = db.query(SessaoAnalise).filter(
        and_(
            SessaoAnalise.status == "iniciada",
            SessaoAnalise.created_at <= limite_minimo_email_1,
            SessaoAnalise.created_at > limite_maximo_email_1,
            SessaoAnalise.email_1_enviado_em.is_(None),
        )
    ).all()
    
    for sessao in sessoes_email_1:
        sucesso = await enviar_email_abandono_1(
            nome_empresa=sessao.nome_empresa,
            email=sessao.email,
        )
        
        if sucesso:
            sessao.email_1_enviado_em = agora
            sessao.status = "abandono_email_1"
            stats["email_1_enviados"] += 1
        else:
            stats["email_1_falhas"] += 1
    
    # ========== E-MAIL 2: 48 horas após início ==========
    # Busca sessões que já receberam e-mail 1 há mais de 45 horas
    # (total de ~48h desde o início)
    
    limite_email_2 = agora - timedelta(hours=45)
    
    sessoes_email_2 = db.query(SessaoAnalise).filter(
        and_(
            SessaoAnalise.status == "abandono_email_1",
            SessaoAnalise.email_1_enviado_em <= limite_email_2,
            SessaoAnalise.email_2_enviado_em.is_(None),
        )
    ).all()
    
    for sessao in sessoes_email_2:
        sucesso = await enviar_email_abandono_2(
            nome_empresa=sessao.nome_empresa,
            email=sessao.email,
        )
        
        if sucesso:
            sessao.email_2_enviado_em = agora
            sessao.status = "abandono_email_2"
            stats["email_2_enviados"] += 1
        else:
            stats["email_2_falhas"] += 1
    
    # Commit das alterações
    db.commit()
    
    return stats


async def processar_abandono_manual(db: Session, sessao_id: str, tipo_email: int) -> bool:
    """
    Força o envio de um e-mail de abandono específico.
    Útil para testes.
    
    Args:
        db: Sessão do banco
        sessao_id: ID da sessão
        tipo_email: 1 ou 2
    
    Returns:
        True se enviou com sucesso
    """
    
    import uuid
    
    try:
        sessao_uuid = uuid.UUID(sessao_id)
    except ValueError:
        return False
    
    sessao = db.query(SessaoAnalise).filter(SessaoAnalise.id == sessao_uuid).first()
    
    if not sessao:
        return False
    
    agora = datetime.utcnow()
    
    if tipo_email == 1:
        sucesso = await enviar_email_abandono_1(
            nome_empresa=sessao.nome_empresa,
            email=sessao.email,
        )
        if sucesso:
            sessao.email_1_enviado_em = agora
            sessao.status = "abandono_email_1"
            db.commit()
        return sucesso
    
    elif tipo_email == 2:
        sucesso = await enviar_email_abandono_2(
            nome_empresa=sessao.nome_empresa,
            email=sessao.email,
        )
        if sucesso:
            sessao.email_2_enviado_em = agora
            sessao.status = "abandono_email_2"
            db.commit()
        return sucesso
    
    return False
