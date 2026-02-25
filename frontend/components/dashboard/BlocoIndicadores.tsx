// components/dashboard/BlocoIndicadores.tsx
// Bloco que agrupa indicadores por categoria
// v2 — passa isPago para controlar explicação nos cards

import { BlocoIndicadores as BlocoIndicadoresType } from '@/types/dashboard';
import IndicadorCard from './IndicadorCard';

interface BlocoIndicadoresProps {
  bloco: BlocoIndicadoresType;
  isPago?: boolean; // false = sem explicação, true = com explicação
}

export default function BlocoIndicadores({ bloco, isPago = false }: BlocoIndicadoresProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 hover:shadow-md transition duration-300">
      {/* Header do bloco */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-primary mb-1">
          {bloco.titulo}
        </h3>
        <p className="text-sm text-muted-foreground">
          {bloco.subtitulo}
        </p>
      </div>

      {/* Grid de indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bloco.indicadores.map((indicador) => (
          <IndicadorCard 
            key={indicador.id} 
            indicador={indicador} 
            isPago={isPago}
          />
        ))}
      </div>
    </div>
  );
}