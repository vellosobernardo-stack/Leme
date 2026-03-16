// components/dashboard/PlanoAcaoSection.tsx
// Plano de ação com checkboxes
// Pro: exibe 3 períodos (30/60/90) com persistência no banco
// Free: exibe apenas 30 dias com persistência em localStorage

"use client";

import { useState, useEffect, useRef } from 'react';
import { Zap, Calendar, CalendarCheck, AlertCircle, Circle, Clock, User, Users } from 'lucide-react';
import { PlanoAcao } from '@/types/dashboard';
import { salvarProgresso, buscarProgresso } from '@/lib/api';

interface PlanoAcaoSectionProps {
  plano: PlanoAcao;
  analiseId?: string;
  isPro?: boolean;
}

export default function PlanoAcaoSection({ plano, analiseId, isPro = false }: PlanoAcaoSectionProps) {
  const [marcados, setMarcados] = useState<{
    '30': Set<number>;
    '60': Set<number>;
    '90': Set<number>;
  }>({
    '30': new Set(),
    '60': new Set(),
    '90': new Set(),
  });

  const carregouInicial = useRef(false);

  useEffect(() => {
    if (!analiseId) return;

    async function carregar() {
      if (isPro) {
        const itens = await buscarProgresso(analiseId!).catch(() => []);
        const novo = { '30': new Set<number>(), '60': new Set<number>(), '90': new Set<number>() };
        for (const item of itens) {
          if (item.marcado && item.periodo in novo) {
            novo[item.periodo as '30' | '60' | '90'].add(item.indice_acao);
          }
        }
        setMarcados(novo);
      } else {
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
      carregouInicial.current = true;
    }

    carregar();
  }, [analiseId, isPro]);

  // Salva no localStorage quando mudar (Free only)
  useEffect(() => {
    if (!analiseId || isPro || !carregouInicial.current) return;

    const toSave = {
      '30': Array.from(marcados['30']),
      '60': Array.from(marcados['60']),
      '90': Array.from(marcados['90']),
    };
    localStorage.setItem(`plano_acao_${analiseId}`, JSON.stringify(toSave));
  }, [marcados, analiseId, isPro]);

  const toggleItem = async (periodo: '30' | '60' | '90', index: number) => {
    const novoSet = new Set(marcados[periodo]);
    const novoEstado = !novoSet.has(index);

    if (novoEstado) novoSet.add(index);
    else novoSet.delete(index);

    setMarcados((prev) => ({ ...prev, [periodo]: novoSet }));

    if (isPro && analiseId) {
      await salvarProgresso(analiseId, periodo, index, novoEstado).catch(() => null);
    }
  };

  const todosPeriodos = [
    {
      key: '30' as const,
      titulo: 'O que fazer hoje',
      subtitulo: plano.plano_30_dias.subtitulo,
      acoes: plano.plano_30_dias.acoes,
      icon: Zap,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      lightColorChecked: 'bg-blue-100',
      borderColor: 'border-blue-200',
      progressColor: 'bg-blue-500',
      badge: 'Ajuste imediato',
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      key: '60' as const,
      titulo: 'O que ajustar no próximo mês',
      subtitulo: plano.plano_60_dias.subtitulo,
      acoes: plano.plano_60_dias.acoes,
      icon: Calendar,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      lightColorChecked: 'bg-purple-100',
      borderColor: 'border-purple-200',
      progressColor: 'bg-purple-500',
      badge: 'Correção estrutural',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      key: '90' as const,
      titulo: 'O que estruturar para o trimestre',
      subtitulo: plano.plano_90_dias.subtitulo,
      acoes: plano.plano_90_dias.acoes,
      icon: CalendarCheck,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      lightColorChecked: 'bg-orange-100',
      borderColor: 'border-orange-200',
      progressColor: 'bg-orange-500',
      badge: 'Redirecionamento estratégico',
      badgeColor: 'bg-orange-100 text-orange-700',
    },
  ];

  // Free: apenas período 30 dias | Pro: todos os 3 períodos
  const periodos = isPro ? todosPeriodos : todosPeriodos.slice(0, 1);

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
                <h3 className="text-xl font-bold text-primary">{periodo.titulo}</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {totalMarcados}/{totalItens}
              </span>
            </div>

            {/* Badge + Subtítulo */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${periodo.badgeColor}`}>
                {periodo.badge}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{periodo.subtitulo}</p>

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
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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

                        {/* Título */}
                        <h4 className={`font-semibold mb-2 transition-all ${
                          isChecked ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {acao.titulo}
                        </h4>

                        {/* Tags */}
                        {'tempo_estimado' in acao && (acao as any).tempo_estimado && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {(acao as any).tempo_estimado && (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                isChecked ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <Clock className="w-3 h-3" />
                                {(acao as any).tempo_estimado}
                              </span>
                            )}
                            {(acao as any).dificuldade && (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                isChecked ? 'bg-gray-100 text-gray-400' :
                                (acao as any).dificuldade === 'Fácil' ? 'bg-green-100 text-green-700' :
                                (acao as any).dificuldade === 'Médio' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {(acao as any).dificuldade}
                              </span>
                            )}
                            {(acao as any).faz_sozinho !== undefined && (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                                isChecked ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {(acao as any).faz_sozinho ? (
                                  <><User className="w-3 h-3" /> Faz sozinho</>
                                ) : (
                                  <><Users className="w-3 h-3" /> Precisa de ajuda</>
                                )}
                              </span>
                            )}
                          </div>
                        )}

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