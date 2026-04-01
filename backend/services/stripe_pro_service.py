"""
Serviço Stripe para assinaturas do Leme Pro

Responsabilidades:
- Criar sessão de checkout para assinatura mensal
- Verificar status de uma sessão
"""

import stripe
import os

# Chave secreta do Stripe — vem da variável de ambiente
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Price ID do plano Pro mensal (R$97/mês)
STRIPE_PRO_PRICE_ID = os.getenv("STRIPE_PRO_PRICE_ID", "price_1T9nicFYVK9qebClXWvu8i7r")

# Price ID do plano Pro anual (R$900)
STRIPE_PRO_PRICE_ANUAL  = os.getenv("STRIPE_PRO_PRICE_ANUAL", "price_1TFZ8YFYVK9qebClEMbsAfFZ")


# URL base do frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://leme.app.br")


async def criar_checkout_assinatura(usuario_id: str, email: str, plano: str = "mensal") -> dict:
    """
    Cria uma sessão de checkout no Stripe para assinatura mensal ou anual do Pro.
    """
    STRIPE_PRO_PRICE_MENSAL = os.getenv("STRIPE_PRO_PRICE_ID", "price_1T9nicFYVK9qebClXWvu8i7r")
    price_id = STRIPE_PRO_PRICE_ANUAL if plano == "anual" else STRIPE_PRO_PRICE_MENSAL

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=email,
        line_items=[{"price": price_id, "quantity": 1}],
        metadata={"usuario_id": usuario_id},
        allow_promotion_codes=True,
        success_url=f"{FRONTEND_URL}/dashboard/pro?assinatura=sucesso",
        cancel_url=f"{FRONTEND_URL}/assinar?cancelado=true",
    )

    return {
        "session_id": session.id,
        "checkout_url": session.url,
    }

async def cancelar_assinatura(subscription_id: str) -> None:
    """
    Cancela a assinatura do usuário no Stripe imediatamente.
    """
    stripe.Subscription.delete(subscription_id)