"""
Serviço de cálculos para análise pré-abertura
Contém: Benchmarks por setor, fórmulas de capital, engine de alertas

Feature: Ainda não tenho empresa
"""

from datetime import datetime
from typing import Optional
from schemas.pre_abertura import (
    PreAberturaInput,
    SetorEnum,
    TipoNegocioEnum,
    ProLaboreEnum,
    FaixaFuncionariosEnum,
    ClientesGarantidosEnum,
    CategoriaAlertaEnum,
    SeveridadeAlertaEnum,
    AlertaPreAbertura,
    ComparativoCapital,
    ComparativoFaturamento,
    ItemChecklist,
    CalculosPreAbertura
)


# ========== BENCHMARKS POR SETOR ==========

BENCHMARKS_SETOR = {
    # Setor: (capital_base, faturamento_ref_mensal, margem_bruta_faixa, margem_ponto_medio)
    SetorEnum.COMERCIO_VAREJO: (25000, 15000, "25-35%", 30),
    SetorEnum.COMERCIO_ATACADO: (40000, 30000, "15-25%", 20),
    SetorEnum.SERVICOS: (15000, 10000, "45-55%", 50),
    SetorEnum.INDUSTRIA: (50000, 25000, "20-30%", 25),
    SetorEnum.TECNOLOGIA: (20000, 12000, "55-65%", 60),
    SetorEnum.ALIMENTACAO: (30000, 18000, "30-40%", 35),
    SetorEnum.SAUDE: (25000, 15000, "40-50%", 45),
    SetorEnum.EDUCACAO: (18000, 10000, "45-55%", 50),
    SetorEnum.CONSTRUCAO: (45000, 25000, "20-30%", 25),
    SetorEnum.AGRONEGOCIO: (35000, 20000, "25-35%", 30),
    SetorEnum.TRANSPORTE: (30000, 18000, "30-40%", 35),
    SetorEnum.HOTELARIA_TURISMO: (35000, 20000, "35-45%", 40),
    SetorEnum.IMOBILIARIO: (20000, 12000, "40-50%", 45),
    SetorEnum.FINANCEIRO: (25000, 15000, "50-60%", 55),
    SetorEnum.COMUNICACAO: (15000, 10000, "50-60%", 55),
    SetorEnum.ENERGIA: (40000, 22000, "30-40%", 35),
    SetorEnum.TEXTIL: (30000, 18000, "30-40%", 35),
    SetorEnum.METALURGICO: (45000, 25000, "20-30%", 25),
    SetorEnum.MOVEIS: (35000, 20000, "30-40%", 35),
    SetorEnum.GRAFICO: (25000, 12000, "35-45%", 40),
    SetorEnum.RECICLAGEM: (30000, 15000, "35-45%", 40),
}


# ========== CUSTO POR FUNCIONÁRIO POR GRUPO ==========

# Grupo 1: Serviços, Comunicação, Educação, Tecnologia → R$ 6.000
# Grupo 2: Alimentação, Hotelaria/Turismo, Saúde → R$ 10.000
# Grupo 3: Demais → R$ 8.000

CUSTO_FUNCIONARIO_GRUPO1 = 6000  # Serviços leves
CUSTO_FUNCIONARIO_GRUPO2 = 10000  # Intensivos em mão de obra
CUSTO_FUNCIONARIO_GRUPO3 = 8000  # Demais

SETORES_GRUPO1 = {
    SetorEnum.SERVICOS,
    SetorEnum.COMUNICACAO,
    SetorEnum.EDUCACAO,
    SetorEnum.TECNOLOGIA
}

SETORES_GRUPO2 = {
    SetorEnum.ALIMENTACAO,
    SetorEnum.HOTELARIA_TURISMO,
    SetorEnum.SAUDE
}


# ========== QUANTIDADE DE FUNCIONÁRIOS POR FAIXA ==========

QUANTIDADE_POR_FAIXA = {
    FaixaFuncionariosEnum.FAIXA_1_2: 1.5,
    FaixaFuncionariosEnum.FAIXA_3_5: 4.0,
    FaixaFuncionariosEnum.FAIXA_6_10: 8.0,
    FaixaFuncionariosEnum.FAIXA_10_MAIS: 12.0,
}


