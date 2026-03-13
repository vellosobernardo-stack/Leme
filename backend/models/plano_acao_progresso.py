"""
Modelo da tabela 'plano_acao_progresso'
Persiste o estado dos checkboxes do plano de ação para usuários Pro.

Cada linha = um item marcado/desmarcado de uma análise específica.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, Integer, Boolean, String,
    DateTime, ForeignKey, UniqueConstraint, TypeDecorator, CHAR
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


class PlanoAcaoProgresso(Base):
    """
    Tabela de progresso do plano de ação (checkboxes).

    Cada linha representa o estado de um item do plano:
    - analise_id: qual análise
    - usuario_id: qual usuário (segurança extra)
    - periodo: '30', '60' ou '90' dias
    - indice_acao: posição do item na lista (0, 1, 2...)
    - marcado: True = checkbox marcado
    """

    __tablename__ = "plano_acao_progresso"

    # ========== IDENTIFICAÇÃO ==========
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)

    # ========== FKs ==========
    analise_id = Column(GUID(), ForeignKey("analises.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id = Column(GUID(), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)

    # ========== DADOS DO CHECKBOX ==========
    periodo = Column(String(2), nullable=False)   # '30', '60' ou '90'
    indice_acao = Column(Integer, nullable=False)  # posição na lista (0-based)
    marcado = Column(Boolean, nullable=False, default=True)

    # ========== METADADOS ==========
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ========== RESTRIÇÃO: um registro por (analise, usuario, periodo, indice) ==========
    __table_args__ = (
        UniqueConstraint("analise_id", "usuario_id", "periodo", "indice_acao", name="uq_progresso_item"),
    )

    # ========== RELACIONAMENTOS ==========
    analise = relationship("Analise", back_populates="progresso_plano")

    def __repr__(self):
        return f"<Progresso analise={self.analise_id} periodo={self.periodo} idx={self.indice_acao} marcado={self.marcado}>"
