"use client";

import Image from "next/image";
import Link from "next/link";
import { usePreAbertura } from "@/hooks/usePreAbertura";
import { PASSOS_INFO } from "@/types/pre_abertura";
import ProgressBar from "@/components/ui/ProgressBar";

// Componentes de cada passo
import PassoTipoNegocio from "@/components/pre-abertura/PassoTipoNegocio";
import PassoEstoque from "@/components/pre-abertura/PassoEstoque";
import PassoSetor from "@/components/pre-abertura/PassoSetor";
import PassoLocalizacao from "@/components/pre-abertura/PassoLocalizacao";
import PassoAbertura from "@/components/pre-abertura/PassoAbertura";
import PassoCapital from "@/components/pre-abertura/PassoCapital";
import PassoProLabore from "@/components/pre-abertura/PassoProLabore";
import PassoFuncionarios from "@/components/pre-abertura/PassoFuncionarios";
import PassoFaturamento from "@/components/pre-abertura/PassoFaturamento";
import PassoClientes from "@/components/pre-abertura/PassoClientes";

export default function PreAberturaPage() {
  const preAbertura = usePreAbertura();
  const { passoAtual, progresso, devePularEstoque } = preAbertura;

  // Título do header
  const getHeaderInfo = () => {
    const info = PASSOS_INFO[passoAtual];
    return info?.titulo || "Análise";
  };

  // Renderiza o passo atual
  const renderPasso = () => {
    switch (passoAtual) {
      case 1:
        return <PassoTipoNegocio {...preAbertura} />;
      case 2:
        // Se for serviço, esse passo é pulado automaticamente pelo hook
        return <PassoEstoque {...preAbertura} />;
      case 3:
        return <PassoSetor {...preAbertura} />;
      case 4:
        return <PassoLocalizacao {...preAbertura} />;
      case 5:
        return <PassoAbertura {...preAbertura} />;
      case 6:
        return <PassoCapital {...preAbertura} />;
      case 7:
        return <PassoProLabore {...preAbertura} />;
      case 8:
        return <PassoFuncionarios {...preAbertura} />;
      case 9:
        return <PassoFaturamento {...preAbertura} />;
      case 10:
        return <PassoClientes {...preAbertura} />;
      default:
        return null;
    }
  };

  // Se já tem resultado, redireciona para página de resultado
  if (preAbertura.resultado) {
    // Redireciona para página de resultado
    if (typeof window !== "undefined") {
      window.location.href = `/pre-abertura/resultado/${preAbertura.resultado.id}`;
    }
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground-muted">Carregando resultado...</p>
        </div>
      </div>
    );
  }

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
            <div className="text-sm text-foreground-muted flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                Pré-abertura
              </span>
              <span>{getHeaderInfo()}</span>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar progresso={progresso} />
          </div>
        </div>
      </header>

      {/* Conteúdo do passo */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {renderPasso()}
      </div>

      {/* Erro de envio (se houver) */}
      {preAbertura.erroEnvio && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <p className="text-red-800 text-sm">{preAbertura.erroEnvio}</p>
        </div>
      )}
    </main>
  );
}