# ========== LABELS DOS SETORES ==========

SETOR_LABELS = {
    SetorEnum.COMERCIO_VAREJO: "Comércio Varejista",
    SetorEnum.COMERCIO_ATACADO: "Comércio Atacadista",
    SetorEnum.SERVICOS: "Serviços",
    SetorEnum.INDUSTRIA: "Indústria",
    SetorEnum.TECNOLOGIA: "Tecnologia",
    SetorEnum.ALIMENTACAO: "Alimentação e Bebidas",
    SetorEnum.SAUDE: "Saúde",
    SetorEnum.EDUCACAO: "Educação",
    SetorEnum.CONSTRUCAO: "Construção Civil",
    SetorEnum.AGRONEGOCIO: "Agronegócio",
    SetorEnum.TRANSPORTE: "Transporte e Logística",
    SetorEnum.HOTELARIA_TURISMO: "Hotelaria e Turismo",
    SetorEnum.IMOBILIARIO: "Imobiliário",
    SetorEnum.FINANCEIRO: "Serviços Financeiros",
    SetorEnum.COMUNICACAO: "Comunicação e Marketing",
    SetorEnum.ENERGIA: "Energia",
    SetorEnum.TEXTIL: "Têxtil e Vestuário",
    SetorEnum.METALURGICO: "Metalúrgico",
    SetorEnum.MOVEIS: "Móveis e Decoração",
    SetorEnum.GRAFICO: "Gráfico e Editorial",
    SetorEnum.RECICLAGEM: "Reciclagem e Meio Ambiente",
}


# ========== FUNÇÕES DE CÁLCULO ==========

def get_custo_funcionario(setor: SetorEnum) -> float:
    """Retorna o custo por funcionário baseado no setor"""
    if setor in SETORES_GRUPO1:
        return CUSTO_FUNCIONARIO_GRUPO1
    elif setor in SETORES_GRUPO2:
        return CUSTO_FUNCIONARIO_GRUPO2
    else:
        return CUSTO_FUNCIONARIO_GRUPO3


def get_quantidade_funcionarios(faixa: Optional[FaixaFuncionariosEnum]) -> float:
    """Retorna a quantidade de funcionários para cálculo"""
    if faixa is None:
        return 0
    return QUANTIDADE_POR_FAIXA.get(faixa, 0)


def calcular_meses_ate_abertura(mes_abertura: int, ano_abertura: int) -> int:
    """Calcula quantos meses faltam até a abertura"""
    hoje = datetime.now()
    data_abertura = datetime(ano_abertura, mes_abertura, 1)
    
    diferenca = (data_abertura.year - hoje.year) * 12 + (data_abertura.month - hoje.month)
    return max(0, diferenca)


def calcular_capital_recomendado(dados: PreAberturaInput) -> CalculosPreAbertura:
    """
    Calcula o capital recomendado com base nos moduladores.
    
    Fórmula:
    capital = capital_base
            + (funcionarios × custo_func)
            + (se estoque: subtotal × 1.20)
            + (se abertura < 3 meses: subtotal × 1.15)
            + (se tecnologia + produto: capital_base × 1.75)
    """
    
    # 1. Capital base do setor
    benchmark = BENCHMARKS_SETOR.get(dados.setor)
    capital_base = benchmark[0] if benchmark else 25000
    margem_faixa = benchmark[2] if benchmark else "30-40%"
    
    # 2. Custo por funcionário do setor
    custo_func = get_custo_funcionario(dados.setor)
    
    # 3. Quantidade de funcionários
    qtd_func = get_quantidade_funcionarios(dados.faixa_funcionarios) if dados.tem_funcionarios else 0
    
    # 4. Adicional de funcionários
    adicional_func = qtd_func * custo_func
    
    # Subtotal parcial
    subtotal = capital_base + adicional_func
    
    # 5. Adicional de estoque (+20%)
    adicional_estoque = 0.0
    if dados.tipo_negocio == TipoNegocioEnum.PRODUTO and dados.tem_estoque:
        adicional_estoque = subtotal * 0.20
        subtotal += adicional_estoque
    
    # 6. Adicional de pressa (+15% se < 3 meses)
    adicional_pressa = 0.0
    meses_ate_abertura = calcular_meses_ate_abertura(dados.mes_abertura, dados.ano_abertura)
    if meses_ate_abertura < 3:
        adicional_pressa = subtotal * 0.15
        subtotal += adicional_pressa
    
    # 7. Adicional tecnologia + produto (+75% do capital base)
    adicional_tech = 0.0
    if dados.setor == SetorEnum.TECNOLOGIA and dados.tipo_negocio == TipoNegocioEnum.PRODUTO:
        adicional_tech = capital_base * 0.75
        subtotal += adicional_tech
    
    return CalculosPreAbertura(
        capital_base_setor=capital_base,
        custo_por_funcionario=custo_func,
        quantidade_funcionarios=qtd_func,
        adicional_funcionarios=adicional_func,
        adicional_estoque=adicional_estoque,
        adicional_pressa=adicional_pressa,
        adicional_tech_produto=adicional_tech,
        margem_setor=margem_faixa
    )


