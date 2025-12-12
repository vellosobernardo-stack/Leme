"""
Gerador de Diagnóstico e Plano de Ação INTELIGENTE
Analisa indicadores reais e gera recomendações específicas por severidade
"""

from typing import Dict, List, Optional
from schemas.analise import IndicadoresCalculados, DadosAnaliseInput


def formatar_moeda(valor: float) -> str:
    """Formata valor para padrão brasileiro"""
    if valor is None:
        return "R$ 0"
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def formatar_numero(valor: float) -> str:
    """Formata número para padrão brasileiro"""
    if valor is None:
        return "0"
    return f"{valor:,.0f}".replace(",", ".")


# ========== BENCHMARKS POR SETOR ==========
BENCHMARKS = {
    "comercio_varejo": {"margem_bruta": 30, "folego_ideal": 45, "ciclo_ideal": 15},
    "comercio_atacado": {"margem_bruta": 25, "folego_ideal": 45, "ciclo_ideal": 20},
    "servicos": {"margem_bruta": 50, "folego_ideal": 45, "ciclo_ideal": 10},
    "industria": {"margem_bruta": 40, "folego_ideal": 60, "ciclo_ideal": 30},
    "tecnologia": {"margem_bruta": 60, "folego_ideal": 60, "ciclo_ideal": 15},
    "alimentacao": {"margem_bruta": 35, "folego_ideal": 30, "ciclo_ideal": 10},
    "saude": {"margem_bruta": 45, "folego_ideal": 45, "ciclo_ideal": 20},
    "default": {"margem_bruta": 35, "folego_ideal": 45, "ciclo_ideal": 25}
}


def get_benchmarks(setor: str) -> dict:
    """Retorna benchmarks do setor ou default"""
    return BENCHMARKS.get(setor, BENCHMARKS["default"])


