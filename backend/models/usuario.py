"""
Modelo da tabela 'usuarios' - usuários autenticados da versão Pro
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, TypeDecorator, CHAR
)
from sqlalchemy.orm import relationship
from database import Base


class GUID(TypeDecorator):
    """Tipo UUID que funciona tanto com SQLite quanto PostgreSQL"""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            from sqlalchemy.dialects.postgresql import UUID
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if isinstance(value, uuid.UUID):
                return str(value)
            else:
                return str(uuid.UUID(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if isinstance(value, uuid.UUID):
                return value
            else:
                return uuid.UUID(value)


class Usuario(Base):
    """
    Tabela de usuários autenticados do Leme Pro.
    """

    __tablename__ = "usuarios"

    # ========== IDENTIFICAÇÃO ==========
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    nome = Column(String(200), nullable=True)
    email = Column(String(100), nullable=False, unique=True, index=True)
    senha_hash = Column(String(255), nullable=False)

    # ========== PLANO ==========
    plano = Column(String(10), nullable=False, default="free")  # free | pro
    pro_ativo = Column(Boolean, default=False)
    pro_validade = Column(DateTime, nullable=True)

    # ========== STRIPE ==========
    stripe_customer_id = Column(String(100), nullable=True, unique=True)
    stripe_subscription_id = Column(String(100), nullable=True)

    # ========== METADADOS ==========
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ultima_analise_em = Column(DateTime(timezone=True), nullable=True)

    # ========== CONTROLE DE E-MAILS (Fase 6) ==========
    # Guarda a data do último envio do Lembrete Mensal Pro.
    # Usado para idempotência: garante que não enviamos o mesmo lembrete
    # mais de uma vez no mesmo mês para o mesmo usuário.
    ultimo_lembrete_mensal_em = Column(DateTime, nullable=True)

    # Guarda a data do envio do email de Boas-vindas Pro.
    # Disparado uma única vez no momento em que o usuário ativa o Pro
    # (via webhook do Stripe). Idempotência: webhooks podem ser entregues
    # várias vezes (retries, renovações), mas o email só sai uma.
    email_boas_vindas_pro_enviado_em = Column(DateTime, nullable=True)

    # ========== RESET DE SENHA ==========
    # Hash do token de reset de senha. Guardamos o HASH e não o token em si
    # pelo mesmo motivo da senha: se o banco vazar, o atacante não consegue
    # usar tokens roubados. O token original só existe no email enviado ao usuário.
    reset_token_hash = Column(String(255), nullable=True)

    # Quando o token expira. Definido como "agora + 1 hora" no momento da geração.
    # Após esse momento, o token não funciona mais e o usuário precisa pedir um novo.
    reset_token_expira_em = Column(DateTime, nullable=True)

    # ========== RELACIONAMENTOS (Fase 2) ==========
    analises = relationship("Analise", back_populates="usuario")

    def __repr__(self):
        return f"<Usuario {self.email} - {self.plano}>"