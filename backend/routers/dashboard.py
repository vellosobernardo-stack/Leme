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
        if valor is None or valor < 30: return "saudavel"
        if valor < 50: return "atencao"
        return "critico"
    elif tipo == "ciclo_financeiro":
        if valor is None: return "saudavel"
        if valor <= 45: return "saudavel"
        if valor <= 60: return "atencao"
        return "critico"
    elif tipo == "resultado_mes":
        if valor > 0: return "saudavel"
        if valor == 0: return "atencao"
        return "critico"
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
    """Gera diagnóstico baseado nos indicadores"""
    pontos_fortes = []
    pontos_atencao = []
    
    # Margem Bruta
    if analise.margem_bruta:
        margem = float(analise.margem_bruta)
        if margem >= 40:
            pontos_fortes.append({
                "titulo": "Margem bruta saudável",
                "descricao": f"Com {margem:.0f}% de margem, você tem boa capacidade de absorver variações de custo e investir em melhorias."
            })
        elif margem < 20:
            pontos_atencao.append({
                "titulo": "Margem bruta baixa",
                "descricao": f"Com apenas {margem:.0f}% de margem, sua empresa tem pouca flexibilidade. Considere revisar preços ou reduzir custos."
            })
    
    # Fôlego de Caixa
    if analise.folego_caixa:
        folego = analise.folego_caixa
        if folego >= 60:
            pontos_fortes.append({
                "titulo": "Reserva de caixa adequada",
                "descricao": f"{folego} dias de fôlego permite enfrentar imprevistos sem comprometer a operação."
            })
        elif folego < 30:
            pontos_atencao.append({
                "titulo": "Reserva de caixa crítica",
                "descricao": f"Com apenas {folego} dias de fôlego, qualquer imprevisto pode comprometer o pagamento de contas."
            })
    
    # Resultado do Mês
    if analise.resultado_mes:
        resultado = float(analise.resultado_mes)
        if resultado > 0:
            pontos_fortes.append({
                "titulo": "Resultado positivo",
                "descricao": f"Empresa lucrativa com resultado de {formatar_moeda(resultado)} no mês."
            })
        else:
            pontos_atencao.append({
                "titulo": "Resultado negativo",
                "descricao": f"A empresa está operando com prejuízo de {formatar_moeda(abs(float(analise.resultado_mes)))}. Ação urgente necessária."
            })
    
    # Ciclo Financeiro
    if analise.ciclo_financeiro:
        ciclo = analise.ciclo_financeiro
        if ciclo > 45:
            pontos_atencao.append({
                "titulo": "Ciclo financeiro acima do ideal",
                "descricao": f"{ciclo} dias é alto para o setor. Negocie melhores prazos com fornecedores ou reduza prazo de recebimento."
            })
    
    # Peso da Dívida
    if analise.peso_divida:
        peso = float(analise.peso_divida)
        if peso > 30:
            pontos_atencao.append({
                "titulo": "Endividamento elevado",
                "descricao": f"{peso:.0f}% da receita anual em dívidas. Priorize quitar as de maior juros antes de novos investimentos."
            })
    
    return {
        "pontos_fortes": pontos_fortes[:3],  # Máximo 3
        "pontos_atencao": pontos_atencao[:3]  # Máximo 3
    }