def calcular_comparativo_capital(
    capital_informado: float,
    calculos: CalculosPreAbertura
) -> ComparativoCapital:
    """Calcula o comparativo de capital"""
    
    capital_recomendado = (
        calculos.capital_base_setor +
        calculos.adicional_funcionarios +
        calculos.adicional_estoque +
        calculos.adicional_pressa +
        calculos.adicional_tech_produto
    )
    
    if capital_recomendado > 0:
        diferenca = ((capital_informado - capital_recomendado) / capital_recomendado) * 100
    else:
        diferenca = 0
    
    # Determinar status
    if diferenca >= 0:
        status = "acima"
    elif diferenca >= -20:
        status = "adequado"
    elif diferenca >= -50:
        status = "abaixo"
    else:
        status = "muito_abaixo"
    
    return ComparativoCapital(
        capital_informado=capital_informado,
        capital_recomendado=round(capital_recomendado, 2),
        diferenca_percentual=round(diferenca, 1),
        status=status
    )


def calcular_comparativo_faturamento(
    faturamento_esperado: float,
    setor: SetorEnum
) -> ComparativoFaturamento:
    """Calcula o comparativo de faturamento"""
    
    benchmark = BENCHMARKS_SETOR.get(setor)
    faturamento_ref = benchmark[1] if benchmark else 15000
    
    if faturamento_ref > 0:
        diferenca = ((faturamento_esperado - faturamento_ref) / faturamento_ref) * 100
    else:
        diferenca = 0
    
    # Determinar status
    if diferenca > 50:
        status = "muito_acima"
    elif diferenca >= 0:
        status = "acima"
    elif diferenca >= -50:
        status = "abaixo"
    else:
        status = "muito_abaixo"
    
    return ComparativoFaturamento(
        faturamento_esperado=faturamento_esperado,
        faturamento_referencia=faturamento_ref,
        diferenca_percentual=round(diferenca, 1),
        status=status
    )


# ========== ENGINE DE ALERTAS ==========

def selecionar_alertas(
    dados: PreAberturaInput,
    comparativo_capital: ComparativoCapital,
    comparativo_faturamento: ComparativoFaturamento,
    calculos: CalculosPreAbertura
) -> list[AlertaPreAbertura]:
    """
    Seleciona até 3 alertas: 1 financeiro + 1 operacional + 1 estrutural.
    Prioriza os mais críticos de cada categoria.
    """
    
    alertas_financeiros = _avaliar_alertas_financeiros(dados, comparativo_capital, comparativo_faturamento)
    alertas_operacionais = _avaliar_alertas_operacionais(dados, comparativo_capital, calculos)
    alertas_estruturais = _avaliar_alertas_estruturais(dados, comparativo_capital)
    
    resultado = []
    
    # Pega o mais crítico de cada categoria
    if alertas_financeiros:
        resultado.append(alertas_financeiros[0])
    
    if alertas_operacionais:
        resultado.append(alertas_operacionais[0])
    
    if alertas_estruturais:
        resultado.append(alertas_estruturais[0])
    
    return resultado[:3]


