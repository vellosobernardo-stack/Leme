// components/dashboard/ScoreGauge.tsx
// Gauge visual do Score de Saúde Financeira — versão Free (sem modal)

'use client';

import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScoreData } from '@/types/dashboard';

interface ScoreGaugeProps {
  score: ScoreData;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {

  const getStatusColor = () => {
    switch (score.status) {
      case 'saudavel': return 'text-green-500';
      case 'atencao': return 'text-yellow-500';
      case 'critico': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusBgColor = () => {
    switch (score.status) {
      case 'saudavel': return 'bg-green-500';
      case 'atencao': return 'bg-yellow-500';
      case 'critico': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (score.status) {
      case 'saudavel': return 'Saudável';
      case 'atencao': return 'Atenção';
      case 'critico': return 'Crítico';
      default: return '';
    }
  };

  const TendenciaIcon = () => {
    switch (score.tendencia) {
      case 'subindo': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'descendo': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/40 p-8">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

        {/* Gauge Visual */}
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-28">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              {/* Fundo cinza */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Arco colorido até o score */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(score.valor / 100) * 283} 283`}
                className="transition-all duration-700"
              />

              {/* Ponteiro */}
              <line
                x1="100"
                y1="100"
                x2={100 + 70 * Math.cos((Math.PI * (180 - score.valor * 1.8)) / 180)}
                y2={100 - 70 * Math.sin((Math.PI * (180 - score.valor * 1.8)) / 180)}
                stroke="#112D4E"
                strokeWidth="3"
                strokeLinecap="round"
                className="transition-all duration-700"
              />

              {/* Bolinha do ponteiro */}
              <circle
                cx={100 + 70 * Math.cos((Math.PI * (180 - score.valor * 1.8)) / 180)}
                cy={100 - 70 * Math.sin((Math.PI * (180 - score.valor * 1.8)) / 180)}
                r="6"
                fill="#112D4E"
                className="transition-all duration-700"
              />

              {/* Centro */}
              <circle cx="100" cy="100" r="12" fill="white" stroke="#E5E7EB" strokeWidth="2" />
              <circle cx="100" cy="100" r="6" fill="#112D4E" />
            </svg>
          </div>

          {/* Labels do gauge */}
          <div className="flex justify-between w-48 -mt-1 text-xs text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Score e Info */}
        <div className="flex-1 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              Score de Saúde Financeira
            </h3>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-4">
            <span className={`text-5xl lg:text-6xl font-bold ${getStatusColor()}`}>
              {score.valor}
            </span>

            <div className="flex flex-col gap-1">
              <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusBgColor()}`}>
                {getStatusLabel()}
              </span>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <TendenciaIcon />
                <span>
                  {score.variacao > 0 ? '+' : ''}{score.variacao} pts
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}