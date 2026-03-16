'use client';

// components/pro/views/ViewIndicadores.tsx
// View "Indicadores" — todos os 8 blocos de indicadores financeiros.

import BlocoIndicadores from '@/components/dashboard/BlocoIndicadores';
import { DashboardData } from '@/types/dashboard';

interface ViewIndicadoresProps {
  dashboard: DashboardData;
  indicadoresAnteriores: Record<string, number | null> | null;
}

export default function ViewIndicadores({
  dashboard,
  indicadoresAnteriores,
}: ViewIndicadoresProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {dashboard.blocos_indicadores.map((bloco) => (
        <BlocoIndicadores
          key={bloco.id}
          bloco={bloco}
          isPago={true}
          analiseAnterior={indicadoresAnteriores}
        />
      ))}
    </div>
  );
}