def identificar_problemas(
    dados: DadosAnaliseInput,
    indicadores: IndicadoresCalculados
) -> Dict[str, Dict]:
    """
    Identifica problemas financeiros e classifica por severidade.
    
    Severidades:
    - CRITICA: Ação imediata necessária (risco de quebra)
    - ALTA: Problema sério que precisa de atenção em 30 dias
    - MEDIA: Oportunidade de melhoria em 60-90 dias
    - OPORTUNIDADE: Pontos positivos que podem ser potencializados
    """
    
    problemas = {}
    benchmarks = get_benchmarks(dados.setor.value if hasattr(dados.setor, 'value') else str(dados.setor))
    
    # ========== 1. RESULTADO NEGATIVO (PREJUÍZO) ==========
    if indicadores.resultado_mes is not None and indicadores.resultado_mes < 0:
        problemas["resultado_negativo"] = {
            "severidade": "CRITICA",
            "valor_atual": indicadores.resultado_mes,
            "valor_ideal": dados.despesas_fixas * 0.1,  # Meta: 10% de lucro sobre despesas
            "gap": abs(indicadores.resultado_mes),
            "descricao": f"Prejuízo de {formatar_moeda(abs(indicadores.resultado_mes))} no mês"
        }
    
    # ========== 2. FÔLEGO DE CAIXA ==========
    if indicadores.folego_caixa is not None:
        if indicadores.folego_caixa < 15:
            problemas["folego_critico"] = {
                "severidade": "CRITICA",
                "valor_atual": indicadores.folego_caixa,
                "valor_ideal": benchmarks["folego_ideal"],
                "gap": benchmarks["folego_ideal"] - indicadores.folego_caixa,
                "descricao": f"Apenas {indicadores.folego_caixa} dias de caixa"
            }
        elif indicadores.folego_caixa < 30:
            problemas["folego_baixo"] = {
                "severidade": "ALTA",
                "valor_atual": indicadores.folego_caixa,
                "valor_ideal": benchmarks["folego_ideal"],
                "gap": benchmarks["folego_ideal"] - indicadores.folego_caixa,
                "descricao": f"Fôlego de {indicadores.folego_caixa} dias está abaixo do ideal"
            }
    
    # ========== 3. MARGEM BRUTA ==========
    if indicadores.margem_bruta is not None:
        benchmark_margem = benchmarks["margem_bruta"]
        if indicadores.margem_bruta < 15:
            problemas["margem_critica"] = {
                "severidade": "CRITICA",
                "valor_atual": indicadores.margem_bruta,
                "valor_ideal": benchmark_margem,
                "gap": benchmark_margem - indicadores.margem_bruta,
                "impacto_estimado": dados.receita_atual * (benchmark_margem - indicadores.margem_bruta) / 100,
                "descricao": f"Margem de {indicadores.margem_bruta:.1f}% é insustentável"
            }
        elif indicadores.margem_bruta < 25:
            problemas["margem_baixa"] = {
                "severidade": "ALTA",
                "valor_atual": indicadores.margem_bruta,
                "valor_ideal": benchmark_margem,
                "gap": benchmark_margem - indicadores.margem_bruta,
                "impacto_estimado": dados.receita_atual * (benchmark_margem - indicadores.margem_bruta) / 100,
                "descricao": f"Margem de {indicadores.margem_bruta:.1f}% abaixo do setor ({benchmark_margem}%)"
            }
        elif indicadores.margem_bruta < benchmark_margem:
            problemas["margem_melhoravel"] = {
                "severidade": "MEDIA",
                "valor_atual": indicadores.margem_bruta,
                "valor_ideal": benchmark_margem,
                "gap": benchmark_margem - indicadores.margem_bruta,
                "impacto_estimado": dados.receita_atual * (benchmark_margem - indicadores.margem_bruta) / 100,
                "descricao": f"Margem pode melhorar de {indicadores.margem_bruta:.1f}% para {benchmark_margem}%"
            }
    
    # ========== 4. PONTO DE EQUILÍBRIO ==========
    if indicadores.ponto_equilibrio is not None and dados.receita_atual > 0:
        pe_percentual = (indicadores.ponto_equilibrio / dados.receita_atual) * 100
        if pe_percentual > 100:
            problemas["pe_acima_receita"] = {
                "severidade": "CRITICA",
                "valor_atual": pe_percentual,
                "valor_ideal": 70,
                "gap": pe_percentual - 70,
                "descricao": f"Ponto de equilíbrio ({pe_percentual:.0f}%) ACIMA da receita atual"
            }
        elif pe_percentual > 85:
            problemas["pe_apertado"] = {
                "severidade": "ALTA",
                "valor_atual": pe_percentual,
                "valor_ideal": 70,
                "gap": pe_percentual - 70,
                "descricao": f"Ponto de equilíbrio em {pe_percentual:.0f}% da receita - margem de segurança mínima"
            }
    
    # ========== 5. PESO DA DÍVIDA ==========
    if indicadores.peso_divida is not None:
        if indicadores.peso_divida > 50:
            problemas["divida_alta"] = {
                "severidade": "ALTA",
                "valor_atual": indicadores.peso_divida,
                "valor_ideal": 30,
                "gap": indicadores.peso_divida - 30,
                "descricao": f"Dívidas representam {indicadores.peso_divida:.1f}% da receita anual"
            }
        elif indicadores.peso_divida > 30:
            problemas["divida_moderada"] = {
                "severidade": "MEDIA",
                "valor_atual": indicadores.peso_divida,
                "valor_ideal": 30,
                "gap": indicadores.peso_divida - 30,
                "descricao": f"Endividamento de {indicadores.peso_divida:.1f}% merece atenção"
            }
    
    # ========== 6. CICLO FINANCEIRO ==========
    if indicadores.ciclo_financeiro is not None:
        ciclo_ideal = benchmarks["ciclo_ideal"]
        if indicadores.ciclo_financeiro > ciclo_ideal + 30:
            problemas["ciclo_longo"] = {
                "severidade": "ALTA",
                "valor_atual": indicadores.ciclo_financeiro,
                "valor_ideal": ciclo_ideal,
                "gap": indicadores.ciclo_financeiro - ciclo_ideal,
                "descricao": f"Ciclo de {indicadores.ciclo_financeiro} dias prende muito capital"
            }
        elif indicadores.ciclo_financeiro > ciclo_ideal:
            problemas["ciclo_melhoravel"] = {
                "severidade": "MEDIA",
                "valor_atual": indicadores.ciclo_financeiro,
                "valor_ideal": ciclo_ideal,
                "gap": indicadores.ciclo_financeiro - ciclo_ideal,
                "descricao": f"Ciclo financeiro pode ser otimizado"
            }
    
    # ========== 7. PRODUTIVIDADE POR FUNCIONÁRIO ==========
    if indicadores.receita_funcionario is not None:
        if indicadores.receita_funcionario < 8000:
            problemas["produtividade_critica"] = {
                "severidade": "ALTA",
                "valor_atual": indicadores.receita_funcionario,
                "valor_ideal": 15000,
                "gap": 15000 - indicadores.receita_funcionario,
                "descricao": f"Apenas {formatar_moeda(indicadores.receita_funcionario)}/funcionário - equipe superdimensionada?"
            }
        elif indicadores.receita_funcionario < 15000:
            problemas["produtividade_baixa"] = {
                "severidade": "MEDIA",
                "valor_atual": indicadores.receita_funcionario,
                "valor_ideal": 15000,
                "gap": 15000 - indicadores.receita_funcionario,
                "descricao": f"Produtividade de {formatar_moeda(indicadores.receita_funcionario)}/funcionário pode melhorar"
            }
    
    # ========== 8. TENDÊNCIA DE QUEDA ==========
    if indicadores.tendencia_status == "caindo" and indicadores.tendencia_receita is not None:
        if indicadores.tendencia_receita < -10:
            problemas["queda_acentuada"] = {
                "severidade": "CRITICA",
                "valor_atual": indicadores.tendencia_receita,
                "valor_ideal": 5,
                "gap": abs(indicadores.tendencia_receita),
                "descricao": f"Receita caindo {abs(indicadores.tendencia_receita):.1f}% - tendência perigosa"
            }
        else:
            problemas["queda_vendas"] = {
                "severidade": "ALTA",
                "valor_atual": indicadores.tendencia_receita,
                "valor_ideal": 5,
                "gap": abs(indicadores.tendencia_receita),
                "descricao": f"Receita em queda de {abs(indicadores.tendencia_receita):.1f}%"
            }
    
    return problemas

