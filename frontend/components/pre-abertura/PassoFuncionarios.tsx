"use client";

import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { FAIXAS_FUNCIONARIOS, FaixaFuncionariosType } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoFuncionarios({
  dados,
  erros,
  atualizarDados,
  avancar,
  voltar,
}: Props) {
  const handleSelectTemFuncionarios = (valor: boolean) => {
    atualizarDados("tem_funcionarios", valor);
    // Se não tem funcionários, limpa a faixa
    if (!valor) {
      atualizarDados("faixa_funcionarios", "");
    }
  };

  const handleSelectFaixa = (faixa: FaixaFuncionariosType) => {
    atualizarDados("faixa_funcionarios", faixa);
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
          Vai começar com funcionários?
        </h1>
        <p className="text-foreground-muted">
          Funcionários representam custo fixo mensal
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        {/* Pergunta principal: Sim ou Não */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleSelectTemFuncionarios(true)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              dados.tem_funcionarios === true
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  dados.tem_funcionarios === true
                    ? "border-primary"
                    : "border-gray-300"
                }`}
              >
                {dados.tem_funcionarios === true && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <p className="font-semibold text-foreground">Sim, vou contratar</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTemFuncionarios(false)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              dados.tem_funcionarios === false
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  dados.tem_funcionarios === false
                    ? "border-primary"
                    : "border-gray-300"
                }`}
              >
                {dados.tem_funcionarios === false && (
                  <div className="w-3 h-3 rounded-full bg-primary" />
                )}
              </div>
              <p className="font-semibold text-foreground">Não, vou começar sozinho</p>
            </div>
          </button>
        </div>

        {erros.tem_funcionarios && (
          <p className="text-danger text-sm text-center mb-4">
            {erros.tem_funcionarios}
          </p>
        )}

        {/* Se selecionou SIM, mostra as faixas */}
        {dados.tem_funcionarios === true && (
          <div className="animate-fade-in">
            <p className="label mb-3">Quantos funcionários?</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {FAIXAS_FUNCIONARIOS.map((faixa) => (
                <button
                  key={faixa.value}
                  type="button"
                  onClick={() => handleSelectFaixa(faixa.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    dados.faixa_funcionarios === faixa.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 bg-white"
                  }`}
                >
                  <p className="font-medium text-foreground">{faixa.label}</p>
                </button>
              ))}
            </div>

            {erros.faixa_funcionarios && (
              <p className="text-danger text-sm text-center mb-4">
                {erros.faixa_funcionarios}
              </p>
            )}
          </div>
        )}

        {/* Dica */}
        {dados.tem_funcionarios === true && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Cada funcionário representa custo fixo (salário + encargos). Considere começar enxuto até validar o modelo.
            </p>
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button type="button" onClick={voltar} className="btn-secondary flex-1">
            Voltar
          </button>
          <button
            type="submit"
            disabled={
              dados.tem_funcionarios === null ||
              (dados.tem_funcionarios === true && !dados.faixa_funcionarios)
            }
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próximo
          </button>
        </div>
      </form>
    </div>
  );
}
