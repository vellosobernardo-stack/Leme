'use client';

// components/pro/views/ViewIndicadores.tsx
// View "Indicadores" — todos os 8 blocos de indicadores financeiros.
// Fase 5: ComparativoSetorial inserido após o BlocoIndicadores.

import BlocoIndicadores from '@/components/dashboard/BlocoIndicadores';
import ComparativoSetorial from '@/components/pro/ComparativoSetorial';
import { DashboardData } from '@/types/dashboard';

interface ViewIndicadoresProps {
  dashboard: DashboardData;
  indicadoresAnteriores: Record<string, number | null> | null;
  comparativoSetorial?: string | null; // JSON string vindo do banco — Fase 5
  setor?: string;
}

export default function ViewIndicadores({
  dashboard,
  indicadoresAnteriores,
  comparativoSetorial,
  setor,
}: ViewIndicadoresProps) {
  // Parse do JSON do comparativo — null se inválido ou ausente
  let dadosComparativo = null;
  if (comparativoSetorial) {
    try {
      dadosComparativo = JSON.parse(comparativoSetorial);
    } catch {
      dadosComparativo = null;
    }
  }

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

      {/* Fase 5: comparativo setorial — não renderiza nada se dadosComparativo for null */}
      <ComparativoSetorial
        dados={dadosComparativo}
        setor={setor ?? ''}
      />
    </div>
  );
}