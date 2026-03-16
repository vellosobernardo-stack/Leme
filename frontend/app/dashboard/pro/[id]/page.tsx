"use client";

// app/dashboard/pro/[id]/page.tsx
// Dashboard Pro — navegação por views com sidebar (desktop) e barra inferior (mobile)
// Fase 4A — reestruturação completa da navegação

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { buscarDashboardPorId, buscarComparativo, buscarHistorico } from "@/lib/api";
import { DashboardData, AnaliseHistorico } from "@/types/dashboard";

import ProSidebar,   { ViewSlug } from "@/components/pro/ProSidebar";
import ProBottomNav              from "@/components/pro/ProBottomNav";
import ProHeader                 from "@/components/pro/ProHeader";

import ViewVisaoGeral   from "@/components/pro/views/ViewVisaoGeral";
import ViewSimuladores  from "@/components/pro/views/ViewSimuladores";
import ViewDiagnostico  from "@/components/pro/views/ViewDiagnostico";
import ViewIndicadores  from "@/components/pro/views/ViewIndicadores";
import ViewPlanoAcao    from "@/components/pro/views/ViewPlanoAcao";
import ViewFinanceiro   from "@/components/pro/views/ViewFinanceiro";
import ViewHistorico    from "@/components/pro/views/ViewHistorico";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ComparativoAnterior {
  analise_id: string;
  score: number | null;
  mes_referencia: number;
  ano_referencia: number;
  indicadores: Record<string, number | null>;
}

interface Comparativo {
  atual: ComparativoAnterior;
  anterior: ComparativoAnterior | null;
  variacoes: Record<string, { valor: number; status: "melhorou" | "piorou" | "estavel" } | number | null> | null;
  pontos_atencao_anteriores: string[];
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const VIEWS_VALIDAS: ViewSlug[] = [
  "visao-geral",
  "simuladores",
  "diagnostico",
  "indicadores",
  "plano-de-acao",
  "financeiro",
  "historico",
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DashboardAnalise() {
  const { id }      = useParams<{ id: string }>();
  const router      = useRouter();
  const searchParams = useSearchParams();
  const { carregando: carregandoAuth, isPro } = useAuth();

  // View ativa — lida do query param ?view=, default: visao-geral
  const viewParam = searchParams.get("view") as ViewSlug | null;
  const viewAtiva: ViewSlug =
    viewParam && VIEWS_VALIDAS.includes(viewParam) ? viewParam : "visao-geral";

  // ─── Estado ─────────────────────────────────────────────────────────────────

  const [dashboard,   setDashboard]   = useState<DashboardData | null>(null);
  const [comparativo, setComparativo] = useState<Comparativo | null>(null);
  const [historico,   setHistorico]   = useState<AnaliseHistorico[]>([]);
  const [carregando,  setCarregando]  = useState(true);
  const [erro,        setErro]        = useState<string | null>(null);

  // ─── Auth guard ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!carregandoAuth && !isPro) router.replace("/");
  }, [carregandoAuth, isPro, router]);

  // ─── Fetch de dados — feito UMA vez no nível da page ────────────────────────
  // As views recebem os dados como props — sem fetch duplicado por view.

  useEffect(() => {
    if (!isPro || !id) return;
    Promise.all([
      buscarDashboardPorId(id),
      buscarComparativo().catch(() => null),
      buscarHistorico().catch(() => []),
    ])
      .then(([dash, comp, hist]) => {
        setDashboard(dash);
        setComparativo(comp);
        setHistorico(hist ?? []);
      })
      .catch(() => setErro("Não foi possível carregar a análise."))
      .finally(() => setCarregando(false));
  }, [isPro, id]);

  // ─── Dados derivados (memoizados) ────────────────────────────────────────────

  const analiseAnterior = useMemo(() => {
    if (!comparativo?.anterior) return null;
    return {
      score:          comparativo.anterior.score,
      mes_referencia: comparativo.anterior.mes_referencia,
      ano_referencia: comparativo.anterior.ano_referencia,
    };
  }, [comparativo]);

  const indicadoresAnteriores = useMemo(
    () => comparativo?.anterior?.indicadores ?? null,
    [comparativo]
  );

  const pontosAtencaoAnteriores = useMemo(
    () => comparativo?.pontos_atencao_anteriores ?? undefined,
    [comparativo]
  );

