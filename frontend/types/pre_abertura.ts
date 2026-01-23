/**
 * Tipos TypeScript para o fluxo de análise pré-abertura
 * Feature: Ainda não tenho empresa
 */

// ========== ENUMS E CONSTANTES ==========

export const TIPOS_NEGOCIO = [
  { value: "produto", label: "Produto", descricao: "Vendo ou fabrico itens físicos" },
  { value: "servico", label: "Serviço", descricao: "Presto serviços ou trabalho intelectual" },
] as const;

export type TipoNegocioType = typeof TIPOS_NEGOCIO[number]["value"];

export const OPCOES_PROLABORE = [
  { value: "sim", label: "Sim, preciso desse dinheiro para viver" },
  { value: "nao", label: "Não, tenho outra fonte de renda" },
  { value: "nao_sei", label: "Ainda não sei" },
] as const;

export type ProLaboreType = typeof OPCOES_PROLABORE[number]["value"];

export const FAIXAS_FUNCIONARIOS = [
  { value: "1-2", label: "1 a 2 funcionários", quantidade: 1.5 },
  { value: "3-5", label: "3 a 5 funcionários", quantidade: 4 },
  { value: "6-10", label: "6 a 10 funcionários", quantidade: 8 },
  { value: "10+", label: "Mais de 10 funcionários", quantidade: 12 },
] as const;

export type FaixaFuncionariosType = typeof FAIXAS_FUNCIONARIOS[number]["value"];

export const OPCOES_CLIENTES = [
  { value: "sim", label: "Sim", descricao: "Já tenho clientes ou contratos confirmados" },
  { value: "parcialmente", label: "Parcialmente", descricao: "Tenho alguns interessados, mas nada fechado" },
  { value: "nao", label: "Não", descricao: "Ainda vou buscar clientes depois de abrir" },
] as const;

export type ClientesGarantidosType = typeof OPCOES_CLIENTES[number]["value"];

// Reutilizar SETORES e ESTADOS do analise.ts
export { SETORES, ESTADOS_BR, MESES } from "./analise";
export type { SetorType, EstadoType } from "./analise";

// ========== PASSOS DO FLUXO ==========

export type PassoPreAbertura = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export const PASSOS_INFO = {
  1: { id: "tipo_negocio", titulo: "Tipo de Negócio" },
  2: { id: "estoque", titulo: "Estoque" }, // Condicional
  3: { id: "setor", titulo: "Setor" },
  4: { id: "localizacao", titulo: "Localização" },
  5: { id: "abertura", titulo: "Previsão de Abertura" },
  6: { id: "capital", titulo: "Capital Disponível" },
  7: { id: "prolabore", titulo: "Pró-labore" },
  8: { id: "funcionarios", titulo: "Funcionários" },
  9: { id: "faturamento", titulo: "Faturamento Esperado" },
  10: { id: "clientes", titulo: "Clientes" },
} as const;

// ========== DADOS DO FORMULÁRIO ==========

export interface DadosPreAbertura {
  // Passo 1: Tipo de negócio
  tipo_negocio: TipoNegocioType | "";

  // Passo 2: Estoque (condicional - só se produto)
  tem_estoque: boolean | null;

  // Passo 3: Setor
  setor: string;

  // Passo 4: Localização
  estado: string;
  cidade: string;

  // Passo 5: Previsão de abertura
  mes_abertura: number;
  ano_abertura: number;

  // Passo 6: Capital
  capital_disponivel: number;

  // Passo 7: Pró-labore
  prolabore: ProLaboreType | "";

  // Passo 8: Funcionários
  tem_funcionarios: boolean | null;
  faixa_funcionarios: FaixaFuncionariosType | "";

  // Passo 9: Faturamento
  faturamento_esperado: number;

  // Passo 10: Clientes
  clientes_garantidos: ClientesGarantidosType | "";

  // Email (opcional)
  email: string;
}

// ========== VALORES INICIAIS ==========

const getProximoMes = () => {
  const hoje = new Date();
  let mes = hoje.getMonth() + 2; // getMonth() retorna 0-11, +2 para próximo mês
  let ano = hoje.getFullYear();

  if (mes > 12) {
    mes = mes - 12;
    ano = ano + 1;
  }

  return { mes, ano };
};

const proximoMes = getProximoMes();

export const DADOS_INICIAIS: DadosPreAbertura = {
  tipo_negocio: "",
  tem_estoque: null,
  setor: "",
  estado: "",
  cidade: "",
  mes_abertura: proximoMes.mes,
  ano_abertura: proximoMes.ano,
  capital_disponivel: 0,
  prolabore: "",
  tem_funcionarios: null,
  faixa_funcionarios: "",
  faturamento_esperado: 0,
  clientes_garantidos: "",
  email: "",
};

// ========== VALIDAÇÃO ==========

export interface ErrosCampo {
  [campo: string]: string | undefined;
}

export interface ResultadoValidacao {
  valido: boolean;
  erros: ErrosCampo;
}

// ========== RESPOSTA DA API ==========

export interface AlertaResponse {
  id: string;
  categoria: "financeiro" | "operacional" | "estrutural";
  severidade: "positivo" | "atencao" | "alerta";
  titulo: string;
  texto: string;
}

export interface ComparativoCapitalResponse {
  capital_informado: number;
  capital_recomendado: number;
  diferenca_percentual: number;
  status: "acima" | "adequado" | "abaixo" | "muito_abaixo";
}

export interface ComparativoFaturamentoResponse {
  faturamento_esperado: number;
  faturamento_referencia: number;
  diferenca_percentual: number;
  status: "muito_acima" | "acima" | "adequado" | "abaixo" | "muito_abaixo";
}

export interface ItemChecklistResponse {
  texto: string;
  condicional: boolean;
  condicao?: string;
}

export interface PreAberturaResponse {
  id: string;
  tipo_negocio: string;
  setor: string;
  setor_label: string;
  estado: string;
  cidade?: string;
  previsao_abertura: string;
  comparativo_capital: ComparativoCapitalResponse;
  comparativo_faturamento: ComparativoFaturamentoResponse;
  alertas: AlertaResponse[];
  checklist_30_dias: ItemChecklistResponse[];
  mensagem_contexto?: string;
  created_at: string;
}

// ========== TOOLTIPS EDUCATIVOS ==========

export const TOOLTIPS = {
  prolabore: "Pró-labore é o salário que você tira da empresa para você. Diferente do lucro, é um custo fixo mensal.",
  margem_bruta: "Margem bruta é o quanto sobra depois do custo do produto ou serviço, antes de descontar aluguel, folha, impostos e outras despesas fixas.",
  capital: "Valor sugerido para cobrir os primeiros meses de operação, considerando sua estrutura.",
  faturamento: "Estimativa mensal conservadora para o primeiro ano de operação.",
} as const;
