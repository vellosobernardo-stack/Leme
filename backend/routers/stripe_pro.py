"""
Router Stripe Pro — assinatura recorrente do Leme Pro

Endpoints:
- POST /stripe-pro/criar-checkout  — abre o Stripe Checkout para assinar
- POST /stripe-pro/webhook         — recebe eventos do Stripe (pagamento, cancelamento)
"""

import stripe
import os
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from models.usuario import Usuario
from routers.auth import get_usuario_atual
from services.stripe_pro_service import criar_checkout_assinatura

router = APIRouter(
    prefix="/stripe-pro",
    tags=["Stripe Pro"]
)

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")


# ========== CRIAR CHECKOUT ==========

@router.post("/criar-checkout")
async def criar_checkout(
    usuario: Usuario = Depends(get_usuario_atual),
    db: Session = Depends(get_db)
):
    """
    Cria a sessão de checkout do Stripe para o usuário logado assinar o Pro.

    Requer que o usuário esteja autenticado (cookie leme_token).
    Retorna a URL para redirecionar o usuário para a página de pagamento do Stripe.
    """
    if usuario.pro_ativo:
        raise HTTPException(status_code=400, detail="Você já tem o Pro ativo")

    try:
        resultado = await criar_checkout_assinatura(
            usuario_id=str(usuario.id),
            email=usuario.email,
        )
        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ========== WEBHOOK ==========

@router.post("/webhook")
async def webhook_stripe_pro(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Recebe eventos do Stripe e atualiza o status Pro do usuário.

    Eventos tratados:
    - checkout.session.completed   → ativa pro_ativo = True
    - customer.subscription.deleted → desativa pro_ativo = False
    - invoice.payment_failed        → log (por enquanto não desativa)

    Configure no Stripe Dashboard:
    URL: https://sua-api.railway.app/stripe-pro/webhook
    Eventos: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # Valida assinatura do Stripe (garante que veio do Stripe de verdade)
    if STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Payload inválido")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Assinatura inválida")
    else:
        # Sem webhook secret (só deve acontecer em dev local)
        event = json.loads(payload)
        print("[Stripe Pro Webhook] ⚠️ Rodando sem validação de assinatura")

    event_type = event.get("type", "")
    print(f"[Stripe Pro Webhook] Evento recebido: {event_type}")

    # ── PAGAMENTO CONFIRMADO ──────────────────────────────────────────────────
    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        usuario_id = session.get("metadata", {}).get("usuario_id")
        subscription_id = session.get("subscription")
        customer_id = session.get("customer")

        print(f"[Stripe Pro Webhook] usuario_id={usuario_id}, subscription={subscription_id}")

        if usuario_id:
            from models.usuario import GUID
            import uuid
            usuario = db.query(Usuario).filter(
                Usuario.id == uuid.UUID(usuario_id)
            ).first()

            if usuario:
                usuario.pro_ativo = True
                usuario.plano = "pro"
                usuario.stripe_customer_id = customer_id
                usuario.stripe_subscription_id = subscription_id
                usuario.updated_at = datetime.utcnow()
                db.commit()
                print(f"[Stripe Pro Webhook] ✅ Pro ativado para {usuario.email}")
            else:
                print(f"[Stripe Pro Webhook] ⚠️ Usuário não encontrado: {usuario_id}")

    # ── ASSINATURA CANCELADA ──────────────────────────────────────────────────
    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        customer_id = subscription.get("customer")

        usuario = db.query(Usuario).filter(
            Usuario.stripe_customer_id == customer_id
        ).first()

        if usuario:
            usuario.pro_ativo = False
            usuario.plano = "free"
            usuario.stripe_subscription_id = None
            usuario.updated_at = datetime.utcnow()
            db.commit()
            print(f"[Stripe Pro Webhook] ❌ Pro desativado para {usuario.email}")
        else:
            print(f"[Stripe Pro Webhook] ⚠️ Usuário não encontrado para customer: {customer_id}")

    # ── PAGAMENTO FALHOU ─────────────────────────────────────────────────────
    elif event_type == "invoice.payment_failed":
        invoice = event["data"]["object"]
        customer_id = invoice.get("customer")
        print(f"[Stripe Pro Webhook] ⚠️ Pagamento falhou para customer: {customer_id}")
        # Por enquanto só loga — o Stripe tenta cobrar novamente automaticamente

    return {"status": "ok"}
