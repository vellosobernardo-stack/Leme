// components/dashboard/ScoreModal.tsx
// Modal com evolução do score e influenciadores

'use client';

import { X, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ScoreData, ScoreEvolucao, Influenciador } from '@/types/dashboard';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: ScoreData;
  evolucao: ScoreEvolucao[];
  influenciadores: Influenciador[];
}

export default function ScoreModal({ isOpen, onClose, score, evolucao, influenciadores }: ScoreModalProps) {
  if (!isOpen) return null;

  // Encontra o valor máximo para escalar o gráfico
  const maxScore = Math.max(...evolucao.map(e => e.score), 100);
  
  // Calcula a altura da barra (mínimo 10% para visualização)
  const getBarHeight = (valor: number) => {
    return Math.max((valor / maxScore) * 100, 10);
  };

  // Cor da barra baseada no valor
  const getBarColor = (valor: number) => {
    if (valor >= 70) return 'bg-green-500';
    if (valor >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-xl font-bold text-primary">Evolução do Score</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-8">
          
          {/* Score Atual */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Score Atual</p>
            <div className="flex items-center justify-center gap-3">
              <span className={`text-5xl font-bold ${
                score.status === 'saudavel' ? 'text-green-500' :
                score.status === 'atencao' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {score.valor}
              </span>
              <div className="flex items-center gap-1 text-sm">
                {score.tendencia === 'subindo' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : score.tendencia === 'descendo' ? (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                ) : null}
                <span className={
                  score.variacao > 0 ? 'text-green-500' : 
                  score.variacao < 0 ? 'text-red-500' : 'text-muted-foreground'
                }>
                  {score.variacao > 0 ? '+' : ''}{score.variacao} pts
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Histórico (últimos 6 meses)</h3>
            <div className="flex items-end justify-between gap-2 h-40 px-2">
              {evolucao.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.score}
                  </span>
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${getBarColor(item.score)}`}
                    style={{ height: `${getBarHeight(item.score)}%` }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{item.mes}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-border/40"></div>

          {/* Influenciadores */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">O que está influenciando seu score</h3>
            <div className="space-y-3">
              {influenciadores.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    item.impacto === 'positivo' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.impacto === 'positivo' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {item.impacto === 'positivo' ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">{item.descricao}</p>
                    </div>
                  </div>
                  
                  {/* Peso visual */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < item.peso 
                            ? item.impacto === 'positivo' ? 'bg-green-500' : 'bg-red-500'
                            : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
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