def gerar_plano_acao(analise: Analise) -> dict:
    """Gera plano de ação 30/60/90 dias"""
    plano_30 = []
    plano_60 = []
    plano_90 = []
    
    # 30 DIAS - Ações urgentes
    if analise.folego_caixa and analise.folego_caixa < 30:
        plano_30.append({
            "titulo": "Aumentar reserva de caixa imediatamente",
            "prioridade": "Alta",
            "descricao": "Antecipar recebíveis, negociar prazos com fornecedores e postergar gastos não essenciais.",
            "resultado_esperado": "Atingir pelo menos 30 dias de fôlego de caixa"
        })
    
    plano_30.append({
        "titulo": "Mapear todos os custos fixos e variáveis",
        "prioridade": "Alta",
        "descricao": "Criar planilha detalhada separando custos fixos (aluguel, salários) dos variáveis (insumos, comissões). Identificar os 3 maiores custos de cada categoria.",
        "resultado_esperado": "Visibilidade completa de onde o dinheiro está sendo gasto"
    })
    
    plano_30.append({
        "titulo": "Revisar contratos e assinaturas recorrentes",
        "prioridade": "Média",
        "descricao": "Listar todos os custos recorrentes (software, serviços, assinaturas). Avaliar se cada um está sendo utilizado e se há alternativas mais baratas.",
        "resultado_esperado": "Reduzir custos fixos em 5-10%"
    })
    
    plano_30.append({
        "titulo": "Antecipar cobrança de clientes inadimplentes",
        "prioridade": "Alta",
        "descricao": "Listar todos os valores a receber atrasados. Entrar em contato oferecendo desconto de 5% para pagamento imediato ou parcelamento.",
        "resultado_esperado": "Recuperar pelo menos 50% dos valores em atraso"
    })
    
    # 60 DIAS - Consolidação
    plano_60.append({
        "titulo": "Implementar automações para reduzir custos operacionais",
        "prioridade": "Média",
        "descricao": "Identificar 3 processos manuais que consomem mais tempo (emissão de notas, cobranças, relatórios) e buscar ferramentas de automação.",
        "resultado_esperado": "Reduzir 10 horas/semana de trabalho operacional"
    })
    
    if analise.margem_bruta and float(analise.margem_bruta) < 50:
        plano_60.append({
            "titulo": "Testar aumento de preços em produtos selecionados",
            "prioridade": "Média",
            "descricao": "Selecionar 3 produtos/serviços com menor sensibilidade a preço e testar aumento de 5-10%. Monitorar impacto nas vendas por 30 dias.",
            "resultado_esperado": "Aumentar margem bruta em 3-5 pontos percentuais"
        })
    
    plano_60.append({
        "titulo": "Criar reserva de emergência separada",
        "prioridade": "Alta",
        "descricao": "Abrir conta separada exclusiva para reserva. Configurar transferência automática de 10% do lucro líquido mensal.",
        "resultado_esperado": "Atingir 90 dias de fôlego de caixa"
    })
    
    plano_60.append({
        "titulo": "Estruturar processo de cobrança",
        "prioridade": "Média",
        "descricao": "Criar régua de cobrança automatizada: lembrete 3 dias antes, cobrança no vencimento, follow-up 3/7/15 dias após.",
        "resultado_esperado": "Reduzir inadimplência em 30%"
    })
    
    # 90 DIAS - Estratégia
    plano_90.append({
        "titulo": "Avaliar oportunidades de expansão",
        "prioridade": "Média",
        "descricao": "Avaliar: 1) Expansão geográfica, 2) Novos canais de venda, 3) Produtos/serviços complementares. Fazer estudo de viabilidade.",
        "resultado_esperado": "Plano de crescimento definido para o próximo semestre"
    })
    
    if analise.peso_divida and float(analise.peso_divida) > 30:
        plano_90.append({
            "titulo": "Implementar plano de redução de endividamento",
            "prioridade": "Alta",
            "descricao": "Listar todas as dívidas por taxa de juros. Quitar primeiro as mais caras. Buscar refinanciamento para reduzir taxa média.",
            "resultado_esperado": "Reduzir peso da dívida em 30%"
        })
    
    plano_90.append({
        "titulo": "Implementar dashboard de indicadores financeiros",
        "prioridade": "Média",
        "descricao": "Criar rotina mensal de acompanhamento dos 8 indicadores do Leme. Definir metas para cada indicador.",
        "resultado_esperado": "Decisões financeiras baseadas em dados, não em intuição"
    })
    
    plano_90.append({
        "titulo": "Revisar modelo de precificação",
        "prioridade": "Média",
        "descricao": "Fazer análise completa de custos fixos e variáveis por produto/serviço. Recalcular preços considerando margem de contribuição desejada.",
        "resultado_esperado": "Garantir margem mínima de 50% em todos os produtos/serviços"
    })
    
    return {
        "plano_30_dias": {
            "subtitulo": "Fundamentos e Otimizações Rápidas",
            "acoes": plano_30[:4]
        },
        "plano_60_dias": {
            "subtitulo": "Consolidação e Melhorias",
            "acoes": plano_60[:4]
        },
        "plano_90_dias": {
            "subtitulo": "Estratégia e Crescimento",
            "acoes": plano_90[:4]
        }
    }

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
        
        "blocos_indicadores": [
            {
                "id": "eficiencia",
                "titulo": "Eficiência e Resultado",
                "subtitulo": "Como sua empresa transforma receita em lucro",
                "indicadores": [
                    {
                        "id": "margem_bruta",
                        "nome": "Margem Bruta",
                        "valor": float(analise.margem_bruta) if analise.margem_bruta else 0,
                        "unidade": "%",
                        "status": get_status(float(analise.margem_bruta) if analise.margem_bruta else 0, "margem_bruta"),
                        "benchmark": "> 40%",
                        "explicacao": f"A cada R$ 100 vendidos, sobram R$ {float(analise.margem_bruta):.0f} após custos diretos." if analise.margem_bruta else "Não calculado",
                        "icone": "Percent"
                    },
                    {
                        "id": "resultado_mes",
                        "nome": "Resultado do Mês",
                        "valor": float(analise.resultado_mes) if analise.resultado_mes else 0,
                        "unidade": "R$",
                        "status": get_status(float(analise.resultado_mes) if analise.resultado_mes else 0, "resultado_mes"),
                        "benchmark": "> 0",
                        "explicacao": "Lucro líquido após todas as despesas." if analise.resultado_mes and float(analise.resultado_mes) > 0 else "Sua empresa está operando com prejuízo.",
                        "icone": "DollarSign"
                    },
                    {
                        "id": "ponto_equilibrio",
                        "nome": "Ponto de Equilíbrio",
                        "valor": float(analise.ponto_equilibrio) if analise.ponto_equilibrio else 0,
                        "unidade": "R$",
                        "status": "saudavel" if analise.ponto_equilibrio and analise.receita_atual and float(analise.ponto_equilibrio) < analise.receita_atual else "atencao",
                        "benchmark": "< Receita",
                        "explicacao": f"Você precisa faturar {formatar_moeda(float(analise.ponto_equilibrio))} para cobrir todos os custos." if analise.ponto_equilibrio else "Não calculado",
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
                        "valor": analise.folego_caixa if analise.folego_caixa else 0,
                        "unidade": "dias",
                        "status": get_status(analise.folego_caixa if analise.folego_caixa else 0, "folego_caixa"),
                        "benchmark": "> 60 dias",
                        "explicacao": f"Com o caixa atual, você consegue pagar as despesas por {analise.folego_caixa} dias sem faturar." if analise.folego_caixa else "Não calculado",
                        "icone": "Wallet"
                    },
                    {
                        "id": "capital_minimo",
                        "nome": "Capital Mínimo",
                        "valor": float(analise.capital_minimo) if analise.capital_minimo else 0,
                        "unidade": "R$",
                        "status": "saudavel" if analise.capital_minimo and analise.caixa_bancos and analise.caixa_bancos >= float(analise.capital_minimo) else "atencao",
                        "benchmark": "Disponível",
                        "explicacao": f"Você precisa de {formatar_moeda(float(analise.capital_minimo))} para manter a operação." if analise.capital_minimo else "Não calculado",
                        "icone": "Banknote"
                    },
                    {
                        "id": "ciclo_financeiro",
                        "nome": "Ciclo Financeiro",
                        "valor": analise.ciclo_financeiro if analise.ciclo_financeiro else 0,
                        "unidade": "dias",
                        "status": get_status(analise.ciclo_financeiro, "ciclo_financeiro") if analise.ciclo_financeiro else "saudavel",
                        "benchmark": "< 45 dias",
                        "explicacao": f"Leva {analise.ciclo_financeiro} dias entre pagar fornecedores e receber dos clientes." if analise.ciclo_financeiro else "Não aplicável ao seu negócio",
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
                        "valor": float(analise.receita_funcionario) if analise.receita_funcionario else 0,
                        "unidade": "R$/mês",
                        "status": "saudavel",
                        "benchmark": "Varia por setor",
                        "explicacao": f"Cada funcionário gera {formatar_moeda(float(analise.receita_funcionario))} de receita mensal em média." if analise.receita_funcionario else "Não calculado",
                        "icone": "Users"
                    },
                    {
                        "id": "peso_divida",
                        "nome": "Peso da Dívida",
                        "valor": float(analise.peso_divida) if analise.peso_divida else 0,
                        "unidade": "%",
                        "status": get_status(float(analise.peso_divida) if analise.peso_divida else 0, "peso_divida"),
                        "benchmark": "< 30%",
                        "explicacao": f"Suas dívidas representam {float(analise.peso_divida):.0f}% da receita anual." if analise.peso_divida else "Sem dívidas registradas",
                        "icone": "CreditCard"
                    }
                ]
            }
        ],
        
        "diagnostico": {
            "pontos_fortes": analise.pontos_fortes or [],
            "pontos_atencao": analise.pontos_atencao or []
        },
        
        "plano_acao": {
            "plano_30_dias": {
                "subtitulo": "Fundamentos e Otimizações Rápidas",
                "acoes": analise.plano_30_dias or []
            },
            "plano_60_dias": {
                "subtitulo": "Consolidação e Melhorias",
                "acoes": analise.plano_60_dias or []
            },
            "plano_90_dias": {
                "subtitulo": "Estratégia e Crescimento",
                "acoes": analise.plano_90_dias or []
            }
        },
        
        "historico": [
            {
                "id": str(a.id),
                "data": a.created_at.strftime("%Y-%m-%d"),
                "mes_referencia": f"{MESES.get(a.mes_referencia, '')} {a.ano_referencia}",
                "score": int(a.score_saude) if a.score_saude else 0,
                "status": get_status(float(a.score_saude) if a.score_saude else 0, "score")
            }
            for a in historico_db
        ]
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
        
        "blocos_indicadores": [
            {
                "id": "eficiencia",
                "titulo": "Eficiência e Resultado",
                "subtitulo": "Como sua empresa transforma receita em lucro",
                "indicadores": [
                    {
                        "id": "margem_bruta",
                        "nome": "Margem Bruta",
                        "valor": float(analise.margem_bruta) if analise.margem_bruta else 0,
                        "unidade": "%",
                        "status": get_status(float(analise.margem_bruta) if analise.margem_bruta else 0, "margem_bruta"),
                        "benchmark": "> 40%",
                        "explicacao": f"Você precisa faturar {formatar_moeda(float(analise.ponto_equilibrio))} para cobrir todos os custos." if analise.ponto_equilibrio else "Não calculado",
                        "icone": "Percent"
                    },
                    {
                        "id": "resultado_mes",
                        "nome": "Resultado do Mês",
                        "valor": float(analise.resultado_mes) if analise.resultado_mes else 0,
                        "unidade": "R$",
                        "status": get_status(float(analise.resultado_mes) if analise.resultado_mes else 0, "resultado_mes"),
                        "benchmark": "> 0",
                        "explicacao": "Lucro líquido após todas as despesas." if analise.resultado_mes and float(analise.resultado_mes) > 0 else "Sua empresa está operando com prejuízo.",
                        "icone": "DollarSign"
                    },
                    {
                        "id": "ponto_equilibrio",
                        "nome": "Ponto de Equilíbrio",
                        "valor": float(analise.ponto_equilibrio) if analise.ponto_equilibrio else 0,
                        "unidade": "R$",
                        "status": "saudavel" if analise.ponto_equilibrio and analise.receita_atual and float(analise.ponto_equilibrio) < analise.receita_atual else "atencao",
                        "benchmark": "< Receita",
                        "explicacao": f"Você precisa faturar {formatar_moeda(float(analise.ponto_equilibrio))} para cobrir todos os custos." if analise.ponto_equilibrio else "Não calculado",
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
                        "valor": analise.folego_caixa if analise.folego_caixa else 0,
                        "unidade": "dias",
                        "status": get_status(analise.folego_caixa if analise.folego_caixa else 0, "folego_caixa"),
                        "benchmark": "> 60 dias",
                        "explicacao": f"Com o caixa atual, você consegue pagar as despesas por {analise.folego_caixa} dias sem faturar." if analise.folego_caixa else "Não calculado",
                        "icone": "Wallet"
                    },
                    {
                        "id": "capital_minimo",
                        "nome": "Capital Mínimo",
                        "valor": float(analise.capital_minimo) if analise.capital_minimo else 0,
                        "unidade": "R$",
                        "status": "saudavel" if analise.capital_minimo and analise.caixa_bancos and analise.caixa_bancos >= float(analise.capital_minimo) else "atencao",
                        "benchmark": "Disponível",
                        "explicacao": f"Você precisa de {formatar_moeda(float(analise.capital_minimo))} para manter a operação." if analise.capital_minimo else "Não calculado",
                        "icone": "Banknote"
                    },
                    {
                        "id": "ciclo_financeiro",
                        "nome": "Ciclo Financeiro",
                        "valor": analise.ciclo_financeiro if analise.ciclo_financeiro else 0,
                        "unidade": "dias",
                        "status": get_status(analise.ciclo_financeiro, "ciclo_financeiro") if analise.ciclo_financeiro else "saudavel",
                        "benchmark": "< 45 dias",
                        "explicacao": f"Leva {analise.ciclo_financeiro} dias entre pagar fornecedores e receber dos clientes." if analise.ciclo_financeiro else "Não aplicável ao seu negócio",
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
                        "valor": float(analise.receita_funcionario) if analise.receita_funcionario else 0,
                        "unidade": "R$/mês",
                        "status": "saudavel",
                        "benchmark": "Varia por setor",
                        "explicacao": f"Cada funcionário gera {formatar_moeda(float(analise.receita_funcionario))} de receita mensal em média." if analise.receita_funcionario else "Não calculado",
                        "icone": "Users"
                    },
                    {
                        "id": "peso_divida",
                        "nome": "Peso da Dívida",
                        "valor": float(analise.peso_divida) if analise.peso_divida else 0,
                        "unidade": "%",
                        "status": get_status(float(analise.peso_divida) if analise.peso_divida else 0, "peso_divida"),
                        "benchmark": "< 30%",
                        "explicacao": f"Suas dívidas representam {float(analise.peso_divida):.0f}% da receita anual." if analise.peso_divida else "Sem dívidas registradas",
                        "icone": "CreditCard"
                    }
                ]
            }
        ],
        
        "diagnostico": {
    "pontos_fortes": analise.pontos_fortes or [],
    "pontos_atencao": analise.pontos_atencao or []
},
        
        "plano_acao": {
            "plano_30_dias": {
                "subtitulo": "Fundamentos e Otimizações Rápidas",
                "acoes": analise.plano_30_dias or []
            },
            "plano_60_dias": {
                "subtitulo": "Consolidação e Melhorias",
                "acoes": analise.plano_60_dias or []
            },
            "plano_90_dias": {
                "subtitulo": "Estratégia e Crescimento",
                 "acoes": analise.plano_90_dias or []
    }
},
        
        "historico": [
            {
                "id": str(a.id),
                "data": a.created_at.strftime("%Y-%m-%d"),
                "mes_referencia": f"{MESES.get(a.mes_referencia, '')} {a.ano_referencia}",
                "score": int(a.score_saude) if a.score_saude else 0,
                "status": get_status(float(a.score_saude) if a.score_saude else 0, "score")
            }
            for a in historico_db
        ]
    }