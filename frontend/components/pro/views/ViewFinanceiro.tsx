'use client';

// components/pro/views/ViewFinanceiro.tsx
// View "Financeiro" — Valuation + Payback da empresa.

import ValuationCard from '@/components/dashboard/ValuationCard';
import PaybackCard   from '@/components/dashboard/PaybackCard';
import { DashboardData } from '@/types/dashboard';

interface ViewFinanceiroProps {
  dashboard: DashboardData;
}

export default function ViewFinanceiro({ dashboard }: ViewFinanceiroProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ValuationCard valuation={dashboard.valuation} />
      <PaybackCard   payback={dashboard.payback} />
    </div>
  );
}
