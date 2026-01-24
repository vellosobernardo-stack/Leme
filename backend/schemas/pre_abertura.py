"""
Schemas de validação para análise pré-abertura de empresa
Feature: Ainda não tenho empresa
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, EmailStr


# ========== ENUMS ==========

class TipoNegocioEnum(str, Enum):
    """Tipo de negócio: produto ou serviço"""
    PRODUTO = "produto"
    SERVICO = "servico"


class SetorEnum(str, Enum):
    """21 setores de atuação (mesmo do fluxo principal)"""
    COMERCIO_VAREJO = "comercio_varejo"
    COMERCIO_ATACADO = "comercio_atacado"
    SERVICOS = "servicos"
    INDUSTRIA = "industria"
    TECNOLOGIA = "tecnologia"
    ALIMENTACAO = "alimentacao"
    SAUDE = "saude"
    EDUCACAO = "educacao"
    CONSTRUCAO = "construcao"
    AGRONEGOCIO = "agronegocio"
    TRANSPORTE = "transporte"
    HOTELARIA_TURISMO = "hotelaria_turismo"
    IMOBILIARIO = "imobiliario"
    FINANCEIRO = "financeiro"
    COMUNICACAO = "comunicacao"
    ENERGIA = "energia"
    TEXTIL = "textil"
    METALURGICO = "metalurgico"
    MOVEIS = "moveis"
    GRAFICO = "grafico"
    RECICLAGEM = "reciclagem"


class ProLaboreEnum(str, Enum):
    """Opções de pró-labore"""
    SIM = "sim"
    NAO = "nao"
    NAO_SEI = "nao_sei"


class FaixaFuncionariosEnum(str, Enum):
    """Faixas de funcionários"""
    FAIXA_1_2 = "1-2"
    FAIXA_3_5 = "3-5"
    FAIXA_6_10 = "6-10"
    FAIXA_10_MAIS = "10+"


class ClientesGarantidosEnum(str, Enum):
    """Opções de clientes garantidos"""
    SIM = "sim"
    NAO = "nao"
    PARCIALMENTE = "parcialmente"


class CategoriaAlertaEnum(str, Enum):
    """Categorias de alerta"""
    FINANCEIRO = "financeiro"
    OPERACIONAL = "operacional"
    ESTRUTURAL = "estrutural"


class SeveridadeAlertaEnum(str, Enum):
    """Severidade do alerta"""
    POSITIVO = "positivo"
    ATENCAO = "atencao"
    ALERTA = "alerta"


# Lista de estados brasileiros
ESTADOS_BR = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]


# ========== SCHEMAS DE ENTRADA ==========

class PreAberturaInput(BaseModel):
    """
    Dados de entrada para análise pré-abertura.
    Corresponde ao formulário de 10-12 perguntas.
    """
    
    # Email para contato (opcional nesta versão)
    email: Optional[EmailStr] = Field(None, description="Email para contato")
    
    # Pergunta 1: Tipo de negócio
    tipo_negocio: TipoNegocioEnum = Field(
        ...,
        description="Produto ou serviço"
    )
    
    # Pergunta 2: Estoque (condicional - só se produto)
    tem_estoque: Optional[bool] = Field(
        None,
        description="Vai trabalhar com estoque físico? (só para produto)"
    )
    
    # Pergunta 3: Setor
    setor: SetorEnum = Field(
        ...,
        description="Setor de atuação"
    )
    
    # Pergunta 4: Localização
    estado: str = Field(
        ...,
        min_length=2,
        max_length=2,
        description="Estado (UF)"
    )
    cidade: Optional[str] = Field(
        None,
        max_length=100,
        description="Cidade de operação"
    )
    
    # Pergunta 5: Previsão de abertura
    mes_abertura: int = Field(
        ...,
        ge=1,
        le=12,
        description="Mês previsto para abertura (1-12)"
    )
    ano_abertura: int = Field(
        ...,
        ge=2024,
        le=2030,
        description="Ano previsto para abertura"
    )
    
    # Pergunta 6: Capital disponível
    capital_disponivel: float = Field(
        ...,
        gt=0,
        description="Quanto tem disponível para investir (R$)"
    )
    
    # Pergunta 7: Pró-labore
    prolabore: ProLaboreEnum = Field(
        ...,
        description="Pretende tirar pró-labore nos primeiros meses?"
    )
    
    # Pergunta 8: Funcionários
    tem_funcionarios: bool = Field(
        ...,
        description="Vai começar com funcionários?"
    )
    
    # Pergunta 8b: Quantidade de funcionários (condicional)
    faixa_funcionarios: Optional[FaixaFuncionariosEnum] = Field(
        None,
        description="Quantos funcionários? (só se tem_funcionarios=True)"
    )
    
    # Pergunta 9: Faturamento esperado
    faturamento_esperado: float = Field(
        ...,
        gt=0,
        description="Quanto espera faturar por mês no 1º ano (R$)"
    )
    
    # Pergunta 10: Clientes garantidos
    clientes_garantidos: ClientesGarantidosEnum = Field(
        ...,
        description="Já tem clientes ou contratos garantidos?"
    )
    
    # ========== VALIDAÇÕES ==========
    
    @field_validator('estado')
    @classmethod
    def validar_estado(cls, v: str) -> str:
        """Valida se é um estado brasileiro válido"""
        v = v.upper()
        if v not in ESTADOS_BR:
            raise ValueError(f"Estado inválido. Use uma das siglas: {', '.join(ESTADOS_BR)}")
        return v
    
    @field_validator('tem_estoque')
    @classmethod
    def validar_estoque_condicional(cls, v, info):
        """Se tipo_negocio=produto, tem_estoque é obrigatório"""
        values = info.data
        if values.get('tipo_negocio') == TipoNegocioEnum.PRODUTO and v is None:
            raise ValueError("Informar se terá estoque é obrigatório para negócios de produto")
        return v
    
    @field_validator('faixa_funcionarios')
    @classmethod
    def validar_faixa_funcionarios(cls, v, info):
        """Se tem_funcionarios=True, faixa é obrigatória"""
        values = info.data
        if values.get('tem_funcionarios') and v is None:
            raise ValueError("Faixa de funcionários é obrigatória quando há funcionários")
        return v


# ========== SCHEMAS DE SAÍDA ==========

class AlertaPreAbertura(BaseModel):
    """Um alerta gerado pela análise"""
    id: str = Field(..., description="ID do alerta (ex: F1, O3, E4)")
    categoria: CategoriaAlertaEnum = Field(..., description="Categoria do alerta")
    severidade: SeveridadeAlertaEnum = Field(..., description="Severidade do alerta")
    titulo: str = Field(..., description="Título do alerta")
    texto: str = Field(..., description="Texto completo do alerta")


class ComparativoCapital(BaseModel):
    """Comparativo de capital"""
    capital_informado: float = Field(..., description="Capital informado pelo usuário")
    capital_recomendado: float = Field(..., description="Capital recomendado calculado")
    diferenca_percentual: float = Field(..., description="Diferença em % (positivo = acima)")
    status: str = Field(..., description="acima, adequado, abaixo, muito_abaixo")


class ComparativoFaturamento(BaseModel):
    """Comparativo de faturamento"""
    faturamento_esperado: float = Field(..., description="Faturamento esperado pelo usuário")
    faturamento_referencia: float = Field(..., description="Faturamento de referência do setor")
    diferenca_percentual: float = Field(..., description="Diferença em % (positivo = acima)")
    status: str = Field(..., description="acima, adequado, abaixo, muito_abaixo")


class ItemChecklist(BaseModel):
    """Item do checklist 30 dias"""
    texto: str = Field(..., description="Texto do item")
    condicional: bool = Field(default=False, description="Se é condicional")
    condicao: Optional[str] = Field(None, description="Condição para exibir (ex: 'tem_estoque')")


class CalculosPreAbertura(BaseModel):
    """Cálculos intermediários (para debug/transparência)"""
    capital_base_setor: float
    custo_por_funcionario: float
    quantidade_funcionarios: float
    adicional_funcionarios: float
    adicional_estoque: float
    adicional_pressa: float
    adicional_tech_produto: float
    margem_setor: str = Field(..., description="Faixa de margem bruta do setor")


class PreAberturaResponse(BaseModel):
    """Resposta completa da análise pré-abertura"""
    
    # Identificação
    id: UUID
    
    # Resumo do projeto
    tipo_negocio: str
    setor: str
    setor_label: str
    estado: str
    cidade: Optional[str]
    previsao_abertura: str = Field(..., description="Mês/Ano formatado")
    
    # Comparativos (para gráficos)
    comparativo_capital: ComparativoCapital
    comparativo_faturamento: ComparativoFaturamento
    
    # Alertas (máximo 3)
    alertas: list[AlertaPreAbertura] = Field(
        ...,
        max_length=3,
        description="Lista de alertas (máximo 3)"
    )
    
    # Checklist
    checklist_30_dias: list[ItemChecklist]
    
    # Mensagem de contexto (se tecnologia + produto)
    mensagem_contexto: Optional[str] = Field(
        None,
        description="Mensagem adicional de contexto (ex: tech produto)"
    )
    
    # Cálculos (opcional, para transparência)
    calculos: Optional[CalculosPreAbertura] = None
    
    # Metadados
    created_at: datetime
    
    class Config:
        from_attributes = True


class PreAberturaResumo(BaseModel):
    """Versão resumida para listagens"""
    id: UUID
    setor: str
    setor_label: str
    previsao_abertura: str
    capital_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
