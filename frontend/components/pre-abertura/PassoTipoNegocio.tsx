"use client";

import Image from "next/image";
import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { TIPOS_NEGOCIO, TipoNegocioType } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoTipoNegocio({
  dados,
  erros,
  atualizarDados,
  avancar,
}: Props) {
  const handleSelect = (tipo: TipoNegocioType) => {
    atualizarDados("tipo_negocio", tipo);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    avancar();
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo.svg"
            alt="Leme"
            width={64}
            height={64}
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Vamos analisar sua ideia de negócio
        </h1>
        <p className="text-foreground-muted">
          Primeiro, me conta: o que você pretende vender?
        </p>
      </div>

      {/* Opções */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-8">
          {TIPOS_NEGOCIO.map((tipo) => (
            <button
              key={tipo.value}
              type="button"
              onClick={() => handleSelect(tipo.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                dados.tipo_negocio === tipo.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    dados.tipo_negocio === tipo.value
                      ? "border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {dados.tipo_negocio === tipo.value && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{tipo.label}</p>
                  <p className="text-sm text-foreground-muted">
                    {tipo.descricao}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {erros.tipo_negocio && (
          <p className="text-danger text-sm text-center mb-4">
            {erros.tipo_negocio}
          </p>
        )}

        {/* Botão */}
        <button
          type="submit"
          disabled={!dados.tipo_negocio}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </form>
    </div>
  );
}
