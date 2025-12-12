# schemas/report.py
# Schema para geração do relatório PDF

from pydantic import BaseModel
from typing import List, Optional, Literal


class Indicador(BaseModel):
    """Indicador financeiro"""
    nome: str              # "Margem Bruta"
    valor: str             # "44,44%"
    descricao: str         # "Boa margem para o setor"


class Diagnostico(BaseModel):
    """Pontos fortes e de atenção"""
    pontos_fortes: List[str]
    pontos_atencao: List[str]


class Acao(BaseModel):
    """Item do plano de ação"""
    periodo: Literal["30", "60", "90"]
    titulo: str


class ReportPayload(BaseModel):
    """Dados completos para gerar o relatório PDF"""
    # Empresa
    empresa_nome: str
    setor: str
    estado: Optional[str] = None
    mes_referencia: str           # "Novembro/2025"
    
    # Score
    score: int                    # 78
    score_label: str              # "Saudável"
    
    # Valuation
    valuation_min: str            # "R$ 117.000,00"
    valuation_max: str            # "R$ 234.000,00"
    multiplo: str                 # "1.5x - 3.0x"
    
    # Payback
    payback_texto: str            # "2 anos e 3 meses"
    
    # Indicadores (8 indicadores)
    indicadores: List[Indicador]
    
    # Diagnóstico
    diagnostico: Diagnostico
    
    # Plano de Ação (máx 4 itens total)
    acoes: List[Acao]