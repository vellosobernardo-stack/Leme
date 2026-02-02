"""
Serviço de integração com Stripe para pagamentos
Features: Checkout Session, Webhook, Verificação de Status
"""

import stripe
from typing import Optional
from config import get_settings

settings = get_settings()

# Configura a chave do Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Serviço para integração com API do Stripe"""
    
    async def criar_checkout_session(
        self,
        analise_id: str,
        nome_empresa: str,
        email: str,
        valor_centavos: int = 1990,
        success_url: str = None,
        cancel_url: str = None
    ) -> dict:
        """
        Cria uma sessão de checkout no Stripe.
        O cliente é redirecionado para a página do Stripe para pagar.
        Sem CPF, sem complicação.
        
        Args:
            analise_id: ID da análise (salvo nos metadados)
            nome_empresa: Nome da empresa (aparece no checkout)
            email: E-mail do cliente (pré-preenchido)
            valor_centavos: Valor em centavos (1990 = R$ 19,90)
            success_url: URL de retorno após pagamento
            cancel_url: URL de retorno se cancelar
        
        Returns:
            dict com session_id e checkout_url
        """
        frontend_url = settings.FRONTEND_URL or "https://leme.app.br"
        
        if not success_url:
            success_url = f"{frontend_url}/dashboard/{analise_id}?pago=true"
        if not cancel_url:
            cancel_url = f"{frontend_url}/dashboard/{analise_id}"
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "brl",
                    "product_data": {
                        "name": "Plano de Ação - Leme",
                        "description": f"Plano de ação 30/60/90 dias para {nome_empresa}",
                    },
                    "unit_amount": valor_centavos,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=email,
            metadata={
                "analise_id": analise_id,
            }
        )
        
        return {
            "session_id": session.id,
            "checkout_url": session.url,
            "status": session.status
        }
    
    async def verificar_session(self, session_id: str) -> dict:
        """
        Verifica o status de uma sessão de checkout.
        
        Returns:
            dict com status e detalhes
        """
        session = stripe.checkout.Session.retrieve(session_id)
        
        return {
            "session_id": session.id,
            "status": session.payment_status,  # paid, unpaid, no_payment_required
            "analise_id": session.metadata.get("analise_id"),
            "customer_email": session.customer_email,
            "amount_total": session.amount_total,
        }


# Instância global do serviço
stripe_service = StripeService()