  const mesLabel = useMemo(() => {
    if (!dashboard) return "";
    const mesNum = Number(dashboard.empresa.mes_referencia);
    return !isNaN(mesNum) && mesNum >= 1 && mesNum <= 12
      ? `${MESES[mesNum - 1]}/${dashboard.empresa.ano_referencia}`
      : String(dashboard.empresa.ano_referencia);
  }, [dashboard]);

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (carregandoAuth || carregando) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#F8F7F5",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 32, height: 32,
          border: "3px solid #003054", borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  // ─── Erro ───────────────────────────────────────────────────────────────────

  if (erro || !dashboard) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16, background: "#F8F7F5", fontFamily: "DM Sans, sans-serif",
      }}>
        <p style={{ color: "#c0392b", fontSize: 15 }}>
          {erro || "Análise não encontrada."}
        </p>
        <Link href="/dashboard/pro" style={{ color: "#003054", fontSize: 14, textDecoration: "underline" }}>
          Voltar ao histórico
        </Link>
      </div>
    );
  }

  // ─── View ativa ─────────────────────────────────────────────────────────────

  const viewProps = { dashboard, analiseId: id };

  const renderView = () => {
    switch (viewAtiva) {
      case "visao-geral":
        return (
          <ViewVisaoGeral
            {...viewProps}
            analiseAnterior={analiseAnterior}
          />
        );
      case "simuladores":
        return <ViewSimuladores {...viewProps} />;
      case "diagnostico":
        return (
          <ViewDiagnostico
            {...viewProps}
            pontosAtencaoAnteriores={pontosAtencaoAnteriores}
          />
        );
      case "indicadores":
        return (
          <ViewIndicadores
            {...viewProps}
            indicadoresAnteriores={indicadoresAnteriores}
          />
        );
      case "plano-de-acao":
        return <ViewPlanoAcao {...viewProps} />;
      case "financeiro":
        return <ViewFinanceiro {...viewProps} />;
      case "historico":
        return <ViewHistorico {...viewProps} historico={historico} />;
      default:
        return (
          <ViewVisaoGeral
            {...viewProps}
            analiseAnterior={analiseAnterior}
          />
        );
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pro-layout {
          min-height: 100vh;
          background: #F8F7F5;
          font-family: 'DM Sans', sans-serif;
          color: #003054;
        }

        /* Área de conteúdo — margem esquerda para não sobrepor a sidebar */
        .pro-content {
          margin-left: 240px;
          /* Espaço para o header fixo */
          padding-top: 60px;
        }

        /* Scroll da área de conteúdo é independente da sidebar */
        .pro-content-inner {
          max-width: 860px;
          margin: 0 auto;
          padding: 36px 32px 80px;
          animation: fadeUp 0.35s ease both;
        }

        /* Plano de Ação precisa de mais largura para os 3 cards */
        .pro-content-inner.view-larga {
          max-width: 1100px;
        }

        /* Título da view atual */
        .view-titulo {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #003054;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        /* Mobile — sidebar some, header ocupa largura total, bottom nav aparece */
        @media (max-width: 1023px) {
          .pro-content {
            margin-left: 0;
          }
          .pro-content-inner {
            padding: 24px 16px 96px; /* 96px = espaço para a barra inferior */
          }
          .view-titulo {
            font-size: 19px;
          }
        }
      `}</style>

      <div className="pro-layout">

        {/* Sidebar — desktop only (se esconde sozinha no mobile via CSS) */}
        <ProSidebar analiseId={id} viewAtiva={viewAtiva} />

        {/* Header — fixo, acima do conteúdo */}
        <ProHeader
          nomeEmpresa={dashboard.empresa.nome}
          mesLabel={mesLabel}
          setor={dashboard.empresa.setor}
        />

        {/* Conteúdo principal */}
        <main className="pro-content">
          <div className={`pro-content-inner${viewAtiva === 'plano-de-acao' ? ' view-larga' : ''}`}>
            <h1 className="view-titulo">
              {{
                "visao-geral":   "Visão Geral",
                "simuladores":   "Simuladores",
                "diagnostico":   "Diagnóstico",
                "indicadores":   "Indicadores Financeiros",
                "plano-de-acao": "Plano de Ação",
                "financeiro":    "Financeiro",
                "historico":     "Histórico",
              }[viewAtiva]}
            </h1>

            {renderView()}
          </div>
        </main>

        {/* Barra inferior — mobile only (se esconde sozinha no desktop via CSS) */}
        <ProBottomNav analiseId={id} viewAtiva={viewAtiva} />

      </div>
    </>
  );
}