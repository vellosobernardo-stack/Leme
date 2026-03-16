// components/dashboard/DiagnosticoCard.tsx
// Card de diagnóstico (pontos fortes ou de atenção)
// v3 — Pro: sem blur, badges Novo/Persistente | Free: blur mantido

import { CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { PontoDiagnostico } from '@/types/dashboard';

interface DiagnosticoCardProps {
  tipo: 'fortes' | 'atencao';
  pontos: PontoDiagnostico[];
  isPago?: boolean;
  // Pro only: títulos dos pontos da análise anterior para comparar
  pontosAnteriores?: string[];
}

export default function DiagnosticoCard({
  tipo,
  pontos,
  isPago = false,
  pontosAnteriores,
}: DiagnosticoCardProps) {
  const isFortes = tipo === 'fortes';

  // Badge só aparece no Pro quando há análise anterior para comparar
  const exibirBadge = isPago && pontosAnteriores !== undefined;

  function getBadge(titulo: string) {
    if (!exibirBadge) return null;
    const persistente = pontosAnteriores!.includes(titulo);
    if (persistente) {
      return (
        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
          Persistente
        </span>
      );
    }
    return (
      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
        Novo
      </span>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition duration-300 ${
      isFortes ? 'border-green-200' : 'border-yellow-200'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${isFortes ? 'bg-green-100' : 'bg-yellow-100'}`}>
          {isFortes ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-primary">
            {isFortes ? 'Pontos Fortes' : 'Pontos de Atenção'}
          </h3>
          {!isPago && (
            <p className="text-xs text-muted-foreground">
              {pontos.length} {pontos.length === 1 ? 'ponto identificado' : 'pontos identificados'}
            </p>
          )}
        </div>
      </div>

      {/* Lista de pontos */}
      <div className="space-y-4">
        {pontos.map((ponto, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${isFortes ? 'bg-green-50' : 'bg-yellow-50'}`}
          >
            {/* Título + badge no canto superior direito */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">
                {ponto.titulo}
              </h4>
              {getBadge(ponto.titulo)}
            </div>

            {/* Descrição — Pro: sempre visível | Free: blur */}
            {isPago ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ponto.descricao}
              </p>
            ) : (
              <div className="relative mt-2">
                <p className="text-sm text-muted-foreground leading-relaxed blur-[6px] select-none pointer-events-none" aria-hidden="true">
                  Detalhes sobre este ponto e como ele impacta diretamente a saúde financeira do seu negócio no curto e médio prazo.
                </p>
                {index === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                      <Lock className="w-3 h-3" />
                      <span>Disponível na versão completa</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}