/**
 * Funções para comunicação com a API do backend
 */

import { DadosAnalise } from "@/types/analise";

// URL base da API
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Prepara os dados do formulário para enviar à API
 */
function prepararDadosParaApi(dados: DadosAnalise) {
  return {
    nome_empresa: dados.nome_empresa,
    email: dados.email,
    setor: dados.setor,
    estado: dados.estado,
    mes_referencia: dados.mes_referencia,
    ano_referencia: dados.ano_referencia,
    receita_historico: {
      tres_meses_atras: dados.receita_historico.tres_meses_atras || 0,
      dois_meses_atras: dados.receita_historico.dois_meses_atras || 0,
      mes_passado: dados.receita_historico.mes_passado || 0,
    },
    receita_atual: dados.receita_atual,
    custo_vendas: dados.custo_vendas,
    despesas_fixas: dados.despesas_fixas,
    caixa_bancos: dados.caixa_bancos,
    contas_receber: dados.contas_receber,
    contas_pagar: dados.contas_pagar,
    tem_estoque: dados.tem_estoque,
    estoque: dados.tem_estoque ? dados.estoque : null,
    tem_dividas: dados.tem_dividas,
    dividas_totais: dados.tem_dividas ? dados.dividas_totais : null,
    tem_bens: dados.tem_bens,
    bens_equipamentos: dados.tem_bens ? dados.bens_equipamentos : null,
    num_funcionarios: dados.num_funcionarios,
  };
}

/**
 * Cria uma nova análise
 */
export async function criarAnalise(dados: DadosAnalise) {
  const dadosFormatados = prepararDadosParaApi(dados);

  const response = await fetch(`${API_BASE}/api/v1/analise/nova`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dadosFormatados),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.detail || "Erro ao criar análise");
  }

  return response.json();
}

/**
 * Busca uma análise pelo ID
 */
export async function buscarAnalise(id: string) {
  const response = await fetch(`${API_BASE}/api/v1/analise/${id}`);

  if (!response.ok) {
    throw new Error("Análise não encontrada");
  }

  return response.json();
}

/**
 * Verifica se a API está online
 */
export async function verificarStatus() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}
// Busca dados do dashboard pelo email
export async function buscarDashboard(email: string) {
  const response = await fetch(`${API_BASE}/api/v1/dashboard/${encodeURIComponent(email)}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Nenhuma análise encontrada para este email');
    }
    throw new Error('Erro ao buscar dados do dashboard');
  }
  
  return response.json();
}

// Busca dados do dashboard por ID da análise
export async function buscarDashboardPorId(id: string) {
  const response = await fetch(`${API_BASE}/api/v1/dashboard/id/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Análise não encontrada');
    }
    throw new Error('Erro ao buscar dados do dashboard');
  }
  
  return response.json();
}