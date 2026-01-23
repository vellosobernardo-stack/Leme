"use client";

import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { SETORES } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoSetor({
  dados,
  erros,
  atualizarDados,
  avancar,
  voltar,
}: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    avancar();
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Qual será o setor de atuação?
        </h1>
        <p className="text-foreground-muted">
          Isso nos ajuda a comparar com a média do mercado
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card">
        <div className="mb-6">
          <label htmlFor="setor" className="label">
            Setor <span className="text-danger">*</span>
          </label>
          <select
            id="setor"
            value={dados.setor}
            onChange={(e) => atualizarDados("setor", e.target.value)}
            className={`input ${erros.setor ? "input-error" : ""}`}
          >
            <option value="">Selecione o setor</option>
            {SETORES.map((setor) => (
              <option key={setor.value} value={setor.value}>
                {setor.label}
              </option>
            ))}
          </select>
          {erros.setor && (
            <p className="text-danger text-sm mt-1">{erros.setor}</p>
          )}
        </div>

        <p className="help-text mb-6">
          Escolha o setor que mais se aproxima da sua ideia de negócio
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
