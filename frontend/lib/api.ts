/**
 * Funções para comunicação com a API do backend
 */

import { DadosAnalise } from "@/types/analise";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ========== SESSÃO ==========

export async function iniciarSessao(nomeEmpresa: string, email: string) {
  const response = await fetch(`${API_BASE}/sessao/iniciar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome_empresa: nomeEmpresa, email }),
  });
  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.detail || "Erro ao iniciar sessão");
  }
  return response.json();
}

export async function concluirSessao(sessaoId: string, analiseId: string) {
  const response = await fetch(`${API_BASE}/sessao/${sessaoId}/concluir`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ analise_id: analiseId }),
  });
  if (!response.ok) {
    console.error("Erro ao concluir sessão:", await response.text());
    return null;
  }
  return response.json();
}

// ========== ANÁLISE ==========

function prepararDadosParaApi(dados: DadosAnalise, refParceiro?: string | null) {
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
    ref_parceiro: refParceiro || null,
  };
}

export async function criarAnalise(dados: DadosAnalise, refParceiro?: string | null) {
  const dadosFormatados = prepararDadosParaApi(dados, refParceiro);
  const response = await fetch(`${API_BASE}/api/v1/analise/nova`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(dadosFormatados),
  });
  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.detail || "Erro ao criar análise");
  }
  return response.json();
}

export async function buscarAnalise(id: string) {
  const response = await fetch(`${API_BASE}/api/v1/analise/${id}`);
  if (!response.ok) throw new Error("Análise não encontrada");
  return response.json();
}

export async function verificarStatus() {
  const response = await fetch(`${API_BASE}/health`);
  return response.json();
}

// ========== DASHBOARD ==========

export async function buscarDashboard(email: string) {
  const response = await fetch(`${API_BASE}/api/v1/dashboard/${encodeURIComponent(email)}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Nenhuma análise encontrada para este email");
    throw new Error("Erro ao buscar dados do dashboard");
  }
  return response.json();
}

export async function buscarDashboardPorId(id: string) {
  const response = await fetch(`${API_BASE}/api/v1/dashboard/id/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Análise não encontrada");
    throw new Error("Erro ao buscar dados do dashboard");
  }
  return response.json();
}

// ========== HISTÓRICO PRO ==========

/**
 * Lista todas as análises vinculadas ao usuário logado
 */
export async function buscarHistorico() {
  const response = await fetch(`${API_BASE}/api/v1/historico/`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Erro ao buscar histórico");
  return response.json();
}

/**
 * Busca dados completos de uma análise específica (valida dono)
 */
export async function buscarAnaliseCompleta(id: string) {
  const response = await fetch(`${API_BASE}/api/v1/historico/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Análise não encontrada ou sem permissão");
  return response.json();
}

/**
 * Vincula uma análise existente ao usuário logado
 */
export async function vincularAnalise(analiseId: string) {
  const response = await fetch(`${API_BASE}/api/v1/historico/${analiseId}/vincular`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!response.ok) {
    console.error("Erro ao vincular análise:", await response.text());
    return null;
  }
  return response.json();
}

/**
 * Retorna as duas análises mais recentes lado a lado com variações calculadas.
 * Se houver só 1 análise, retorna anterior: null e variacoes: null.
 */
export async function buscarComparativo() {
  const response = await fetch(`${API_BASE}/api/v1/historico/comparativo`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Erro ao buscar comparativo");
  return response.json();
}

/**
 * Retorna os fatores positivos e negativos que mais impactaram o score
 * de uma análise específica. Lógica determinística — sem IA.
 */
export async function buscarFatoresScore(analiseId: string) {
  const response = await fetch(`${API_BASE}/api/v1/historico/${analiseId}/fatores-score`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Erro ao buscar fatores do score");
  return response.json();
}

// ========== PROGRESSO DO PLANO DE AÇÃO ==========

/**
 * Salva ou atualiza o estado de um checkbox do plano de ação
 */
export async function salvarProgresso(
  analiseId: string,
  periodo: "30" | "60" | "90",
  indiceAcao: number,
  marcado: boolean
) {
  const response = await fetch(`${API_BASE}/api/v1/progresso/${analiseId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ periodo, indice_acao: indiceAcao, marcado }),
  });
  if (!response.ok) {
    console.error("Erro ao salvar progresso:", await response.text());
    return null;
  }
  return response.json();
}

/**
 * Busca todos os checkboxes marcados de uma análise
 */
export async function buscarProgresso(analiseId: string) {
  const response = await fetch(`${API_BASE}/api/v1/progresso/${analiseId}`, {
    credentials: "include",
  });
  if (!response.ok) return [];
  return response.json();
}

// ========== CHAT CONSULTOR PRO — Fase 5 ==========

export interface MensagemHistorico {
  role: "user" | "assistant";
  content: string;
}

/**
 * Envia uma mensagem ao ChatConsultor e retorna a resposta da IA.
 * O histórico completo da conversa é enviado a cada chamada —
 * o backend não armazena o histórico de chat.
 *
 * Histórico vazio = primeira abertura → backend gera mensagem contextualizada.
 */
export async function enviarMensagemChat(
  analiseId: string,
  mensagem: string,
  historico: MensagemHistorico[] = []
): Promise<string> {
  const response = await fetch(`${API_BASE}/api/v1/chat/consultor`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      analise_id: analiseId,
      mensagem,
      historico,
    }),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.detail || "Erro ao enviar mensagem ao consultor");
  }

  const data = await response.json();
  return data.resposta;
}