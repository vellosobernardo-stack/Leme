"use client";

import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { MESES } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoAbertura({
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

  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 7 }, (_, i) => anoAtual + i);

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Quando pretende abrir?
        </h1>
        <p className="text-foreground-muted">
          Uma estimativa é suficiente — pode ajustar depois
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="mes_abertura" className="label">
              Mês <span className="text-danger">*</span>
            </label>
            <select
              id="mes_abertura"
              value={dados.mes_abertura}
              onChange={(e) =>
                atualizarDados("mes_abertura", parseInt(e.target.value))
              }
              className="input"
            >
              {MESES.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ano_abertura" className="label">
              Ano <span className="text-danger">*</span>
            </label>
            <select
              id="ano_abertura"
              value={dados.ano_abertura}
              onChange={(e) =>
                atualizarDados("ano_abertura", parseInt(e.target.value))
              }
              className="input"
            >
              {anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dica */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> Aberturas muito próximas (menos de 3 meses) exigem mais capital de reserva
          </p>
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