def _avaliar_alertas_financeiros(
    dados: PreAberturaInput,
    comp_capital: ComparativoCapital,
    comp_fat: ComparativoFaturamento
) -> list[AlertaPreAbertura]:
    """Avalia e retorna alertas financeiros ordenados por prioridade"""
    
    alertas = []
    capital_status = comp_capital.status
    capital_recomendado = comp_capital.capital_recomendado
    capital_informado = comp_capital.capital_informado
    
    # F1 — Capital < 50% do recomendado
    if capital_status == "muito_abaixo":
        alertas.append(AlertaPreAbertura(
            id="F1",
            categoria=CategoriaAlertaEnum.FINANCEIRO,
            severidade=SeveridadeAlertaEnum.ALERTA,
            titulo="Capital significativamente abaixo da referência",
            texto=f"Para esse setor, a referência de capital inicial é de R$ {capital_recomendado:,.0f}. Com R$ {capital_informado:,.0f} disponível, o risco de dificuldades nos primeiros meses é elevado. Considere buscar fontes complementares ou começar menor.".replace(",", ".")
        ))
    
    # F2 — Capital entre 50-80% do recomendado
    elif capital_status == "abaixo":
        alertas.append(AlertaPreAbertura(
            id="F2",
            categoria=CategoriaAlertaEnum.FINANCEIRO,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Capital abaixo da referência do setor",
            texto="Seu capital está próximo, mas ainda abaixo da referência para esse setor. Isso exige controle rigoroso de gastos e estrutura inicial enxuta."
        ))
    
    # F3 — Pró-labore = Sim E Capital < recomendado
    if dados.prolabore == ProLaboreEnum.SIM and capital_status in ["abaixo", "muito_abaixo"]:
        alertas.append(AlertaPreAbertura(
            id="F3",
            categoria=CategoriaAlertaEnum.FINANCEIRO,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Pró-labore pode pressionar o caixa",
            texto="Tirar pró-labore desde o início, com capital limitado, reduz sua margem de segurança. Avalie se consegue adiar essa retirada nos primeiros meses."
        ))
    
    # F4 — Pró-labore = "Ainda não sei"
    if dados.prolabore == ProLaboreEnum.NAO_SEI:
        alertas.append(AlertaPreAbertura(
            id="F4",
            categoria=CategoriaAlertaEnum.FINANCEIRO,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Defina sua estratégia de pró-labore",
            texto="Saber se você vai tirar pró-labore muda completamente o planejamento financeiro. Defina isso antes de abrir."
        ))
    
    # F5 — Faturamento esperado < 50% da média
    if comp_fat.status == "muito_abaixo":
        alertas.append(AlertaPreAbertura(
            id="F5",
            categoria=CategoriaAlertaEnum.FINANCEIRO,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Expectativa de faturamento conservadora",
            texto="Sua estimativa está bem abaixo da média do setor. Isso pode ser realista para o início, mas planeje o crescimento."
        ))
    
    # F6 — Faturamento esperado > 150% da média
    if comp_fat.diferenca_percentual > 50:
        alertas.append(AlertaPreAbertura(
            id="F6",
            categoria=CategoriaAlertaEnum.FINANCEIRO,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Expectativa de faturamento otimista",
            texto="Sua estimativa está acima da média do setor. Isso é possível, mas evite basear custos fixos nessa projeção."
        ))
    
    # F7 — Sem clientes garantidos E capital < recomendado
    if dados.clientes_garantidos == ClientesGarantidosEnum.NAO and capital_status in ["abaixo", "muito_abaixo"]:
        alertas.append(AlertaPreAbertura(
            id="F7",
            categoria=CategoriaAlertaEnum.FINANCEIRO,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Sem clientes garantidos e capital limitado",
            texto="Começar sem clientes confirmados exige reserva financeira maior. Considere validar demanda antes de investir ou reduzir a estrutura inicial."
        ))
    
    return alertas


