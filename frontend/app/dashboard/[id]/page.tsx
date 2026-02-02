// app/dashboard/[id]/page.tsx
// Página do Dashboard com ID dinâmico na URL e Paywall

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HeaderNavigation from "@/components/dashboard/HeaderNavigation";
import ValuationCard from "@/components/dashboard/ValuationCard";
import PaybackCard from "@/components/dashboard/PaybackCard";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import BlocoIndicadores from "@/components/dashboard/BlocoIndicadores";
import DiagnosticoCard from "@/components/dashboard/DiagnosticoCard";
import PlanoAcaoSection from "@/components/dashboard/PlanoAcaoSection";
import HistoricoTable from "@/components/dashboard/HistoricoTable";
import PaywallOverlay from "@/components/dashboard/PaywallOverlay";
import PaywallModal from "@/components/dashboard/PaywallModal";
import { buscarDashboardPorId } from "@/lib/api";
import { DashboardData } from "@/types/dashboard";
import { AlertTriangle, Download } from "lucide-react";

// Declaração do gtag para TypeScript
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// E-mail admin que tem acesso liberado sem pagar (para testes)
const ADMIN_EMAIL = "bavstecnologia@gmail.com";

interface DashboardPageProps {
  params: { id: string };
}

export default function DashboardPage({ params }: DashboardPageProps) {
  const { id } = params;
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  
  // Estado do paywall
  const [pago, setPago] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
        
        // Verifica se é admin (libera sem pagar)
        if (resultado.empresa.email === ADMIN_EMAIL) {
          setPago(true);
        } else {
          // Verifica status de pagamento
          await verificarStatusPagamento();
        }
        
        // Dispara evento de conversão do Google Ads quando carrega com sucesso
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-17804678209/RR2JCNi84dEbEMGo96lC'
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

  // Verificar se a análise já foi paga
  const verificarStatusPagamento = async () => {
    try {
      // Primeiro verifica no backend se já está marcado como pago
      const response = await fetch(`${API_URL}/pagamento/status/${id}`);
      if (response.ok) {
        const statusData = await response.json();
        if (statusData.pago === true) {
          setPago(true);
          return;
        }
      }

      // Se voltou do Stripe com ?pago=true, confirma o pagamento
      const pagoParam = searchParams.get('pago');
      if (pagoParam === 'true') {
        await confirmarPagamentoStripe();
      }
    } catch (err) {
      console.error("Erro ao verificar pagamento:", err);
    }
  };

  // Confirma pagamento após retorno do Stripe
  const confirmarPagamentoStripe = async () => {
    try {
      // Chama endpoint para verificar e liberar a análise
      const response = await fetch(`${API_URL}/pagamento/confirmar-retorno`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analise_id: id })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.confirmado) {
          setPago(true);
          
          // Remove ?pago=true da URL sem recarregar
          const url = new URL(window.location.href);
          url.searchParams.delete('pago');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch (err) {
      console.error("Erro ao confirmar pagamento:", err);
    }
  };

  // Callback quando pagamento é confirmado (via modal)
  const handlePagamentoConfirmado = () => {
    setPago(true);
    setModalAberto(false);
  };

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

  // Erro ou não encontrado
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

  return (
    <div className="min-h-screen bg-[#F7FAFD]">
      {/* Header integrado com navegação */}
      <HeaderNavigation />

      {/* Header com info da empresa */}
      <div className="max-w-7xl mx-auto px-4 pt-28">
        <DashboardHeader empresa={data.empresa} />
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        
        {/* ========== SEÇÃO: RESUMO (LIBERADO) ========== */}
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

        {/* ========== SEÇÃO: INDICADORES (LIBERADO) ========== */}
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

        {/* ========== SEÇÃO: DIAGNÓSTICO (LIBERADO) ========== */}
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

        {/* ========== SEÇÃO: PLANO DE AÇÃO (PAYWALL) ========== */}
        <section id="plano" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Plano de Ação</h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
          
          {pago ? (
            <PlanoAcaoSection plano={data.plano_acao} analiseId={id} />
          ) : (
            <PaywallOverlay onDesbloquear={() => setModalAberto(true)}>
              <PlanoAcaoSection plano={data.plano_acao} analiseId={id} />
            </PaywallOverlay>
          )}
        </section>

        {/* ========== SEÇÃO: HISTÓRICO (PAYWALL) ========== */}
        <section id="historico" className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-2">Histórico de Análises</h2>
            <div className="w-24 h-1 bg-primary/20 mx-auto rounded-full"></div>
          </div>
          
          {pago ? (
            <HistoricoTable historico={data.historico} />
          ) : (
            <PaywallOverlay onDesbloquear={() => setModalAberto(true)}>
              <HistoricoTable historico={data.historico} />
            </PaywallOverlay>
          )}
        </section>

        {/* ========== AVISO PÓS-PAGAMENTO ========== */}
        {pago && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Importante: Baixe seu PDF antes de sair</p>
              <p className="text-sm text-amber-700 mt-1">
                Esta página não ficará disponível após você sair. Recomendamos baixar o relatório em PDF para consultar depois.
              </p>
            </div>
          </div>
        )}

        {/* ========== AÇÕES FINAIS ========== */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link 
            href="/analise"
            className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            Nova Análise
          </Link>
          
          {pago ? (
            <button 
              onClick={handleExportarPDF}
              disabled={exportando}
              className="px-8 py-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exportando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Baixar PDF
                </>
              )}
            </button>
          ) : (
            <button 
              onClick={() => setModalAberto(true)}
              className="px-8 py-4 bg-white text-primary border border-border/40 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              Desbloquear Plano Completo - R$ 19,90
            </button>
          )}
        </div>
      </main>

      {/* Modal de Pagamento */}
      <PaywallModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        analiseId={id}
        empresaNome={data.empresa.nome}
        onPagamentoConfirmado={handlePagamentoConfirmado}
      />
    </div>
  );
}