"""
Router para cron jobs do Leme Pro
Fase 6 — Novo arquivo

Endpoints:
- GET /api/v1/cron/lembrete-mensal — Envia lembrete para usuários Pro inativos há 28+ dias

Protegido por CRON_SECRET no header Authorization.
Configurar no cron-job.org: diariamente às 09:00 horário de Brasília.
"""

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


@router.get("/lembrete-mensal")
async def lembrete_mensal(
    db: Session = Depends(get_db),
    authorization: str = Header(None),
):
    """
    Envia lembrete mensal para usuários Pro que não fizeram análise em 28+ dias.

    Regras:
    - Apenas usuários Pro (pro_ativo = True)
    - Última análise entre 28 e 60 dias atrás
    - Não envia se o usuário fez análise nos últimos 7 dias
      (a janela 28–60d já garante isso, mas fica explícito no comentário)

    ⚠ Verificar antes do deploy: coluna ultima_analise_em deve existir na tabela usuarios.
    """
    _verificar_cron_secret(authorization)

    hoje = datetime.now(timezone.utc)
    limite_minimo = hoje - timedelta(days=28)   # não fez análise há pelo menos 28 dias
    limite_maximo = hoje - timedelta(days=60)   # mas não passou de 60 dias (evita usuários muito inativos)

    usuarios = (
        db.query(Usuario)
        .filter(
            Usuario.pro_ativo == True,
            Usuario.ultima_analise_em <= limite_minimo,
            Usuario.ultima_analise_em >= limite_maximo,
        )
        .all()
    )

    enviados = 0
    erros = 0

    for usuario in usuarios:
        # Busca a análise mais recente para pegar score e fôlego
        ultima_analise = (
            db.query(Analise)
            .filter(Analise.usuario_id == usuario.id)
            .order_by(Analise.criado_em.desc())
            .first()
        )

        if not ultima_analise:
            continue

        dias_desde_analise = (hoje - usuario.ultima_analise_em.replace(tzinfo=timezone.utc)).days

        # Nome do mês da última análise
        mes_ultima = MESES_PT.get(ultima_analise.mes_referencia, "")
        mes_ultima_analise = f"{mes_ultima}/{ultima_analise.ano_referencia}"

        # Fôlego: busca nos indicadores salvos ou usa fallback 0
        folego = 0
        if ultima_analise.indicadores:
            folego = int(ultima_analise.indicadores.get("folego_caixa", 0))

        sucesso = await enviar_email_lembrete_mensal(
            nome_empresa=usuario.nome,
            email=usuario.email,
            score_anterior=ultima_analise.score or 0,
            folego_anterior=folego,
            dias_desde_analise=dias_desde_analise,
            mes_ultima_analise=mes_ultima_analise,
        )

        if sucesso:
            enviados += 1
        else:
            erros += 1

    return {
        "mensagem": "Lembrete mensal processado",
        "usuarios_elegíveis": len(usuarios),
        "enviados": enviados,
        "erros": erros,
        "executado_em": hoje.isoformat(),
    }
