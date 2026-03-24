// components/dashboard/DiagnosticoCard.tsx
// Card de diagnóstico (pontos fortes ou de atenção)
// v4 — Free: descrições visíveis, sem blur | Pro: badges Novo/Persistente

import { CheckCircle2, AlertTriangle, ThumbsUp } from 'lucide-react';
import { PontoDiagnostico } from '@/types/dashboard';

interface DiagnosticoCardProps {
  tipo: 'fortes' | 'atencao';
  pontos: PontoDiagnostico[];
  isPago?: boolean;
  pontosAnteriores?: string[];
}

export default function DiagnosticoCard({
  tipo,
  pontos,
  isPago = false,
  pontosAnteriores,
}: DiagnosticoCardProps) {
  const isFortes = tipo === 'fortes';
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
          <p className="text-xs text-muted-foreground">
            {pontos.length} {pontos.length === 1 ? 'ponto identificado' : 'pontos identificados'}
          </p>
        </div>
      </div>

      {/* Lista de pontos */}
      {pontos.length > 0 ? (
        <div className="space-y-4">
          {pontos.map((ponto, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${isFortes ? 'bg-green-50' : 'bg-yellow-50'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-gray-900">{ponto.titulo}</h4>
                {getBadge(ponto.titulo)}
              </div>
              {isPago && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                  {ponto.descricao}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Card vazio — especialmente útil quando não há pontos de atenção */
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className={`p-3 rounded-full mb-3 ${isFortes ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <ThumbsUp className={`w-6 h-6 ${isFortes ? 'text-green-400' : 'text-yellow-400'}`} />
          </div>
          <p className="text-sm font-medium text-gray-600">
            {isFortes
              ? 'Nenhum ponto forte identificado ainda.'
              : 'Nenhum ponto de atenção crítico identificado.'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isFortes
              ? 'Continue monitorando seus resultados.'
              : 'Sua empresa está dentro dos parâmetros esperados.'}
          </p>
        </div>
      )}
    </div>
  );
}