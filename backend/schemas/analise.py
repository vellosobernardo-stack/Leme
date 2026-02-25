"""
Schemas de validação para a análise financeira
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, model_validator, EmailStr


class SetorEnum(str, Enum):
    """21 setores de atuação baseados em CNAE"""
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


# Lista de estados brasileiros para validação
ESTADOS_BR = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
    "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
    "RS", "RO", "RR", "SC", "SP", "SE", "TO"
]


class ReceitaHistorico(BaseModel):
    """Receitas dos últimos 3 meses para cálculo de tendência"""
    tres_meses_atras: float = Field(..., ge=0, description="Receita de 3 meses atrás")
    dois_meses_atras: float = Field(..., ge=0, description="Receita de 2 meses atrás")
    mes_passado: float = Field(..., ge=0, description="Receita do mês passado")


class DadosAnaliseInput(BaseModel):
    """
    Dados de entrada para criar uma nova análise.
    Corresponde ao formulário de 15-19 perguntas.
    """
    ref_parceiro: str | None = None
    
    # ========== ETAPA 1: IDENTIFICAÇÃO ==========
    nome_empresa: str = Field(
        ..., 
        min_length=2, 
        max_length=200,
        description="Nome da empresa"
    )
    email: EmailStr = Field(..., description="Email para contato")
    
    # ========== ETAPA 2: INFORMAÇÕES BÁSICAS ==========
    setor: SetorEnum = Field(..., description="Setor de atuação")
    estado: str = Field(
        ..., 
        min_length=2, 
        max_length=2,
        description="Estado (UF)"
    )
    mes_referencia: int = Field(
        ..., 
        ge=1, 
        le=12,
        description="Mês de referência (1-12)"
    )
    ano_referencia: int = Field(
        ..., 
        ge=2020, 
        le=2030,
        description="Ano de referência"
    )
    
    # ========== ETAPA 4: RECEITA E HISTÓRICO ==========
    receita_historico: ReceitaHistorico = Field(
        ...,
        description="Histórico de receitas dos últimos 3 meses"
    )
    receita_atual: float = Field(
        ..., 
        gt=0,
        description="Receita do mês de referência"
    )
    
    # ========== ETAPA 4: CUSTOS E DESPESAS ==========
    custo_vendas: float = Field(
        ..., 
        ge=0,
        description="Custo das vendas/serviços do mês"
    )
    despesas_fixas: float = Field(
        ..., 
        ge=0,
        description="Despesas fixas mensais"
    )
    
    # ========== ETAPA 4: CAIXA E FLUXO ==========
    caixa_bancos: float = Field(
        ..., 
        ge=0,
        description="Saldo em caixa + bancos"
    )
    contas_receber: float = Field(
        ..., 
        ge=0,
        description="Contas a receber (próximos 30 dias)"
    )
    contas_pagar: float = Field(
        ..., 
        ge=0,
        description="Contas a pagar (próximos 30 dias)"
    )
    
    # ========== ETAPA 4: CONDICIONAIS ==========
    tem_estoque: bool = Field(default=False, description="Possui estoque?")
    estoque: Optional[float] = Field(
        default=None, 
        ge=0,
        description="Valor do estoque (se houver)"
    )
    
    tem_dividas: bool = Field(default=False, description="Possui dívidas?")
    dividas_totais: Optional[float] = Field(
        default=None, 
        ge=0,
        description="Total de dívidas (se houver)"
    )
    
    tem_bens: bool = Field(default=False, description="Possui bens/equipamentos?")
    bens_equipamentos: Optional[float] = Field(
        default=None, 
        ge=0,
        description="Valor dos bens (se houver)"
    )
    
    # ========== ETAPA 4: EQUIPE ==========
    num_funcionarios: int = Field(
        ..., 
        ge=1,
        description="Número de funcionários (incluindo o dono)"
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
    
    @field_validator('estoque')
    @classmethod
    def validar_estoque_obrigatorio(cls, v, info):
        """Se tem_estoque=True, estoque é obrigatório"""
        values = info.data
        if values.get('tem_estoque') and v is None:
            raise ValueError("Valor do estoque é obrigatório quando possui estoque")
        return v
    
    @field_validator('dividas_totais')
    @classmethod
    def validar_dividas_obrigatorio(cls, v, info):
        """Se tem_dividas=True, dividas_totais é obrigatório"""
        values = info.data
        if values.get('tem_dividas') and v is None:
            raise ValueError("Valor das dívidas é obrigatório quando possui dívidas")
        return v
    
    @field_validator('bens_equipamentos')
    @classmethod
    def validar_bens_obrigatorio(cls, v, info):
        """Se tem_bens=True, bens_equipamentos é obrigatório"""
        values = info.data
        if values.get('tem_bens') and v is None:
            raise ValueError("Valor dos bens é obrigatório quando possui bens")
        return v
    
    @model_validator(mode='after')
    def validar_coerencia(self):
        """
        Validações de coerência - gera alertas mas NÃO bloqueia.
        Os alertas são armazenados para mostrar ao usuário.
        """
        self._alertas_coerencia = []
        
        if self.custo_vendas > self.receita_atual:
            self._alertas_coerencia.append(
                "O custo das vendas está maior que a receita. Verifique se os valores estão corretos."
            )
        
        if self.despesas_fixas > self.receita_atual:
            self._alertas_coerencia.append(
                "As despesas fixas estão maiores que a receita. Isso indica prejuízo operacional."
            )
        
        return self
    
    def get_alertas(self) -> list[str]:
        """Retorna os alertas de coerência"""
        return getattr(self, '_alertas_coerencia', [])


class IndicadoresCalculados(BaseModel):
    """Indicadores calculados a partir dos dados de entrada"""
    
    # 8 indicadores do dashboard
    margem_bruta: Optional[float] = Field(None, description="Margem bruta em %")
    resultado_mes: Optional[float] = Field(None, description="Resultado do mês em R$")
    folego_caixa: Optional[int] = Field(None, description="Fôlego de caixa em dias")
    ponto_equilibrio: Optional[float] = Field(None, description="Ponto de equilíbrio em R$")
    ciclo_financeiro: Optional[int] = Field(None, description="Ciclo financeiro em dias")
    capital_minimo: Optional[float] = Field(None, description="Capital mínimo necessário em R$")
    receita_funcionario: Optional[float] = Field(None, description="Receita por funcionário em R$")
    peso_divida: Optional[float] = Field(None, description="Peso da dívida em %")
    
    # Valuation (destaque)
    valor_empresa_min: Optional[float] = Field(None, description="Valuation mínimo")
    valor_empresa_max: Optional[float] = Field(None, description="Valuation máximo")
    multiplo_setor: Optional[str] = Field(None, description="Múltiplo usado (ex: 2.0x - 4.0x)")
    
    # Payback (destaque)
    retorno_investimento: Optional[float] = Field(None, description="Payback em anos (decimal)")
    payback_anos: Optional[int] = Field(None, description="Parte inteira do payback")
    payback_meses: Optional[int] = Field(None, description="Meses restantes do payback")
    payback_frase: Optional[str] = Field(None, description="Frase interpretativa do payback")
    payback_percentual_meta: Optional[float] = Field(None, description="Percentual da meta de 5 anos")
    
    # Tendência
    tendencia_receita: Optional[float] = Field(None, description="Tendência em %")
    tendencia_status: Optional[str] = Field(None, description="crescendo, estavel, caindo")
    
    # Score
    score_saude: Optional[float] = Field(None, ge=0, le=100, description="Score de 0 a 100")

class PontoDiagnostico(BaseModel):
    titulo: str
    descricao: str

class DiagnosticoPlano(BaseModel):
    pontos_fortes: list[PontoDiagnostico] = []
    pontos_atencao: list[PontoDiagnostico] = []
    plano_30_dias: list[dict] = []
    plano_60_dias: list[dict] = []
    plano_90_dias: list[dict] = []


class AnaliseResponse(BaseModel):
    """Resposta completa de uma análise"""
    id: UUID
    nome_empresa: str
    email: str
    setor: str
    estado: str
    mes_referencia: int
    ano_referencia: int
    
    # Indicadores
    indicadores: IndicadoresCalculados
    
    # Diagnóstico
    diagnostico: DiagnosticoPlano
    
    # Metadados
    alertas_coerencia: list[str] = Field(default_factory=list)
    metodo_entrada: str = "manual"
    created_at: datetime
    
    class Config:
        from_attributes = True


class AnaliseResumo(BaseModel):
    """Versão resumida para listagens"""
    id: UUID
    nome_empresa: str
    setor: str
    mes_referencia: int
    ano_referencia: int
    score_saude: Optional[float]
    tendencia_status: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ValidacaoResponse(BaseModel):
    """Resposta de validação do formulário"""
    valido: bool
    alertas: list[str] = Field(default_factory=list)
    erros: list[str] = Field(default_factory=list)
