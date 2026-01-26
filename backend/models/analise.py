"""
Modelo da tabela 'analises' - armazena os dados e resultados das análises
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, 
    DateTime, JSON, CheckConstraint, TypeDecorator, CHAR
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


class Analise(Base):
    """
    Tabela principal do Leme.
    Guarda os dados do formulário + indicadores calculados + diagnóstico.
    """
    
    __tablename__ = "analises"
    
    # ========== IDENTIFICAÇÃO ==========
    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    nome_empresa = Column(String(200), nullable=False)
    email = Column(String(100), nullable=False, index=True)
    
    # ========== INFORMAÇÕES BÁSICAS ==========
    setor = Column(String(50), nullable=False, index=True)
    estado = Column(String(2), nullable=False)
    mes_referencia = Column(Integer, nullable=False)  # 1-12
    ano_referencia = Column(Integer, nullable=False)  # 2020-2030
    
    # ========== RECEITA E HISTÓRICO (4 meses para tendência) ==========
    receita_3_meses_atras = Column(Numeric(15, 2), nullable=False)
    receita_2_meses_atras = Column(Numeric(15, 2), nullable=False)
    receita_mes_passado = Column(Numeric(15, 2), nullable=False)
    receita_atual = Column(Numeric(15, 2), nullable=False)
    
    # ========== CUSTOS E DESPESAS ==========
    custo_vendas = Column(Numeric(15, 2), nullable=False)
    despesas_fixas = Column(Numeric(15, 2), nullable=False)
    
    # ========== CAIXA E FLUXO ==========
    caixa_bancos = Column(Numeric(15, 2), nullable=False)
    contas_receber = Column(Numeric(15, 2), nullable=False)
    contas_pagar = Column(Numeric(15, 2), nullable=False)
    
    # ========== CONDICIONAIS ==========
    tem_estoque = Column(Boolean, default=False)
    estoque = Column(Numeric(15, 2), nullable=True)
    
    tem_dividas = Column(Boolean, default=False)
    dividas_totais = Column(Numeric(15, 2), nullable=True)
    
    tem_bens = Column(Boolean, default=False)
    bens_equipamentos = Column(Numeric(15, 2), nullable=True)
    
    # ========== EQUIPE ==========
    num_funcionarios = Column(Integer, nullable=False, default=1)
    
    # ========== INDICADORES CALCULADOS (8 do dashboard) ==========
    margem_bruta = Column(Numeric(5, 2), nullable=True)  # em %
    resultado_mes = Column(Numeric(15, 2), nullable=True)
    folego_caixa = Column(Integer, nullable=True)  # em dias
    ponto_equilibrio = Column(Numeric(15, 2), nullable=True)
    ciclo_financeiro = Column(Integer, nullable=True)  # em dias
    capital_minimo = Column(Numeric(15, 2), nullable=True)
    receita_funcionario = Column(Numeric(15, 2), nullable=True)
    peso_divida = Column(Numeric(5, 2), nullable=True)  # em %
    
    # ========== INDICADORES DESTAQUE (topo do dashboard) ==========
    valor_empresa_min = Column(Numeric(15, 2), nullable=True)
    valor_empresa_max = Column(Numeric(15, 2), nullable=True)
    retorno_investimento = Column(Numeric(5, 2), nullable=True)  # em anos
    
    # ========== TENDÊNCIA ==========
    tendencia_receita = Column(Numeric(5, 2), nullable=True)  # em %
    tendencia_status = Column(String(20), nullable=True)  # crescendo, estavel, caindo
    
    # ========== SCORE E DIAGNÓSTICO ==========
    score_saude = Column(Numeric(5, 2), nullable=True)
    pontos_fortes = Column(JSON, default=list)
    pontos_atencao = Column(JSON, default=list)
    plano_30_dias = Column(JSON, default=list)
    plano_60_dias = Column(JSON, default=list)
    plano_90_dias = Column(JSON, default=list)
    
    # ========== METADADOS ==========
    metodo_entrada = Column(String(20), default="manual")  # manual, dre, balanco
    alertas_coerencia = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # ========== CONTROLE DE E-MAILS ==========
    email_30d_enviado_em = Column(DateTime, nullable=True)  # E-mail de reengajamento 30 dias
    
    def __repr__(self):
        return f"<Analise {self.nome_empresa} - {self.mes_referencia}/{self.ano_referencia}>"