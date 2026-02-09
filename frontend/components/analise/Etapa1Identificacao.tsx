"use client";

import Image from "next/image";
import { DadosAnalise, ErrosCampo } from "@/types/analise";

interface Etapa1Props {
  dados: DadosAnalise;
  erros: ErrosCampo;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
  avancar: () => Promise<boolean> | boolean;
}

export default function Etapa1Identificacao({
  dados,
  erros,
  atualizarDados,
  avancar,
}: Etapa1Props) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await avancar();
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="flex justify-center mb-4">
          <Image 
            src="/images/logo.svg" 
            alt="Leme" 
            width={64} 
            height={64}
            className="h-12 sm:h-16 w-auto"
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Bem-vindo ao Leme!
        </h1>
        <p className="text-sm sm:text-base text-foreground-muted">
          Vamos começar sua análise financeira
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card p-4 sm:p-6">
        {/* Nome da Empresa */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="nome_empresa" className="label">
            Nome da Empresa <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            id="nome_empresa"
            value={dados.nome_empresa}
            onChange={(e) => atualizarDados("nome_empresa", e.target.value)}
            placeholder="Digite o nome da sua empresa"
            className={`input py-3 sm:py-2 ${erros.nome_empresa ? "input-error" : ""}`}
            autoFocus
          />
          {erros.nome_empresa && (
            <p className="text-danger text-sm mt-1">{erros.nome_empresa}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="email" className="label">
            Seu melhor e-mail <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={dados.email}
            onChange={(e) => atualizarDados("email", e.target.value)}
            placeholder="seu@email.com"
            className={`input py-3 sm:py-2 ${erros.email ? "input-error" : ""}`}
            data-hj-suppress
          />
          {erros.email && (
            <p className="text-danger text-sm mt-1">{erros.email}</p>
          )}
          <p className="help-text text-xs">
            Usamos apenas para salvar sua análise
          </p>
        </div>

        {/* Botão */}
        <button type="submit" className="btn-primary w-full py-3 sm:py-2.5">
          Começar Análise
        </button>
      </form>
    </div>
  );
}