def gerar_acoes_30_dias(
    problemas: Dict[str, Dict],
    dados: DadosAnaliseInput,
    indicadores: IndicadoresCalculados
) -> List[Dict]:
    """
    Gera ações prioritárias para 30 dias.
    Foco: Resolver problemas CRÍTICOS e de ALTA severidade.
    """
    
    acoes = []
    
    # ========== AÇÃO 1: CAIXA/LIQUIDEZ (Sempre prioridade se houver problema) ==========
    if "folego_critico" in problemas:
        p = problemas["folego_critico"]
        acoes.append({
            "titulo": "URGENTE: Aumentar caixa imediatamente",
            "prioridade": "Alta",
            "descricao": f"Com apenas {p['valor_atual']} dias de fôlego, você precisa agir agora. Opções: (1) Antecipar recebíveis via factoring ou banco, (2) Negociar extensão de prazo com fornecedores principais, (3) Postergar gastos não essenciais por 30 dias.",
            "resultado_esperado": f"Elevar fôlego para pelo menos 30 dias"
        })
    elif "folego_baixo" in problemas:
        p = problemas["folego_baixo"]
        acoes.append({
            "titulo": "Construir reserva de caixa",
            "prioridade": "Alta",
            "descricao": f"Fôlego de {p['valor_atual']} dias está abaixo do ideal ({p['valor_ideal']} dias). Separe 10% de cada recebimento em conta reserva. Negocie prazos maiores com fornecedores.",
            "resultado_esperado": f"Atingir {p['valor_ideal']} dias de reserva em 60 dias"
        })
    
    # ========== AÇÃO 2: RESULTADO NEGATIVO (PREJUÍZO) ==========
    if "resultado_negativo" in problemas:
        p = problemas["resultado_negativo"]
        acoes.append({
            "titulo": "Reverter prejuízo com corte emergencial",
            "prioridade": "Alta",
            "descricao": f"Prejuízo de {formatar_moeda(p['gap'])} exige ação imediata. Liste TODAS as despesas e classifique: (A) Essencial para operar, (B) Importante mas pode reduzir, (C) Pode cortar. Elimine categoria C e reduza B em 30%.",
            "resultado_esperado": "Zerar prejuízo e criar margem de segurança"
        })
    
    # ========== AÇÃO 3: MARGEM CRÍTICA ==========
    if "margem_critica" in problemas:
        p = problemas["margem_critica"]
        acoes.append({
            "titulo": "Reajuste de preços urgente",
            "prioridade": "Alta",
            "descricao": f"Margem de {p['valor_atual']:.1f}% é insustentável. Ações: (1) Aumente preços em 10-15% nos produtos menos sensíveis, (2) Renegocie com fornecedores buscando 5-10% de desconto, (3) Descontinue produtos com margem negativa.",
            "resultado_esperado": f"Elevar margem para pelo menos 25%"
        })
    elif "margem_baixa" in problemas:
        p = problemas["margem_baixa"]
        impacto = p.get('impacto_estimado', 0)
        acoes.append({
            "titulo": f"Aumentar margem de {p['valor_atual']:.1f}% para {p['valor_ideal']}%",
            "prioridade": "Alta",
            "descricao": f"Sua margem está {p['gap']:.1f} pontos abaixo do setor. Mapeie os 3 produtos/serviços de menor margem e avalie: reajustar preço em 8-12% ou descontinuar. Renegocie com principal fornecedor.",
            "resultado_esperado": f"Incremento mensal de aproximadamente {formatar_moeda(impacto * 0.3)}"
        })
    
    # ========== AÇÃO 4: PONTO DE EQUILÍBRIO ACIMA DA RECEITA ==========
    if "pe_acima_receita" in problemas:
        p = problemas["pe_acima_receita"]
        acoes.append({
            "titulo": "Reduzir ponto de equilíbrio abaixo da receita",
            "prioridade": "Alta",
            "descricao": f"Seu ponto de equilíbrio está em {p['valor_atual']:.0f}% da receita - você precisa vender mais do que consegue para não ter prejuízo. Corte despesas fixas em 20% ou aumente margem bruta em 10 pontos.",
            "resultado_esperado": "Ponto de equilíbrio abaixo de 85% da receita"
        })
    elif "pe_apertado" in problemas:
        p = problemas["pe_apertado"]
        acoes.append({
            "titulo": "Aumentar margem de segurança operacional",
            "prioridade": "Alta",
            "descricao": f"Com ponto de equilíbrio em {p['valor_atual']:.0f}% da receita, qualquer queda nas vendas gera prejuízo. Identifique despesas fixas que podem virar variáveis (comissão ao invés de salário fixo, por exemplo).",
            "resultado_esperado": "Ponto de equilíbrio abaixo de 70% da receita"
        })
    
    # ========== AÇÃO 5: QUEDA NAS VENDAS ==========
    if "queda_acentuada" in problemas:
        p = problemas["queda_acentuada"]
        acoes.append({
            "titulo": "Diagnóstico urgente da queda de vendas",
            "prioridade": "Alta",
            "descricao": f"Receita caindo {abs(p['valor_atual']):.1f}% é sinal de alerta grave. Esta semana: converse com 10 clientes que deixaram de comprar e 5 que reduziram. Pergunte: preço, qualidade, concorrência ou mudança de necessidade?",
            "resultado_esperado": "Identificar as 3 principais causas em 7 dias"
        })
    elif "queda_vendas" in problemas:
        p = problemas["queda_vendas"]
        acoes.append({
            "titulo": "Investigar causas da queda de vendas",
            "prioridade": "Alta",
            "descricao": f"Receita em queda de {abs(p['valor_atual']):.1f}%. Analise: (1) Seus 10 maiores clientes ainda compram o mesmo volume? (2) Há novos concorrentes? (3) Seu mix de produtos ainda atende o mercado?",
            "resultado_esperado": "Plano de ação para estabilizar vendas"
        })
    
    # ========== AÇÃO 6: DÍVIDA ALTA ==========
    if "divida_alta" in problemas:
        p = problemas["divida_alta"]
        acoes.append({
            "titulo": "Renegociar dívidas de maior custo",
            "prioridade": "Alta",
            "descricao": f"Dívidas em {p['valor_atual']:.1f}% da receita anual comprometem o crescimento. Liste todas as dívidas com taxa de juros. Priorize renegociar as com juros >2% ao mês. Busque consolidação ou portabilidade.",
            "resultado_esperado": "Reduzir parcelas mensais em 20-30%"
        })
    
    # ========== AÇÃO 7: PRODUTIVIDADE CRÍTICA ==========
    if "produtividade_critica" in problemas:
        p = problemas["produtividade_critica"]
        acoes.append({
            "titulo": "Revisar estrutura de pessoal",
            "prioridade": "Alta",
            "descricao": f"Com {formatar_moeda(p['valor_atual'])} por funcionário, a equipe pode estar superdimensionada. Analise: cada função é essencial? Há ociosidade? Tarefas repetitivas que podem ser automatizadas?",
            "resultado_esperado": "Adequar equipe ao volume de operação atual"
        })
    
    # ========== AÇÕES GENÉRICAS SE NÃO HOUVER PROBLEMAS CRÍTICOS ==========
    if len(acoes) == 0:
        acoes.append({
            "titulo": "Implementar controle financeiro diário",
            "prioridade": "Alta",
            "descricao": f"Mesmo com indicadores saudáveis, crie rotina de fechamento diário: registre todas as entradas e saídas, confira saldo bancário, atualize contas a pagar/receber. Configure alerta para saldo abaixo de {formatar_moeda(dados.despesas_fixas)}.",
            "resultado_esperado": "Visibilidade completa do fluxo de caixa"
        })
    
    if len(acoes) < 2:
        acoes.append({
            "titulo": "Mapear custos por produto/serviço",
            "prioridade": "Média",
            "descricao": "Calcule o custo REAL de cada produto/serviço incluindo: matéria-prima, mão de obra proporcional, embalagem, frete, comissões e impostos. Identifique os 20% que geram 80% do lucro.",
            "resultado_esperado": "Foco comercial nos produtos mais rentáveis"
        })
    
    if len(acoes) < 3:
        acoes.append({
            "titulo": "Renegociar com principais fornecedores",
            "prioridade": "Média",
            "descricao": "Entre em contato com seus 3 maiores fornecedores. Peça: (1) Desconto de 5% para pedidos consolidados, (2) Prazo estendido de 7-15 dias, ou (3) Bonificação por volume trimestral.",
            "resultado_esperado": "Redução de 3-5% nos custos de aquisição"
        })
    
    if len(acoes) < 4:
        acoes.append({
            "titulo": "Criar processo de aprovação de despesas",
            "prioridade": "Média",
            "descricao": f"Estabeleça regra: despesas acima de {formatar_moeda(dados.despesas_fixas * 0.05)} precisam de aprovação documentada com justificativa. Crie checklist de 3 perguntas antes de qualquer gasto novo.",
            "resultado_esperado": "Eliminar gastos por impulso e criar consciência financeira"
        })
    
    # Retorna no máximo 4 ações
    return acoes[:4]

