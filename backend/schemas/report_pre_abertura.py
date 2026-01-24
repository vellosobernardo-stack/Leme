# schemas/report_pre_abertura.py
# Schema para geração do relatório PDF de pré-abertura

from pydantic import BaseModel
from typing import List, Optional, Literal


class ComparativoItem(BaseModel):
    """Item de comparativo (capital ou faturamento)"""
    valor_usuario: float
    valor_referencia: float
    diferenca_percentual: float
    status: str  # "acima", "adequado", "abaixo", "critico"


class AlertaItem(BaseModel):
    """Alerta da análise"""
    titulo: str
    texto: str
    categoria: str  # "financeiro", "operacional", "estrutural"
    severidade: str  # "positivo", "atencao", "alerta"


class ChecklistItem(BaseModel):
    """Item do checklist"""
    texto: str


class ReportPreAberturaPayload(BaseModel):
    """Dados completos para gerar o relatório PDF de pré-abertura"""
    # Identificação
    setor: str
    tipo_negocio: str  # "produto" ou "servico"
    previsao_abertura: str  # "Março/2026"
    
    # Comparativos
    capital_usuario: float
    capital_recomendado: float
    capital_diferenca: float
    capital_status: str
    
    faturamento_usuario: float
    faturamento_referencia: float
    faturamento_diferenca: float
    faturamento_status: str
    
    # Alertas (máx 3)
    alertas: List[AlertaItem]
    
    # Checklist
    checklist: List[ChecklistItem]
