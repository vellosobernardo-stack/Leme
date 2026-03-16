'use client';

// components/pro/views/ViewDiagnostico.tsx
// View "Diagnóstico" — pontos fortes e pontos de atenção da análise.

import DiagnosticoCard from '@/components/dashboard/DiagnosticoCard';
import { DashboardData } from '@/types/dashboard';

interface ViewDiagnosticoProps {
  dashboard: DashboardData;
  pontosAtencaoAnteriores?: string[];
}

export default function ViewDiagnostico({
  dashboard,
  pontosAtencaoAnteriores,
}: ViewDiagnosticoProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <DiagnosticoCard
        tipo="fortes"
        pontos={dashboard.diagnostico.pontos_fortes}
        isPago={true}
      />
      <DiagnosticoCard
        tipo="atencao"
        pontos={dashboard.diagnostico.pontos_atencao}
        isPago={true}
        pontosAnteriores={pontosAtencaoAnteriores}
      />
    </div>
  );
}