def gerar_acoes_60_dias(
    problemas: Dict[str, Dict],
    dados: DadosAnaliseInput,
    indicadores: IndicadoresCalculados
) -> List[Dict]:
    """
    Gera ações estruturantes para 60 dias.
    Foco: Consolidar melhorias e resolver problemas de severidade MÉDIA.
    """
    
    acoes = []
    
    # ========== AÇÃO 1: DASHBOARD DE INDICADORES ==========
    acoes.append({
        "titulo": "Criar rotina de acompanhamento dos indicadores",
        "prioridade": "Alta",
        "descricao": f"Defina um dia fixo por semana para analisar: fôlego de caixa ({indicadores.folego_caixa or 0} dias), margem bruta ({indicadores.margem_bruta or 0:.1f}%), resultado do mês e contas a pagar/receber. Anote tendências e tome decisões baseadas em dados.",
        "resultado_esperado": "Detectar problemas com antecedência e agir antes da crise"
    })
    
    # ========== AÇÃO 2: CICLO FINANCEIRO ==========
    if "ciclo_longo" in problemas:
        p = problemas["ciclo_longo"]
        acoes.append({
            "titulo": f"Reduzir ciclo financeiro de {p['valor_atual']} para {p['valor_ideal'] + 10} dias",
            "prioridade": "Alta",
            "descricao": f"Seu ciclo de {p['valor_atual']} dias prende capital na operação. Ataque nas duas pontas: (1) Reduza prazo de recebimento oferecendo 3% de desconto para pagamento em 7 dias, (2) Estenda prazo com fornecedores em 15 dias.",
            "resultado_esperado": f"Liberar capital de giro equivalente a {p['gap']} dias de operação"
        })
    elif "ciclo_melhoravel" in problemas:
        p = problemas["ciclo_melhoravel"]
        acoes.append({
            "titulo": "Otimizar ciclo financeiro",
            "prioridade": "Média",
            "descricao": f"Ciclo atual de {p['valor_atual']} dias pode ser reduzido. Revise: prazo médio de recebimento (pode reduzir?), prazo com fornecedores (pode estender?), giro de estoque (itens parados >45 dias?).",
            "resultado_esperado": f"Reduzir ciclo para {p['valor_ideal']} dias"
        })
    
    # ========== AÇÃO 3: MARGEM MELHORÁVEL ==========
    if "margem_melhoravel" in problemas:
        p = problemas["margem_melhoravel"]
        acoes.append({
            "titulo": f"Otimizar margem de {p['valor_atual']:.1f}% para {p['valor_ideal']}%",
            "prioridade": "Média",
            "descricao": f"Há espaço para ganhar {p['gap']:.1f} pontos de margem. Faça análise ABC dos produtos: os 20% que mais vendem têm margem adequada? Teste aumento de 5% nos itens menos sensíveis a preço.",
            "resultado_esperado": f"Incremento de {formatar_moeda(p.get('impacto_estimado', 0) * 0.5)} no resultado mensal"
        })
    
    # ========== AÇÃO 4: DÍVIDA MODERADA ==========
    if "divida_moderada" in problemas:
        p = problemas["divida_moderada"]
        acoes.append({
            "titulo": "Criar plano de redução de dívidas",
            "prioridade": "Média",
            "descricao": f"Endividamento de {p['valor_atual']:.1f}% merece atenção. Liste todas as dívidas ordenadas por taxa de juros. Direcione sobras de caixa para quitar as mais caras primeiro. Evite novas dívidas.",
            "resultado_esperado": f"Reduzir endividamento para abaixo de {p['valor_ideal']}% em 6 meses"
        })
    
    # ========== AÇÃO 5: PRODUTIVIDADE BAIXA ==========
    if "produtividade_baixa" in problemas:
        p = problemas["produtividade_baixa"]
        acoes.append({
            "titulo": "Aumentar produtividade da equipe",
            "prioridade": "Média",
            "descricao": f"Produtividade de {formatar_moeda(p['valor_atual'])} por funcionário está abaixo do ideal ({formatar_moeda(p['valor_ideal'])}). Mapeie os 5 processos que mais consomem tempo. Busque: automação, eliminação de retrabalho, treinamento.",
            "resultado_esperado": "Aumentar receita por funcionário em 20%"
        })
    
    # ========== AÇÃO 6: DESPESAS FIXAS ==========
    despesas = dados.despesas_fixas
    acoes.append({
        "titulo": "Revisar e renegociar despesas fixas",
        "prioridade": "Média",
        "descricao": f"Com despesas fixas de {formatar_moeda(despesas)}/mês, revise cada item: (1) Aluguel - há como renegociar ou mudar? (2) Telecom/Internet - cotar alternativas, (3) Assinaturas - cancelar não utilizadas, (4) Seguros - cotar 3 corretoras.",
        "resultado_esperado": f"Economizar 10-15% = {formatar_moeda(despesas * 0.125)} mensais"
    })
    
    # ========== AÇÃO 7: RECUPERAÇÃO DE VENDAS (se houve queda) ==========
    if "queda_vendas" in problemas or "queda_acentuada" in problemas:
        acoes.append({
            "titulo": "Implementar plano de recuperação de vendas",
            "prioridade": "Alta",
            "descricao": "Com base no diagnóstico dos 30 dias, implemente: (1) Campanha de reativação para clientes inativos há 60+ dias, (2) Oferta especial para os 20 maiores clientes, (3) Teste de novo canal de vendas (delivery, marketplace, redes sociais).",
            "resultado_esperado": "Estabilizar receita e iniciar recuperação"
        })
    
    # ========== AÇÃO GENÉRICA: RENTABILIDADE POR CANAL ==========
    if len(acoes) < 4:
        acoes.append({
            "titulo": "Calcular rentabilidade real por produto/canal",
            "prioridade": "Média",
            "descricao": "Vá além da margem bruta média. Calcule a margem REAL de cada produto e canal de venda descontando TODOS os custos: frete, comissões, impostos, devoluções. Descubra quais realmente dão lucro.",
            "resultado_esperado": "Concentrar esforços nos 20% que geram 80% do lucro"
        })
    
    return acoes[:4]


