// components/dashboard/PlanoAcaoSection.tsx
// Seção do plano de ação 30/60/90 dias com checklist interativo

"use client";

import { useState, useEffect } from 'react';
import { Clock, Calendar, CalendarCheck, AlertCircle, Circle } from 'lucide-react';
import { PlanoAcao } from '@/types/dashboard';

interface PlanoAcaoSectionProps {
  plano: PlanoAcao;
  analiseId?: string; // Para salvar progresso por análise
}

export default function PlanoAcaoSection({ plano, analiseId }: PlanoAcaoSectionProps) {
  // Estado para controlar itens marcados por período
  const [marcados, setMarcados] = useState<{
    '30': Set<number>;
    '60': Set<number>;
    '90': Set<number>;
  }>({
    '30': new Set(),
    '60': new Set(),
    '90': new Set(),
  });

  // Carregar estado do localStorage ao montar
  useEffect(() => {
    if (analiseId) {
      const saved = localStorage.getItem(`plano_acao_${analiseId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMarcados({
            '30': new Set(parsed['30'] || []),
            '60': new Set(parsed['60'] || []),
            '90': new Set(parsed['90'] || []),
          });
        } catch (e) {
          console.error('Erro ao carregar progresso:', e);
        }
      }
    }
  }, [analiseId]);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    if (analiseId) {
      const toSave = {
        '30': Array.from(marcados['30']),
        '60': Array.from(marcados['60']),
        '90': Array.from(marcados['90']),
      };
      localStorage.setItem(`plano_acao_${analiseId}`, JSON.stringify(toSave));
    }
  }, [marcados, analiseId]);

  const toggleItem = (periodo: '30' | '60' | '90', index: number) => {
    setMarcados((prev) => {
      const novo = { ...prev };
      const novoSet = new Set(prev[periodo]);
      if (novoSet.has(index)) {
        novoSet.delete(index);
      } else {
        novoSet.add(index);
      }
      novo[periodo] = novoSet;
      return novo;
    });
  };

  const periodos = [
    {
      key: '30' as const,
      titulo: '30 Dias',
      subtitulo: plano.plano_30_dias.subtitulo,
      acoes: plano.plano_30_dias.acoes,
      icon: Clock,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      lightColorChecked: 'bg-blue-100',
      borderColor: 'border-blue-200',
      progressColor: 'bg-blue-500',
    },
    {
      key: '60' as const,
      titulo: '60 Dias',
      subtitulo: plano.plano_60_dias.subtitulo,
      acoes: plano.plano_60_dias.acoes,
      icon: Calendar,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      lightColorChecked: 'bg-purple-100',
      borderColor: 'border-purple-200',
      progressColor: 'bg-purple-500',
    },
    {
      key: '90' as const,
      titulo: '90 Dias',
      subtitulo: plano.plano_90_dias.subtitulo,
      acoes: plano.plano_90_dias.acoes,
      icon: CalendarCheck,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      lightColorChecked: 'bg-orange-100',
      borderColor: 'border-orange-200',
      progressColor: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {periodos.map((periodo) => {
        const Icon = periodo.icon;
        const totalMarcados = marcados[periodo.key].size;
        const totalItens = periodo.acoes.length;
        const progresso = totalItens > 0 ? (totalMarcados / totalItens) * 100 : 0;
        
        return (
          <div 
            key={periodo.key}
            className={`bg-white rounded-xl shadow-sm border ${periodo.borderColor} p-6 hover:shadow-md transition duration-300`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2.5 rounded-lg ${periodo.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-primary">
                  {periodo.titulo}
                </h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {totalMarcados}/{totalItens}
              </span>
            </div>
            
            {/* Subtítulo */}
            <p className="text-sm text-muted-foreground mb-3">
              {periodo.subtitulo}
            </p>

            {/* Barra de progresso */}
            <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
              <div
                className={`h-full ${periodo.progressColor} rounded-full transition-all duration-300`}
                style={{ width: `${progresso}%` }}
              />
            </div>

            {/* Lista de ações */}
            <div className="space-y-4">
              {periodo.acoes.map((acao, index) => {
                const isChecked = marcados[periodo.key].has(index);
                
                return (
                  <button
                    key={index}
                    onClick={() => toggleItem(periodo.key, index)}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                      isChecked 
                        ? `${periodo.lightColorChecked} opacity-75` 
                        : `${periodo.lightColor} hover:shadow-sm`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          isChecked
                            ? `${periodo.color} border-transparent`
                            : `border-gray-300 hover:border-gray-400`
                        }`}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      <div className="flex-1">
                        {/* Prioridade */}
                        <div className="flex items-center gap-2 mb-2">
                          {acao.prioridade === 'Alta' ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-xs font-medium ${
                            acao.prioridade === 'Alta' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            Prioridade {acao.prioridade}
                          </span>
                        </div>

                        {/* Título da ação */}
                        <h4 className={`font-semibold mb-2 transition-all ${
                          isChecked ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {acao.titulo}
                        </h4>

                        {/* Descrição */}
                        <p className={`text-sm mb-3 leading-relaxed transition-all ${
                          isChecked ? 'text-gray-400' : 'text-muted-foreground'
                        }`}>
                          {acao.descricao}
                        </p>

                        {/* Resultado esperado */}
                        <div className="pt-3 border-t border-gray-200">
                          <p className={`text-xs ${isChecked ? 'text-gray-400' : 'text-muted-foreground'}`}>
                            <span className={`font-medium ${isChecked ? 'text-gray-500' : 'text-gray-700'}`}>
                              Resultado esperado:{' '}
                            </span>
                            {acao.resultado_esperado}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}