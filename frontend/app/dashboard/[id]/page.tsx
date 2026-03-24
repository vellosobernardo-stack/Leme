// app/dashboard/[id]/page.tsx
// Dashboard Free — modelo freemium
// Exibe: Score + Simulador + Diagnóstico (títulos) + 3 indicadores + Plano (hoje, títulos+tags) + ProUpgradeCard

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeaderNavigation from "@/components/dashboard/HeaderNavigation";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import IndicadorCard from "@/components/dashboard/IndicadorCard";
import DiagnosticoCard from "@/components/dashboard/DiagnosticoCard";
import PlanoAcaoSection from "@/components/dashboard/PlanoAcaoSection";
import SimuladorSobrevivencia from "@/components/dashboard/SimuladorSobrevivencia";
import ProUpgradeCard from "@/components/dashboard/ProUpgradeCard";
import { buscarDashboardPorId } from "@/lib/api";
import { DashboardData } from "@/types/dashboard";

// Declaração do gtag para TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// IDs dos 3 indicadores exibidos no Free
const INDICADORES_FREE = ["margem_bruta", "resultado_mes", "folego_caixa"];

interface DashboardPageProps {
  params: { id: string };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { id } = params;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      if (!id) {
        setError("ID da análise não informado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const resultado = await buscarDashboardPorId(id);
        setData(resultado);

        // Evento de conversão Google Ads
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "conversion", {
            send_to: "AW-17804678209/RR2JCNi84dEbEMGo96lC",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise...</p>
        </div>
      </div>
    );
  }

  // Erro
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F7FAFD] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            {error || "Análise não encontrada"}
          </p>
          <Link
            href="/analise"
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all"
          >
            Fazer Nova Análise
          </Link>
        </div>
      </div>
    );
  }

  // Filtra apenas os 3 indicadores do Free
  // Percorre os blocos e mantém só os indicadores com id na lista INDICADORES_FREE
  const blocosFiltered = data.blocos_indicadores
    .map((bloco) => ({
      ...bloco,
      indicadores: bloco.indicadores.filter((ind) =>
        INDICADORES_FREE.includes(ind.id)
      ),
    }))
    .filter((bloco) => bloco.indicadores.length > 0);

  return (
    <div className="min-h-screen bg-[#F7FAFD]">
      <HeaderNavigation />

      <div className="max-w-7xl mx-auto px-4 pt-28">
        <DashboardHeader empresa={data.empresa} />
      </div>

      <main className="max-w-7xl mx-auto px-4 pb-16">

        {/* ========== SEÇÃO 1: SCORE ========== */}
        <section id="resumo" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              Saúde da Empresa
            </h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>

          <ScoreGauge score={data.score} />
        </section>

        {/* ========== SEÇÃO 2: SIMULADOR ========== */}
        <section id="simulador" className="mb-16">
          <SimuladorSobrevivencia dados={data.simulador} />
        </section>

        {/* ========== SEÇÃO 3: DIAGNÓSTICO — títulos visíveis, descrições com blur ========== */}
        <section id="diagnostico" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              Diagnóstico
            </h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DiagnosticoCard
              tipo="fortes"
              pontos={data.diagnostico.pontos_fortes}
              isPago={false}
            />
            <DiagnosticoCard
              tipo="atencao"
              pontos={data.diagnostico.pontos_atencao}
              isPago={false}
            />
          </div>
        </section>

        {/* ========== SEÇÃO 4: 3 INDICADORES — todos na mesma linha ========== */}
        <section id="indicadores" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              Indicadores Financeiros
            </h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {blocosFiltered.flatMap((bloco) =>
              bloco.indicadores.map((indicador) => (
                <IndicadorCard
                  key={indicador.id}
                  indicador={indicador}
                  isPago={false}
                />
              ))
            )}
          </div>
        </section>

        {/* ========== SEÇÃO 5: PLANO DE AÇÃO — largura total, sem colunas vazias ========== */}
        <section id="plano" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              O Que Fazer
            </h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>

          <PlanoAcaoSection
            plano={data.plano_acao}
            analiseId={id}
            isPro={false}
            isFree={true}
          />
        </section>

        {/* ========== SEÇÃO 6: PRO UPGRADE CARD ========== */}
        <section id="pro" className="mb-16">
          <ProUpgradeCard />
        </section>

        {/* ========== AÇÃO FINAL ========== */}
        <div className="flex justify-center pt-4">
          <Link
            href="/analise"
            className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Nova Análise
          </Link>
        </div>

      </main>
    </div>
  );
}