def _avaliar_alertas_operacionais(
    dados: PreAberturaInput,
    comp_capital: ComparativoCapital,
    calculos: CalculosPreAbertura
) -> list[AlertaPreAbertura]:
    """Avalia e retorna alertas operacionais ordenados por prioridade"""
    
    alertas = []
    capital_status = comp_capital.status
    setor_label = SETOR_LABELS.get(dados.setor, str(dados.setor))
    
    # Pega o ponto médio da margem para avaliar
    benchmark = BENCHMARKS_SETOR.get(dados.setor)
    margem_ponto_medio = benchmark[3] if benchmark else 40
    
    # O1 — Funcionários = Sim (qualquer quantidade)
    if dados.tem_funcionarios:
        alertas.append(AlertaPreAbertura(
            id="O1",
            categoria=CategoriaAlertaEnum.OPERACIONAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Funcionários aumentam o risco inicial",
            texto="Cada funcionário representa custo fixo mensal (salário + encargos). Considere começar sozinho ou com sócios, se possível, até validar o modelo."
        ))
    
    # O2 — Funcionários = 6-10 ou 10+
    if dados.faixa_funcionarios in [FaixaFuncionariosEnum.FAIXA_6_10, FaixaFuncionariosEnum.FAIXA_10_MAIS]:
        alertas.append(AlertaPreAbertura(
            id="O2",
            categoria=CategoriaAlertaEnum.OPERACIONAL,
            severidade=SeveridadeAlertaEnum.ALERTA,
            titulo="Equipe grande para início de operação",
            texto="Começar com mais de 5 funcionários é incomum e arriscado. A maioria das empresas cresce a equipe conforme a demanda."
        ))
    
    # O3 e variantes — Estoque + margem baixa
    if dados.tipo_negocio == TipoNegocioEnum.PRODUTO and dados.tem_estoque:
        
        # O3-agravado: Estoque + margem baixa + capital baixo
        if margem_ponto_medio <= 35 and capital_status in ["abaixo", "muito_abaixo"]:
            alertas.append(AlertaPreAbertura(
                id="O3-agravado",
                categoria=CategoriaAlertaEnum.OPERACIONAL,
                severidade=SeveridadeAlertaEnum.ALERTA,
                titulo="Estoque com caixa limitado é risco elevado",
                texto="Você indicou trabalhar com estoque em um setor de margem apertada, com capital abaixo da referência. Essa combinação exige atenção: comece com estoque mínimo e gire rápido."
            ))
        
        # O3-completo: Margem < 35%
        elif margem_ponto_medio < 35:
            alertas.append(AlertaPreAbertura(
                id="O3",
                categoria=CategoriaAlertaEnum.OPERACIONAL,
                severidade=SeveridadeAlertaEnum.ATENCAO,
                titulo="Estoque em setor de margem bruta apertada",
                texto=f"Setores como {setor_label} tendem a operar com margens brutas menores. Estoque parado representa dinheiro parado. Negocie prazos com fornecedores."
            ))
        
        # O3-soft: Margem = 35%
        elif margem_ponto_medio == 35:
            alertas.append(AlertaPreAbertura(
                id="O3-soft",
                categoria=CategoriaAlertaEnum.OPERACIONAL,
                severidade=SeveridadeAlertaEnum.ATENCAO,
                titulo="Estoque pode pressionar o caixa",
                texto="Estoque pode pressionar o caixa nesse setor. Priorize giro rápido e negociação de prazo com fornecedores."
            ))
    
    # O4 — Estoque + Capital < recomendado (se não entrou em O3-agravado)
    if (dados.tipo_negocio == TipoNegocioEnum.PRODUTO and 
        dados.tem_estoque and 
        capital_status in ["abaixo", "muito_abaixo"] and
        not any(a.id == "O3-agravado" for a in alertas)):
        alertas.append(AlertaPreAbertura(
            id="O4",
            categoria=CategoriaAlertaEnum.OPERACIONAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Estoque exige capital de giro",
            texto="Trabalhar com estoque amarra parte do seu capital. Com recursos limitados, comece com estoque mínimo e reponha conforme vender."
        ))
    
    # O5 — Produto sem estoque
    if dados.tipo_negocio == TipoNegocioEnum.PRODUTO and not dados.tem_estoque:
        alertas.append(AlertaPreAbertura(
            id="O5",
            categoria=CategoriaAlertaEnum.OPERACIONAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Produto sem estoque próprio",
            texto="Você indicou vender produto, mas sem estoque. Isso funciona bem com dropshipping ou sob encomenda. Confirme se seu modelo é esse."
        ))
    
    # O6 — Setor intensivo em mão de obra sem funcionários
    if dados.setor in [SetorEnum.ALIMENTACAO, SetorEnum.HOTELARIA_TURISMO] and not dados.tem_funcionarios:
        alertas.append(AlertaPreAbertura(
            id="O6",
            categoria=CategoriaAlertaEnum.OPERACIONAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Setor intensivo em mão de obra",
            texto=f"{setor_label} geralmente demanda equipe desde o início. Verifique se consegue operar sozinho ou se precisará contratar logo."
        ))
    
    # O7 — Prazo curto + capital limitado
    meses_ate_abertura = calcular_meses_ate_abertura(dados.mes_abertura, dados.ano_abertura)
    if meses_ate_abertura < 3 and capital_status in ["abaixo", "muito_abaixo"]:
        alertas.append(AlertaPreAbertura(
            id="O7",
            categoria=CategoriaAlertaEnum.OPERACIONAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Prazo curto com capital limitado",
            texto="Abrir em menos de 3 meses com capital abaixo da referência aumenta o risco. Considere adiar a abertura para fortalecer o caixa e reduzir riscos."
        ))
    
    return alertas


