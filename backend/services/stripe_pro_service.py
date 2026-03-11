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

# URL base do frontend
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://leme.app.br")


async def criar_checkout_assinatura(usuario_id: str, email: str) -> dict:
    """
    Cria uma sessão de checkout no Stripe para assinatura mensal do Pro.

    O Stripe redireciona o usuário de volta para o frontend após o pagamento.
    O usuario_id fica salvo nos metadados para identificar quem pagou no webhook.
    """
    session = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=email,
        line_items=[{"price": STRIPE_PRO_PRICE_ID, "quantity": 1}],
        metadata={"usuario_id": usuario_id},
        success_url=f"{FRONTEND_URL}/dashboard/pro?assinatura=sucesso",
        cancel_url=f"{FRONTEND_URL}/assinar?cancelado=true",
    )

    return {
        "session_id": session.id,
        "checkout_url": session.url,
    }
