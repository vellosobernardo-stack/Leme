"use client";

import Image from "next/image";
import { useAnalise, PASSOS_ETAPA4_INFO } from "@/hooks/useAnalise";
import { ETAPAS_INFO } from "@/types/analise";
import ProgressBar from "@/components/ui/ProgressBar";
import Link from "next/link";

// Etapas do fluxo
import Etapa1Identificacao from "@/components/analise/Etapa1Identificacao";
import Etapa2Basico from "@/components/analise/Etapa2Basico";
import Etapa3Metodo from "@/components/analise/Etapa3Metodo";
import Etapa4SaudeFinanceira from "@/components/analise/Etapa4SaudeFinanceira";

export default function AnalisePage() {
  const analise = useAnalise();
  const { etapaAtual, passoEtapa4, progresso } = analise;

  // Texto do header - mostra passo específico na Etapa 4
  const getHeaderInfo = () => {
    if (etapaAtual === 4) {
      return `Saúde Financeira: ${PASSOS_ETAPA4_INFO[passoEtapa4].titulo}`;
    }
    return `Etapa ${etapaAtual} de 4: ${ETAPAS_INFO[etapaAtual].titulo}`;
  };

  // Renderiza a etapa atual
  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return <Etapa1Identificacao {...analise} />;
      case 2:
        return <Etapa2Basico {...analise} />;
      case 3:
        return <Etapa3Metodo {...analise} />;
      case 4:
        return <Etapa4SaudeFinanceira {...analise} />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-background-light">
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
            <div className="text-sm text-foreground-muted">
              {getHeaderInfo()}
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar progresso={progresso} />
          </div>
        </div>
      </header>

      {/* Conteúdo da etapa */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderEtapa()}
      </div>
    </main>
  );
}