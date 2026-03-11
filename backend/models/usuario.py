"""
Modelo da tabela 'usuarios' - usuários autenticados da versão Pro

NOVA TABELA — não interfere com analises, sessoes_analise ou analises_pre_abertura.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, DateTime, TypeDecorator, CHAR
)
from database import Base


# ========== TIPO UUID COMPATÍVEL COM SQLITE E POSTGRESQL ==========
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

    Campos de plano:
    - plano: "free" ou "pro"
    - pro_ativo: True quando assinatura está ativa no Stripe
    - pro_validade: data até quando o Pro é válido

    Campos Stripe:
    - stripe_customer_id: ID do cliente no Stripe
    - stripe_subscription_id: ID da assinatura ativa
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

    def __repr__(self):
        return f"<Usuario {self.email} - {self.plano}>"
