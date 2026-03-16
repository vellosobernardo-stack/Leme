'use client';

// components/pro/ResumoExecutivo.tsx
// Resumo determinístico da empresa — exibido no topo de ViewVisaoGeral.
// Fase 4B: lógica local com os dados já disponíveis.
// Fase 5: será substituído por versão que lê do banco (gerado por IA).
// A interface de props é intencionalmente mantida compatível para facilitar a substituição.

import { Target, Clock, AlertTriangle, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { DashboardData } from '@/types/dashboard';

interface ResumoExecutivoProps {
  dados: DashboardData;
  analiseAnterior?: {
    score: number;
    mes_referencia: number;
    ano_referencia: number;
  } | null;
}

interface Linha {
  icone: React.ReactNode;
  texto: string;
  cor?: string;
}

function buildLinhas(dados: DashboardData, analiseAnterior?: ResumoExecutivoProps['analiseAnterior']): Linha[] {
  const linhas: Linha[] = [];
  const score = dados.score ?? 0;

  // Linha 1 — Estado geral
  let estadoTexto: string;
  let estadoCor: string;
  if (score >= 70) {
    estadoTexto = 'Sua empresa está saudável este mês.';
    estadoCor = 'text-green-700';
  } else if (score >= 40) {
    estadoTexto = 'Sua empresa está em atenção este mês.';
    estadoCor = 'text-yellow-700';
  } else {
    estadoTexto = 'Sua empresa está em situação crítica este mês.';
    estadoCor = 'text-red-700';
  }
  linhas.push({
    icone: <Target className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#003054' }} />,
    texto: estadoTexto,
    cor: estadoCor,
  });

  // Linha 2 — Caixa
  const sim = dados.simulador;
  if (sim) {
    const caixaDisponivel = sim.caixa_disponivel ?? 0;
    const despesasFixas = sim.despesas_fixas ?? 0;
    const saldoMes = (dados.receita_mensal ?? 0) - (dados.custo_vendas ?? 0) - despesasFixas;

    let caixaTexto: string;
    if (saldoMes > 0) {
      caixaTexto = 'Sua empresa está gerando caixa este mês.';
    } else if (despesasFixas > 0) {
      const dias = Math.round(caixaDisponivel / (despesasFixas / 30));
      caixaTexto = `Seu caixa sustenta ${dias} dia${dias !== 1 ? 's' : ''} de operação.`;
    } else {
      caixaTexto = `Seu caixa disponível é de R$ ${caixaDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}.`;
    }
    linhas.push({
      icone: <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#003054' }} />,
      texto: caixaTexto,
    });
  }

  // Linha 3 — Principal risco (omitida se não houver pontos de atenção)
  const pontosAtencao = dados.diagnostico?.pontos_atencao ?? [];
  if (pontosAtencao.length > 0) {
    // Pega o ponto de atenção com título mais curto
    const ponto = [...pontosAtencao].sort((a, b) => a.titulo.length - b.titulo.length)[0];
    linhas.push({
      icone: <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#003054' }} />,
      texto: `Principal risco: ${ponto.titulo}.`,
    });
  }

  // Linha 4 — Prioridade do mês
  const primeiraAcao = dados.plano?.plano_30_dias?.acoes?.[0];
  if (primeiraAcao?.titulo) {
    linhas.push({
      icone: <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#003054' }} />,
      texto: `Prioridade do mês: ${primeiraAcao.titulo}.`,
    });
  }

  // Linha 5 — Comparativo (só exibe se houver análise anterior)
  if (analiseAnterior && analiseAnterior.score != null) {
    const variacao = Math.round(score) - Math.round(analiseAnterior.score);
    let comparativoTexto: string;
    let comparativoIcone: React.ReactNode;

    if (variacao > 0) {
      comparativoTexto = `Seu score subiu ${variacao} ponto${variacao !== 1 ? 's' : ''} em relação ao mês passado.`;
      comparativoIcone = <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#003054' }} />;
    } else if (variacao < 0) {
      comparativoTexto = `Seu score caiu ${Math.abs(variacao)} ponto${Math.abs(variacao) !== 1 ? 's' : ''} em relação ao mês passado.`;
      comparativoIcone = <TrendingDown className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#003054' }} />;
    } else {
      comparativoTexto = 'Seu score se manteve estável em relação ao mês passado.';
      comparativoIcone = <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#003054' }} />;
    }
    linhas.push({
      icone: comparativoIcone,
      texto: comparativoTexto,
    });
  }

  return linhas;
}

export default function ResumoExecutivo({ dados, analiseAnterior }: ResumoExecutivoProps) {
  const linhas = buildLinhas(dados, analiseAnterior);

  return (
    <>
      <style>{`
        .resumo-executivo {
          background: rgba(0, 48, 84, 0.04);
          border: 1.5px solid rgba(0, 48, 84, 0.12);
          border-radius: 14px;
          padding: 20px 24px;
          font-family: 'DM Sans', sans-serif;
        }
        .resumo-executivo-titulo {
          font-size: 13px;
          font-weight: 700;
          color: #003054;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          margin-bottom: 14px;
          opacity: 0.7;
        }
        .resumo-executivo-linhas {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .resumo-executivo-linha {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .resumo-executivo-linha-texto {
          font-size: 14px;
          color: #374151;
          line-height: 1.55;
        }
        .resumo-executivo-linha-texto.saudavel { color: #15803d; }
        .resumo-executivo-linha-texto.atencao  { color: #b45309; }
        .resumo-executivo-linha-texto.critico   { color: #b91c1c; }
      `}</style>

      <div className="resumo-executivo">
        <p className="resumo-executivo-titulo">Resumo da sua empresa hoje</p>
        <div className="resumo-executivo-linhas">
          {linhas.map((linha, idx) => {
            // Primeira linha recebe cor adaptativa
            let classeTexto = 'resumo-executivo-linha-texto';
            if (idx === 0) {
              const score = dados.score ?? 0;
              if (score >= 70) classeTexto += ' saudavel';
              else if (score >= 40) classeTexto += ' atencao';
              else classeTexto += ' critico';
            }
            return (
              <div key={idx} className="resumo-executivo-linha">
                {linha.icone}
                <span className={classeTexto}>{linha.texto}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
