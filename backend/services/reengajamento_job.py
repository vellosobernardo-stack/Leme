"""
Job para processar e-mails de reengajamento (30 dias)
Feature: E-mail de 30 dias

Este job verifica análises concluídas há 30 dias e envia e-mail
convidando o usuário a fazer uma nova análise.

⚠ IMPORTANTE: Este job é apenas para usuários FREE (não-Pro).
Clientes Pro têm o fluxo de Lembrete Mensal Pro (cron diário) e
NÃO devem receber o email de 30 dias para evitar duplicidade.

Executado pelo mesmo cron job que processa abandonos.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from models.analise import Analise
from models.usuario import Usuario
from services.email_service import enviar_email_30_dias


async def processar_reengajamento_30_dias(db: Session) -> dict:
    """
    Processa análises concluídas há 30 dias e envia e-mail de reengajamento.

    Regras:
    - Análises criadas há 30 dias (+/- 1 dia de margem)
    - Que ainda não receberam e-mail de 30 dias
    - Apenas 1 e-mail por e-mail (não enviar duplicado se tiver múltiplas análises)
    - APENAS para usuários Free — clientes Pro têm o Lembrete Mensal Pro

    Returns:
        Estatísticas de processamento
    """

    agora = datetime.utcnow()
    stats = {
        "email_30d_enviados": 0,
        "email_30d_falhas": 0,
        "email_30d_ignorados": 0,
        "email_30d_pulados_pro": 0,  # contador novo
    }

    # Busca análises criadas entre 29 e 31 dias atrás
    # (margem de 1 dia para garantir que o cron capture)
    limite_minimo = agora - timedelta(days=31)
    limite_maximo = agora - timedelta(days=29)

    # LEFT JOIN com usuarios para checar pro_ativo.
    # Filtra fora quem é Pro: só vai email pra análise sem usuário (Free puro)
    # ou com usuário Free.
    analises = (
        db.query(Analise)
        .outerjoin(Usuario, Analise.usuario_id == Usuario.id)
        .filter(
            and_(
                Analise.created_at >= limite_minimo,
                Analise.created_at <= limite_maximo,
                Analise.email_30d_enviado_em.is_(None),
                or_(
                    Analise.usuario_id.is_(None),     # análise sem usuário (Free puro)
                    Usuario.pro_ativo.is_(False),     # usuário Free
                    Usuario.pro_ativo.is_(None),      # safety: usuário deletado
                )
            )
        )
        .all()
    )

    # Agrupa por e-mail para não enviar duplicado
    emails_processados = set()

    for analise in analises:
        # Pula se já enviou para este e-mail nesta execução
        if analise.email in emails_processados:
            stats["email_30d_ignorados"] += 1
            continue

        # Camada extra de segurança: dupla checagem se o usuário virou Pro
        # entre a query e este momento (corrida improvável mas possível).
        if analise.usuario_id:
            usuario = db.query(Usuario).filter(Usuario.id == analise.usuario_id).first()
            if usuario and usuario.pro_ativo:
                stats["email_30d_pulados_pro"] += 1
                continue

        sucesso = await enviar_email_30_dias(
            nome_empresa=analise.nome_empresa,
            email=analise.email,
        )

        if sucesso:
            analise.email_30d_enviado_em = agora
            stats["email_30d_enviados"] += 1
            emails_processados.add(analise.email)
        else:
            stats["email_30d_falhas"] += 1

    # Commit das alterações
    db.commit()

    return stats


async def enviar_email_30d_manual(db: Session, analise_id: str) -> bool:
    """
    Força o envio de um e-mail de 30 dias para uma análise específica.
    Útil para testes.

    ⚠ Esta função NÃO checa se o usuário é Pro — é exclusiva para teste manual.
    Use com cuidado em produção.

    Args:
        db: Sessão do banco
        analise_id: ID da análise

    Returns:
        True se enviou com sucesso
    """

    import uuid

    try:
        analise_uuid = uuid.UUID(analise_id)
    except ValueError:
        return False

    analise = db.query(Analise).filter(Analise.id == analise_uuid).first()

    if not analise:
        return False

    sucesso = await enviar_email_30_dias(
        nome_empresa=analise.nome_empresa,
        email=analise.email,
    )

    if sucesso:
        analise.email_30d_enviado_em = datetime.utcnow()
        db.commit()

    return sucesso