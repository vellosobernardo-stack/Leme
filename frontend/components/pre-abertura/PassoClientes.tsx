"use client";

import { UsePreAberturaReturn } from "@/hooks/usePreAbertura";
import { OPCOES_CLIENTES, ClientesGarantidosType } from "@/types/pre_abertura";

type Props = UsePreAberturaReturn;

export default function PassoClientes({
  dados,
  erros,
  atualizarDados,
  voltar,
  enviarAnalise,
  carregando,
}: Props) {
  const handleSelect = (valor: ClientesGarantidosType) => {
    atualizarDados("clientes_garantidos", valor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await enviarAnalise();
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Já tem clientes ou contratos garantidos?
        </h1>
        <p className="text-foreground-muted">
          Última pergunta! Isso nos ajuda a avaliar o risco inicial
        </p>
      </div>

      {/* Opções */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-8">
          {OPCOES_CLIENTES.map((opcao) => (
            <button
              key={opcao.value}
              type="button"
              onClick={() => handleSelect(opcao.value)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                dados.clientes_garantidos === opcao.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    dados.clientes_garantidos === opcao.value
                      ? "border-primary"
                      : "border-gray-300"
                  }`}
                >
                  {dados.clientes_garantidos === opcao.value && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{opcao.label}</p>
                  <p className="text-sm text-foreground-muted">
                    {opcao.descricao}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {erros.clientes_garantidos && (
          <p className="text-danger text-sm text-center mb-4">
            {erros.clientes_garantidos}
          </p>
        )}

        {/* Email opcional */}
        <div className="card mb-6">
          <label htmlFor="email" className="label">
            Seu e-mail{" "}
            <span className="text-foreground-muted text-sm">(opcional)</span>
          </label>
          <input
            type="email"
            id="email"
            value={dados.email}
            onChange={(e) => atualizarDados("email", e.target.value)}
            placeholder="seu@email.com"
            className="input"
          />
          <p className="help-text">Para salvar sua análise e receber por e-mail</p>
        </div>

        {/* Botões */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={voltar}
            disabled={carregando}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={!dados.clientes_garantidos || carregando}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Analisando...
              </span>
            ) : (
              "Ver minha análise"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
