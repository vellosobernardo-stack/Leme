"""
Cálculo dos 8 indicadores financeiros + Valuation + Payback + Score
"""

from typing import Optional, TypedDict
from schemas.analise import DadosAnaliseInput, IndicadoresCalculados, SetorEnum


# ========== MÚLTIPLOS POR SETOR (para Valuation) ==========

MULTIPLOS_SETOR = {
    SetorEnum.COMERCIO_VAREJO: (1.5, 2.5),
    SetorEnum.COMERCIO_ATACADO: (1.5, 2.5),
    SetorEnum.SERVICOS: (2.0, 4.0),
    SetorEnum.INDUSTRIA: (2.5, 4.5),
    SetorEnum.TECNOLOGIA: (3.0, 6.0),
    SetorEnum.ALIMENTACAO: (1.5, 3.0),
    SetorEnum.SAUDE: (2.5, 5.0),
    SetorEnum.EDUCACAO: (2.0, 4.0),
    SetorEnum.CONSTRUCAO: (1.5, 3.0),
    SetorEnum.AGRONEGOCIO: (2.0, 4.0),
    SetorEnum.TRANSPORTE: (1.5, 3.0),
    SetorEnum.HOTELARIA_TURISMO: (2.0, 4.0),
    SetorEnum.IMOBILIARIO: (2.0, 4.0),
    SetorEnum.FINANCEIRO: (3.0, 5.0),
    SetorEnum.COMUNICACAO: (2.5, 4.5),
    SetorEnum.ENERGIA: (3.0, 5.0),
    SetorEnum.TEXTIL: (1.5, 3.0),
    SetorEnum.METALURGICO: (2.0, 3.5),
    SetorEnum.MOVEIS: (1.5, 3.0),
    SetorEnum.GRAFICO: (1.5, 3.0),
    SetorEnum.RECICLAGEM: (2.0, 4.0),
}


# ========== FUNÇÃO DE TENDÊNCIA ==========

class ResultadoTendencia(TypedDict):
    """Resultado do cálculo de tendência"""
    tendencia_receita: float
    tendencia_status: str
    receitas_historico: list


def calcular_tendencia(
    receita_3_meses_atras: float,
    receita_2_meses_atras: float,
    receita_mes_passado: float,
    receita_atual: float
) -> ResultadoTendencia:
    """
    Calcula a tendência de receita dos últimos 3 meses.
    """
    receitas = [
        receita_3_meses_atras,
        receita_2_meses_atras,
        receita_mes_passado,
        receita_atual
    ]
    
    variacoes = []
    for i in range(1, len(receitas)):
        if receitas[i - 1] > 0:
            variacao = ((receitas[i] - receitas[i - 1]) / receitas[i - 1]) * 100
            variacoes.append(variacao)
    
    tendencia_percentual = sum(variacoes) / len(variacoes) if variacoes else 0
    
    if tendencia_percentual > 5:
        status = "crescendo"
    elif tendencia_percentual < -5:
        status = "caindo"
    else:
        status = "estavel"
    
    return {
        "tendencia_receita": round(tendencia_percentual, 2),
        "tendencia_status": status,
        "receitas_historico": receitas
    }


# ========== FUNÇÃO PRINCIPAL ==========

