'use client';

// components/pro/views/ViewVisaoGeral.tsx
// View "Visão Geral" — primeira view que o usuário vê ao entrar no dashboard Pro.
// Fase 4B: ResumoExecutivo real + ScoreGaugePro + ProLaboreCard

import ScoreGaugePro from '@/components/pro/ScoreGaugePro';
import ResumoExecutivo from '@/components/pro/ResumoExecutivo';
import ProLaboreCard from '@/components/pro/ProLaboreCard';
import { DashboardData } from '@/types/dashboard';

interface ViewVisaoGeralProps {
  dashboard: DashboardData;
  analiseId: string;
  analiseAnterior: {
    score: number | null;
    mes_referencia: number;
    ano_referencia: number;
  } | null;
}

export default function ViewVisaoGeral({
  dashboard,
  analiseId,
  analiseAnterior,
}: ViewVisaoGeralProps) {
  // analiseAnterior pode ter score null (primeira análise do histórico sem score calculado)
  // ResumoExecutivo espera score: number — filtramos aqui para não passar null
  const analiseAnteriorResumo =
    analiseAnterior?.score != null
      ? {
          score: analiseAnterior.score,
          mes_referencia: analiseAnterior.mes_referencia,
          ano_referencia: analiseAnterior.ano_referencia,
        }
      : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 1. Resumo Executivo */}
      <ResumoExecutivo
        dados={dashboard}
        analiseAnterior={analiseAnteriorResumo}
      />

      {/* 2. Score */}
      <ScoreGaugePro
        score={dashboard.score}
        analiseId={analiseId}
        analiseAnterior={analiseAnterior}
      />

      {/* 3. Pró-labore */}
      <ProLaboreCard
        
      />

    </div>
  );
}