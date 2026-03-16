// components/pro/ScoreModalPro.tsx     
// Modal Pro do Score — gráfico de linha (Recharts) + fatores positivos/negativos
// Busca dados reais de dois endpoints ao abrir

'use client';

import { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Dot,
} from 'recharts';
import { ScoreData } from '@/types/dashboard';
import { buscarHistorico, buscarFatoresScore } from '@/lib/api';

interface FatorScore {
  label: string;
  impacto: number; // positivo = +N, negativo = -N
}

interface FatoresScore {
  positivos: FatorScore[];
  negativos: FatorScore[];
}

interface PontoGrafico {
  label: string;
  score: number;
}

interface ScoreModalProProps {
  isOpen: boolean;
  onClose: () => void;
  score: ScoreData;
  analiseId: string;
  temHistorico: boolean; // false = só 1 análise, oculta seção de evolução
}

function scoreColor(valor: number) {
  if (valor >= 70) return '#10B981';
  if (valor >= 40) return '#F59E0B';
  return '#EF4444';
}

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export default function ScoreModalPro({
  isOpen,
  onClose,
  score,
  analiseId,
  temHistorico,
}: ScoreModalProProps) {
  const [fatores, setFatores]           = useState<FatoresScore | null>(null);
  const [dadosGrafico, setDadosGrafico] = useState<PontoGrafico[]>([]);
  const [carregando, setCarregando]     = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCarregando(true);

    // Busca paralela: histórico (para o gráfico) + fatores do score
    Promise.all([
      buscarHistorico(),
      buscarFatoresScore(analiseId),
    ])
      .then(([historico, fat]) => {
        // Monta pontos do gráfico — mais antigo primeiro
        const pontos: PontoGrafico[] = [...historico]
          .reverse()
          .map((a) => ({
            label: `${MESES[(a.mes_referencia ?? 1) - 1]}/${String(a.ano_referencia ?? '').slice(-2)}`,
            score: Math.round(a.score_saude ?? 0),
          }));
        setDadosGrafico(pontos);
        setFatores(fat);
      })
      .catch(() => {
        // falha silenciosa — modal continua funcional sem dados
      })
      .finally(() => setCarregando(false));
  }, [isOpen, analiseId]);

  if (!isOpen) return null;

  const corScore = scoreColor(score.valor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-xl font-bold text-primary">Score de Saúde Financeira</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-8">

          {/* Score atual */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Score atual</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl font-bold" style={{ color: corScore }}>
                {score.valor}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {score.tendencia === 'subindo'  && <TrendingUp  className="w-5 h-5 text-green-500" />}
                {score.tendencia === 'descendo' && <TrendingDown className="w-5 h-5 text-red-500" />}
                <span className={score.variacao > 0 ? 'text-green-500' : score.variacao < 0 ? 'text-red-500' : ''}>
                  {score.variacao > 0 ? '+' : ''}{score.variacao} pts
                </span>
              </div>
            </div>
          </div>

          {/* Seção Evolução */}
          {temHistorico ? (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Evolução</h3>
              {carregando ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : dadosGrafico.length >= 2 ? (
                <ResponsiveContainer width="100%" height={192}>
                  <LineChart data={dadosGrafico} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0eeea" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v) => [`${v ?? 0} pts`, 'Score']}
                      contentStyle={{
                        borderRadius: 10,
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,48,84,0.12)',
                        fontSize: 13,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#003054"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#003054', strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: '#E07B2A', strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Dados insuficientes para exibir o gráfico.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 text-center">
              Faça uma nova análise no próximo mês para ver sua evolução aqui.
            </div>
          )}

          <div className="border-t border-border/40" />

          {/* Fatores */}
          {carregando ? (
            <div className="h-24 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : fatores ? (
            <div className="space-y-6">

              {/* Positivos */}
              {fatores.positivos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    O que está sustentando seu score
                  </h3>
                  <div className="space-y-2">
                    {fatores.positivos.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-green-100">
                            <ArrowUp className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{f.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          +{f.impacto} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Negativos */}
              {fatores.negativos.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    O que está puxando seu score para baixo
                  </h3>
                  <div className="space-y-2">
                    {fatores.negativos.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-red-100">
                            <ArrowDown className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{f.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          {f.impacto} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            // Falha silenciosa ao buscar fatores
            <p className="text-sm text-muted-foreground text-center py-4">
              Não foi possível carregar os fatores do score.
            </p>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/40">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
