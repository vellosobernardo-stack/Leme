"""
Router para cron jobs do Leme Pro
Fase 6 — Reescrito com idempotência e regra de aniversário mensal

Endpoints:
- GET /api/v1/cron/lembrete-mensal — Envia lembrete no aniversário mensal da 1ª análise

Protegido por CRON_SECRET no header Authorization.
Configurar no cron-job.org: diariamente às 09:00 horário de Brasília.
"""

import calendar
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.usuario import Usuario
from models.analise import Analise
from services.email_service import enviar_email_lembrete_mensal
from config import get_settings

settings = get_settings()

router = APIRouter(
    prefix="/api/v1/cron",
    tags=["Cron"],
)

MESES_PT = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
}


def _verificar_cron_secret(authorization: str = Header(None)):
    """Valida o header de autenticação do cron-job.org."""
    if not settings.CRON_SECRET:
        raise HTTPException(status_code=500, detail="CRON_SECRET não configurado no servidor")
    if authorization != f"Bearer {settings.CRON_SECRET}":
        raise HTTPException(status_code=401, detail="Não autorizado")


def _calcular_dia_alvo(dia_aniversario: int, ano: int, mes: int) -> int:
    """
    Retorna o dia em que o lembrete deve disparar no mês/ano informados.

    Se a 1ª análise foi no dia 31 e o mês atual só tem 28 dias (ex: fevereiro),
    o lembrete dispara no último dia do mês atual.

    Exemplos:
    - aniversário dia 15, mês com 30 dias  → dia 15
    - aniversário dia 31, fevereiro normal → dia 28
    - aniversário dia 31, fevereiro bissex → dia 29
    - aniversário dia 30, fevereiro normal → dia 28
    """
    ultimo_dia_do_mes = calendar.monthrange(ano, mes)[1]
    return min(dia_aniversario, ultimo_dia_do_mes)


def _ja_enviou_neste_mes(ultimo_envio: datetime, hoje: datetime) -> bool:
    """
    Verifica se já enviamos o lembrete mensal pra esse usuário neste mês.
    Idempotência: mesmo que o cron rode 10x no mesmo dia, só envia uma vez por mês.
    """
    if ultimo_envio is None:
        return False
    return (
        ultimo_envio.year == hoje.year
        and ultimo_envio.month == hoje.month
    )


@router.get("/lembrete-mensal")
async def lembrete_mensal(
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    """
    Envia lembrete mensal para usuários Pro no "aniversário mensal" da 1ª análise.

    Regras:
    - Apenas usuários Pro ativos (pro_ativo = True)
    - Dispara no mesmo dia do mês em que o usuário fez a 1ª análise
      (com fallback pro último dia do mês se o aniversário não existe — ex: 31 em fev)
    - Pula se o usuário fez análise nos últimos 7 dias (não atrapalha quem está ativo)
    - Pula se já enviamos o lembrete neste mês (idempotência)

    Roda diariamente às 09:00 BRT no cron-job.org.
    """
    _verificar_cron_secret(authorization)

    hoje = datetime.now(timezone.utc)
    sete_dias_atras = hoje - timedelta(days=7)

    # Busca todos os usuários Pro ativos. A filtragem fina (dia-alvo, idempotência,
    # análise recente) é feita em Python pra deixar a lógica explícita e auditável.
    usuarios_pro = (
        db.query(Usuario)
        .filter(Usuario.pro_ativo == True)
        .all()
    )

    enviados = 0
    erros = 0
    pulados_dia_diferente = 0
    pulados_ja_enviado_no_mes = 0
    pulados_analise_recente = 0
    pulados_sem_analise = 0

    for usuario in usuarios_pro:
        # Busca a 1ª análise do usuário (mais antiga) — define o "aniversário mensal"
        primeira_analise = (
            db.query(Analise)
            .filter(Analise.usuario_id == str(usuario.id))
            .order_by(Analise.created_at.asc())
            .first()
        )

        if not primeira_analise or not primeira_analise.created_at:
            pulados_sem_analise += 1
            continue

        # Calcula o dia-alvo deste mês
        dia_aniversario = primeira_analise.created_at.day
        dia_alvo = _calcular_dia_alvo(dia_aniversario, hoje.year, hoje.month)

        if hoje.day != dia_alvo:
            pulados_dia_diferente += 1
            continue

        # Idempotência: já enviei esse mês?
        if _ja_enviou_neste_mes(usuario.ultimo_lembrete_mensal_em, hoje):
            pulados_ja_enviado_no_mes += 1
            continue

        # Pula quem fez análise nos últimos 7 dias
        if usuario.ultima_analise_em is not None:
            ultima_analise_utc = usuario.ultima_analise_em
            # Garante timezone-aware pra comparar com 'hoje'
            if ultima_analise_utc.tzinfo is None:
                ultima_analise_utc = ultima_analise_utc.replace(tzinfo=timezone.utc)
            if ultima_analise_utc > sete_dias_atras:
                pulados_analise_recente += 1
                continue

        # Busca a análise MAIS RECENTE pra extrair score, fôlego e mês de referência
        ultima_analise = (
            db.query(Analise)
            .filter(Analise.usuario_id == str(usuario.id))
            .order_by(Analise.created_at.desc())
            .first()
        )

        if not ultima_analise:
            pulados_sem_analise += 1
            continue

        # Calcula dias desde a última análise (pra texto do email)
        ultima_dt = ultima_analise.created_at
        if ultima_dt.tzinfo is None:
            ultima_dt = ultima_dt.replace(tzinfo=timezone.utc)
        dias_desde_analise = (hoje - ultima_dt).days

        # Mês/ano da última análise pra exibir no email
        mes_nome = MESES_PT.get(ultima_analise.mes_referencia, "")
        mes_ultima_analise = f"{mes_nome}/{ultima_analise.ano_referencia}"

        # Score e fôlego (com fallback pra 0 se nulo)
        score = int(ultima_analise.score_saude or 0)
        folego = int(ultima_analise.folego_caixa or 0)

        # Envia o email
        sucesso = await enviar_email_lembrete_mensal(
            nome_empresa=usuario.nome or "Empresário(a)",
            email=usuario.email,
            score_anterior=score,
            folego_anterior=folego,
            dias_desde_analise=dias_desde_analise,
            mes_ultima_analise=mes_ultima_analise,
        )

        if sucesso:
            # Marca como enviado ANTES de qualquer outra coisa, pra não correr
            # risco de enviar 2x se o servidor cair logo depois
            usuario.ultimo_lembrete_mensal_em = hoje.replace(tzinfo=None)
            db.commit()
            enviados += 1
        else:
            erros += 1

    return {
        "mensagem": "Lembrete mensal processado",
        "data_execucao": hoje.isoformat(),
        "total_pro_ativo": len(usuarios_pro),
        "enviados": enviados,
        "erros": erros,
        "pulados": {
            "dia_diferente_do_aniversario": pulados_dia_diferente,
            "ja_enviado_neste_mes": pulados_ja_enviado_no_mes,
            "analise_recente_7d": pulados_analise_recente,
            "sem_analise": pulados_sem_analise,
        },
    }