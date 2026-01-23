"use client";

import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { OPCOES_PROLABORE, ProLaboreType, TOOLTIPS } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoProLabore({
  dados,
  erros,
  atualizarDados,
  avancar,
  voltar,
}: Props) {
  const handleSelect = (valor: ProLaboreType) => {
    atualizarDados("prolabore", valor);
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
          Pretende tirar pró-labore nos primeiros meses?
        </h1>
        <p className="text-foreground-muted">
          Pró-labore é o "salário" que você tira da empresa para você
        </p>
      </div>

      {/* Tooltip educativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>O que é pró-labore?</strong> {TOOLTIPS.prolabore}
        </p>
      </div>

      {/* Opções */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-3 mb-8">
          {OPCOES_PROLABORE.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              onClick={() => handleSelect(opcao.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                dados.prolabore === opcao.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    dados.prolabore === opcao.value
                      ? "border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {dados.prolabore === opcao.value && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-foreground">{opcao.label}</p>
              </div>
            </button>
          ))}
        </div>

        {erros.prolabore && (
          <p className="text-danger text-sm text-center mb-4">
            {erros.prolabore}
          </p>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button type="button" onClick={voltar} className="btn-secondary flex-1">
            Voltar
          </button>
          <button
            type="submit"
            disabled={!dados.prolabore}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      </form>
    </div>
  );
}
