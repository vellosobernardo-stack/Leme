// components/dashboard/DiagnosticoCard.tsx
// Card de diagnóstico (pontos fortes ou de atenção)

import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { PontoDiagnostico } from '@/types/dashboard';

interface DiagnosticoCardProps {
  tipo: 'fortes' | 'atencao';
  pontos: PontoDiagnostico[];
}

export default function DiagnosticoCard({ tipo, pontos }: DiagnosticoCardProps) {
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
        <h3 className="text-lg font-bold text-primary">
          {isFortes ? 'Pontos Fortes' : 'Pontos de Atenção'}
        </h3>
      </div>

      {/* Lista de pontos */}
      <div className="space-y-4">
        {pontos.map((ponto, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg ${isFortes ? 'bg-green-50' : 'bg-yellow-50'}`}
          >
            <h4 className="font-semibold text-gray-900 mb-1">
              {ponto.titulo}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {ponto.descricao}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}