def _avaliar_alertas_estruturais(
    dados: PreAberturaInput,
    comp_capital: ComparativoCapital
) -> list[AlertaPreAbertura]:
    """Avalia e retorna alertas estruturais ordenados por prioridade"""
    
    alertas = []
    capital_status = comp_capital.status
    setor_label = SETOR_LABELS.get(dados.setor, str(dados.setor))
    
    # E4 — Bom sinal: demanda pré-validada (POSITIVO - prioridade alta)
    if dados.clientes_garantidos in [ClientesGarantidosEnum.SIM, ClientesGarantidosEnum.PARCIALMENTE]:
        alertas.append(AlertaPreAbertura(
            id="E4",
            categoria=CategoriaAlertaEnum.ESTRUTURAL,
            severidade=SeveridadeAlertaEnum.POSITIVO,
            titulo="Bom sinal: demanda pré-validada",
            texto="Ter clientes ou contratos antes de abrir reduz significativamente o risco. Formalize esses compromissos se possível."
        ))
    
    # E5 — Estrutura enxuta com boa reserva (POSITIVO)
    if (dados.tipo_negocio == TipoNegocioEnum.SERVICO and 
        not dados.tem_funcionarios and 
        capital_status in ["acima", "adequado"]):
        alertas.append(AlertaPreAbertura(
            id="E5",
            categoria=CategoriaAlertaEnum.ESTRUTURAL,
            severidade=SeveridadeAlertaEnum.POSITIVO,
            titulo="Estrutura enxuta com boa reserva",
            texto="Serviço sem funcionários e capital acima da referência é uma combinação de baixo risco. Bom ponto de partida."
        ))
    
    # E1 — Setor alimentação (alta taxa de encerramento)
    if dados.setor == SetorEnum.ALIMENTACAO:
        alertas.append(AlertaPreAbertura(
            id="E1",
            categoria=CategoriaAlertaEnum.ESTRUTURAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Setor com alta taxa de encerramento de empresas",
            texto="Alimentação é um dos setores com maior taxa de encerramento de empresas. Diferencie-se, controle custos e tenha reserva para imprevistos."
        ))
    
    # E2 — Tecnologia como produto
    if dados.setor == SetorEnum.TECNOLOGIA and dados.tipo_negocio == TipoNegocioEnum.PRODUTO:
        alertas.append(AlertaPreAbertura(
            id="E2",
            categoria=CategoriaAlertaEnum.ESTRUTURAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Tecnologia como produto exige investimento",
            texto="Tecnologia como produto costuma exigir mais tempo até gerar receita. Por isso, sua reserva recomendada é maior. Valide a ideia antes de investir pesado."
        ))
    
    # E3 — Setor intensivo em capital
    if dados.setor in [SetorEnum.CONSTRUCAO, SetorEnum.INDUSTRIA] and capital_status in ["abaixo", "muito_abaixo"]:
        alertas.append(AlertaPreAbertura(
            id="E3",
            categoria=CategoriaAlertaEnum.ESTRUTURAL,
            severidade=SeveridadeAlertaEnum.ATENCAO,
            titulo="Setor intensivo em capital",
            texto=f"{setor_label} tende a exigir investimento inicial maior que outros setores. Seu capital pode ser insuficiente para essa operação."
        ))
    
    # E6 — Fallback positivo (se não tiver alertas negativos significativos)
    if not alertas:
        alertas.append(AlertaPreAbertura(
            id="E6",
            categoria=CategoriaAlertaEnum.ESTRUTURAL,
            severidade=SeveridadeAlertaEnum.POSITIVO,
            titulo="Seu planejamento indica viabilidade inicial",
            texto="Os números indicam uma estrutura inicial equilibrada. Mantenha controle financeiro rigoroso nos primeiros meses."
        ))
    
    # Ordena para priorizar positivos quando há
    alertas.sort(key=lambda x: (0 if x.severidade == SeveridadeAlertaEnum.POSITIVO else 1))
    
    return alertas


