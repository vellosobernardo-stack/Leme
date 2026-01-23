"use client";

import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";

type Props = UsePreAberturaReturn;

export default function PassoEstoque({
  dados,
  erros,
  atualizarDados,
  avancar,
  voltar,
}: Props) {
  const handleSelect = (valor: boolean) => {
    atualizarDados("tem_estoque", valor);
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
          Vai trabalhar com estoque físico?
        </h1>
        <p className="text-foreground-muted">
          Estoque significa ter produtos guardados antes de vender
        </p>
      </div>

      {/* Opções */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-8">
          <button
            type="button"
            onClick={() => handleSelect(true)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              dados.tem_estoque === true
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  dados.tem_estoque === true
                    ? "border-primary"
                    : "border-gray-300"
                }`}
              >
                {dados.tem_estoque === true && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">Sim</p>
                <p className="text-sm text-foreground-muted">
                  Vou comprar produtos para revender ou usar como matéria-prima
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelect(false)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              dados.tem_estoque === false
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  dados.tem_estoque === false
                    ? "border-primary"
                    : "border-gray-300"
                }`}
              >
                {dados.tem_estoque === false && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">Não</p>
                <p className="text-sm text-foreground-muted">
                  Trabalho sob encomenda, dropshipping ou sem estoque próprio
                </p>
              </div>
            </div>
          </button>
        </div>

        {erros.tem_estoque && (
          <p className="text-danger text-sm text-center mb-4">
            {erros.tem_estoque}
          </p>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button type="button" onClick={voltar} className="btn-secondary flex-1">
            Voltar
          </button>
          <button
            type="submit"
            disabled={dados.tem_estoque === null}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      </form>
    </div>
  );
}