def gerar_acoes_90_dias(
    problemas: Dict[str, Dict],
    dados: DadosAnaliseInput,
    indicadores: IndicadoresCalculados
) -> List[Dict]:
    """
    Gera ações estratégicas para 90 dias.
    Foco: Crescimento sustentável (se empresa saudável) ou consolidação (se em recuperação).
    """
    
    acoes = []
    
    # Verifica se empresa está em crise ou saudável
    tem_problemas_criticos = any(
        p.get("severidade") == "CRITICA" 
        for p in problemas.values()
    )
    
    resultado_positivo = indicadores.resultado_mes and indicadores.resultado_mes > 0
    margem_saudavel = indicadores.margem_bruta and indicadores.margem_bruta >= 25
    
    # ========== CENÁRIO 1: EMPRESA EM CRISE - FOCO EM ESTABILIZAÇÃO ==========
    if tem_problemas_criticos or not resultado_positivo:
        
        acoes.append({
            "titulo": "Consolidar base antes de crescer",
            "prioridade": "Alta",
            "descricao": "Antes de pensar em expansão, estabilize: (1) Confirme que as ações de 30 e 60 dias estão implementadas, (2) Documente processos críticos (compras, vendas, financeiro), (3) Garanta 45+ dias de fôlego de caixa.",
            "resultado_esperado": "Operação estável e preparada para crescer com segurança"
        })
        
        acoes.append({
            "titulo": "Criar reserva de emergência",
            "prioridade": "Alta",
            "descricao": f"Meta: reserva de {formatar_moeda(dados.despesas_fixas * 2)} (2 meses de despesas). Separe 10-15% de cada resultado positivo em conta exclusiva. Use APENAS para emergências reais.",
            "resultado_esperado": "Segurança financeira para enfrentar imprevistos"
        })
        
        acoes.append({
            "titulo": "Reduzir dependência do gestor principal",
            "prioridade": "Média",
            "descricao": "Treine 2-3 pessoas-chave para entender os números do negócio. Crie rotina mensal de 1h para revisar indicadores em equipe. Compartilhe metas e bonifique por resultados.",
            "resultado_esperado": "Equipe engajada e menor risco operacional"
        })
        
        acoes.append({
            "titulo": "Mapear riscos e criar plano B",
            "prioridade": "Média",
            "descricao": "Liste os 5 maiores riscos do negócio (perda de cliente grande, aumento de custos, etc). Para cada um, defina: sinais de alerta, ação preventiva e plano de contingência.",
            "resultado_esperado": "Resiliência para enfrentar cenários adversos"
        })
    
    # ========== CENÁRIO 2: EMPRESA SAUDÁVEL - FOCO EM CRESCIMENTO ==========
    else:
        
        receita_atual = dados.receita_atual
        meta_crescimento = receita_atual * 12 * 1.25  # 25% de crescimento anual
        
        acoes.append({
            "titulo": "Desenvolver plano de crescimento de 25%",
            "prioridade": "Média",
            "descricao": f"Com base sólida (margem {indicadores.margem_bruta:.1f}%, resultado positivo), planeje crescimento sustentável. Meta: sair de {formatar_moeda(receita_atual * 12)} para {formatar_moeda(meta_crescimento)} em receita anual. Defina metas por canal.",
            "resultado_esperado": "Crescimento organizado de 20-30% ao ano"
        })
        
        acoes.append({
            "titulo": "Criar reserva equivalente a 3 meses de operação",
            "prioridade": "Alta",
            "descricao": f"Meta: {formatar_moeda(dados.despesas_fixas * 3)}. Com indicadores saudáveis, é hora de construir colchão robusto. Separe 15% do resultado mensal até atingir o objetivo.",
            "resultado_esperado": "90 dias de autonomia para crises ou oportunidades"
        })
        
        acoes.append({
            "titulo": "Avaliar investimento em capacidade ou eficiência",
            "prioridade": "Média",
            "descricao": f"Com receita de {formatar_moeda(receita_atual)}/mês, mapeie investimentos que poderiam: aumentar capacidade em 30%, reduzir custos em 15%, ou abrir novo canal de vendas. Priorize opções com payback <12 meses.",
            "resultado_esperado": "Roadmap de investimentos para os próximos 12 meses"
        })
        
        acoes.append({
            "titulo": "Capacitar equipe em gestão financeira",
            "prioridade": "Média",
            "descricao": f"Treine 2-3 pessoas-chave para entender os 8 indicadores do Leme. Crie rotina mensal de revisão de números. Compartilhe metas financeiras e bonifique por atingimento.",
            "resultado_esperado": "Equipe autônoma e cultura de gestão por indicadores"
        })
    
    return acoes[:4]

