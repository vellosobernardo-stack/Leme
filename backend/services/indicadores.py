"""
Cálculo dos 8 indicadores financeiros + Valuation + Payback + Score
v3 — Validação de dados suspeitos: valores placeholder (0, 0.01) são detectados
     e indicadores afetados retornam None em vez de resultados absurdos.
     Indicadores que NÃO dependem do dado suspeito continuam normais.
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

# Setores que obrigatoriamente têm custo de mercadoria/insumo
# (se custo = 0 nesses setores, o dado é suspeito)
SETORES_COM_CUSTO = {
    SetorEnum.COMERCIO_VAREJO,
    SetorEnum.COMERCIO_ATACADO,
    SetorEnum.INDUSTRIA,
    SetorEnum.ALIMENTACAO,
    SetorEnum.TEXTIL,
    SetorEnum.METALURGICO,
    SetorEnum.MOVEIS,
    SetorEnum.GRAFICO,
    SetorEnum.RECICLAGEM,
    SetorEnum.AGRONEGOCIO,
    SetorEnum.CONSTRUCAO,
    SetorEnum.ENERGIA,
}


# ========== VALIDAÇÃO DE DADOS SUSPEITOS ==========

# Limiar: valores abaixo disso são considerados placeholder
# (cliente colocou algo só pra passar a validação)
LIMIAR_PLACEHOLDER = 1.0  # R$ 1,00


class DadosValidados(TypedDict):
    """Resultado da validação — indica quais dados são confiáveis"""
    custo_confiavel: bool
    despesas_confiaveis: bool
    caixa_confiavel: bool
    receber_confiavel: bool
    pagar_confiavel: bool
    estoque_confiavel: bool


def _validar_dados(dados: DadosAnaliseInput) -> DadosValidados:
    """
    Verifica quais dados parecem reais vs placeholder.
    
    Regras:
    - Valor < R$ 1,00 com receita > R$ 500 → provavelmente placeholder
    - Custo = 0 em setor que obrigatoriamente tem custo → suspeito
    - Proporções absurdas entre campos relacionados → suspeito
    
    Retorna um dict indicando quais dados são confiáveis.
    Os indicadores que dependem de dados não-confiáveis viram None.
    """
    receita = dados.receita_atual

    # --- Custo ---
    custo_confiavel = True
    if dados.custo_vendas < LIMIAR_PLACEHOLDER and receita > 500:
        # Custo zero/placeholder em setor que TEM custo = suspeito
        if dados.setor in SETORES_COM_CUSTO:
            custo_confiavel = False
    
    # --- Despesas fixas ---
    despesas_confiaveis = True
    if dados.despesas_fixas < LIMIAR_PLACEHOLDER and receita > 500:
        # Toda empresa tem alguma despesa fixa (nem que seja telefone/internet)
        despesas_confiaveis = False
    
    # --- Caixa ---
    caixa_confiavel = True
    # Caixa = 0 pode ser real (empresa zerada), mas se receita é significativa
    # e caixa é placeholder (0.01, 0.50), é suspeito
    if 0 < dados.caixa_bancos < LIMIAR_PLACEHOLDER and receita > 500:
        caixa_confiavel = False
    # Caixa = 0 exato aceitamos como possível (empresa realmente sem caixa)
    
    # --- Contas a receber ---
    receber_confiavel = True
    if 0 < dados.contas_receber < LIMIAR_PLACEHOLDER and receita > 500:
        receber_confiavel = False
    
    # --- Contas a pagar ---
    pagar_confiavel = True
    if 0 < dados.contas_pagar < LIMIAR_PLACEHOLDER and receita > 500:
        pagar_confiavel = False
    
    # --- Estoque ---
    estoque_confiavel = True
    if dados.tem_estoque:
        estoque_val = dados.estoque or 0
        if 0 < estoque_val < LIMIAR_PLACEHOLDER and receita > 500:
            estoque_confiavel = False
    
    return {
        "custo_confiavel": custo_confiavel,
        "despesas_confiaveis": despesas_confiaveis,
        "caixa_confiavel": caixa_confiavel,
        "receber_confiavel": receber_confiavel,
        "pagar_confiavel": pagar_confiavel,
        "estoque_confiavel": estoque_confiavel,
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
    Dados suspeitos (placeholder) fazem o indicador afetado retornar None.
    """
    
    # ========== VALIDAR DADOS ==========
    validacao = _validar_dados(dados)
    
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
    # Depende de: receita, custo
    # Se custo não é confiável, margem fica None
    margem_bruta: Optional[float] = None
    if validacao["custo_confiavel"]:
        margem_bruta = ((receita - custo) / receita * 100) if receita > 0 else 0
    
    # ========== 2. RESULTADO DO MÊS ==========
    # Depende de: receita, custo, despesas
    # Se custo OU despesas não são confiáveis, resultado fica None
    resultado_mes: Optional[float] = None
    if validacao["custo_confiavel"] and validacao["despesas_confiaveis"]:
        resultado_mes = receita - custo - despesas
    
    # ========== 3. FÔLEGO DE CAIXA ==========
    # Depende de: caixa, despesas (ou custo como proxy)
    # Se caixa é placeholder (não zero exato) OU despesas não confiáveis → None
    folego_caixa: Optional[int] = None
    if validacao["caixa_confiavel"] and validacao["despesas_confiaveis"]:
        if despesas > 0:
            despesa_diaria = despesas / 30
        elif custo > 0 and validacao["custo_confiavel"]:
            despesa_diaria = custo / 30
        else:
            despesa_diaria = 1

        folego_caixa = int(caixa / despesa_diaria) if despesa_diaria > 0 else 0
        folego_caixa = max(folego_caixa, 0)
        # Cap máximo: 365 dias — evita valores absurdos
        folego_caixa = min(folego_caixa, 365)
    
    # ========== 4. PONTO DE EQUILÍBRIO ==========
    # Depende de: margem bruta, despesas
    # Se margem ou despesas não confiáveis → None
    ponto_equilibrio: Optional[float] = None
    if margem_bruta is not None and margem_bruta > 0 and validacao["despesas_confiaveis"]:
        margem_contribuicao = margem_bruta / 100
        ponto_equilibrio = despesas / margem_contribuicao
    
    # ========== 5. CICLO FINANCEIRO ==========
    # Depende de: receber, estoque, pagar, receita, custo
    # Se qualquer um desses não é confiável → None
    ciclo_financeiro: Optional[int] = None
    
    if dados.tem_estoque and estoque > 0:
        dados_ciclo_ok = (
            validacao["receber_confiavel"] and
            validacao["pagar_confiavel"] and
            validacao["estoque_confiavel"] and
            validacao["custo_confiavel"]
        )
        if dados_ciclo_ok:
            receita_diaria = receita / 30 if receita > 0 else 1
            custo_diario = custo / 30 if custo > 0 else 1
            
            pmr = receber / receita_diaria if receita_diaria > 0 else 0
            pme = estoque / custo_diario if custo_diario > 0 else 0
            pmp = pagar / custo_diario if custo_diario > 0 else 0
            
            ciclo_financeiro = int(pmr + pme - pmp)
            
            # Cap de segurança: ciclo fora de -365..365 é absurdo
            if ciclo_financeiro < -365 or ciclo_financeiro > 365:
                ciclo_financeiro = None
    
    # ========== 6. CAPITAL MÍNIMO ==========
    # Depende de: receber, estoque, pagar
    capital_minimo: Optional[float] = None
    if validacao["receber_confiavel"] and validacao["pagar_confiavel"]:
        capital_minimo = receber + estoque - pagar
    
    # ========== 7. RECEITA POR FUNCIONÁRIO ==========
    # Depende de: receita, funcionarios (ambos obrigatórios no form, confiáveis)
    receita_funcionario: Optional[float] = None
    if funcionarios >= 1:
        receita_funcionario = receita / funcionarios
    
    # ========== 8. PESO DA DÍVIDA ==========
    peso_divida: Optional[float] = None
    if dados.tem_dividas and dividas > 0:
        receita_anual = receita * 12
        peso_divida = (dividas / receita_anual * 100) if receita_anual > 0 else 100.0
    
    # ========== VALUATION (múltiplos por setor) ==========
    # Depende de: resultado_mes (que depende de custo + despesas)
    valor_empresa_min: Optional[float] = None
    valor_empresa_max: Optional[float] = None
    multiplo_min: float = 2.0
    multiplo_max: float = 5.0
    
    if dados.setor in MULTIPLOS_SETOR:
        multiplo_min, multiplo_max = MULTIPLOS_SETOR[dados.setor]
    
    lucro_anual: Optional[float] = None
    if resultado_mes is not None:
        lucro_anual = resultado_mes * 12
        if lucro_anual > 0:
            valor_empresa_min = lucro_anual * multiplo_min
            valor_empresa_max = lucro_anual * multiplo_max
    
    # ========== PAYBACK (Tempo de Retorno estimado) ==========
    retorno_investimento: Optional[float] = None
    payback_anos: Optional[int] = None
    payback_meses: Optional[int] = None
    payback_frase: Optional[str] = None
    payback_percentual_meta: Optional[float] = None
    
    if valor_empresa_min is not None and valor_empresa_max is not None and lucro_anual is not None and lucro_anual > 0:
        valor_medio = (valor_empresa_min + valor_empresa_max) / 2
        retorno_investimento = valor_medio / lucro_anual
        
        payback_anos = int(retorno_investimento)
        payback_meses = int((retorno_investimento - payback_anos) * 12)
        
        payback_percentual_meta = min((5 / retorno_investimento) * 100, 100) if retorno_investimento > 0 else 0
        
        if retorno_investimento <= 2:
            payback_frase = f"Excelente! Com o lucro atual, o investimento se paga em {payback_anos} ano(s) e {payback_meses} mês(es)."
        elif retorno_investimento <= 3.5:
            payback_frase = f"Bom retorno! Com o lucro atual, o investimento se paga em {payback_anos} ano(s) e {payback_meses} mês(es)."
        elif retorno_investimento <= 5:
            payback_frase = f"Retorno dentro da média. Com o lucro atual, o investimento se paga em {payback_anos} ano(s) e {payback_meses} mês(es)."
        else:
            payback_frase = f"Retorno de longo prazo: {payback_anos} ano(s) e {payback_meses} mês(es) com o lucro atual."
    elif lucro_anual is not None and lucro_anual <= 0:
        payback_frase = "Com o resultado atual negativo, não é possível estimar tempo de retorno. Foque em equilibrar as contas primeiro."
    elif resultado_mes is None:
        payback_frase = "Não foi possível calcular o retorno — alguns dados financeiros precisam ser revisados."
    
    # ========== TENDÊNCIA ==========
    tendencia = calcular_tendencia(
        dados.receita_historico.tres_meses_atras,
        dados.receita_historico.dois_meses_atras,
        dados.receita_historico.mes_passado,
        dados.receita_atual
    )
    
    # ========== SCORE DE SAÚDE ==========
    # Score usa valores com fallback: se indicador é None, usa valor neutro
    # para não penalizar nem beneficiar — o score reflete só o que é confiável
    score_saude = _calcular_score(
        margem_bruta=margem_bruta,
        resultado_mes=resultado_mes,
        folego_caixa=folego_caixa,
        ponto_equilibrio=ponto_equilibrio,
        receita=receita,
        capital_minimo=capital_minimo if capital_minimo is not None else 0,
        peso_divida=peso_divida,
        tendencia_receita=tendencia["tendencia_receita"]
    )
    
    # ========== RETORNO ==========
    return IndicadoresCalculados(
        # 8 indicadores
        margem_bruta=round(margem_bruta, 2) if margem_bruta is not None else None,
        resultado_mes=round(resultado_mes, 2) if resultado_mes is not None else None,
        folego_caixa=folego_caixa,
        ponto_equilibrio=round(ponto_equilibrio, 2) if ponto_equilibrio is not None else None,
        ciclo_financeiro=ciclo_financeiro,
        capital_minimo=round(capital_minimo, 2) if capital_minimo is not None else None,
        receita_funcionario=round(receita_funcionario, 2) if receita_funcionario is not None else None,
        peso_divida=round(peso_divida, 2) if peso_divida is not None else None,
        
        # Valuation
        valor_empresa_min=round(valor_empresa_min, 2) if valor_empresa_min is not None else None,
        valor_empresa_max=round(valor_empresa_max, 2) if valor_empresa_max is not None else None,
        multiplo_setor=f"{multiplo_min}x - {multiplo_max}x",
        
        # Payback
        retorno_investimento=round(retorno_investimento, 2) if retorno_investimento is not None else None,
        payback_anos=payback_anos,
        payback_meses=payback_meses,
        payback_frase=payback_frase,
        payback_percentual_meta=round(payback_percentual_meta, 1) if payback_percentual_meta is not None else None,
        
        # Tendência
        tendencia_receita=tendencia["tendencia_receita"],
        tendencia_status=tendencia["tendencia_status"],
        
        # Score
        score_saude=round(score_saude, 2)
    )


