"""
Router de Pagamentos - Integração com Stripe
Features: Checkout Session, Webhook, Verificação de Status
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import stripe

from database import get_db
from models.analise import Analise
from services.stripe_service import stripe_service
from config import get_settings

settings = get_settings()

router = APIRouter(
    prefix="/pagamento",
    tags=["Pagamento"]
)


# ========== SCHEMAS ==========

class CriarCheckoutRequest(BaseModel):
    analise_id: str


class CheckoutResponse(BaseModel):
    session_id: str
    checkout_url: str


class StatusPagamentoResponse(BaseModel):
    analise_id: str
    pago: bool
    pago_em: Optional[datetime] = None


# ========== ENDPOINTS ==========

@router.post("/criar-checkout", response_model=CheckoutResponse)
async def criar_checkout(
    request: CriarCheckoutRequest,
    db: Session = Depends(get_db)
):
    """
    Cria uma sessão de checkout no Stripe.
    Retorna a URL para redirecionar o usuário para o pagamento.
    Sem CPF, sem cadastro prévio.
    """
    # Busca análise
    analise = db.query(Analise).filter(Analise.id == request.analise_id).first()
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Verifica se já está pago
    if analise.pago:
        raise HTTPException(status_code=400, detail="Esta análise já foi paga")
    
    try:
        resultado = await stripe_service.criar_checkout_session(
            analise_id=str(analise.id),
            nome_empresa=analise.nome_empresa,
            email=analise.email
        )
        
        # Salva session_id na análise
        analise.stripe_session_id = resultado["session_id"]
        db.commit()
        
        return CheckoutResponse(
            session_id=resultado["session_id"],
            checkout_url=resultado["checkout_url"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{analise_id}", response_model=StatusPagamentoResponse)
async def status_pagamento(
    analise_id: str,
    db: Session = Depends(get_db)
):
    """
    Verifica se uma análise já foi paga.
    Usado pelo frontend para decidir se mostra paywall ou conteúdo.
    """
    analise = db.query(Analise).filter(Analise.id == analise_id).first()
    
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Bypass para admin
    if analise.email == settings.ADMIN_EMAIL:
        return StatusPagamentoResponse(
            analise_id=str(analise.id),
            pago=True,
            pago_em=None
        )
    
    return StatusPagamentoResponse(
        analise_id=str(analise.id),
        pago=analise.pago or False,
        pago_em=analise.pago_em
    )


@router.get("/verificar-session/{session_id}")
async def verificar_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Verifica o status de uma sessão de checkout do Stripe.
    Usado como fallback caso o webhook demore.
    """
    try:
        resultado = await stripe_service.verificar_session(session_id)
        
        # Se pago, atualiza a análise
        if resultado["status"] == "paid":
            analise_id = resultado["analise_id"]
            if analise_id:
                analise = db.query(Analise).filter(
                    Analise.id == analise_id
                ).first()
                
                if analise and not analise.pago:
                    analise.pago = True
                    analise.pago_em = datetime.utcnow()
                    db.commit()
        
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def webhook_stripe(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Webhook para receber notificações do Stripe.
    Chamado automaticamente quando um pagamento é confirmado.
    
    Configure no Stripe Dashboard:
    URL: https://leme.app.br/pagamento/webhook
    Evento: checkout.session.completed
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    # Se tem webhook secret configurado, valida a assinatura
    if settings.STRIPE_WEBHOOK_SECRET:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Payload inválido")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Assinatura inválida")
    else:
        # Em desenvolvimento, aceita sem validar assinatura
        import json
        event = json.loads(payload)
    
    print(f"[Webhook Stripe] Evento: {event.get('type', event.get('id', 'unknown'))}")
    
    # Processa evento de checkout concluído
    event_type = event.get("type", "")
    
    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        analise_id = session.get("metadata", {}).get("analise_id")
        payment_status = session.get("payment_status")
        
        print(f"[Webhook Stripe] Análise: {analise_id}, Status: {payment_status}")
        
        if analise_id and payment_status == "paid":
            analise = db.query(Analise).filter(
                Analise.id == analise_id
            ).first()
            
            if analise:
                analise.pago = True
                analise.pago_em = datetime.utcnow()
                analise.stripe_session_id = session.get("id")
                db.commit()
                
                print(f"[Webhook Stripe] ✅ Pagamento confirmado para análise {analise_id}")
            else:
                print(f"[Webhook Stripe] ⚠️ Análise não encontrada: {analise_id}")
    
    return {"status": "ok"}


@router.post("/liberar/{analise_id}")
async def liberar_acesso_manual(
    analise_id: str,
    db: Session = Depends(get_db)
):
    """
    Libera acesso manualmente (uso administrativo/testes).
    """
    analise = db.query(Analise).filter(Analise.id == analise_id).first()
    
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    analise.pago = True
    analise.pago_em = datetime.utcnow()
    db.commit()
    
    return {
        "status": "ok",
        "mensagem": f"Acesso liberado para análise {analise_id}"
    }


class ConfirmarRetornoRequest(BaseModel):
    analise_id: str


@router.post("/confirmar-retorno")
async def confirmar_retorno_stripe(
    request: ConfirmarRetornoRequest,
    db: Session = Depends(get_db)
):
    """
    Chamado quando o usuário volta do Stripe com ?pago=true.
    Verifica a session no Stripe e libera o acesso se pago.
    """
    analise = db.query(Analise).filter(
        Analise.id == request.analise_id
    ).first()
    
    if not analise:
        raise HTTPException(status_code=404, detail="Análise não encontrada")
    
    # Se já está pago, retorna direto
    if analise.pago:
        return {"confirmado": True, "mensagem": "Já estava liberado"}
    
    # Se tem session_id, verifica no Stripe
    if analise.stripe_session_id:
        try:
            resultado = await stripe_service.verificar_session(analise.stripe_session_id)
            
            if resultado["status"] == "paid":
                analise.pago = True
                analise.pago_em = datetime.utcnow()
                db.commit()
                return {"confirmado": True, "mensagem": "Pagamento confirmado"}
        except Exception as e:
            print(f"[Confirmar Retorno] Erro ao verificar session: {e}")
    
    return {"confirmado": False, "mensagem": "Pagamento ainda não confirmado"}