"""
Modelo da tabela 'analises_pre_abertura' - análises para quem ainda não abriu empresa
Feature: Ainda não tenho empresa
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean,
    DateTime, JSON, TypeDecorator, CHAR
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


class AnalisePreAbertura(Base):
    """
    Tabela para análises pré-abertura.
    Guarda os dados do formulário + resultados calculados + alertas.
    """
    
    __tablename__ = "analises_pre_abertura"
    
    # ========== IDENTIFICAÇÃO ==========
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(100), nullable=True, index=True)
    
    # ========== DADOS DO FORMULÁRIO ==========
    
    # Tipo de negócio
    tipo_negocio = Column(String(20), nullable=False)  # produto, servico
    tem_estoque = Column(Boolean, nullable=True)  # só para produto
    
    # Setor e localização
    setor = Column(String(50), nullable=False, index=True)
    estado = Column(String(2), nullable=False)
    cidade = Column(String(100), nullable=True)
    
    # Previsão de abertura
    mes_abertura = Column(Integer, nullable=False)  # 1-12
    ano_abertura = Column(Integer, nullable=False)  # 2024-2030
    
    # Financeiro
    capital_disponivel = Column(Numeric(15, 2), nullable=False)
    faturamento_esperado = Column(Numeric(15, 2), nullable=False)
    
    # Pró-labore
    prolabore = Column(String(20), nullable=False)  # sim, nao, nao_sei
    
    # Funcionários
    tem_funcionarios = Column(Boolean, nullable=False, default=False)
    faixa_funcionarios = Column(String(10), nullable=True)  # 1-2, 3-5, 6-10, 10+
    
    # Clientes
    clientes_garantidos = Column(String(20), nullable=False)  # sim, nao, parcialmente
    
    # ========== RESULTADOS CALCULADOS ==========
    
    # Capital
    capital_recomendado = Column(Numeric(15, 2), nullable=False)
    capital_diferenca_percentual = Column(Numeric(5, 2), nullable=False)
    capital_status = Column(String(20), nullable=False)  # acima, adequado, abaixo, muito_abaixo
    
    # Faturamento
    faturamento_referencia = Column(Numeric(15, 2), nullable=False)
    faturamento_diferenca_percentual = Column(Numeric(5, 2), nullable=False)
    faturamento_status = Column(String(20), nullable=False)
    
    # Detalhes do cálculo (para transparência)
    capital_base_setor = Column(Numeric(15, 2), nullable=False)
    custo_por_funcionario = Column(Numeric(15, 2), nullable=False)
    quantidade_funcionarios = Column(Numeric(4, 1), nullable=False, default=0)
    adicional_funcionarios = Column(Numeric(15, 2), nullable=False, default=0)
    adicional_estoque = Column(Numeric(15, 2), nullable=False, default=0)
    adicional_pressa = Column(Numeric(15, 2), nullable=False, default=0)
    adicional_tech_produto = Column(Numeric(15, 2), nullable=False, default=0)
    
    # Margem do setor (para referência)
    margem_setor = Column(String(20), nullable=False)  # ex: "25-35%"
    
    # ========== ALERTAS E CHECKLIST ==========
    alertas = Column(JSON, default=list)  # Lista de alertas selecionados
    checklist = Column(JSON, default=list)  # Lista de itens do checklist
    
    # Mensagem de contexto (ex: tech produto)
    mensagem_contexto = Column(String(500), nullable=True)
    
    # ========== METADADOS ==========
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<AnalisePreAbertura {self.setor} - {self.mes_abertura}/{self.ano_abertura}>"