def _calcular_score(
    margem_bruta: Optional[float],
    resultado_mes: Optional[float],
    folego_caixa: Optional[int],
    ponto_equilibrio: Optional[float],
    receita: float,
    capital_minimo: float,
    peso_divida: Optional[float],
    tendencia_receita: float
) -> float:
    """
    Score de Saúde Financeira (0-100) v3.
    
    Mudanças vs v2:
    - Indicadores com dados insuficientes (None) recebem pontuação neutra
      proporcional ao peso, para não distorcer o score final.
    - Tetos e penalizações cruzadas só se aplicam quando o dado é confiável.
    """
    score = 0
    
    # Total de pontos possíveis e pontos de indicadores com dados confiáveis
    # Usado para redistribuir proporcionalmente se algum indicador é None
    pontos_possiveis = 100
    pontos_sem_dado = 0
    
    # ========== INDICADORES (soma até 100) ==========
    
    # 1. Margem Bruta (20 pts)
    if margem_bruta is not None:
        if margem_bruta >= 40:
            score += 20
        elif margem_bruta >= 25:
            score += 14
        elif margem_bruta >= 15:
            score += 8
        elif margem_bruta >= 0:
            score += 3
    else:
        pontos_sem_dado += 20
    
    # 2. Resultado do Mês (25 pts)
    if resultado_mes is not None:
        if resultado_mes > 0 and receita > 0:
            resultado_pct = (resultado_mes / receita) * 100
            if resultado_pct >= 15:
                score += 25
            elif resultado_pct >= 10:
                score += 20
            elif resultado_pct >= 5:
                score += 14
            else:
                score += 8
        elif resultado_mes == 0:
            score += 3
    else:
        pontos_sem_dado += 25
    
    # 3. Fôlego de Caixa (20 pts)
    if folego_caixa is not None:
        if folego_caixa >= 120:
            score += 20
        elif folego_caixa >= 90:
            score += 16
        elif folego_caixa >= 60:
            score += 11
        elif folego_caixa >= 30:
            score += 5
        else:
            score += 2
    else:
        pontos_sem_dado += 20
    
    # 4. Ponto de Equilíbrio (15 pts)
    if ponto_equilibrio is not None and receita > 0:
        pe_pct = (ponto_equilibrio / receita) * 100
        if pe_pct < 50:
            score += 15
        elif pe_pct < 70:
            score += 10
        elif pe_pct < 85:
            score += 5
        elif pe_pct < 100:
            score += 2
    elif ponto_equilibrio is None:
        pontos_sem_dado += 15
    
    # 5. Peso da Dívida (10 pts)
    if peso_divida is None or peso_divida == 0:
        score += 10
    elif peso_divida < 15:
        score += 7
    elif peso_divida < 30:
        score += 4
    elif peso_divida < 50:
        score += 2
    
    # 6. Tendência (10 pts)
    if tendencia_receita >= 10:
        score += 10
    elif tendencia_receita > 5:
        score += 7
    elif tendencia_receita >= -5:
        score += 4
    elif tendencia_receita >= -15:
        score += 2
    
    # ========== REDISTRIBUIÇÃO PROPORCIONAL ==========
    # Se alguns indicadores ficaram None, o score é calculado sobre
    # os indicadores que TÊM dado, e depois normalizado para 0-100.
    # Isso evita que dados faltantes penalizem injustamente.
    pontos_com_dado = pontos_possiveis - pontos_sem_dado
    if pontos_sem_dado > 0 and pontos_com_dado > 0:
        score = (score / pontos_com_dado) * pontos_possiveis
    
    # ========== TETOS DE SEGURANÇA (CAPS) ==========
    # Só aplicam quando o dado é confiável (não é None)
    
    if resultado_mes is not None and resultado_mes < 0:
        score = min(score, 40)
    
    if resultado_mes is not None and receita > 0 and resultado_mes >= 0:
        sobra_pct = (resultado_mes / receita) * 100
        if sobra_pct < 5:
            score = min(score, 65)
    
    if folego_caixa is not None:
        if folego_caixa < 30:
            score = min(score, 50)
        if folego_caixa < 60:
            score = min(score, 65)
        if folego_caixa < 90:
            score = min(score, 72)
    
    if margem_bruta is not None and margem_bruta < 10:
        score = min(score, 60)
    
    if ponto_equilibrio is not None and receita > 0 and ponto_equilibrio >= receita:
        score = min(score, 45)
    
    if peso_divida is not None and peso_divida > 50:
        score = min(score, 55)
    
    if tendencia_receita < -10:
        score = min(score, 68)
    
    # ========== PENALIZAÇÃO CRUZADA ==========
    # Só aplica quando AMBOS os dados são confiáveis
    
    if margem_bruta is not None and folego_caixa is not None:
        if margem_bruta < 15 and folego_caixa < 60:
            score = min(score, 42)
    
    if resultado_mes is not None and folego_caixa is not None:
        if resultado_mes < 0 and folego_caixa < 60:
            score = min(score, 30)
    
    if resultado_mes is not None and peso_divida is not None:
        if resultado_mes < 0 and peso_divida > 30:
            score = min(score, 25)
    
    return max(0, min(100, score))