def calcular_indicadores(dados: DadosAnaliseInput) -> IndicadoresCalculados:
    """
    Calcula todos os indicadores financeiros a partir dos dados de entrada.
    """
    
    # ========== EXTRAIR DADOS ==========
    receita = dados.receita_atual
    custo = dados.custo_vendas
    despesas = dados.despesas_fixas
    caixa = dados.caixa_bancos
    receber = dados.contas_receber
    pagar = dados.contas_pagar
    funcionarios = dados.num_funcionarios
    
    estoque = dados.estoque if dados.tem_estoque else 0
    dividas = dados.dividas_totais if dados.tem_dividas else 0
    bens = dados.bens_equipamentos if dados.tem_bens else 0
    
    # ========== 1. MARGEM BRUTA ==========
    margem_bruta = ((receita - custo) / receita * 100) if receita > 0 else 0
    
    # ========== 2. RESULTADO DO MÊS ==========
    resultado_mes = receita - custo - despesas
    
    # ========== 3. FÔLEGO DE CAIXA ==========
    despesa_diaria = despesas / 30 if despesas > 0 else 1
    folego_caixa = int(caixa / despesa_diaria) if despesa_diaria > 0 else 0
    
    # ========== 4. PONTO DE EQUILÍBRIO ==========
    margem_contribuicao = margem_bruta / 100 if margem_bruta > 0 else 0.01
    ponto_equilibrio = despesas / margem_contribuicao if margem_contribuicao > 0 else 0
    
    # ========== 5. CICLO FINANCEIRO ==========
    ciclo_financeiro: Optional[int] = None
    
    if dados.tem_estoque and estoque > 0:
        receita_diaria = receita / 30 if receita > 0 else 1
        custo_diario = custo / 30 if custo > 0 else 1
        
        pmr = receber / receita_diaria if receita_diaria > 0 else 0
        pme = estoque / custo_diario if custo_diario > 0 else 0
        pmp = pagar / custo_diario if custo_diario > 0 else 0
        
        ciclo_financeiro = int(pmr + pme - pmp)
    
    # ========== 6. CAPITAL MÍNIMO ==========
    capital_minimo = receber + estoque - pagar
    
    # ========== 7. RECEITA POR FUNCIONÁRIO ==========
    receita_funcionario: Optional[float] = None
    if funcionarios >= 1:
        receita_funcionario = receita / funcionarios
    
    # ========== 8. PESO DA DÍVIDA ==========
    peso_divida: Optional[float] = None
    
    if dados.tem_dividas and dividas > 0:
        receita_anual = receita * 12
        peso_divida = (dividas / receita_anual * 100) if receita_anual > 0 else 0
    
    # ========== VALUATION (melhorado com múltiplos por setor) ==========
    lucro_anual = resultado_mes * 12
    valor_empresa_min: Optional[float] = None
    valor_empresa_max: Optional[float] = None
    multiplo_min: float = 2.0
    multiplo_max: float = 5.0
    
    # Busca múltiplos específicos do setor
    if dados.setor in MULTIPLOS_SETOR:
        multiplo_min, multiplo_max = MULTIPLOS_SETOR[dados.setor]
    
    if lucro_anual > 0:
        valor_empresa_min = lucro_anual * multiplo_min
        valor_empresa_max = lucro_anual * multiplo_max
    
    # ========== PAYBACK (melhorado com frase interpretativa) ==========
    retorno_investimento: Optional[float] = None
    payback_anos: Optional[int] = None
    payback_meses: Optional[int] = None
    payback_frase: Optional[str] = None
    payback_percentual_meta: Optional[float] = None
    
    # Calcula payback baseado no valuation médio
    if valor_empresa_min and valor_empresa_max and lucro_anual > 0:
        valor_medio = (valor_empresa_min + valor_empresa_max) / 2
        retorno_investimento = valor_medio / lucro_anual
        
        # Separa em anos e meses
        payback_anos = int(retorno_investimento)
        payback_meses = int((retorno_investimento - payback_anos) * 12)
        
        # Percentual da meta (5 anos = 100%)
        payback_percentual_meta = min((5 / retorno_investimento) * 100, 100) if retorno_investimento > 0 else 0
        
        # Frase interpretativa
        if retorno_investimento <= 2:
            payback_frase = f"Excelente! Se o negócio mantiver o lucro atual, você recupera o investimento em apenas {payback_anos} ano(s) e {payback_meses} mês(es)."
        elif retorno_investimento <= 3.5:
            payback_frase = f"Bom retorno! Se o negócio mantiver o lucro atual, você recupera o investimento em {payback_anos} ano(s) e {payback_meses} mês(es)."
        elif retorno_investimento <= 5:
            payback_frase = f"Retorno dentro da média. Se o negócio mantiver o lucro atual, você recupera o investimento em {payback_anos} ano(s) e {payback_meses} mês(es)."
        else:
            payback_frase = f"Retorno de longo prazo. Se o negócio mantiver o lucro atual, você recupera o investimento em {payback_anos} ano(s) e {payback_meses} mês(es)."
    
    # ========== TENDÊNCIA ==========
    tendencia = calcular_tendencia(
        dados.receita_historico.tres_meses_atras,
        dados.receita_historico.dois_meses_atras,
        dados.receita_historico.mes_passado,
        dados.receita_atual
    )
    
    # ========== SCORE DE SAÚDE ==========
    score_saude = _calcular_score(
        margem_bruta=margem_bruta,
        resultado_mes=resultado_mes,
        folego_caixa=folego_caixa,
        ponto_equilibrio=ponto_equilibrio,
        receita=receita,
        peso_divida=peso_divida,
        tendencia_receita=tendencia["tendencia_receita"]
    )
    
    return IndicadoresCalculados(
        # 8 indicadores
        margem_bruta=round(margem_bruta, 2),
        resultado_mes=round(resultado_mes, 2),
        folego_caixa=folego_caixa,
        ponto_equilibrio=round(ponto_equilibrio, 2),
        ciclo_financeiro=ciclo_financeiro,
        capital_minimo=round(capital_minimo, 2),
        receita_funcionario=round(receita_funcionario, 2) if receita_funcionario else None,
        peso_divida=round(peso_divida, 2) if peso_divida else None,
        
        # Valuation
        valor_empresa_min=round(valor_empresa_min, 2) if valor_empresa_min else None,
        valor_empresa_max=round(valor_empresa_max, 2) if valor_empresa_max else None,
        multiplo_setor=f"{multiplo_min}x - {multiplo_max}x",
        
        # Payback
        retorno_investimento=round(retorno_investimento, 2) if retorno_investimento else None,
        payback_anos=payback_anos,
        payback_meses=payback_meses,
        payback_frase=payback_frase,
        payback_percentual_meta=round(payback_percentual_meta, 1) if payback_percentual_meta else None,
        
        # Tendência
        tendencia_receita=tendencia["tendencia_receita"],
        tendencia_status=tendencia["tendencia_status"],
        
        # Score
        score_saude=round(score_saude, 2)
    )


