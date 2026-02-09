"use client";

import Image from "next/image";
import { useAnalise, PASSOS_ETAPA4_INFO } from "@/hooks/useAnalise";
import ProgressBar from "@/components/ui/ProgressBar";
import Link from "next/link";
import { Check } from "lucide-react";

// Etapas do fluxo (Etapa 3 removida — método manual é default)
import Etapa1Identificacao from "@/components/analise/Etapa1Identificacao";
import Etapa2Basico from "@/components/analise/Etapa2Basico";
import Etapa4SaudeFinanceira from "@/components/analise/Etapa4SaudeFinanceira";

export default function AnalisePage() {
  const analise = useAnalise();
  const { etapaAtual, passoEtapa4, progresso } = analise;

  const isEtapa1 = etapaAtual === 1;

  // Breadcrumb: ✔ Perfil › ✔ Empresa › Saúde Financeira
  const renderBreadcrumb = () => {
    const etapas = [
      { label: "Perfil", completa: etapaAtual > 1, ativa: false },
      { label: "Empresa", completa: etapaAtual > 2, ativa: etapaAtual === 2 },
      { label: "Saúde", completa: false, ativa: etapaAtual === 4 },
    ];

    return (
      <div className="flex items-center gap-1 text-xs">
        {etapas.map((etapa, i) => (
          <span key={etapa.label} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300 mx-0.5">›</span>}
            {etapa.completa ? (
              <>
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                <span className="text-gray-400">{etapa.label}</span>
              </>
            ) : etapa.ativa ? (
              <span className="text-primary font-medium">{etapa.label}</span>
            ) : (
              <span className="text-gray-300">{etapa.label}</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  // Header info adaptativo por tamanho de tela
  const renderHeaderInfo = () => {
    if (etapaAtual === 2) {
      return (
        <div className="flex flex-col items-end gap-0.5">
          {/* Breadcrumb — escondido no menor mobile */}
          <div className="hidden sm:block">
            {renderBreadcrumb()}
          </div>
          {/* Mobile pequeno: só o essencial */}
          <span className="sm:hidden text-xs text-foreground-muted">Empresa</span>
        </div>
      );
    }

    if (etapaAtual === 4) {
      return (
        <div className="flex flex-col items-end gap-0.5">
          {/* Breadcrumb — escondido no menor mobile */}
          <div className="hidden sm:block">
            {renderBreadcrumb()}
          </div>
          {/* Subtítulo: "Receita (1/7)" */}
          <span className="text-xs text-foreground-muted">
            {PASSOS_ETAPA4_INFO[passoEtapa4].titulo}
            <span className="text-gray-400"> ({passoEtapa4}/7)</span>
          </span>
        </div>
      );
    }

    return null;
  };

  // Renderiza a etapa atual (sem Etapa 3)
  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return <Etapa1Identificacao {...analise} />;
      case 2:
        return <Etapa2Basico {...analise} />;
      case 4:
        return <Etapa4SaudeFinanceira {...analise} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-background-light">
      {/* Header — compacto, adaptativo */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/images/logo.svg" 
                alt="Leme" 
                width={32} 
                height={32} 
                className="h-7 sm:h-8 w-auto" 
              />
              <span className="font-bold text-primary text-lg sm:text-xl">Leme</span>
            </Link>
            {/* Info — só a partir da Etapa 2 */}
            {!isEtapa1 && renderHeaderInfo()}
          </div>
          {/* Barra de progresso — escondida na Etapa 1 */}
          {!isEtapa1 && (
            <div className="mt-2 sm:mt-3">
              <ProgressBar progresso={progresso} />
            </div>
          )}
        </div>
      </header>

      {/* Microcopy de transição — só no passo 1 da Saúde Financeira */}
      {etapaAtual === 4 && passoEtapa4 === 1 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-center">
            <p className="text-xs sm:text-sm text-blue-700">
              ⚡ Valores aproximados, 7 perguntas objetivas
            </p>
          </div>
        </div>
      )}

      {/* Conteúdo da etapa — spacing adaptativo */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {renderEtapa()}
      </div>
    </main>
  );
}