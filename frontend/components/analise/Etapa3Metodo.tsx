"use client";

import { DadosAnalise } from "@/types/analise";
import { FileText } from "lucide-react";

interface Etapa3Props {
  dados: DadosAnalise;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
  avancar: () => boolean;
  voltar: () => void;
}

export default function Etapa3Metodo({
  dados,
  atualizarDados,
  avancar,
  voltar,
}: Etapa3Props) {
  const handleContinuar = () => {
    atualizarDados("metodo_entrada", "manual");
    avancar();
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Vamos analisar seu negócio
        </h1>
        <p className="text-foreground-muted">
          Responda algumas perguntas simples sobre as finanças da sua empresa
        </p>
      </div>

      {/* Card informativo */}
      <div className="card text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h3 className="font-semibold text-foreground text-lg mb-2">
          Preenchimento manual
        </h3>
        
        <p className="text-foreground-muted mb-4">
          Você vai responder perguntas sobre receita, custos, caixa e estrutura do seu negócio. 
          Leva menos de <strong>2 minutos</strong>.
        </p>


      </div>

      {/* Botão continuar */}
      <button
        onClick={handleContinuar}
        className="btn-primary w-full py-4 text-lg font-semibold"
      >
        Continuar
      </button>

      {/* Voltar */}
      <div className="mt-6 text-center">
        <button
          onClick={voltar}
          className="text-foreground-muted hover:text-foreground transition-colors"
        >
          Voltar para etapa anterior
        </button>
      </div>
    </div>
  );
}