def _calcular_score(
    margem_bruta: float,
    resultado_mes: float,
    folego_caixa: int,
    ponto_equilibrio: float,
    receita: float,
    peso_divida: Optional[float],
    tendencia_receita: float
) -> float:
    """
    Calcula o Score de Saúde Financeira (0-100).
    """
    score = 0
    
    # 1. Margem Bruta (20 pts)
    if margem_bruta >= 40:
        score += 20
    elif margem_bruta >= 20:
        score += 15
    elif margem_bruta >= 0:
        score += 10
    
    # 2. Resultado do Mês (20 pts)
    if receita > 0:
        resultado_percentual = (resultado_mes / receita) * 100
        if resultado_percentual >= 10:
            score += 20
        elif resultado_mes > 0:
            score += 15
    
    # 3. Fôlego de Caixa (20 pts)
    if folego_caixa >= 90:
        score += 20
    elif folego_caixa >= 60:
        score += 15
    elif folego_caixa >= 30:
        score += 10
    else:
        score += 5
    
    # 4. Ponto de Equilíbrio (15 pts)
    if receita > 0:
        pe_percentual = (ponto_equilibrio / receita) * 100
        if pe_percentual < 50:
            score += 15
        elif pe_percentual < 80:
            score += 10
        elif pe_percentual < 100:
            score += 5
    
    # 5. Peso da Dívida (10 pts)
    if peso_divida is None or peso_divida < 20:
        score += 10
    elif peso_divida < 50:
        score += 7
    elif peso_divida < 100:
        score += 3
    
    # 6. Tendência (15 pts)
    if tendencia_receita >= 10:
        score += 15
    elif tendencia_receita > 5:
        score += 12
    elif tendencia_receita >= -5:
        score += 8
    else:
        score += 3
    
    return score