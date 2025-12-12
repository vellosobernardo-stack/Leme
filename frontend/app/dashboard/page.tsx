// app/dashboard/page.tsx
// Página principal do Dashboard - Estilo Premium

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeaderNavigation from "@/components/dashboard/HeaderNavigation";
import ValuationCard from "@/components/dashboard/ValuationCard";
import PaybackCard from "@/components/dashboard/PaybackCard";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import BlocoIndicadores from "@/components/dashboard/BlocoIndicadores";
import DiagnosticoCard from "@/components/dashboard/DiagnosticoCard";
import PlanoAcaoSection from "@/components/dashboard/PlanoAcaoSection";
import HistoricoTable from "@/components/dashboard/HistoricoTable";
import { buscarDashboard, buscarDashboardPorId } from "@/lib/api";
import { mockDashboardData } from "@/lib/mockDashboardData";
import { DashboardData } from "@/types/dashboard";

// Componente interno que usa useSearchParams
function DashboardContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const id = searchParams.get("id");
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      if (!email && !id) {
        setData(mockDashboardData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let resultado;
        if (id) {
          resultado = await buscarDashboardPorId(id);
        } else if (email) {
          resultado = await buscarDashboard(email);
        }
        
        setData(resultado);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        setData(mockDashboardData);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [email, id]);

  // Função para exportar PDF via backend
  const handleExportarPDF = async () => {
    if (!data) return;
    
    setExportando(true);
    
    try {
      // Formata o tempo do payback
      const formatarPayback = () => {
        const anos = data.payback.anos || 0;
        const meses = data.payback.meses || 0;
        if (anos === 0 && meses === 0) return 'Imediato';
        if (anos === 0) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
        if (meses === 0) return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
        return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
      };

      const payload = {
        empresa_nome: data.empresa.nome,
        setor: data.empresa.setor,
        estado: data.empresa.estado || null,
        mes_referencia: `${data.empresa.mes_referencia}/${data.empresa.ano_referencia}`,
        score: data.score.valor,
        score_label: data.score.status === 'saudavel' ? 'Saudável' : data.score.status === 'atencao' ? 'Atenção' : 'Crítico',
        valuation_min: `R$ ${data.valuation.valor_minimo.toLocaleString('pt-BR')}`,
        valuation_max: `R$ ${data.valuation.valor_maximo.toLocaleString('pt-BR')}`,
        multiplo: data.valuation.multiplo_usado,
        payback_texto: formatarPayback(),
        indicadores: data.blocos_indicadores.flatMap(bloco => 
          bloco.indicadores.map(ind => ({
            nome: ind.nome,
            valor: ind.unidade.startsWith('R$')
              ? `R$ ${Number(ind.valor).toLocaleString('pt-BR')}${ind.unidade.replace('R$', '')}`
              : ind.unidade === '%'
                ? `${ind.valor}%`
                : `${ind.valor} ${ind.unidade}`,
            descricao: ind.explicacao
          }))
        ),
        diagnostico: {
          pontos_fortes: data.diagnostico.pontos_fortes.map(p => p.titulo),
          pontos_atencao: data.diagnostico.pontos_atencao.map(p => p.titulo)
        },
        acoes: [
          ...data.plano_acao.plano_30_dias.acoes.slice(0, 3).map(a => ({ periodo: "30" as const, titulo: a.titulo })),
          ...data.plano_acao.plano_60_dias.acoes.slice(0, 3).map(a => ({ periodo: "60" as const, titulo: a.titulo })),
          ...data.plano_acao.plano_90_dias.acoes.slice(0, 3).map(a => ({ periodo: "90" as const, titulo: a.titulo }))
        ]
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Leme_${data.empresa.nome.replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setExportando(false);
    }
  };

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

  // Se não tem dados
  if (!data) {
    return (
      <div className="min-h-screen bg-[#F7FAFD] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Nenhuma análise encontrada</p>
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

  return (
    <div className="min-h-screen bg-[#F7FAFD]">
      {/* Header integrado com navegação */}
      <HeaderNavigation />

      {/* Aviso se usando dados mockados */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-28">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              {error}. Exibindo dados de demonstração.
            </p>
          </div>
        </div>
      )}

      {/* Header com info da empresa */}
      <div className={`max-w-7xl mx-auto px-4 ${error ? 'pt-4' : 'pt-28'}`}>
        <DashboardHeader empresa={data.empresa} />
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        
        {/* ========== SEÇÃO: RESUMO ========== */}
        <section id="resumo" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Resumo Executivo</h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ValuationCard valuation={data.valuation} />
            <PaybackCard payback={data.payback} />
          </div>

          {/* Score de Saúde Financeira */}
          <ScoreGauge 
            score={data.score}
            evolucao={data.score_evolucao}
            influenciadores={data.influenciadores}
          />
        </section>

        {/* ========== SEÇÃO: INDICADORES ========== */}
        <section id="indicadores" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Indicadores Financeiros</h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
          
          {/* 3 Blocos de Indicadores */}
          <div className="space-y-6">
            {data.blocos_indicadores.map((bloco) => (
              <BlocoIndicadores key={bloco.id} bloco={bloco} />
            ))}
          </div>
        </section>

        {/* ========== SEÇÃO: DIAGNÓSTICO ========== */}
        <section id="diagnostico" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Diagnóstico</h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DiagnosticoCard 
              tipo="fortes" 
              pontos={data.diagnostico.pontos_fortes} 
            />
            <DiagnosticoCard 
              tipo="atencao" 
              pontos={data.diagnostico.pontos_atencao} 
            />
          </div>
        </section>

        {/* ========== SEÇÃO: PLANO DE AÇÃO ========== */}
        <section id="plano" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Plano de Ação</h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
          
          <PlanoAcaoSection plano={data.plano_acao} />
        </section>

        {/* ========== SEÇÃO: HISTÓRICO ========== */}
        <section id="historico" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Histórico de Análises</h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
          
          <HistoricoTable historico={data.historico} />
        </section>

        {/* ========== AÇÕES FINAIS ========== */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            href="/analise"
            className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            Nova Análise
          </Link>
          
          <button 
            onClick={handleExportarPDF}
            disabled={exportando}
            className="px-8 py-4 bg-white text-primary border border-border/40 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                Gerando PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar PDF
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}

// Componente principal com Suspense para useSearchParams
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7FAFD] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando análise...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}