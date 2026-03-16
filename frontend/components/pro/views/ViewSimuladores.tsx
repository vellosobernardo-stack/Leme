'use client';

// components/pro/views/ViewSimuladores.tsx
// View "Simuladores" — SimuladorSobrevivencia (Fase 3) + SimuladorCenarios (Fase 4B).

import SimuladorSobrevivencia from '@/components/dashboard/SimuladorSobrevivencia';
import SimuladorCenarios from '@/components/pro/SimuladorCenarios';
import { DashboardData } from '@/types/dashboard';

interface ViewSimuladoresProps {
  dashboard: DashboardData;
}

export default function ViewSimuladores({ dashboard }: ViewSimuladoresProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 1. Simulador de Sobrevivência — existia na Fase 3 */}
      {dashboard.simulador && (
        <SimuladorSobrevivencia dados={dashboard.simulador} />
      )}

      {/* 2. Simulador de Cenários — novo na Fase 4B */}
      {dashboard.simulador && (
        <SimuladorCenarios
          caixa_disponivel={dashboard.simulador.caixa_disponivel}
          receita_mensal={dashboard.simulador.receita_mensal}
          custo_vendas={dashboard.simulador.custo_vendas}
          despesas_fixas={dashboard.simulador.despesas_fixas}
          score_atual={dashboard.score ?? 0}
        />
      )}

    </div>
  );
}