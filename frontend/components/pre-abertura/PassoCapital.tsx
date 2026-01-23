"use client";

import { useState, useEffect } from "react";
import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { TOOLTIPS } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoCapital({
  dados,
  erros,
  atualizarDados,
  avancar,
  voltar,
}: Props) {
  const [displayValue, setDisplayValue] = useState(
    dados.capital_disponivel > 0
      ? dados.capital_disponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
      : ""
  );

  // Atualiza o display quando o valor externo muda
  useEffect(() => {
    setDisplayValue(
      dados.capital_disponivel > 0
        ? dados.capital_disponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
        : ""
    );
  }, [dados.capital_disponivel]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numero = parseInt(raw) / 100 || 0;
    setDisplayValue(numero > 0 ? numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
    atualizarDados("capital_disponivel", numero);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    avancar();
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Quanto você tem para investir?
        </h1>
        <p className="text-foreground-muted">
          Valor disponível para começar o negócio
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card">
        <div className="mb-6">
          <label htmlFor="capital_disponivel" className="label">
            Capital disponível <span className="text-danger">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-8 text-foreground-muted pointer-events-none select-none z-15">
              R$
            </span>
            <input
              type="text"
              id="capital_disponivel"
              value={displayValue}
              onChange={handleChange}
              placeholder="0,00"
              className={`input w-full !pl-16 focus:ring-2 focus:ring-primary/20 transition-all ${
                erros.capital_disponivel ? "input-error" : ""
              }`}
              inputMode="numeric"
              data-hj-suppress
            />
          </div>
          {erros.capital_disponivel && (
            <p className="text-danger text-sm mt-1">{erros.capital_disponivel}</p>
          )}
        </div>

        {/* Dica */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Dica:</strong> {TOOLTIPS.capital}
          </p>
        </div>

        <p className="help-text mb-6">
          Use valores aproximados — não precisa ser exato
        </p>

        {/* Botões */}
        <div className="flex gap-4">
          <button type="button" onClick={voltar} className="btn-secondary flex-1">
            Voltar
          </button>
          <button type="submit" className="btn-primary flex-1">
            Próximo
          </button>
        </div>
      </form>
    </div>
  );
}