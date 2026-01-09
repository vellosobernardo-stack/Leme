/**
 * Tipos TypeScript para o fluxo de análise financeira
 */

// ========== SETORES ==========
export const SETORES = [
  { value: "comercio_varejo", label: "Comércio Varejista" },
  { value: "comercio_atacado", label: "Comércio Atacadista" },
  { value: "servicos", label: "Serviços" },
  { value: "industria", label: "Indústria" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "alimentacao", label: "Alimentação e Bebidas" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "construcao", label: "Construção Civil" },
  { value: "agronegocio", label: "Agronegócio" },
  { value: "transporte", label: "Transporte e Logística" },
  { value: "hotelaria_turismo", label: "Hotelaria e Turismo" },
  { value: "imobiliario", label: "Imobiliário" },
  { value: "financeiro", label: "Serviços Financeiros" },
  { value: "comunicacao", label: "Comunicação e Marketing" },
  { value: "energia", label: "Energia" },
  { value: "textil", label: "Têxtil e Vestuário" },
  { value: "metalurgico", label: "Metalúrgico" },
  { value: "moveis", label: "Móveis e Decoração" },
  { value: "grafico", label: "Gráfico e Editorial" },
  { value: "reciclagem", label: "Reciclagem e Meio Ambiente" },
] as const;

export type SetorType = typeof SETORES[number]["value"];

// ========== ESTADOS BRASILEIROS ==========
export const ESTADOS_BR = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;

export type EstadoType = typeof ESTADOS_BR[number]["value"];

// ========== MESES ==========
export const MESES = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
] as const;

// ========== ETAPAS DO FLUXO ==========
export type EtapaFluxo = 1 | 2 | 3 | 4;

export const ETAPAS_INFO = {
  1: { titulo: "Identificação", descricao: "Nome e email" },
  2: { titulo: "Informações Básicas", descricao: "Setor e período" },
  3: { titulo: "Método de Entrada", descricao: "Como fornecer os dados" },
  4: { titulo: "Saúde Financeira", descricao: "Dados financeiros" },
} as const;

// ========== DADOS DO FORMULÁRIO ==========
export interface ReceitaHistorico {
  tres_meses_atras: number;
  dois_meses_atras: number;
  mes_passado: number;
}

export interface DadosAnalise {
  // Etapa 1: Identificação
  nome_empresa: string;
  email: string;

  // Etapa 2: Básico
  setor: SetorType | "";
  estado: EstadoType | "";
  mes_referencia: number;
  ano_referencia: number;

  // Etapa 3: Método
  metodo_entrada: "manual" | "dre" | "balanco";

  // Etapa 4: Receita e Histórico
  receita_historico: ReceitaHistorico;
  receita_atual: number;

  // Etapa 4: Custos e Despesas
  custo_vendas: number;
  despesas_fixas: number;

  // Etapa 4: Caixa e Fluxo
  caixa_bancos: number;
  contas_receber: number;
  contas_pagar: number;

  // Etapa 4: Condicionais
  tem_estoque: boolean;
  estoque?: number;

  tem_dividas: boolean;
  dividas_totais?: number;

  tem_bens: boolean;
  bens_equipamentos?: number;

  // Etapa 4: Equipe
  num_funcionarios: number;
}

// ========== VALORES INICIAIS ==========
const getMesAnterior = () => {
  const hoje = new Date();
  let mes = hoje.getMonth(); // getMonth() retorna 0-11
  let ano = hoje.getFullYear();
  
  // Se estamos em janeiro, volta para dezembro do ano anterior
  if (mes === 0) {
    mes = 12;
    ano = ano - 1;
  }
  
  return { mes, ano };
};

const mesAnterior = getMesAnterior();

export const DADOS_INICIAIS: DadosAnalise = {
  nome_empresa: "",
  email: "",
  setor: "",
  estado: "",
  mes_referencia: mesAnterior.mes,
  ano_referencia: mesAnterior.ano,
  metodo_entrada: "manual",
  receita_historico: {
    tres_meses_atras: 0,
    dois_meses_atras: 0,
    mes_passado: 0,
  },
  receita_atual: 0,
  custo_vendas: 0,
  despesas_fixas: 0,
  caixa_bancos: 0,
  contas_receber: 0,
  contas_pagar: 0,
  tem_estoque: false,
  estoque: undefined,
  tem_dividas: false,
  dividas_totais: undefined,
  tem_bens: false,
  bens_equipamentos: undefined,
  num_funcionarios: 1,
};

// ========== INDICADORES ==========
export interface Indicadores {
  margem_bruta: number | null;
  resultado_mes: number | null;
  folego_caixa: number | null;
  ponto_equilibrio: number | null;
  ciclo_financeiro: number | null;
  capital_minimo: number | null;
  receita_funcionario: number | null;
  peso_divida: number | null;
  valor_empresa_min: number | null;
  valor_empresa_max: number | null;
  retorno_investimento: number | null;
  tendencia_receita: number | null;
  tendencia_status: "crescendo" | "estavel" | "caindo" | null;
  score_saude: number | null;
}

// ========== VALIDAÇÃO ==========
export interface ErrosCampo {
  [campo: string]: string | undefined;
}

export interface ResultadoValidacao {
  valido: boolean;
  erros: ErrosCampo;
  alertas: string[];
}