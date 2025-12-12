// components/dashboard/PlanoAcaoSection.tsx
// Seção do plano de ação 30/60/90 dias

import { Clock, Calendar, CalendarCheck, AlertCircle, Circle } from 'lucide-react';
import { PlanoAcao } from '@/types/dashboard';

interface PlanoAcaoSectionProps {
  plano: PlanoAcao;
}

export default function PlanoAcaoSection({ plano }: PlanoAcaoSectionProps) {
  const periodos = [
    {
      key: '30',
      titulo: '30 Dias',
      subtitulo: plano.plano_30_dias.subtitulo,
      acoes: plano.plano_30_dias.acoes,
      icon: Clock,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      key: '60',
      titulo: '60 Dias',
      subtitulo: plano.plano_60_dias.subtitulo,
      acoes: plano.plano_60_dias.acoes,
      icon: Calendar,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      key: '90',
      titulo: '90 Dias',
      subtitulo: plano.plano_90_dias.subtitulo,
      acoes: plano.plano_90_dias.acoes,
      icon: CalendarCheck,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {periodos.map((periodo) => {
        const Icon = periodo.icon;
        
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
              <h3 className="text-xl font-bold text-primary">
                {periodo.titulo}
              </h3>
            </div>
            
            {/* Subtítulo */}
            <p className="text-sm text-muted-foreground mb-6">
              {periodo.subtitulo}
            </p>

            {/* Lista de ações */}
            <div className="space-y-4">
              {periodo.acoes.map((acao, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg ${periodo.lightColor}`}
                >
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
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {acao.titulo}
                  </h4>

                  {/* Descrição */}
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                    {acao.descricao}
                  </p>

                  {/* Resultado esperado */}
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-gray-700">Resultado esperado: </span>
                      {acao.resultado_esperado}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}