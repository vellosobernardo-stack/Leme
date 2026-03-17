'use client';

// components/pro/ComparativoSetorial.tsx
// Fase 5 — exibe benchmarks setoriais gerados por IA na criação da análise.
// Inserido em ViewIndicadores.tsx, após o BlocoIndicadores.
// Se dados null: não renderiza nada — sem placeholder, sem mensagem de erro.

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ========== TIPOS ==========

interface BenchmarkIndicador {
  faixa_setor: string;       // ex: "30% a 50%"
  posicao: 'abaixo' | 'dentro' | 'acima';
  interpretacao: string;     // frase curta em linguagem leiga
}

interface ComparativoSetorialData {
  [indicador: string]: BenchmarkIndicador;
}

interface ComparativoSetorialProps {
  dados: ComparativoSetorialData | null;
  setor: string;
}

// ========== HELPERS ==========

// Labels amigáveis para as chaves do JSON
const LABELS: Record<string, string> = {
  margem_bruta: 'Margem Bruta',
  folego_caixa: 'Fôlego de Caixa',
  ciclo_financeiro: 'Ciclo Financeiro',
  peso_divida: 'Peso da Dívida',
  margem_liquida: 'Margem Líquida',
  receita_funcionario: 'Receita por Funcionário',
};

function labelIndicador(chave: string): string {
  return LABELS[chave] ?? chave.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Visual por posição conforme handoff
function configPosicao(posicao: BenchmarkIndicador['posicao']) {
  switch (posicao) {
    case 'acima':
      return {
        badge: 'Acima da média',
        bgBadge: 'bg-green-100',
        textBadge: 'text-green-700',
        icone: <TrendingUp className="w-3.5 h-3.5" />,
      };
    case 'dentro':
      return {
        badge: 'Na média do setor',
        bgBadge: 'bg-blue-100',
        textBadge: 'text-blue-700',
        icone: <Minus className="w-3.5 h-3.5" />,
      };
    case 'abaixo':
      return {
        badge: 'Abaixo da média',
        bgBadge: 'bg-yellow-100',
        textBadge: 'text-yellow-700',
        icone: <TrendingDown className="w-3.5 h-3.5" />,
      };
  }
}

// Formata o nome do setor para exibição no badge
function formatarSetor(setor: string): string {
  return setor
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

// ========== COMPONENTE ==========

export default function ComparativoSetorial({ dados, setor }: ComparativoSetorialProps) {
  // Se dados null ou vazio: não renderiza nada
  if (!dados || Object.keys(dados).length === 0) return null;

  const indicadores = Object.entries(dados);

  return (
    <>
      <style>{`
        .comparativo-setorial {
          margin-top: 24px;
          font-family: 'DM Sans', sans-serif;
        }
        .comparativo-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .comparativo-titulo {
          font-size: 15px;
          font-weight: 700;
          color: #003054;
        }
        .comparativo-badge-setor {
          font-size: 11px;
          font-weight: 600;
          color: #003054;
          background: rgba(0, 48, 84, 0.08);
          border-radius: 20px;
          padding: 3px 10px;
          letter-spacing: 0.01em;
        }
        .comparativo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 12px;
        }
        .comparativo-card {
          background: white;
          border: 1.5px solid rgba(0, 48, 84, 0.10);
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .comparativo-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .comparativo-card-nome {
          font-size: 13px;
          font-weight: 600;
          color: #003054;
        }
        .comparativo-badge-posicao {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          border-radius: 20px;
          padding: 3px 8px;
          white-space: nowrap;
        }
        .comparativo-faixa {
          font-size: 12px;
          color: #6b7280;
        }
        .comparativo-interpretacao {
          font-size: 13px;
          color: #374151;
          line-height: 1.45;
        }
        .comparativo-rodape {
          margin-top: 12px;
          font-size: 11px;
          color: #9ca3af;
          line-height: 1.4;
        }
        @media (max-width: 640px) {
          .comparativo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="comparativo-setorial">
        <div className="comparativo-header">
          <span className="comparativo-titulo">Como você se compara ao seu setor</span>
          <span className="comparativo-badge-setor">{formatarSetor(setor)}</span>
        </div>

        <div className="comparativo-grid">
          {indicadores.map(([chave, benchmark]) => {
            const config = configPosicao(benchmark.posicao);
            return (
              <div key={chave} className="comparativo-card">
                <div className="comparativo-card-header">
                  <span className="comparativo-card-nome">{labelIndicador(chave)}</span>
                  <span className={`comparativo-badge-posicao ${config.bgBadge} ${config.textBadge}`}>
                    {config.icone}
                    {config.badge}
                  </span>
                </div>
                <span className="comparativo-faixa">Faixa do setor: {benchmark.faixa_setor}</span>
                <span className="comparativo-interpretacao">{benchmark.interpretacao}</span>
              </div>
            );
          })}
        </div>

        <p className="comparativo-rodape">
          Benchmarks baseados em dados públicos do Sebrae, IBGE e Banco Central.
        </p>
      </div>
    </>
  );
}
