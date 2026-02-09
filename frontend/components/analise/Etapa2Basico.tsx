"use client";

import { DadosAnalise, ErrosCampo, SETORES, ESTADOS_BR, MESES } from "@/types/analise";

interface Etapa2Props {
  dados: DadosAnalise;
  erros: ErrosCampo;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
  avancar: () => Promise<boolean> | boolean;
  voltar: () => void;
}

export default function Etapa2Basico({
  dados,
  erros,
  atualizarDados,
  avancar,
  voltar,
}: Etapa2Props) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await avancar();
  };

  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: anoAtual - 2020 + 2 }, (_, i) => 2020 + i);

  return (
    <div className="max-w-lg mx-auto animate-fade-in pb-24 sm:pb-0">
      {/* Cabeçalho — compacto no mobile pequeno */}
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
          Sobre sua empresa
        </h1>
        <p className="hidden sm:block text-foreground-muted">
          Precisamos de alguns dados para personalizar sua análise
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="card p-4 sm:p-6">
        {/* Setor */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="setor" className="label">
            Setor de atuação <span className="text-danger">*</span>
          </label>
          <select
            id="setor"
            value={dados.setor}
            onChange={(e) => atualizarDados("setor", e.target.value as any)}
            className={`input py-3 sm:py-2 ${erros.setor ? "input-error" : ""}`}
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

        {/* Estado */}
        <div className="mb-4 sm:mb-6">
          <label htmlFor="estado" className="label">
            Estado <span className="text-danger">*</span>
          </label>
          <select
            id="estado"
            value={dados.estado}
            onChange={(e) => atualizarDados("estado", e.target.value as any)}
            className={`input py-3 sm:py-2 ${erros.estado ? "input-error" : ""}`}
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

        {/* Mês e Ano */}
        <div className="grid grid-cols-2 gap-4 mb-4 sm:mb-6">
          <div>
            <label htmlFor="mes_referencia" className="label">
              Mês de referência <span className="text-danger">*</span>
            </label>
            <select
              id="mes_referencia"
              value={dados.mes_referencia}
              onChange={(e) => atualizarDados("mes_referencia", parseInt(e.target.value))}
              className={`input py-3 sm:py-2 ${erros.mes_referencia ? "input-error" : ""}`}
            >
              {MESES.map((mes) => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="ano_referencia" className="label">
              Ano <span className="text-danger">*</span>
            </label>
            <select
              id="ano_referencia"
              value={dados.ano_referencia}
              onChange={(e) => atualizarDados("ano_referencia", parseInt(e.target.value))}
              className="input py-3 sm:py-2"
            >
              {anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="help-text mb-4 sm:mb-6 text-xs">
          Dados do mês mais recente com informações completas
        </p>

        {/* Botões — sticky no mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 sm:relative sm:border-0 sm:p-0 sm:bg-transparent z-40">
          <div className="flex gap-3 max-w-lg mx-auto">
            <button type="button" onClick={voltar} className="btn-secondary flex-1 py-3 sm:py-2.5">
              Voltar
            </button>
            <button type="submit" className="btn-primary flex-1 py-3 sm:py-2.5">
              Próximo
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}