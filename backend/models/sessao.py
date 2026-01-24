"""
Modelo da tabela 'sessoes_analise' - rastreia início e abandono de análises
Feature: E-mail de abandono
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, TypeDecorator, CHAR, ForeignKey, Index
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


class SessaoAnalise(Base):
    """
    Tabela para rastrear sessões de análise.
    Permite identificar abandonos e disparar e-mails de recuperação.
    
    Status possíveis:
    - iniciada: usuário começou mas não terminou
    - concluida: análise finalizada com sucesso
    - abandono_email_1: primeiro e-mail de abandono enviado
    - abandono_email_2: segundo e-mail de abandono enviado
    - recuperada: usuário voltou e concluiu após abandono
    """
    
    __tablename__ = "sessoes_analise"
    
    # ========== IDENTIFICAÇÃO ==========
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    
    # Dados capturados no início do fluxo
    nome_empresa = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False, index=True)
    
    # ========== STATUS E VÍNCULO ==========
    status = Column(String(30), nullable=False, default="iniciada")
    # Quando concluída, vincula à análise gerada
    analise_id = Column(GUID(), ForeignKey("analises.id"), nullable=True)
    
    # ========== CONTROLE DE E-MAILS ==========
    email_1_enviado_em = Column(DateTime, nullable=True)  # 3-6h após início
    email_2_enviado_em = Column(DateTime, nullable=True)  # 48h após início
    
    # ========== METADADOS ==========
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Índice composto para buscar sessões abandonadas
    __table_args__ = (
        Index('idx_sessao_status_created', 'status', 'created_at'),
    )
    
    def __repr__(self):
        return f"<SessaoAnalise {self.nome_empresa} - {self.status}>"