# ========== CHECKLIST 30 DIAS ==========

def gerar_checklist(dados: PreAberturaInput) -> list[ItemChecklist]:
    """Gera o checklist de 30 dias para abertura"""
    
    checklist = [
        ItemChecklist(
            texto="Definir estrutura jurídica (MEI, ME, LTDA)",
            condicional=False
        ),
        ItemChecklist(
            texto="Pesquisar exigências da prefeitura local",
            condicional=False
        ),
        ItemChecklist(
            texto="Abrir conta bancária PJ",
            condicional=False
        ),
        ItemChecklist(
            texto="Contratar contador ou empresa de contabilidade",
            condicional=False
        ),
    ]
    
    # Condicionais
    if dados.tipo_negocio == TipoNegocioEnum.PRODUTO and dados.tem_estoque:
        checklist.append(ItemChecklist(
            texto="Pesquisar fornecedores e negociar prazos",
            condicional=True,
            condicao="tem_estoque"
        ))
    
    if dados.clientes_garantidos == ClientesGarantidosEnum.NAO:
        checklist.append(ItemChecklist(
            texto="Validar primeiros clientes antes de investir pesado",
            condicional=True,
            condicao="sem_clientes"
        ))
    
    if dados.tem_funcionarios:
        checklist.append(ItemChecklist(
            texto="Planejar contratação e documentação trabalhista",
            condicional=True,
            condicao="tem_funcionarios"
        ))
    
    return checklist


# ========== FUNÇÃO PRINCIPAL ==========

def processar_analise_pre_abertura(dados: PreAberturaInput) -> dict:
    """
    Processa todos os cálculos e retorna os dados para resposta.
    """
    
    # 1. Calcular capital recomendado
    calculos = calcular_capital_recomendado(dados)
    
    # 2. Comparativo de capital
    comparativo_capital = calcular_comparativo_capital(dados.capital_disponivel, calculos)
    
    # 3. Comparativo de faturamento
    comparativo_faturamento = calcular_comparativo_faturamento(dados.faturamento_esperado, dados.setor)
    
    # 4. Selecionar alertas
    alertas = selecionar_alertas(dados, comparativo_capital, comparativo_faturamento, calculos)
    
    # 5. Gerar checklist
    checklist = gerar_checklist(dados)
    
    # 6. Mensagem de contexto (se aplicável)
    mensagem_contexto = None
    if dados.setor == SetorEnum.TECNOLOGIA and dados.tipo_negocio == TipoNegocioEnum.PRODUTO:
        mensagem_contexto = "Tecnologia como produto costuma exigir mais tempo sem receita. Por isso, sua reserva recomendada é maior."
    
    # 7. Formatar previsão de abertura
    meses = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
             "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    previsao_abertura = f"{meses[dados.mes_abertura]}/{dados.ano_abertura}"
    
    return {
        "tipo_negocio": dados.tipo_negocio.value,
        "setor": dados.setor.value,
        "setor_label": SETOR_LABELS.get(dados.setor, str(dados.setor)),
        "estado": dados.estado,
        "cidade": dados.cidade,
        "previsao_abertura": previsao_abertura,
        "comparativo_capital": comparativo_capital,
        "comparativo_faturamento": comparativo_faturamento,
        "alertas": alertas,
        "checklist_30_dias": checklist,
        "mensagem_contexto": mensagem_contexto,
        "calculos": calculos
    }
