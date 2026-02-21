// types/dashboard.ts
// Tipos TypeScript para o Dashboard do Leme

// ========== IDENTIFICAÇÃO ==========
export interface EmpresaInfo {
  nome: string;
  email: string;
  estado: string;
  setor: string;
  mes_referencia: string;
  ano_referencia: number;
}

// ========== DESTAQUE ==========
export interface Valuation {
  valor_minimo: number;
  valor_maximo: number;
  multiplo_usado: string;
  explicacao: string;
}

export interface Payback {
  anos: number | null;
  meses: number | null;
  frase_interpretativa: string;
  percentual_meta: number;
  status?: 'saudavel' | 'atencao' | 'critico' | 'indisponivel';
}

// ========== SCORE ==========
export type StatusType = 'saudavel' | 'atencao' | 'critico';
export type TendenciaType = 'subindo' | 'estavel' | 'descendo';

export interface ScoreData {
  valor: number;
  status: StatusType;
  tendencia: TendenciaType;
  variacao: number;
}

export interface Influenciador {
  nome: string;
  impacto: 'positivo' | 'negativo';
  peso: number;
  descricao: string;
}

export interface ScoreEvolucao {
  mes: string;
  score: number;
}

// ========== INDICADORES ==========
export interface Indicador {
  id: string;
  nome: string;
  valor: number | string;
  unidade: string;
  status: StatusType;
  benchmark: string;
  explicacao: string;
  icone: string;
}

export interface BlocoIndicadores {
  id: string;
  titulo: string;
  subtitulo: string;
  indicadores: Indicador[];
}

// ========== DIAGNÓSTICO ==========
export interface PontoDiagnostico {
  titulo: string;
  descricao: string;
}

export interface Diagnostico {
  pontos_fortes: PontoDiagnostico[];
  pontos_atencao: PontoDiagnostico[];
}

// ========== PLANO DE AÇÃO ==========
export type PrioridadeType = 'Alta' | 'Média';

export interface Acao {
  titulo: string;
  prioridade: PrioridadeType;
  descricao: string;
  resultado_esperado: string;
}

export interface PeriodoPlano {
  subtitulo: string;
  acoes: Acao[];
}

export interface PlanoAcao {
  plano_30_dias: PeriodoPlano;
  plano_60_dias: PeriodoPlano;
  plano_90_dias: PeriodoPlano;
}

// ========== HISTÓRICO ==========
export interface AnaliseHistorico {
  id: string;
  data: string;
  mes_referencia: string;
  score: number;
  status: StatusType;
}

// ========== SIMULADOR ==========
export interface SimuladorData {
  caixa_disponivel: number;
  receita_mensal: number;
  custo_vendas: number;
  despesas_fixas: number;
}

// ========== DASHBOARD COMPLETO ==========
export interface DashboardData {
  empresa: EmpresaInfo;
  valuation: Valuation;
  payback: Payback;
  score: ScoreData;
  score_evolucao: ScoreEvolucao[];
  influenciadores: Influenciador[];
  blocos_indicadores: BlocoIndicadores[];
  diagnostico: Diagnostico;
  plano_acao: PlanoAcao;
  historico: AnaliseHistorico[];
  simulador: SimuladorData;
}