def gerar_pontos_fortes(
    dados: DadosAnaliseInput,
    indicadores: IndicadoresCalculados,
    problemas: Dict[str, Dict]
) -> List[Dict]:
    """Gera lista de pontos fortes baseado nos indicadores positivos"""
    
    pontos = []
    
    # Margem Bruta excelente
    if indicadores.margem_bruta is not None:
        if indicadores.margem_bruta >= 50:
            pontos.append({
                "titulo": "Margem bruta excelente",
                "descricao": f"Com {indicadores.margem_bruta:.1f}% de margem, você consegue agregar muito valor ao seu produto/serviço."
            })
        elif indicadores.margem_bruta >= 40:
            pontos.append({
                "titulo": "Margem bruta saudável",
                "descricao": f"Com {indicadores.margem_bruta:.1f}% de margem, você tem boa capacidade de absorver variações de custo."
            })
    
    # Resultado positivo
    if indicadores.resultado_mes is not None and indicadores.resultado_mes > 0:
        percentual = (indicadores.resultado_mes / dados.receita_atual) * 100 if dados.receita_atual > 0 else 0
        if percentual >= 15:
            pontos.append({
                "titulo": "Rentabilidade muito boa",
                "descricao": f"Lucro de {formatar_moeda(indicadores.resultado_mes)} ({percentual:.1f}% da receita). Empresa muito rentável!"
            })
        elif percentual >= 5:
            pontos.append({
                "titulo": "Resultado positivo",
                "descricao": f"Lucro de {formatar_moeda(indicadores.resultado_mes)} no mês. A empresa está gerando valor."
            })
        else:
            pontos.append({
                "titulo": "Empresa lucrativa",
                "descricao": f"Resultado positivo de {formatar_moeda(indicadores.resultado_mes)}, mas há espaço para melhorar a rentabilidade."
            })
    
    # Fôlego de caixa bom
    if indicadores.folego_caixa is not None:
        if indicadores.folego_caixa >= 90:
            pontos.append({
                "titulo": "Reserva de caixa excelente",
                "descricao": f"Com {indicadores.folego_caixa} dias de fôlego, você tem reserva robusta para qualquer imprevisto."
            })
        elif indicadores.folego_caixa >= 60:
            pontos.append({
                "titulo": "Reserva de caixa adequada",
                "descricao": f"Com {indicadores.folego_caixa} dias de fôlego, sua reserva está em nível saudável."
            })
    
    # Sem dívidas ou dívida baixa
    if indicadores.peso_divida is None or indicadores.peso_divida == 0:
        pontos.append({
            "titulo": "Empresa sem dívidas",
            "descricao": "Situação financeira sólida, com liberdade para investir quando necessário."
        })
    elif indicadores.peso_divida <= 20:
        pontos.append({
            "titulo": "Endividamento baixo",
            "descricao": f"Apenas {indicadores.peso_divida:.1f}% da receita anual em dívidas. Boa margem para investir se necessário."
        })
    
    # Tendência de crescimento
    if indicadores.tendencia_status == "crescendo" and indicadores.tendencia_receita:
        pontos.append({
            "titulo": "Receita em crescimento",
            "descricao": f"Crescimento de {indicadores.tendencia_receita:.1f}% nos últimos meses. Momento favorável para investir."
        })
    elif indicadores.tendencia_status == "estavel":
        pontos.append({
            "titulo": "Receita estável",
            "descricao": "Base sólida nos últimos meses. Bom momento para planejar crescimento."
        })
    
    # Ciclo financeiro curto
    if indicadores.ciclo_financeiro is not None and indicadores.ciclo_financeiro <= 30:
        pontos.append({
            "titulo": "Ciclo financeiro eficiente",
            "descricao": f"Ciclo de {indicadores.ciclo_financeiro} dias indica boa gestão do capital de giro."
        })
    
    # Produtividade alta
    if indicadores.receita_funcionario is not None and indicadores.receita_funcionario >= 25000:
        pontos.append({
            "titulo": "Alta produtividade",
            "descricao": f"{formatar_moeda(indicadores.receita_funcionario)} por funcionário/mês. Equipe enxuta e eficiente."
        })
    
    return pontos[:4]

