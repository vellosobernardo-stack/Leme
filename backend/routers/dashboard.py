"""
Endpoint do Dashboard - retorna dados formatados para o frontend
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from models.analise import Analise

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard"]
)

def formatar_moeda(valor: float) -> str:
    """Formata valor para padrão brasileiro: R$ 10.306,00"""
    if valor is None:
        return "R$ 0"
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def formatar_numero(valor: float, casas_decimais: int = 0) -> str:
    """Formata número para padrão brasileiro: 10.306"""
    if valor is None:
        return "0"
    if casas_decimais == 0:
        return f"{valor:,.0f}".replace(",", ".")
    return f"{valor:,.{casas_decimais}f}".replace(",", "X").replace(".", ",").replace("X", ".")

# Mapeamento de setores para nomes amigáveis
SETORES_NOMES = {
    "comercio_varejo": "Comércio Varejista",
    "comercio_atacado": "Comércio Atacadista",
    "servicos": "Serviços",
    "industria": "Indústria",
    "tecnologia": "Tecnologia",
    "alimentacao": "Alimentação e Bebidas",
    "saude": "Saúde",
    "educacao": "Educação",
    "construcao": "Construção Civil",
    "agronegocio": "Agronegócio",
    "transporte": "Transporte e Logística",
    "hotelaria_turismo": "Hotelaria e Turismo",
    "imobiliario": "Imobiliário",
    "financeiro": "Serviços Financeiros",
    "comunicacao": "Comunicação",
    "energia": "Energia",
    "textil": "Têxtil e Vestuário",
    "metalurgico": "Metalúrgico",
    "moveis": "Móveis",
    "grafico": "Gráfico e Editorial",
    "reciclagem": "Reciclagem",
}

# Mapeamento de estados
ESTADOS_NOMES = {
    "AC": "Acre", "AL": "Alagoas", "AP": "Amapá", "AM": "Amazonas",
    "BA": "Bahia", "CE": "Ceará", "DF": "Distrito Federal", "ES": "Espírito Santo",
    "GO": "Goiás", "MA": "Maranhão", "MT": "Mato Grosso", "MS": "Mato Grosso do Sul",
    "MG": "Minas Gerais", "PA": "Pará", "PB": "Paraíba", "PR": "Paraná",
    "PE": "Pernambuco", "PI": "Piauí", "RJ": "Rio de Janeiro", "RN": "Rio Grande do Norte",
    "RS": "Rio Grande do Sul", "RO": "Rondônia", "RR": "Roraima", "SC": "Santa Catarina",
    "SP": "São Paulo", "SE": "Sergipe", "TO": "Tocantins"
}

# Meses
MESES = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
}

# Benchmark de margem bruta por setor (em %)
BENCHMARK_MARGEM_SETOR = {
    "comercio_varejo": 30,
    "comercio_atacado": 20,
    "servicos": 50,
    "industria": 35,
    "tecnologia": 60,
    "alimentacao": 35,
    "saude": 50,
    "educacao": 50,
    "construcao": 30,
    "agronegocio": 30,
    "transporte": 25,
    "hotelaria_turismo": 40,
    "imobiliario": 35,
    "financeiro": 50,
    "comunicacao": 45,
    "energia": 40,
    "textil": 35,
    "metalurgico": 30,
    "moveis": 35,
    "grafico": 35,
    "reciclagem": 35,
}

# Benchmark de receita por funcionário por setor (em R$/mês)
BENCHMARK_RECEITA_FUNC_SETOR = {
    "comercio_varejo": 8000,
    "comercio_atacado": 15000,
    "servicos": 6000,
    "industria": 10000,
    "tecnologia": 12000,
    "alimentacao": 5000,
    "saude": 8000,
    "educacao": 5000,
    "construcao": 10000,
    "agronegocio": 12000,
    "transporte": 10000,
    "hotelaria_turismo": 6000,
    "imobiliario": 10000,
    "financeiro": 15000,
    "comunicacao": 8000,
    "energia": 15000,
    "textil": 7000,
    "metalurgico": 10000,
    "moveis": 7000,
    "grafico": 7000,
    "reciclagem": 8000,
}

# Múltiplos por setor para valuation
MULTIPLOS_SETOR = {
    "comercio_varejo": "1.5x - 2.5x",
    "comercio_atacado": "1.5x - 2.5x",
    "servicos": "2.0x - 4.0x",
    "industria": "2.5x - 4.5x",
    "tecnologia": "3.0x - 6.0x",
    "alimentacao": "1.5x - 3.0x",
    "saude": "2.5x - 5.0x",
    "educacao": "2.0x - 4.0x",
    "construcao": "1.5x - 3.0x",
    "agronegocio": "2.0x - 4.0x",
    "transporte": "1.5x - 3.0x",
    "hotelaria_turismo": "2.0x - 4.0x",
    "imobiliario": "2.0x - 4.0x",
    "financeiro": "3.0x - 5.0x",
    "comunicacao": "2.5x - 4.5x",
    "energia": "3.0x - 5.0x",
    "textil": "1.5x - 3.0x",
    "metalurgico": "2.0x - 3.5x",
    "moveis": "1.5x - 3.0x",
    "grafico": "1.5x - 3.0x",
    "reciclagem": "2.0x - 4.0x",
}


def get_status(valor: float, tipo: str) -> str:
    """Retorna status baseado no valor e tipo de indicador"""
    if tipo == "margem_bruta":
        if valor >= 40: return "saudavel"
        if valor >= 20: return "atencao"
        return "critico"
    elif tipo == "folego_caixa":
        if valor >= 60: return "saudavel"
        if valor >= 30: return "atencao"
        return "critico"
    elif tipo == "peso_divida":
        if valor is None or valor == 0: return "saudavel"
        if valor < 30: return "saudavel"
        if valor < 50: return "atencao"
        return "critico"
    elif tipo == "ciclo_financeiro":
        if valor is None: return "saudavel"  # Sem estoque, não se aplica
        if valor <= 0: return "saudavel"     # Negativo = recebe antes de pagar = ótimo
        if valor <= 45: return "saudavel"
        if valor <= 60: return "atencao"
        return "critico"
    elif tipo == "resultado_mes":
        if valor > 0: return "saudavel"
        if valor == 0: return "atencao"
        return "critico"
    elif tipo == "capital_minimo":
        # Capital mínimo: negativo = empresa deve mais do que tem a receber
        if valor is None: return "saudavel"
        if valor >= 0: return "saudavel"     # Positivo ou zero = ok
        return "critico"                      # Negativo = problema
    elif tipo == "ponto_equilibrio":
        # PE None = margem negativa = crítico
        if valor is None: return "critico"
        # PE < receita = ok, PE >= receita = não atinge equilíbrio
        return "saudavel"  # Contexto precisa da receita, tratado inline
    elif tipo == "score":
        if valor >= 70: return "saudavel"
        if valor >= 50: return "atencao"
        return "critico"
    return "saudavel"


def get_tendencia_tipo(variacao: float) -> str:
    """Retorna tipo de tendência"""
    if variacao > 5: return "subindo"
    if variacao < -5: return "descendo"
    return "estavel"


def gerar_payback(valor_empresa_min: float, valor_empresa_max: float, lucro_anual: float) -> dict:
    """Gera dados de payback"""
    
    # Caso 1: Empresa com prejuízo (PRIORIDADE - verificar primeiro)
    if lucro_anual is not None and lucro_anual <= 0:
        return {
            "anos": None,
            "meses": None,
            "frase_interpretativa": "A empresa está operando sem lucro. Primeiro é preciso atingir resultado positivo para calcular o retorno.",
            "percentual_meta": 0,
            "status": "critico"
        }
    
    # Caso 2: Não tem valor da empresa calculado
    if not valor_empresa_min or not valor_empresa_max or valor_empresa_min <= 0 or valor_empresa_max <= 0:
        return {
            "anos": None,
            "meses": None,
            "frase_interpretativa": "Não foi possível calcular o valor da empresa com os dados informados.",
            "percentual_meta": 0,
            "status": "indisponivel"
        }
    
    # Caso 3: Cálculo normal
    valor_medio = (valor_empresa_min + valor_empresa_max) / 2
    retorno = valor_medio / lucro_anual
    
    anos = int(retorno)
    meses = int((retorno - anos) * 12)
    percentual = min((5 / retorno) * 100, 100) if retorno > 0 else 0
    
    if retorno <= 2:
        frase = f"Excelente! Se o negócio mantiver o lucro atual, você recupera o investimento em {anos} ano(s) e {meses} mês(es)."
        status = "saudavel"
    elif retorno <= 3.5:
        frase = f"Bom retorno! Se o negócio mantiver o lucro atual, você recupera o investimento em {anos} ano(s) e {meses} mês(es)."
        status = "saudavel"
    elif retorno <= 5:
        frase = f"Retorno dentro da média. Se o negócio mantiver o lucro atual, você recupera o investimento em {anos} ano(s) e {meses} mês(es)."
        status = "atencao"
    else:
        frase = f"Retorno de longo prazo. Se o negócio mantiver o lucro atual, você recupera o investimento em {anos} ano(s) e {meses} mês(es)."
        status = "atencao"
    
    return {
        "anos": anos,
        "meses": meses,
        "frase_interpretativa": frase,
        "percentual_meta": round(percentual, 1),
        "status": status
    }

def gerar_diagnostico(analise: Analise) -> dict:
    """
    Gera diagnóstico v2 — conectado com simulador, linguagem leiga.
    
    Princípios:
    - Pontos fortes: dizer o que PERMITE, não só o que é bom
    - Pontos de atenção: ser ESPECÍFICO e INCÔMODO com números reais
    - Conectar com o simulador (queda de receita, sobra, fôlego)
    - Máximo 4+4 para dar profundidade sem sobrecarregar
    """
    pontos_fortes = []
    pontos_atencao = []
    
    # Extrair valores com segurança
    receita = float(analise.receita_atual) if analise.receita_atual else 0
    custo = float(analise.custo_vendas) if analise.custo_vendas else 0
    despesas = float(analise.despesas_fixas) if analise.despesas_fixas else 0
    caixa = float(analise.caixa_bancos) if analise.caixa_bancos else 0
    margem = float(analise.margem_bruta) if analise.margem_bruta else 0
    resultado = float(analise.resultado_mes) if analise.resultado_mes else 0
    folego = analise.folego_caixa if analise.folego_caixa else 0
    peso_div = float(analise.peso_divida) if analise.peso_divida else 0
    ciclo = analise.ciclo_financeiro if analise.ciclo_financeiro else 0
    funcionarios = analise.num_funcionarios if analise.num_funcionarios else 0
    rec_func = float(analise.receita_funcionario) if analise.receita_funcionario else 0
    pe = float(analise.ponto_equilibrio) if analise.ponto_equilibrio else 0
    
    custo_total = custo + despesas
    
    # Cálculo do simulador (mesmo motor do frontend)
    sobra = receita - custo_total
    receita_est = receita * 0.7  # cenário -30%
    sobra_est = receita_est - custo_total
    queda_valor = receita - receita_est
    
    # ========== MARGEM BRUTA ==========
    if margem >= 40:
        pontos_fortes.append({
            "titulo": "Margem bruta excelente",
            "descricao": f"Com {margem:.1f}% de margem, sua empresa consegue agregar muito valor ao seu produto/serviço."
        })
    elif margem >= 25:
        pontos_fortes.append({
            "titulo": "Margem bruta adequada",
            "descricao": f"Com {margem:.1f}% de margem, você tem espaço para absorver variações de custo sem comprometer o resultado."
        })
    elif margem >= 15:
        pontos_atencao.append({
            "titulo": "Margem bruta apertada",
            "descricao": f"Com {margem:.1f}% de margem, um aumento de custo de fornecedor ou matéria-prima já pode comprometer seu resultado. Avalie revisar preços."
        })
    elif margem >= 0:
        pontos_atencao.append({
            "titulo": "Margem bruta muito baixa",
            "descricao": f"Com apenas {margem:.1f}% de margem, quase tudo que entra é consumido pelo custo. Sua empresa está vulnerável a qualquer variação de preço."
        })
    else:
        pontos_atencao.append({
            "titulo": "Margem bruta negativa",
            "descricao": "Seu custo de vendas é maior que a receita. Cada venda gera prejuízo. Revisão de preço ou fornecedores é urgente."
        })
    
    # ========== RESULTADO / SOBRA MENSAL ==========
    if resultado > 0 and receita > 0:
        sobra_pct = (resultado / receita) * 100
        if sobra_pct >= 15:
            pontos_fortes.append({
                "titulo": "Rentabilidade muito boa",
                "descricao": f"Sobram {formatar_moeda(resultado)} por mês ({sobra_pct:.1f}% da receita). Isso dá margem para investir em crescimento ou reforçar reservas."
            })
        elif sobra_pct >= 5:
            pontos_fortes.append({
                "titulo": "Resultado positivo",
                "descricao": f"Sobram {formatar_moeda(resultado)} por mês. Empresa se sustenta, mas a folga é moderada."
            })
        else:
            pontos_atencao.append({
                "titulo": "Sobra mensal muito baixa",
                "descricao": f"Depois de pagar tudo, sobram apenas {formatar_moeda(resultado)} ({sobra_pct:.1f}% da receita). Um pequeno imprevisto já pode zerar essa sobra."
            })
    elif resultado == 0:
        pontos_atencao.append({
            "titulo": "Resultado zerado",
            "descricao": "A receita cobre exatamente os custos. Não há sobra para imprevistos nem para crescer."
        })
    elif resultado < 0:
        pontos_atencao.append({
            "titulo": "Empresa operando no prejuízo",
            "descricao": f"As despesas superam o faturamento em {formatar_moeda(abs(resultado))} por mês. Sem ajustes, o caixa será consumido."
        })
    
    # ========== VULNERABILIDADE A QUEDA (conecta com simulador) ==========
    if receita > 0 and sobra > 0:
        if sobra_est < 0:
            # Lucro vira prejuízo com -30%
            pontos_atencao.append({
                "titulo": "Vulnerável a queda de vendas",
                "descricao": f"Uma queda de {formatar_moeda(queda_valor)} nas vendas já faria sua empresa operar no prejuízo, consumindo o caixa."
            })
        elif sobra_est > 0 and sobra > 0:
            erosao = round((1 - sobra_est / sobra) * 100)
            if erosao >= 60:
                pontos_atencao.append({
                    "titulo": "Alta dependência do faturamento atual",
                    "descricao": f"Uma queda de 30% na receita reduziria sua sobra mensal em {erosao}%. Diversificar fontes de receita reduz esse risco."
                })
    
    # ========== FÔLEGO / CAIXA ==========
    if folego >= 120:
        pontos_fortes.append({
            "titulo": "Reserva de caixa confortável",
            "descricao": f"Com {folego} dias de fôlego, sua empresa tem tempo para reagir a imprevistos sem comprometer a operação."
        })
    elif folego >= 60:
        pontos_fortes.append({
            "titulo": "Reserva de caixa adequada",
            "descricao": f"Com {folego} dias de fôlego, você tem uma margem de segurança razoável, mas considere reforçar."
        })
    elif folego >= 30:
        pontos_atencao.append({
            "titulo": "Reserva de caixa limitada",
            "descricao": f"Com apenas {folego} dias de fôlego, um atraso em recebimento ou despesa inesperada já pode apertar o caixa."
        })
    elif folego > 0:
        pontos_atencao.append({
            "titulo": "Reserva de caixa crítica",
            "descricao": f"Com apenas {folego} dias de fôlego, qualquer imprevisto pode comprometer o pagamento de contas."
        })
    
    # ========== DÍVIDA ==========
    if peso_div == 0:
        pontos_fortes.append({
            "titulo": "Empresa sem dívidas",
            "descricao": "Situação financeira sólida, com liberdade para investir quando necessário."
        })
    elif peso_div < 15:
        pontos_fortes.append({
            "titulo": "Endividamento controlado",
            "descricao": f"Dívidas representam {peso_div:.0f}% da receita anual. Nível saudável que não pressiona o caixa."
        })
    elif peso_div >= 30:
        pontos_atencao.append({
            "titulo": "Endividamento elevado",
            "descricao": f"Dívidas representam {peso_div:.0f}% da receita anual. Isso compromete parte do faturamento e limita novos investimentos."
        })
    
    # ========== PONTO DE EQUILÍBRIO ==========
    if pe > 0 and receita > 0:
        pe_pct = (pe / receita) * 100
        folga_pe = receita - pe
        if pe_pct >= 90:
            pontos_atencao.append({
                "titulo": "Operando muito perto do limite",
                "descricao": f"Você precisa faturar pelo menos {formatar_moeda(pe)} por mês para cobrir os custos. Sua folga é de apenas {formatar_moeda(folga_pe)}."
            })
        elif pe_pct >= 70:
            pontos_atencao.append({
                "titulo": "Ponto de equilíbrio alto",
                "descricao": f"Seu custo fixo exige um faturamento mínimo de {formatar_moeda(pe)} para não dar prejuízo. Considere reduzir despesas fixas."
            })
    
    # ========== PRODUTIVIDADE ==========
    if funcionarios and funcionarios > 0 and rec_func > 0:
        if rec_func >= 10000:
            pontos_fortes.append({
                "titulo": "Boa produtividade por funcionário",
                "descricao": f"Cada funcionário gera {formatar_moeda(rec_func)} de receita. Equipe enxuta e eficiente."
            })
        elif rec_func < 5000:
            pontos_atencao.append({
                "titulo": "Produtividade baixa por funcionário",
                "descricao": f"Cada funcionário gera apenas {formatar_moeda(rec_func)} de receita. Avalie se a equipe está dimensionada para o faturamento atual."
            })
    
    # ========== TENDÊNCIA ==========
    if analise.tendencia_receita is not None:
        tend = float(analise.tendencia_receita)
        if tend >= 10:
            pontos_fortes.append({
                "titulo": "Receita em crescimento",
                "descricao": f"Tendência de alta de {tend:.0f}%. Bom momento para planejar expansão com base sólida."
            })
        elif tend <= -10:
            pontos_atencao.append({
                "titulo": "Receita em queda",
                "descricao": f"Tendência de queda de {abs(tend):.0f}%. Se mantida, pode comprometer a sustentabilidade. Investigue a causa."
            })
    
    # Ordenar: mais impactantes primeiro
    # Pontos fortes: prioriza resultado > margem > caixa
    # Pontos atenção: prioriza prejuízo > vulnerabilidade > caixa
    return {
        "pontos_fortes": pontos_fortes[:4],  # Máximo 4
        "pontos_atencao": pontos_atencao[:4]  # Máximo 4
    }


def gerar_plano_acao(analise: Analise) -> dict:
    """
    Gera plano de ação 30/60/90 dias personalizado.
    
    Princípios:
    - Só ações ligadas a indicadores reais (nada genérico)
    - Números do cliente em cada ação (gap, impacto, meta)
    - Prioridade por gravidade (score numérico, ordenado)
    - Benchmarks por setor
    - 4 por período, sempre
    """
    
    # ========== EXTRAIR DADOS ==========
    receita = float(analise.receita_atual) if analise.receita_atual else 0
    custo = float(analise.custo_vendas) if analise.custo_vendas else 0
    despesas = float(analise.despesas_fixas) if analise.despesas_fixas else 0
    resultado = float(analise.resultado_mes) if analise.resultado_mes is not None else 0
    margem = float(analise.margem_bruta) if analise.margem_bruta is not None else 0
    folego = analise.folego_caixa if analise.folego_caixa is not None else 0
    caixa = float(analise.caixa_bancos) if analise.caixa_bancos else 0
    receber = float(analise.contas_receber) if analise.contas_receber else 0
    pagar = float(analise.contas_pagar) if analise.contas_pagar else 0
    capital = float(analise.capital_minimo) if analise.capital_minimo is not None else 0
    ciclo = analise.ciclo_financeiro  # pode ser None
    pe = float(analise.ponto_equilibrio) if analise.ponto_equilibrio is not None else None
    peso_div = float(analise.peso_divida) if analise.peso_divida is not None else 0
    dividas = float(analise.dividas_totais) if analise.dividas_totais else 0
    score = float(analise.score_saude) if analise.score_saude is not None else 0
    tendencia = float(analise.tendencia_receita) if analise.tendencia_receita is not None else 0
    funcionarios = analise.num_funcionarios or 1
    setor = analise.setor or ""
    receita_func = receita / funcionarios if funcionarios > 0 else 0
    
    despesa_diaria = despesas / 30 if despesas > 0 else 0
    
    # ========== BENCHMARKS POR SETOR ==========
    benchmark_margem = BENCHMARK_MARGEM_SETOR.get(setor, 40)
    benchmark_receita_func = BENCHMARK_RECEITA_FUNC_SETOR.get(setor, 8000)
    setor_nome = SETORES_NOMES.get(setor, "seu setor")
    
    # ========== CÁLCULOS DE GAP ==========
    gap_margem = max(benchmark_margem - margem, 0)
    impacto_margem = receita * (gap_margem / 100)
    
    gap_pe = (pe - receita) if (pe is not None and pe > receita) else 0
    
    gap_folego_dias = max(60 - folego, 0)
    gap_folego_reais = gap_folego_dias * despesa_diaria
    
    gap_capital = abs(capital) if capital < 0 else max(capital - caixa, 0)
    
    corte_necessario = abs(resultado) if resultado < 0 else 0
    
    impacto_renegociar_15dias = despesa_diaria * 15
    
    # ========== AÇÕES COM SCORE DE PRIORIDADE ==========
    # score_pri: 100 = crítico urgente, 70 = importante, 40 = médio, 20 = fallback
    
    acoes_30 = []  # lista de (score_pri, ação)
    acoes_60 = []
    acoes_90 = []
    
    # ==========================================
    # 30 DIAS — AÇÕES URGENTES
    # ==========================================
    
    # 🔴 Resultado negativo (PRIORIDADE MÁXIMA)
    if resultado < 0:
        desc = f"Sua empresa tem prejuízo de {formatar_moeda(abs(resultado))}/mês. "
        if pe is not None and pe > receita:
            desc += f"Seu ponto de equilíbrio é {formatar_moeda(pe)}, mas você fatura {formatar_moeda(receita)} — faltam {formatar_moeda(gap_pe)}. Caminho: reduzir despesas fixas em {formatar_moeda(corte_necessario * 0.6)} e aumentar receita em {formatar_moeda(corte_necessario * 0.4)}."
        else:
            desc += f"Receita: {formatar_moeda(receita)}, Custos + Despesas: {formatar_moeda(custo + despesas)}. Identifique os 3 maiores custos e negocie redução imediata de pelo menos {formatar_moeda(corte_necessario)}."
        
        acoes_30.append((100, {
            "titulo": "Eliminar o prejuízo mensal",
            "prioridade": "Alta",
            "descricao": desc,
            "resultado_esperado": f"Zerar o prejuízo de {formatar_moeda(abs(resultado))}/mês em 30 dias",
            "tempo_estimado": "1-2h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # 🔴 Fôlego de caixa crítico (< 30 dias)
    if folego < 30:
        acoes_30.append((95, {
            "titulo": f"Aumentar fôlego de caixa de {folego} para 60 dias",
            "prioridade": "Alta",
            "descricao": f"Seu caixa de {formatar_moeda(caixa)} cobre apenas {folego} dias de operação. Você precisa de mais {formatar_moeda(gap_folego_reais)}. Antecipe {formatar_moeda(receber)} em recebíveis e renegocie prazos de pagamento (+15 dias ganha {formatar_moeda(impacto_renegociar_15dias)} de fôlego).",
            "resultado_esperado": f"Atingir {formatar_moeda(caixa + gap_folego_reais)} em caixa (60 dias de fôlego)",
            "tempo_estimado": "1-2h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # 🔴 Capital de giro negativo
    if capital < 0:
        acoes_30.append((90, {
            "titulo": "Resolver déficit de capital de giro",
            "prioridade": "Alta",
            "descricao": f"Você tem {formatar_moeda(receber)} a receber e {formatar_moeda(pagar)} a pagar — déficit de {formatar_moeda(abs(capital))}. Renegocie prazos com os 3 maiores fornecedores (+15 dias = {formatar_moeda(impacto_renegociar_15dias)} de alívio) e antecipe cobranças (ofereça 3% de desconto para pagamento em 7 dias).",
            "resultado_esperado": f"Eliminar o déficit de {formatar_moeda(abs(capital))} no capital de giro",
            "tempo_estimado": "2-3h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # 🔴 Margem bruta crítica (abaixo de metade do benchmark do setor)
    if margem < benchmark_margem * 0.5:
        acoes_30.append((88, {
            "titulo": f"Revisar precificação urgente — margem de {margem:.0f}% (setor: {benchmark_margem}%)",
            "prioridade": "Alta",
            "descricao": f"Seus custos diretos ({formatar_moeda(custo)}) consomem {100 - margem:.0f}% da receita. No setor de {setor_nome}, a margem saudável é {benchmark_margem}%. Para atingir esse nível, reduza custos em {formatar_moeda(impacto_margem)} ou aumente preços. Comece pelos 3 produtos/serviços com maior volume.",
            "resultado_esperado": f"Elevar margem de {margem:.0f}% para pelo menos {int(benchmark_margem * 0.6)}% — ganho de +{formatar_moeda(receita * (benchmark_margem * 0.6 - margem) / 100)}/mês",
            "tempo_estimado": "2-3h",
            "dificuldade": "Avançado",
            "faz_sozinho": False
        }))
    
    # 🔴 Dívida crítica (> 50%)
    if peso_div > 50:
        acoes_30.append((85, {
            "titulo": f"Renegociar dívidas — {peso_div:.0f}% da receita anual",
            "prioridade": "Alta",
            "descricao": f"Suas dívidas de {formatar_moeda(dividas)} equivalem a {peso_div:.0f}% do faturamento anual ({formatar_moeda(receita * 12)}). Liste todas por taxa de juros e renegocie as 3 mais caras — busque redução de pelo menos 20% nos juros.",
            "resultado_esperado": f"Reduzir o peso da dívida de {peso_div:.0f}% para abaixo de 50%",
            "tempo_estimado": "2-4h",
            "dificuldade": "Avançado",
            "faz_sozinho": False
        }))
    
    # 🟡 Margem em atenção (abaixo do benchmark, mas não crítica)
    if benchmark_margem * 0.5 <= margem < benchmark_margem:
        acoes_30.append((70, {
            "titulo": f"Melhorar margem de {margem:.0f}% para {benchmark_margem}% (meta do setor)",
            "prioridade": "Alta",
            "descricao": f"Cada ponto de margem a mais = +{formatar_moeda(receita * 0.01)}/mês. Para ir de {margem:.0f}% a {benchmark_margem}% ({setor_nome}), o ganho seria +{formatar_moeda(impacto_margem)}/mês. Revise custos dos 5 produtos mais vendidos e negocie com fornecedores.",
            "resultado_esperado": f"Ganho de até +{formatar_moeda(impacto_margem)}/mês atingindo margem de {benchmark_margem}%",
            "tempo_estimado": "1-2h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # 🟡 Capital positivo mas caixa insuficiente
    if capital > 0 and caixa < capital:
        acoes_30.append((65, {
            "titulo": "Reforçar caixa para cobrir capital de giro",
            "prioridade": "Alta",
            "descricao": f"Seu capital de giro necessário é {formatar_moeda(capital)}, mas seu caixa é {formatar_moeda(caixa)} — faltam {formatar_moeda(gap_capital)}. Antecipe cobranças e negocie prazos para fechar esse gap.",
            "resultado_esperado": f"Acumular mais {formatar_moeda(gap_capital)} em caixa nos próximos 30 dias",
            "tempo_estimado": "1-2h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # 🟡 Tendência de queda
    if tendencia < -5:
        acoes_30.append((60, {
            "titulo": f"Investigar queda de receita ({tendencia:.0f}%)",
            "prioridade": "Alta",
            "descricao": f"Sua receita caiu {abs(tendencia):.0f}% nos últimos meses. Identifique: quais clientes pararam de comprar? Qual produto caiu mais? Há sazonalidade ou perda real? Fale com os 5 maiores clientes esta semana.",
            "resultado_esperado": "Diagnóstico claro da queda e plano para reverter a tendência",
            "tempo_estimado": "1h",
            "dificuldade": "Fácil",
            "faz_sozinho": True
        }))
    
    # Fallbacks 30 dias
    if receita > 0:
        acoes_30.append((20, {
            "titulo": f"Reduzir despesas fixas de {formatar_moeda(despesas)}/mês",
            "prioridade": "Média",
            "descricao": f"Suas despesas fixas consomem {(despesas/receita*100):.0f}% da receita. Liste todas por valor e corte ou renegocie as 3 maiores. Uma redução de 10% = economia de {formatar_moeda(despesas * 0.1)}/mês.",
            "resultado_esperado": f"Economizar {formatar_moeda(despesas * 0.1)}/mês (10% das despesas fixas)",
            "tempo_estimado": "1h",
            "dificuldade": "Fácil",
            "faz_sozinho": True
        }))
    
    if receber > 0:
        acoes_30.append((15, {
            "titulo": f"Acelerar recebimento de {formatar_moeda(receber)}",
            "prioridade": "Média",
            "descricao": f"Você tem {formatar_moeda(receber)} a receber. Ofereça 3-5% de desconto para pagamento antecipado. Monte régua de cobrança: lembrete 3 dias antes, cobrança no dia, follow-up em 3/7/15 dias.",
            "resultado_esperado": f"Receber pelo menos {formatar_moeda(receber * 0.8)} dentro de 15 dias",
            "tempo_estimado": "30 min",
            "dificuldade": "Fácil",
            "faz_sozinho": True
        }))
    
    acoes_30.append((10, {
        "titulo": "Criar controle financeiro semanal",
        "prioridade": "Média",
        "descricao": f"Separe 30 minutos toda segunda para conferir: saldo em caixa, contas a pagar da semana, recebimentos previstos. Seus gastos mensais são {formatar_moeda(custo + despesas)} — acompanhar semanalmente evita surpresas.",
        "resultado_esperado": "Visibilidade completa do fluxo de caixa semanal",
        "tempo_estimado": "30 min",
        "dificuldade": "Fácil",
        "faz_sozinho": True
    }))
    
    # ==========================================
    # 60 DIAS — CONSOLIDAÇÃO
    # ==========================================
    
    # Margem em zona de atenção
    if margem < benchmark_margem:
        acoes_60.append((70, {
            "titulo": f"Testar reajuste de preço em 3 produtos principais",
            "prioridade": "Média",
            "descricao": f"Com margem de {margem:.0f}% (meta do setor: {benchmark_margem}%), um aumento de 5% no preço médio geraria +{formatar_moeda(receita * 0.05)}/mês sem aumentar custos. Selecione 3 itens com menor sensibilidade a preço e teste por 30 dias.",
            "resultado_esperado": f"Aproximar margem de {margem:.0f}% da meta de {benchmark_margem}% — ganho de +{formatar_moeda(impacto_margem)}/mês",
            "tempo_estimado": "1h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # Fôlego entre 30-60
    if 30 <= folego < 60:
        meta_reais = (90 - folego) * despesa_diaria
        reserva_mensal = formatar_moeda(resultado * 0.2) if resultado > 0 else "o máximo possível"
        acoes_60.append((65, {
            "titulo": f"Ampliar fôlego de {folego} para 90 dias",
            "prioridade": "Média",
            "descricao": f"Faltam {formatar_moeda(meta_reais)} para atingir 90 dias de reserva. Separe {reserva_mensal}/mês em conta exclusiva para emergências.",
            "resultado_esperado": f"Acumular {formatar_moeda(meta_reais)} de reserva adicional",
            "tempo_estimado": "30 min",
            "dificuldade": "Fácil",
            "faz_sozinho": True
        }))
    
    # Ciclo financeiro alto
    if ciclo is not None and ciclo > 45:
        acoes_60.append((60, {
            "titulo": f"Reduzir ciclo financeiro de {ciclo} para menos de 45 dias",
            "prioridade": "Média",
            "descricao": f"Seu dinheiro fica preso por {ciclo} dias entre pagar e receber. Negocie +15 dias com fornecedores (libera ~{formatar_moeda(impacto_renegociar_15dias)}) e ofereça 2% de desconto para clientes que pagarem em 15 dias.",
            "resultado_esperado": f"Reduzir ciclo de {ciclo} para ~40 dias e liberar capital de giro",
            "tempo_estimado": "2-3h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # Dívida em zona de atenção (30-50%)
    if 30 <= peso_div <= 50:
        amortizacao = formatar_moeda(resultado * 0.3) if resultado > 0 else "o máximo disponível"
        acoes_60.append((55, {
            "titulo": f"Reduzir endividamento de {peso_div:.0f}% para abaixo de 30%",
            "prioridade": "Média",
            "descricao": f"Dívidas de {formatar_moeda(dividas)} = {peso_div:.0f}% da receita anual. Destine {amortizacao}/mês para amortização, priorizando as dívidas com juros mais altos.",
            "resultado_esperado": f"Reduzir dívidas de {formatar_moeda(dividas)} para {formatar_moeda(dividas * 0.7)} em 60 dias",
            "tempo_estimado": "2-4h",
            "dificuldade": "Avançado",
            "faz_sozinho": False
        }))
    
    # Resultado positivo mas baixo
    if resultado > 0 and receita > 0 and (resultado / receita * 100) < 10:
        pct = resultado / receita * 100
        meta_resultado = receita * 0.10
        acoes_60.append((50, {
            "titulo": f"Aumentar resultado de {pct:.0f}% para 10% da receita",
            "prioridade": "Média",
            "descricao": f"Seu lucro de {formatar_moeda(resultado)} = apenas {pct:.0f}% da receita. Meta saudável: 10% ({formatar_moeda(meta_resultado)}). Faltam {formatar_moeda(meta_resultado - resultado)}/mês. Combine redução de custos + melhoria de margem.",
            "resultado_esperado": f"Alcançar resultado de {formatar_moeda(meta_resultado)}/mês",
            "tempo_estimado": "1-2h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # Receita/funcionário abaixo do benchmark do setor
    if receita_func < benchmark_receita_func and funcionarios > 1:
        acoes_60.append((45, {
            "titulo": f"Aumentar produtividade de {formatar_moeda(receita_func)} por funcionário",
            "prioridade": "Média",
            "descricao": f"No setor de {setor_nome}, o benchmark é {formatar_moeda(benchmark_receita_func)}/funcionário. Seus {funcionarios} funcionários geram {formatar_moeda(receita_func)} cada. Automatize processos manuais (cobranças, notas, relatórios) e avalie se a equipe está dimensionada.",
            "resultado_esperado": f"Elevar para {formatar_moeda(benchmark_receita_func)}/funcionário (benchmark do setor)",
            "tempo_estimado": "2-4h",
            "dificuldade": "Avançado",
            "faz_sozinho": False
        }))
    
    # Fallbacks 60
    acoes_60.append((15, {
        "titulo": f"Criar reserva de emergência de {formatar_moeda(90 * despesa_diaria)}",
        "prioridade": "Média",
        "descricao": f"Abra conta separada exclusiva. Com despesas de {formatar_moeda(despesas)}/mês, o ideal é ter {formatar_moeda(90 * despesa_diaria)} guardados (90 dias). Configure transferência automática mensal.",
        "resultado_esperado": f"Reserva de emergência de 90 dias ({formatar_moeda(90 * despesa_diaria)})",
        "tempo_estimado": "30 min",
        "dificuldade": "Fácil",
        "faz_sozinho": True
    }))
    
    if receber > 0:
        acoes_60.append((10, {
            "titulo": "Automatizar cobrança de clientes",
            "prioridade": "Média",
            "descricao": f"Com {formatar_moeda(receber)} a receber mensalmente, uma régua automática (lembrete antes, cobrança no dia, follow-up em 3/7/15 dias) reduz inadimplência sem esforço manual.",
            "resultado_esperado": "Reduzir inadimplência em 30% e liberar tempo operacional",
            "tempo_estimado": "2-3h",
            "dificuldade": "Médio",
            "faz_sozinho": False
        }))
    
    # ==========================================
    # 90 DIAS — ESTRATÉGIA
    # ==========================================
    
    # Score saudável — hora de crescer
    if score >= 70:
        investimento = formatar_moeda(resultado * 0.3) if resultado > 0 else "parte do resultado"
        acoes_90.append((70, {
            "titulo": "Investir em crescimento — empresa saudável",
            "prioridade": "Média",
            "descricao": f"Com score {score:.0f}/100, margem de {margem:.0f}% e fôlego de {folego} dias, você tem base sólida. Avalie: novos canais de venda, expansão geográfica, produtos complementares. Destine até {investimento}/mês para testes.",
            "resultado_esperado": "Plano de crescimento para aumentar receita em 20% no próximo semestre",
            "tempo_estimado": "3-4h",
            "dificuldade": "Avançado",
            "faz_sozinho": False
        }))
    
    # Score atenção — consolidar
    if 50 <= score < 70:
        acoes_90.append((70, {
            "titulo": f"Elevar score de {score:.0f} para acima de 70",
            "prioridade": "Alta",
            "descricao": f"Score de {score:.0f}/100 mostra pontos a melhorar. Foque nos indicadores vermelhos e amarelos antes de pensar em expansão. Faça nova análise no Leme para medir evolução.",
            "resultado_esperado": "Score acima de 70 em 90 dias — empresa pronta para crescer",
            "tempo_estimado": "1h",
            "dificuldade": "Fácil",
            "faz_sozinho": True
        }))
    
    # Score crítico — sobrevivência
    if score < 50:
        problemas = []
        if resultado < 0: problemas.append("prejuízo mensal")
        if folego < 30: problemas.append("fôlego insuficiente")
        if margem < benchmark_margem * 0.5: problemas.append("margem crítica")
        if peso_div > 50: problemas.append("dívida alta")
        lista_problemas = ", ".join(problemas) if problemas else "indicadores abaixo do ideal"
        
        acoes_90.append((80, {
            "titulo": f"Sair da zona crítica — score {score:.0f}/100",
            "prioridade": "Alta",
            "descricao": f"Foco total em estabilizar: {lista_problemas}. Nenhum investimento novo até resolver os pontos críticos. Refaça a análise mensalmente para acompanhar evolução.",
            "resultado_esperado": f"Elevar score de {score:.0f} para acima de 50 — sair da zona de risco",
            "tempo_estimado": "1h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # Margem boa — reinvestir
    if margem >= benchmark_margem and resultado > 0:
        acoes_90.append((50, {
            "titulo": f"Reinvestir parte do lucro de {formatar_moeda(resultado)}/mês",
            "prioridade": "Média",
            "descricao": f"Com margem saudável de {margem:.0f}% (acima dos {benchmark_margem}% do setor) e lucro de {formatar_moeda(resultado)}/mês, destine 20-30% ({formatar_moeda(resultado * 0.25)}/mês) para marketing, vendas ou melhoria de produto.",
            "resultado_esperado": "Aumentar receita em 15-20% mantendo margem saudável",
            "tempo_estimado": "2-3h",
            "dificuldade": "Médio",
            "faz_sozinho": True
        }))
    
    # Tendência de queda
    if tendencia < -5:
        acoes_90.append((65, {
            "titulo": f"Diversificar receita — queda de {abs(tendencia):.0f}%",
            "prioridade": "Alta",
            "descricao": f"Receita caindo {abs(tendencia):.0f}% nos últimos meses. Não dependa de poucos clientes. Identifique 2 novas fontes de receita (online, parcerias, novos segmentos) e teste com investimento mínimo.",
            "resultado_esperado": "Pelo menos 20% da receita vindo de novas fontes em 90 dias",
            "tempo_estimado": "3-4h",
            "dificuldade": "Avançado",
            "faz_sozinho": False
        }))
    
    # Fallbacks 90
    acoes_90.append((15, {
        "titulo": "Acompanhar indicadores mensalmente no Leme",
        "prioridade": "Média",
        "descricao": f"Faça nova análise todo mês. Seus números de referência: Margem {margem:.0f}%, Fôlego {folego} dias, Resultado {formatar_moeda(resultado)}, Score {score:.0f}/100. Meta: melhorar cada indicador 5-10%/mês.",
        "resultado_esperado": "Histórico de evolução e decisões baseadas em dados reais",
        "tempo_estimado": "15 min",
        "dificuldade": "Fácil",
        "faz_sozinho": True
    }))
    
    acoes_90.append((10, {
        "titulo": f"Revisar precificação com base na margem de {margem:.0f}%",
        "prioridade": "Média",
        "descricao": f"Analise custo real de cada produto/serviço. Sua margem média é {margem:.0f}%, mas pode variar entre itens. No setor de {setor_nome}, a meta é {benchmark_margem}%. Elimine ou reajuste os que estão abaixo. Cada ponto extra = +{formatar_moeda(receita * 0.01)}/mês.",
        "resultado_esperado": f"Garantir margem mínima de {int(benchmark_margem * 0.75)}% em todos os itens",
        "tempo_estimado": "2-3h",
        "dificuldade": "Médio",
        "faz_sozinho": True
    }))
    
    acoes_90.append((5, {
        "titulo": "Definir metas financeiras para o próximo trimestre",
        "prioridade": "Média",
        "descricao": f"Com base nos indicadores atuais, defina metas claras: receita alvo, margem mínima ({benchmark_margem}%), resultado desejado, fôlego de caixa (60+ dias). Revise mensalmente.",
        "resultado_esperado": "Planejamento financeiro estruturado com metas mensuráveis",
        "tempo_estimado": "1h",
        "dificuldade": "Fácil",
        "faz_sozinho": True
    }))
    
    # ========== ORDENAR POR PRIORIDADE E SELECIONAR TOP 4 ==========
    acoes_30.sort(key=lambda x: x[0], reverse=True)
    acoes_60.sort(key=lambda x: x[0], reverse=True)
    acoes_90.sort(key=lambda x: x[0], reverse=True)
    
    plano_30 = [a[1] for a in acoes_30[:4]]
    plano_60 = [a[1] for a in acoes_60[:4]]
    plano_90 = [a[1] for a in acoes_90[:4]]
    
    return {
        "plano_30_dias": {
            "subtitulo": "Essa semana",
            "badge": "Rápido",
            "acoes": plano_30
        },
        "plano_60_dias": {
            "subtitulo": "Este mês",
            "badge": "Impacto médio",
            "acoes": plano_60
        },
        "plano_90_dias": {
            "subtitulo": "Próximos 90 dias",
            "badge": "Estrutural",
            "acoes": plano_90
        }
    }

def gerar_blocos_indicadores(analise: Analise) -> list:
    """Gera os 3 blocos de indicadores com status e explicações corretos"""
    
    # Helpers locais
    margem = float(analise.margem_bruta) if analise.margem_bruta is not None else 0
    resultado = float(analise.resultado_mes) if analise.resultado_mes is not None else 0
    pe = float(analise.ponto_equilibrio) if analise.ponto_equilibrio is not None else None
    folego = analise.folego_caixa if analise.folego_caixa is not None else 0
    capital = float(analise.capital_minimo) if analise.capital_minimo is not None else 0
    ciclo = analise.ciclo_financeiro  # pode ser None, 0, positivo ou negativo
    receita_func = float(analise.receita_funcionario) if analise.receita_funcionario is not None else 0
    peso_div = float(analise.peso_divida) if analise.peso_divida is not None else None
    receita = analise.receita_atual or 0
    caixa = analise.caixa_bancos or 0
    
    # ---- Capital Mínimo: status e explicação ----
    if capital < 0:
        capital_status = "critico"
        capital_explicacao = f"Você tem um déficit de {formatar_moeda(abs(capital))} entre o que tem a receber e o que deve pagar."
    elif caixa >= capital:
        capital_status = "saudavel"
        capital_explicacao = f"Você precisa de {formatar_moeda(capital)} de capital de giro e tem caixa suficiente."
    else:
        capital_status = "atencao"
        capital_explicacao = f"Você precisa de {formatar_moeda(capital)} de capital de giro, mas seu caixa é menor."
    
    # ---- Ciclo Financeiro: status e explicação ----
    if ciclo is None:
        ciclo_valor = "N/A"
        ciclo_status = "saudavel"
        ciclo_explicacao = "Não aplicável ao seu negócio (sem estoque)."
        ciclo_unidade = ""
    elif ciclo < 0:
        ciclo_valor = abs(ciclo)
        ciclo_status = "saudavel"
        ciclo_explicacao = f"Excelente! Você recebe {abs(ciclo)} dias antes de pagar fornecedores."
        ciclo_unidade = "dias"
    elif ciclo == 0:
        ciclo_valor = 0
        ciclo_status = "saudavel"
        ciclo_explicacao = "Equilíbrio perfeito entre pagar e receber."
        ciclo_unidade = "dias"
    else:
        ciclo_valor = ciclo
        ciclo_status = get_status(ciclo, "ciclo_financeiro")
        ciclo_explicacao = f"Leva {ciclo} dias entre pagar fornecedores e receber dos clientes."
        ciclo_unidade = "dias"
    
    # ---- Ponto de Equilíbrio: status e explicação ----
    if pe is None:
        pe_status = "critico"
        pe_explicacao = "Margem negativa: a empresa não cobre os custos diretos."
        pe_valor = "N/A"
    elif receita > 0 and pe < receita:
        pe_status = "saudavel"
        pe_explicacao = f"Você precisa faturar {formatar_moeda(pe)} para cobrir todos os custos."
        pe_valor = pe
    elif receita > 0 and pe >= receita:
        pe_status = "critico"
        pe_explicacao = f"Seu faturamento não atinge o ponto de equilíbrio de {formatar_moeda(pe)}."
        pe_valor = pe
    else:
        pe_status = "atencao"
        pe_explicacao = f"Ponto de equilíbrio: {formatar_moeda(pe)}."
        pe_valor = pe
    
    return [
        {
            "id": "eficiencia",
            "titulo": "Eficiência e Resultado",
            "subtitulo": "Como sua empresa transforma receita em lucro",
            "indicadores": [
                {
                    "id": "margem_bruta",
                    "nome": "Margem Bruta",
                    "valor": margem,
                    "unidade": "%",
                    "status": get_status(margem, "margem_bruta"),
                    "benchmark": "> 40%",
                    "explicacao": f"A cada R$ 100 vendidos, sobram R$ {margem:.0f} após custos diretos." if margem > 0 else "Custos diretos consomem toda a receita.",
                    "icone": "Percent"
                },
                {
                    "id": "resultado_mes",
                    "nome": "Resultado do Mês",
                    "valor": resultado,
                    "unidade": "R$",
                    "status": get_status(resultado, "resultado_mes"),
                    "benchmark": "> 0",
                    "explicacao": f"Lucro de {formatar_moeda(resultado)} após todas as despesas." if resultado > 0 else f"Prejuízo de {formatar_moeda(abs(resultado))} no mês." if resultado < 0 else "Resultado zero: empresa empata receitas e despesas.",
                    "icone": "DollarSign"
                },
                {
                    "id": "ponto_equilibrio",
                    "nome": "Ponto de Equilíbrio",
                    "valor": pe_valor,
                    "unidade": "R$",
                    "status": pe_status,
                    "benchmark": "< Receita",
                    "explicacao": pe_explicacao,
                    "icone": "Scale"
                }
            ]
        },
        {
            "id": "caixa",
            "titulo": "Caixa e Operação",
            "subtitulo": "Sua capacidade de honrar compromissos",
            "indicadores": [
                {
                    "id": "folego_caixa",
                    "nome": "Fôlego de Caixa",
                    "valor": folego,
                    "unidade": "dias",
                    "status": get_status(folego, "folego_caixa"),
                    "benchmark": "> 60 dias",
                    "explicacao": f"Com o caixa atual, você consegue pagar as despesas por {folego} dias sem faturar." if folego > 0 else "Sem reserva de caixa disponível.",
                    "icone": "Wallet"
                },
                {
                    "id": "capital_minimo",
                    "nome": "Capital Mínimo",
                    "valor": capital,
                    "unidade": "R$",
                    "status": capital_status,
                    "benchmark": "Disponível" if capital >= 0 else "Déficit",
                    "explicacao": capital_explicacao,
                    "icone": "Banknote"
                },
                {
                    "id": "ciclo_financeiro",
                    "nome": "Ciclo Financeiro",
                    "valor": ciclo_valor,
                    "unidade": ciclo_unidade,
                    "status": ciclo_status,
                    "benchmark": "< 45 dias" if ciclo is not None and ciclo > 0 else "Favorável" if ciclo is not None and ciclo <= 0 else "N/A",
                    "explicacao": ciclo_explicacao,
                    "icone": "RefreshCw"
                }
            ]
        },
        {
            "id": "estrutura",
            "titulo": "Estrutura e Produtividade",
            "subtitulo": "Eficiência da sua equipe e saúde financeira",
            "indicadores": [
                {
                    "id": "receita_funcionario",
                    "nome": "Receita/Funcionário",
                    "valor": receita_func,
                    "unidade": "R$/mês",
                    "status": "saudavel",
                    "benchmark": "Varia por setor",
                    "explicacao": f"Cada funcionário gera {formatar_moeda(receita_func)} de receita mensal em média." if receita_func > 0 else "Não calculado",
                    "icone": "Users"
                },
                {
                    "id": "peso_divida",
                    "nome": "Peso da Dívida",
                    "valor": peso_div if peso_div is not None else 0,
                    "unidade": "%",
                    "status": get_status(peso_div if peso_div is not None else 0, "peso_divida"),
                    "benchmark": "< 30%",
                    "explicacao": f"Suas dívidas representam {peso_div:.0f}% da receita anual." if peso_div is not None and peso_div > 0 else "Sem dívidas registradas.",
                    "icone": "CreditCard"
                }
            ]
        }
    ]


@router.get("/id/{analise_id}")
def get_dashboard_by_id(
    analise_id: str,
    db: Session = Depends(get_db)
):
    """
    Retorna dados do Dashboard para uma análise específica por ID.
    """
    from uuid import UUID
    
    try:
        uuid_id = UUID(analise_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID inválido"
        )
    
    # Buscar análise pelo ID
    analise = db.query(Analise).filter(Analise.id == uuid_id).first()
    
    if not analise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Análise não encontrada"
        )
    
    # Buscar histórico do mesmo email
    historico_db = db.query(Analise).filter(
        Analise.email == analise.email
    ).order_by(
        Analise.created_at.desc()
    ).limit(10).all()
    
    # Calcular lucro anual para payback
    lucro_anual = float(analise.resultado_mes) * 12 if analise.resultado_mes else 0
    
    # Montar resposta (mesma estrutura do endpoint por email)
    return {
        "empresa": {
            "nome": analise.nome_empresa,
            "email": analise.email,
            "estado": ESTADOS_NOMES.get(analise.estado, analise.estado),
            "setor": SETORES_NOMES.get(analise.setor, analise.setor),
            "mes_referencia": MESES.get(analise.mes_referencia, str(analise.mes_referencia)),
            "ano_referencia": analise.ano_referencia
        },
        
        "valuation": {
            "valor_minimo": float(analise.valor_empresa_min) if analise.valor_empresa_min else 0,
            "valor_maximo": float(analise.valor_empresa_max) if analise.valor_empresa_max else 0,
            "multiplo_usado": MULTIPLOS_SETOR.get(analise.setor, "2.0x - 4.0x"),
            "explicacao": "Baseado no faturamento anual × múltiplo do setor"
        },
        
        "payback": gerar_payback(
            float(analise.valor_empresa_min) if analise.valor_empresa_min else 0,
            float(analise.valor_empresa_max) if analise.valor_empresa_max else 0,
            lucro_anual
        ),
        
        "score": {
            "valor": int(analise.score_saude) if analise.score_saude else 0,
            "status": get_status(float(analise.score_saude) if analise.score_saude else 0, "score"),
            "tendencia": get_tendencia_tipo(float(analise.tendencia_receita) if analise.tendencia_receita else 0),
            "variacao": int(analise.tendencia_receita) if analise.tendencia_receita else 0
        },
        
        "score_evolucao": [
            {"mes": MESES.get(a.mes_referencia, "")[:3], "score": int(a.score_saude) if a.score_saude else 0}
            for a in reversed(historico_db[:6])
        ],
        
        "influenciadores": [
            {
                "nome": "Margem Bruta",
                "impacto": "positivo" if analise.margem_bruta and float(analise.margem_bruta) >= 40 else "negativo",
                "peso": 5 if analise.margem_bruta and float(analise.margem_bruta) >= 40 else 2,
                "descricao": f"{float(analise.margem_bruta):.0f}% - {'Acima' if float(analise.margem_bruta) >= 40 else 'Abaixo'} do benchmark" if analise.margem_bruta else "Não calculado"
            },
            {
                "nome": "Fôlego de Caixa",
                "impacto": "positivo" if analise.folego_caixa and analise.folego_caixa >= 60 else "negativo",
                "peso": 4 if analise.folego_caixa and analise.folego_caixa >= 60 else 2,
                "descricao": f"Reserva de {analise.folego_caixa} dias" if analise.folego_caixa else "Não calculado"
            },
            {
                "nome": "Resultado do Mês",
                "impacto": "positivo" if analise.resultado_mes and float(analise.resultado_mes) > 0 else "negativo",
                "peso": 4 if analise.resultado_mes and float(analise.resultado_mes) > 0 else 1,
                "descricao": "Empresa lucrativa" if analise.resultado_mes and float(analise.resultado_mes) > 0 else "Resultado negativo"
            },
            {
                "nome": "Peso da Dívida",
                "impacto": "positivo" if not analise.peso_divida or float(analise.peso_divida) < 30 else "negativo",
                "peso": 3 if not analise.peso_divida or float(analise.peso_divida) < 30 else 2,
                "descricao": f"{float(analise.peso_divida):.0f}% da receita anual" if analise.peso_divida else "Sem dívidas"
            }
        ],
        
        "blocos_indicadores": gerar_blocos_indicadores(analise),
        
        "diagnostico": {
            "pontos_fortes": analise.pontos_fortes or [],
            "pontos_atencao": analise.pontos_atencao or []
        },
        
        "plano_acao": gerar_plano_acao(analise),
        
        "historico": [
            {
                "id": str(a.id),
                "data": a.created_at.strftime("%Y-%m-%d"),
                "mes_referencia": f"{MESES.get(a.mes_referencia, '')} {a.ano_referencia}",
                "score": int(a.score_saude) if a.score_saude else 0,
                "status": get_status(float(a.score_saude) if a.score_saude else 0, "score")
            }
            for a in historico_db
        ],

        "simulador": {
            "caixa_disponivel": float(analise.caixa_bancos) if analise.caixa_bancos else 0,
            "receita_mensal": float(analise.receita_atual) if analise.receita_atual else 0,
            "custo_vendas": float(analise.custo_vendas) if analise.custo_vendas else 0,
            "despesas_fixas": float(analise.despesas_fixas) if analise.despesas_fixas else 0,
        }
    }

@router.get("/{email}")
def get_dashboard(
    email: str,
    db: Session = Depends(get_db)
):
    """
    Retorna todos os dados formatados para o Dashboard.
    Busca a análise mais recente do email.
    """
    
    # Buscar análise mais recente
    analise = db.query(Analise).filter(
        Analise.email == email
    ).order_by(
        Analise.created_at.desc()
    ).first()
    
    if not analise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhuma análise encontrada para este email"
        )
    
    # Buscar histórico
    historico_db = db.query(Analise).filter(
        Analise.email == email
    ).order_by(
        Analise.created_at.desc()
    ).limit(10).all()
    
    # Calcular lucro anual para payback
    lucro_anual = float(analise.resultado_mes) * 12 if analise.resultado_mes else 0
    
    # Montar resposta
    return {
        "empresa": {
            "nome": analise.nome_empresa,
            "email": analise.email,
            "estado": ESTADOS_NOMES.get(analise.estado, analise.estado),
            "setor": SETORES_NOMES.get(analise.setor, analise.setor),
            "mes_referencia": MESES.get(analise.mes_referencia, str(analise.mes_referencia)),
            "ano_referencia": analise.ano_referencia
        },
        
        "valuation": {
            "valor_minimo": float(analise.valor_empresa_min) if analise.valor_empresa_min else 0,
            "valor_maximo": float(analise.valor_empresa_max) if analise.valor_empresa_max else 0,
            "multiplo_usado": MULTIPLOS_SETOR.get(analise.setor, "2.0x - 4.0x"),
            "explicacao": "Baseado no faturamento anual × múltiplo do setor"
        },
        
        "payback": gerar_payback(
            float(analise.valor_empresa_min) if analise.valor_empresa_min else 0,
            float(analise.valor_empresa_max) if analise.valor_empresa_max else 0,
            lucro_anual
        ),
        
        "score": {
            "valor": int(analise.score_saude) if analise.score_saude else 0,
            "status": get_status(float(analise.score_saude) if analise.score_saude else 0, "score"),
            "tendencia": get_tendencia_tipo(float(analise.tendencia_receita) if analise.tendencia_receita else 0),
            "variacao": int(analise.tendencia_receita) if analise.tendencia_receita else 0
        },
        
        "score_evolucao": [
            {"mes": MESES.get(a.mes_referencia, "")[:3], "score": int(a.score_saude) if a.score_saude else 0}
            for a in reversed(historico_db[:6])
        ],
        
        "influenciadores": [
            {
                "nome": "Margem Bruta",
                "impacto": "positivo" if analise.margem_bruta and float(analise.margem_bruta) >= 40 else "negativo",
                "peso": 5 if analise.margem_bruta and float(analise.margem_bruta) >= 40 else 2,
                "descricao": f"{float(analise.margem_bruta):.0f}% - {'Acima' if float(analise.margem_bruta) >= 40 else 'Abaixo'} do benchmark" if analise.margem_bruta else "Não calculado"
            },
            {
                "nome": "Fôlego de Caixa",
                "impacto": "positivo" if analise.folego_caixa and analise.folego_caixa >= 60 else "negativo",
                "peso": 4 if analise.folego_caixa and analise.folego_caixa >= 60 else 2,
                "descricao": f"Reserva de {analise.folego_caixa} dias" if analise.folego_caixa else "Não calculado"
            },
            {
                "nome": "Resultado do Mês",
                "impacto": "positivo" if analise.resultado_mes and float(analise.resultado_mes) > 0 else "negativo",
                "peso": 4 if analise.resultado_mes and float(analise.resultado_mes) > 0 else 1,
                "descricao": "Empresa lucrativa" if analise.resultado_mes and float(analise.resultado_mes) > 0 else "Resultado negativo"
            },
            {
                "nome": "Peso da Dívida",
                "impacto": "positivo" if not analise.peso_divida or float(analise.peso_divida) < 30 else "negativo",
                "peso": 3 if not analise.peso_divida or float(analise.peso_divida) < 30 else 2,
                "descricao": f"{float(analise.peso_divida):.0f}% da receita anual" if analise.peso_divida else "Sem dívidas"
            }
        ],
        
        "blocos_indicadores": gerar_blocos_indicadores(analise),
        
        "diagnostico": {
    "pontos_fortes": analise.pontos_fortes or [],
    "pontos_atencao": analise.pontos_atencao or []
},
        
        "plano_acao": gerar_plano_acao(analise),
        
        "historico": [
            {
                "id": str(a.id),
                "data": a.created_at.strftime("%Y-%m-%d"),
                "mes_referencia": f"{MESES.get(a.mes_referencia, '')} {a.ano_referencia}",
                "score": int(a.score_saude) if a.score_saude else 0,
                "status": get_status(float(a.score_saude) if a.score_saude else 0, "score")
            }
            for a in historico_db
        ],

        "simulador": {
            "caixa_disponivel": float(analise.caixa_bancos) if analise.caixa_bancos else 0,
            "receita_mensal": float(analise.receita_atual) if analise.receita_atual else 0,
            "custo_vendas": float(analise.custo_vendas) if analise.custo_vendas else 0,
            "despesas_fixas": float(analise.despesas_fixas) if analise.despesas_fixas else 0,
        }
    }