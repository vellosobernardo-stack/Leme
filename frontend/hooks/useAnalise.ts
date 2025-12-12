"use client";

import { useState, useCallback } from "react";
import {
  DadosAnalise,
  DADOS_INICIAIS,
  EtapaFluxo,
  ErrosCampo,
  ResultadoValidacao,
  ReceitaHistorico,
} from "@/types/analise";

/**
 * Hook para gerenciar o estado do fluxo de análise
 */
export function useAnalise() {
  const [dados, setDados] = useState<DadosAnalise>(DADOS_INICIAIS);
  const [etapaAtual, setEtapaAtual] = useState<EtapaFluxo>(1);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<ErrosCampo>({});
  const [alertas, setAlertas] = useState<string[]>([]);
  const [cardsExpandidos, setCardsExpandidos] = useState<string[]>(["receita"]);

  // Atualizar campo simples
  const atualizarDados = useCallback(
    <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => {
      setDados((prev) => ({ ...prev, [campo]: valor }));
      if (erros[campo]) {
        setErros((prev) => ({ ...prev, [campo]: undefined }));
      }
    },
    [erros]
  );

  // Atualizar receita histórico
  const atualizarReceitaHistorico = useCallback(
    (campo: keyof ReceitaHistorico, valor: number) => {
      setDados((prev) => ({
        ...prev,
        receita_historico: { ...prev.receita_historico, [campo]: valor },
      }));
    },
    []
  );

  // Validar Etapa 1
  const validarEtapa1 = useCallback((): ResultadoValidacao => {
    const novosErros: ErrosCampo = {};

    if (!dados.nome_empresa || dados.nome_empresa.trim().length < 2) {
      novosErros.nome_empresa = "Nome da empresa é obrigatório";
    }

    if (!dados.email || !/^[\w.-]+@[\w.-]+\.\w+$/.test(dados.email)) {
      novosErros.email = "Email inválido";
    }

    return { valido: Object.keys(novosErros).length === 0, erros: novosErros, alertas: [] };
  }, [dados]);

  // Validar Etapa 2
  const validarEtapa2 = useCallback((): ResultadoValidacao => {
    const novosErros: ErrosCampo = {};

    if (!dados.setor) novosErros.setor = "Selecione o setor";
    if (!dados.estado) novosErros.estado = "Selecione o estado";

    return { valido: Object.keys(novosErros).length === 0, erros: novosErros, alertas: [] };
  }, [dados]);

  // Validar Etapa 4
  const validarEtapa4 = useCallback((): ResultadoValidacao => {
    const novosErros: ErrosCampo = {};
    const novosAlertas: string[] = [];

    if (dados.receita_atual <= 0) novosErros.receita_atual = "Receita é obrigatória";
    if (dados.num_funcionarios < 1) novosErros.num_funcionarios = "Mínimo 1 funcionário";

    if (dados.tem_estoque && (!dados.estoque || dados.estoque <= 0)) {
      novosErros.estoque = "Informe o valor do estoque";
    }
    if (dados.tem_dividas && (!dados.dividas_totais || dados.dividas_totais <= 0)) {
      novosErros.dividas_totais = "Informe o valor das dívidas";
    }
    if (dados.tem_bens && (!dados.bens_equipamentos || dados.bens_equipamentos <= 0)) {
      novosErros.bens_equipamentos = "Informe o valor dos bens";
    }

    // Alertas (não bloqueiam)
    if (dados.custo_vendas > dados.receita_atual) {
      novosAlertas.push("Custo maior que receita. Verifique os valores.");
    }
    if (dados.despesas_fixas > dados.receita_atual) {
      novosAlertas.push("Despesas maiores que receita. Isso indica prejuízo.");
    }

    return { valido: Object.keys(novosErros).length === 0, erros: novosErros, alertas: novosAlertas };
  }, [dados]);

  // Avançar etapa
  const avancar = useCallback(() => {
    let validacao: ResultadoValidacao = { valido: true, erros: {}, alertas: [] };

    if (etapaAtual === 1) validacao = validarEtapa1();
    else if (etapaAtual === 2) validacao = validarEtapa2();
    else if (etapaAtual === 4) validacao = validarEtapa4();

    setErros(validacao.erros);
    setAlertas(validacao.alertas);

    if (validacao.valido && etapaAtual < 4) {
      setEtapaAtual((prev) => (prev + 1) as EtapaFluxo);
      return true;
    }

    return validacao.valido;
  }, [etapaAtual, validarEtapa1, validarEtapa2, validarEtapa4]);

  // Voltar etapa
  const voltar = useCallback(() => {
    if (etapaAtual > 1) {
      setEtapaAtual((prev) => (prev - 1) as EtapaFluxo);
      setErros({});
      setAlertas([]);
    }
  }, [etapaAtual]);

  // Toggle card
  const toggleCard = useCallback((cardId: string) => {
    setCardsExpandidos((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  }, []);

  const isCardExpandido = useCallback(
    (cardId: string) => cardsExpandidos.includes(cardId),
    [cardsExpandidos]
  );

  // Progresso
  const progresso = Math.round((etapaAtual / 4) * 100);

  return {
    dados,
    etapaAtual,
    carregando,
    erros,
    alertas,
    progresso,
    atualizarDados,
    atualizarReceitaHistorico,
    setCarregando,
    avancar,
    voltar,
    toggleCard,
    isCardExpandido,
  };
}