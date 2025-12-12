// lib/mockDashboardData.ts
// Dados mockados para desenvolvimento do Dashboard

import { DashboardData } from '@/types/dashboard';

export const mockDashboardData: DashboardData = {
  // ========== EMPRESA ==========
  empresa: {
    nome: "Padaria Pão Dourado",
    email: "contato@paodourado.com.br",
    estado: "São Paulo",
    setor: "Alimentação e Bebidas",
    mes_referencia: "Novembro",
    ano_referencia: 2024
  },

  // ========== VALUATION ==========
  valuation: {
    valor_minimo: 180000,
    valor_maximo: 300000,
    multiplo_usado: "2.0x - 4.0x",
    explicacao: "Baseado no faturamento anual × múltiplo do setor"
  },

  // ========== PAYBACK ==========
  payback: {
    anos: 2,
    meses: 6,
    frase_interpretativa: "Se o negócio mantiver o lucro atual, você recupera o investimento em 2 anos e 6 meses.",
    percentual_meta: 50
  },

  // ========== SCORE ==========
  score: {
    valor: 72,
    status: 'saudavel',
    tendencia: 'subindo',
    variacao: 5
  },

  score_evolucao: [
    { mes: 'Jun', score: 58 },
    { mes: 'Jul', score: 61 },
    { mes: 'Ago', score: 65 },
    { mes: 'Set', score: 67 },
    { mes: 'Out', score: 67 },
    { mes: 'Nov', score: 72 }
  ],

  influenciadores: [
    {
      nome: "Margem Bruta",
      impacto: "positivo",
      peso: 5,
      descricao: "Acima do benchmark do setor"
    },
    {
      nome: "Fôlego de Caixa",
      impacto: "positivo",
      peso: 4,
      descricao: "Reserva confortável de 75 dias"
    },
    {
      nome: "Ciclo Financeiro",
      impacto: "negativo",
      peso: 3,
      descricao: "Acima do ideal de 45 dias"
    },
    {
      nome: "Peso da Dívida",
      impacto: "negativo",
      peso: 2,
      descricao: "Moderado, mas controlável"
    }
  ],

  // ========== INDICADORES ==========
  blocos_indicadores: [
    {
      id: 'eficiencia',
      titulo: 'Eficiência e Resultado',
      subtitulo: 'Como sua empresa transforma receita em lucro',
      indicadores: [
        {
          id: 'margem_bruta',
          nome: 'Margem Bruta',
          valor: 52,
          unidade: '%',
          status: 'saudavel',
          benchmark: '> 40%',
          explicacao: 'A cada R$ 100 de venda, sobram R$ 52 após pagar os custos diretos.',
          icone: 'Percent'
        },
        {
          id: 'resultado_mes',
          nome: 'Resultado do Mês',
          valor: 8500,
          unidade: 'R$',
          status: 'saudavel',
          benchmark: '> 0',
          explicacao: 'Lucro líquido após todas as despesas. Sua empresa está no azul!',
          icone: 'DollarSign'
        },
        {
          id: 'ponto_equilibrio',
          nome: 'Ponto de Equilíbrio',
          valor: 35000,
          unidade: 'R$',
          status: 'saudavel',
          benchmark: '< Receita',
          explicacao: 'Você precisa faturar R$ 35.000 para cobrir todos os custos. Sua receita está acima.',
          icone: 'Scale'
        }
      ]
    },
    {
      id: 'caixa',
      titulo: 'Caixa e Operação',
      subtitulo: 'Sua capacidade de honrar compromissos',
      indicadores: [
        {
          id: 'folego_caixa',
          nome: 'Fôlego de Caixa',
          valor: 75,
          unidade: 'dias',
          status: 'saudavel',
          benchmark: '> 60 dias',
          explicacao: 'Com o caixa atual, você consegue pagar as despesas por 75 dias sem faturar.',
          icone: 'Wallet'
        },
        {
          id: 'capital_minimo',
          nome: 'Capital Mínimo',
          valor: 12000,
          unidade: 'R$',
          status: 'atencao',
          benchmark: 'Disponível',
          explicacao: 'Você precisa de R$ 12.000 para manter a operação. Verifique se tem esse valor disponível.',
          icone: 'Banknote'
        },
        {
          id: 'ciclo_financeiro',
          nome: 'Ciclo Financeiro',
          valor: 52,
          unidade: 'dias',
          status: 'atencao',
          benchmark: '< 45 dias',
          explicacao: 'Leva 52 dias entre pagar fornecedores e receber dos clientes. Tente reduzir.',
          icone: 'RefreshCw'
        }
      ]
    },
    {
      id: 'estrutura',
      titulo: 'Estrutura e Produtividade',
      subtitulo: 'Eficiência da sua equipe e saúde financeira',
      indicadores: [
        {
          id: 'receita_funcionario',
          nome: 'Receita/Funcionário',
          valor: 12500,
          unidade: 'R$/mês',
          status: 'saudavel',
          benchmark: 'Varia por setor',
          explicacao: 'Cada funcionário gera R$ 12.500 de receita mensal em média.',
          icone: 'Users'
        },
        {
          id: 'peso_divida',
          nome: 'Peso da Dívida',
          valor: 35,
          unidade: '%',
          status: 'atencao',
          benchmark: '< 30%',
          explicacao: 'Suas dívidas representam 35% da receita anual. Ideal seria abaixo de 30%.',
          icone: 'CreditCard'
        }
      ]
    }
  ],

  // ========== DIAGNÓSTICO ==========
  diagnostico: {
    pontos_fortes: [
      {
        titulo: "Margem bruta saudável",
        descricao: "Com 52% de margem, você tem boa capacidade de absorver variações de custo e investir em melhorias."
      },
      {
        titulo: "Reserva de caixa adequada",
        descricao: "75 dias de fôlego permite enfrentar imprevistos sem comprometer a operação."
      },
      {
        titulo: "Resultado positivo consistente",
        descricao: "Empresa lucrativa com tendência de crescimento nos últimos 6 meses."
      }
    ],
    pontos_atencao: [
      {
        titulo: "Ciclo financeiro acima do ideal",
        descricao: "52 dias é alto para o setor. Negocie melhores prazos com fornecedores ou reduza prazo de recebimento."
      },
      {
        titulo: "Endividamento moderado",
        descricao: "35% da receita anual em dívidas. Priorize quitar as de maior juros antes de novos investimentos."
      }
    ]
  },

  // ========== PLANO DE AÇÃO ==========
  plano_acao: {
    plano_30_dias: {
      subtitulo: "Fundamentos e Otimizações Rápidas",
      acoes: [
        {
          titulo: "Mapear todos os custos fixos e variáveis",
          prioridade: "Alta",
          descricao: "Criar planilha detalhada separando custos fixos (aluguel, salários) dos variáveis (insumos, comissões). Identificar os 3 maiores custos de cada categoria.",
          resultado_esperado: "Visibilidade completa de onde o dinheiro está sendo gasto"
        },
        {
          titulo: "Revisar contratos e assinaturas recorrentes",
          prioridade: "Média",
          descricao: "Listar todos os custos recorrentes (software, serviços, assinaturas). Avaliar se cada um está sendo utilizado e se há alternativas mais baratas.",
          resultado_esperado: "Reduzir custos fixos em 5-10%"
        },
        {
          titulo: "Antecipar cobrança de clientes inadimplentes",
          prioridade: "Alta",
          descricao: "Listar todos os valores a receber atrasados. Entrar em contato oferecendo desconto de 5% para pagamento imediato ou parcelamento.",
          resultado_esperado: "Recuperar pelo menos 50% dos valores em atraso"
        },
        {
          titulo: "Negociar prazo com principal fornecedor",
          prioridade: "Média",
          descricao: "Agendar reunião com os 2 principais fornecedores para negociar aumento de prazo de pagamento de 30 para 45 dias.",
          resultado_esperado: "Reduzir ciclo financeiro em 15 dias"
        }
      ]
    },
    plano_60_dias: {
      subtitulo: "Consolidação e Melhorias",
      acoes: [
        {
          titulo: "Implementar automações para reduzir custos operacionais",
          prioridade: "Média",
          descricao: "Identificar 3 processos manuais que consomem mais tempo (emissão de notas, cobranças, relatórios) e buscar ferramentas de automação.",
          resultado_esperado: "Reduzir 10 horas/semana de trabalho operacional"
        },
        {
          titulo: "Testar aumento de preços em produtos selecionados",
          prioridade: "Média",
          descricao: "Selecionar 3 produtos/serviços com menor sensibilidade a preço e testar aumento de 5-10%. Monitorar impacto nas vendas por 30 dias.",
          resultado_esperado: "Aumentar margem bruta de 52% para 55%"
        },
        {
          titulo: "Criar reserva de emergência separada",
          prioridade: "Alta",
          descricao: "Abrir conta separada exclusiva para reserva. Configurar transferência automática de 10% do lucro líquido mensal.",
          resultado_esperado: "Atingir 90 dias de fôlego de caixa"
        },
        {
          titulo: "Estruturar processo de cobrança",
          prioridade: "Média",
          descricao: "Criar régua de cobrança automatizada: lembrete 3 dias antes, cobrança no vencimento, follow-up 3/7/15 dias após.",
          resultado_esperado: "Reduzir inadimplência em 30%"
        }
      ]
    },
    plano_90_dias: {
      subtitulo: "Estratégia e Crescimento",
      acoes: [
        {
          titulo: "Avaliar oportunidades de expansão",
          prioridade: "Média",
          descricao: "Com tendência de crescimento de 8%, avaliar: 1) Expansão geográfica, 2) Novos canais de venda, 3) Produtos/serviços complementares.",
          resultado_esperado: "Plano de crescimento definido para o próximo semestre"
        },
        {
          titulo: "Implementar plano de redução de endividamento",
          prioridade: "Alta",
          descricao: "Listar todas as dívidas por taxa de juros. Quitar primeiro as mais caras. Buscar refinanciamento para reduzir taxa média.",
          resultado_esperado: "Reduzir peso da dívida de 35% para 25%"
        },
        {
          titulo: "Implementar dashboard de indicadores financeiros",
          prioridade: "Média",
          descricao: "Criar rotina mensal de acompanhamento dos 8 indicadores do Leme. Definir metas para cada indicador.",
          resultado_esperado: "Decisões financeiras baseadas em dados, não em intuição"
        },
        {
          titulo: "Revisar modelo de precificação",
          prioridade: "Média",
          descricao: "Fazer análise completa de custos fixos e variáveis por produto/serviço. Recalcular preços considerando margem de contribuição desejada.",
          resultado_esperado: "Garantir margem mínima de 50% em todos os produtos/serviços"
        }
      ]
    }
  },

  // ========== HISTÓRICO ==========
  historico: [
    {
      id: "analise-6",
      data: "2024-11-15",
      mes_referencia: "Novembro/2024",
      score: 72,
      status: 'saudavel'
    },
    {
      id: "analise-5",
      data: "2024-10-12",
      mes_referencia: "Outubro/2024",
      score: 67,
      status: 'atencao'
    },
    {
      id: "analise-4",
      data: "2024-09-10",
      mes_referencia: "Setembro/2024",
      score: 67,
      status: 'atencao'
    },
    {
      id: "analise-3",
      data: "2024-08-08",
      mes_referencia: "Agosto/2024",
      score: 65,
      status: 'atencao'
    }
  ]
};