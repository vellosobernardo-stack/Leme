// components/dashboard/DiagnosticoCard.tsx
// Card de diagnóstico (pontos fortes ou de atenção)
// v2 — títulos sempre visíveis, descrições travadas no grátis

import { CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { PontoDiagnostico } from '@/types/dashboard';

interface DiagnosticoCardProps {
  tipo: 'fortes' | 'atencao';
  pontos: PontoDiagnostico[];
  isPago?: boolean; // false = só títulos, true = títulos + descrições
}

export default function DiagnosticoCard({ tipo, pontos, isPago = false }: DiagnosticoCardProps) {
  const isFortes = tipo === 'fortes';

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
            {/* Título — sempre visível */}
            <h4 className="font-semibold text-gray-900 mb-1">
              {ponto.titulo}
            </h4>

            {/* Descrição — só aparece na versão paga */}
            {isPago ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ponto.descricao}
              </p>
            ) : (
              /* Versão grátis: descrição travada com blur */
              <div className="relative mt-2">
                <p className="text-sm text-muted-foreground leading-relaxed blur-[6px] select-none pointer-events-none" aria-hidden="true">
                  Detalhes sobre este ponto e como ele impacta diretamente a saúde financeira do seu negócio no curto e médio prazo.
                </p>
                {/* Overlay com ícone de cadeado — só no primeiro item */}
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