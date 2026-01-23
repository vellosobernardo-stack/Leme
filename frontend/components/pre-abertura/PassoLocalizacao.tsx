"use client";

import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { ESTADOS_BR } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoLocalizacao({
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
          Onde pretende operar?
        </h1>
        <p className="text-foreground-muted">
          Localização pode influenciar custos e exigências legais
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card">
        {/* Estado */}
        <div className="mb-6">
          <label htmlFor="estado" className="label">
            Estado <span className="text-danger">*</span>
          </label>
          <select
            id="estado"
            value={dados.estado}
            onChange={(e) => atualizarDados("estado", e.target.value)}
            className={`input ${erros.estado ? "input-error" : ""}`}
          >
            <option value="">Selecione o estado</option>
            {ESTADOS_BR.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
          {erros.estado && (
            <p className="text-danger text-sm mt-1">{erros.estado}</p>
          )}
        </div>

        {/* Cidade (opcional) */}
        <div className="mb-6">
          <label htmlFor="cidade" className="label">
            Cidade <span className="text-foreground-muted text-sm">(opcional)</span>
          </label>
          <input
            type="text"
            id="cidade"
            value={dados.cidade}
            onChange={(e) => atualizarDados("cidade", e.target.value)}
            placeholder="Digite a cidade"
            className="input"
          />
        </div>

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
