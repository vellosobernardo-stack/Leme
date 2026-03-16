'use client';

// components/pro/views/ViewPlanoAcao.tsx
// View "Plano de Ação" — plano 30/60/90 dias completo.

import PlanoAcaoSection from '@/components/dashboard/PlanoAcaoSection';
import { DashboardData } from '@/types/dashboard';

interface ViewPlanoAcaoProps {
  dashboard: DashboardData;
  analiseId: string;
}

export default function ViewPlanoAcao({ dashboard, analiseId }: ViewPlanoAcaoProps) {
  return (
    <PlanoAcaoSection
      plano={dashboard.plano_acao}
      analiseId={analiseId}
      isPro={true}
    />
  );
}
