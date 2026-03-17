"""
Endpoint do ChatConsultor — Fase 5
POST /api/v1/chat/consultor

Requer autenticação Pro.
O histórico completo da conversa é enviado pelo frontend a cada mensagem
— o backend não armazena histórico de chat.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models.analise import Analise
from services.ia_service import (
    montar_system_prompt_chat,
    gerar_mensagem_abertura_chat,
)
import anthropic

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/chat",
    tags=["Chat Consultor"]
)

_client = anthropic.Anthropic()
MODELO_IA = "claude-sonnet-4-5"


# ========== SCHEMAS ==========

class MensagemHistorico(BaseModel):
    role: str   # "user" ou "assistant"
    content: str


class ChatConsultorRequest(BaseModel):
    mensagem: str
    analise_id: str
    historico: list[MensagemHistorico] = []


class ChatConsultorResponse(BaseModel):
    resposta: str


# ========== DEPENDÊNCIA: usuário Pro autenticado ==========

def get_usuario_pro(
    db: Session = Depends(get_db),
    # Reutiliza a função de auth já existente no projeto
):
    """
    Importação lazy para evitar import circular com routers.auth.
    Retorna o usuário autenticado e Pro ativo.
    """
    from routers.auth import get_usuario_atual
    return get_usuario_atual


# ========== ENDPOINT ==========

@router.post("/consultor", response_model=ChatConsultorResponse)
async def chat_consultor(
    body: ChatConsultorRequest,
    db: Session = Depends(get_db),
):
    """
    Endpoint do ChatConsultor Pro.

    - Busca a análise no banco para montar o contexto real
    - Se historico vazio: gera mensagem de abertura contextualizada
    - Se historico preenchido: responde à última mensagem do usuário
    - Requer que a análise pertença a um usuário Pro
    """

    # 1. Buscar análise no banco
    try:
        from uuid import UUID
        analise_uuid = UUID(body.analise_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="analise_id inválido"
        )

    analise = db.query(Analise).filter(Analise.id == analise_uuid).first()

    if not analise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Análise não encontrada"
        )

    # 2. Verificar que a análise pertence a um usuário Pro
    # (análises Free têm usuario_id = None)
    if not analise.usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ChatConsultor disponível apenas para usuários Pro"
        )

    # 3. Montar dict da análise para o system prompt
    analise_dict = {
        "score_saude": float(analise.score_saude) if analise.score_saude else 0,
        "setor": analise.setor,
        "folego_caixa": analise.folego_caixa or 0,
        "resultado_mes": float(analise.resultado_mes) if analise.resultado_mes else 0,
        "pontos_atencao": analise.pontos_atencao or [],
        "plano_30_dias": analise.plano_30_dias or [],
    }

    # 4. Histórico vazio = primeira abertura → gerar mensagem de abertura
    if not body.historico:
        try:
            abertura = await gerar_mensagem_abertura_chat(analise_dict)
            return ChatConsultorResponse(resposta=abertura)
        except Exception as e:
            logger.error("Erro ao gerar abertura do chat: %s", e)
            score = int(analise_dict["score_saude"])
            return ChatConsultorResponse(
                resposta=f"Olá! Estou aqui para ajudar com a análise financeira da sua empresa (score {score}/100). O que você quer explorar?"
            )

    # 5. Histórico preenchido → responder à mensagem do usuário
    system_prompt = montar_system_prompt_chat(analise_dict)

    # Converter histórico para formato da Claude API
    mensagens_api = [
        {"role": msg.role, "content": msg.content}
        for msg in body.historico
    ]

    # Adicionar a mensagem atual do usuário
    mensagens_api.append({"role": "user", "content": body.mensagem})

    try:
        resposta = _client.messages.create(
            model=MODELO_IA,
            max_tokens=600,
            system=system_prompt,
            messages=mensagens_api,
        )
        texto = resposta.content[0].text.strip()
        return ChatConsultorResponse(resposta=texto)

    except Exception as e:
        logger.error("Erro na chamada ao ChatConsultor: %s", e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Serviço de chat temporariamente indisponível. Tente novamente em instantes."
        )