def gerar_pontos_atencao(
    problemas: Dict[str, Dict]
) -> List[Dict]:
    """Gera lista de pontos de atenção baseado nos problemas identificados"""
    
    pontos = []
    
    # Ordena problemas por severidade (CRITICA > ALTA > MEDIA)
    ordem_severidade = {"CRITICA": 0, "ALTA": 1, "MEDIA": 2, "OPORTUNIDADE": 3}
    problemas_ordenados = sorted(
        problemas.items(),
        key=lambda x: ordem_severidade.get(x[1].get("severidade", "MEDIA"), 2)
    )
    
    for nome, problema in problemas_ordenados:
        descricao = problema.get("descricao", "")
        severidade = problema.get("severidade", "")
        
        # Define título baseado no tipo de problema
        titulos = {
            "resultado_negativo": "Resultado negativo",
            "folego_critico": "Reserva de caixa crítica",
            "folego_baixo": "Reserva de caixa baixa",
            "margem_critica": "Margem bruta crítica",
            "margem_baixa": "Margem bruta baixa",
            "margem_melhoravel": "Margem pode melhorar",
            "pe_acima_receita": "Ponto de equilíbrio acima da receita",
            "pe_apertado": "Margem de segurança apertada",
            "divida_alta": "Endividamento elevado",
            "divida_moderada": "Endividamento moderado",
            "ciclo_longo": "Ciclo financeiro longo",
            "ciclo_melhoravel": "Ciclo financeiro pode melhorar",
            "produtividade_critica": "Produtividade muito baixa",
            "produtividade_baixa": "Produtividade abaixo do ideal",
            "queda_acentuada": "Queda acentuada nas vendas",
            "queda_vendas": "Vendas em queda"
        }
        
        titulo = titulos.get(nome, "Ponto de atenção")
        
        # Adiciona indicador de severidade na descrição
        if severidade == "CRITICA":
            descricao_final = f"🚨 {descricao}"
        elif severidade == "ALTA":
            descricao_final = f"⚠️ {descricao}"
        else:
            descricao_final = descricao
        
        pontos.append({
            "titulo": titulo,
            "descricao": descricao_final
        })
    
    return pontos[:5]

def gerar_diagnostico(
    dados: DadosAnaliseInput,
    indicadores: IndicadoresCalculados
) -> dict:
    """
    Função principal que gera diagnóstico completo e plano de ação.
    
    Retorna:
        dict com pontos_fortes, pontos_atencao, plano_30_dias, plano_60_dias, plano_90_dias
    """
    
    # 1. Identificar problemas
    problemas = identificar_problemas(dados, indicadores)
    
    # 2. Gerar pontos fortes e de atenção
    pontos_fortes = gerar_pontos_fortes(dados, indicadores, problemas)
    pontos_atencao = gerar_pontos_atencao(problemas)
    
    # 3. Gerar plano de ação 30/60/90 dias
    plano_30 = gerar_acoes_30_dias(problemas, dados, indicadores)
    plano_60 = gerar_acoes_60_dias(problemas, dados, indicadores)
    plano_90 = gerar_acoes_90_dias(problemas, dados, indicadores)
    
    return {
        "pontos_fortes": pontos_fortes,
        "pontos_atencao": pontos_atencao,
        "plano_30_dias": plano_30,
        "plano_60_dias": plano_60,
        "plano_90_dias": plano_90
    }