'use client';

// components/pro/views/ViewVisaoGeral.tsx
// View "Visão Geral" — primeira view que o usuário vê ao entrar no dashboard Pro.
// Fase 4B: ResumoExecutivo real + ScoreGaugePro + ProLaboreCard
// Fase 5: resumoIa passado ao ResumoExecutivo

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
  resumoIa?: string | null; // Fase 5 — texto gerado por IA, null = fallback determinístico
}

export default function ViewVisaoGeral({
  dashboard,
  analiseId,
  analiseAnterior,
  resumoIa,
}: ViewVisaoGeralProps) {
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
        resumo_ia={resumoIa}
      />

      {/* 2. Score */}
      <ScoreGaugePro
        score={dashboard.score}
        analiseId={analiseId}
        analiseAnterior={analiseAnterior}
      />

      {/* 3. Pró-labore */}
      <ProLaboreCard />

    </div>
  );
}