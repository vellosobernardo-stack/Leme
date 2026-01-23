// app/pre-abertura/resultado/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PreAberturaResponse } from "@/types/pre_abertura";
import GraficoComparativo from "@/components/pre-abertura/resultado/GraficoComparativo";
import AlertaCard from "@/components/pre-abertura/resultado/AlertaCard";
import ChecklistCard from "@/components/pre-abertura/resultado/ChecklistCard";
import MensagemEncorajamento from "@/components/pre-abertura/resultado/MensagemEncorajamento";

interface ResultadoPageProps {
  params: { id: string };
}

export default function ResultadoPreAberturaPage({ params }: ResultadoPageProps) {
  const { id } = params;

  const [data, setData] = useState<PreAberturaResponse | null>(null);
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

        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${API_URL}/api/v1/pre-abertura/${id}`);

        if (!response.ok) {
          throw new Error("Análise não encontrada");
        }

        const resultado: PreAberturaResponse = await response.json();
        setData(resultado);
      } catch (err) {
        console.error("Erro ao carregar resultado:", err);
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
          <p className="text-foreground-muted">Carregando análise...</p>
        </div>
      </div>
    );
  }

  // Erro ou não encontrado
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F7FAFD] flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground-muted mb-4">
            {error || "Análise não encontrada"}
          </p>
          <Link
            href="/pre-abertura"
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
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.svg"
                alt="Leme"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="font-bold text-primary text-xl">Leme</span>
            </Link>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
              Análise Pré-abertura
            </span>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Cabeçalho do resultado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
            Análise do seu projeto
          </h1>
          <div className="flex items-center justify-center gap-2 text-foreground-muted">
            <span>{data.setor_label}</span>
            <span>•</span>
            <span>{data.tipo_negocio === "produto" ? "Produto" : "Serviço"}</span>
            <span>•</span>
            <span>Previsão: {data.previsao_abertura}</span>
          </div>
        </div>

        {/* Gráficos comparativos */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Comparativo com referência do setor
          </h2>
          <div className="space-y-6">
            <GraficoComparativo
              titulo="Capital"
              valorUsuario={data.comparativo_capital.capital_informado}
              valorReferencia={data.comparativo_capital.capital_recomendado}
              diferencaPercentual={data.comparativo_capital.diferenca_percentual}
              status={data.comparativo_capital.status}
              labelUsuario="Seu capital"
              labelReferencia="Referência do setor"
            />
            <GraficoComparativo
              titulo="Faturamento mensal esperado"
              valorUsuario={data.comparativo_faturamento.faturamento_esperado}
              valorReferencia={data.comparativo_faturamento.faturamento_referencia}
              diferencaPercentual={data.comparativo_faturamento.diferenca_percentual}
              status={data.comparativo_faturamento.status}
              labelUsuario="Sua estimativa"
              labelReferencia="Média do setor (1º ano)"
            />
          </div>
        </section>

        {/* Alertas */}
        {data.alertas.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Pontos de atenção
            </h2>
            <div className="space-y-4">
              {data.alertas.map((alerta) => (
                <AlertaCard key={alerta.id} alerta={alerta} />
              ))}
            </div>
          </section>
        )}

        {/* Checklist 30 dias */}
        <section className="mb-10">
          <ChecklistCard itens={data.checklist_30_dias} />
        </section>

        {/* Mensagem de encorajamento */}
        <section className="mb-10">
          <MensagemEncorajamento />
        </section>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-600 text-center">
            Esta é uma análise inicial baseada em médias de mercado. 
            Não substitui orientação contábil, jurídica ou financeira profissional.
          </p>
        </div>

        {/* Ação final */}
        <div className="flex justify-center">
          <Link
            href="/pre-abertura"
            className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            Fazer nova análise
          </Link>
        </div>

        {/* CTA para análise completa */}
        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Já abriu sua empresa?
          </h3>
          <p className="text-foreground-muted mb-4">
            Faça a análise completa do Leme e receba diagnóstico detalhado com 8 indicadores financeiros e plano de ação personalizado.
          </p>
          <Link
            href="/analise"
            className="inline-flex px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-all"
          >
            Fazer análise completa
          </Link>
        </div>
      </main>
    </div>
  );
}