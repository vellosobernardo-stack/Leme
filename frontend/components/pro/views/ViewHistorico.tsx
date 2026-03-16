'use client';

// components/pro/views/ViewHistorico.tsx
// View "Histórico" — tabela de análises anteriores + gráfico de evolução do score.
// HistoricoTable já existia na Fase 3. O gráfico de evolução está dentro do
// ScoreModalPro — aqui exibimos a tabela e um acesso direto ao modal de evolução.

import HistoricoTable from '@/components/dashboard/HistoricoTable';
import { DashboardData, AnaliseHistorico } from '@/types/dashboard';

interface ViewHistoricoProps {
  dashboard: DashboardData;
  analiseId: string;
  historico: AnaliseHistorico[];
}

export default function ViewHistorico({ dashboard, analiseId, historico }: ViewHistoricoProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <HistoricoTable historico={historico} />
    </div>
  );
}
