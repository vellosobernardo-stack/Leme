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
import { iniciarSessao } from "@/lib/api";

// Passos da Etapa 4 (blocos de perguntas)
export type PassoEtapa4 = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const PASSOS_ETAPA4_INFO = {
  1: { id: "receita", titulo: "Receita" },
  2: { id: "custos", titulo: "Custos e Despesas" },
  3: { id: "caixa", titulo: "Caixa e Fluxo" },
  4: { id: "estoque", titulo: "Estoque" },
  5: { id: "dividas", titulo: "Dívidas" },
  6: { id: "bens", titulo: "Bens e Equipamentos" },
  7: { id: "equipe", titulo: "Equipe" },
} as const;

// Chave para persistir sessão no localStorage
const SESSAO_STORAGE_KEY = "leme_sessao_id";

/**
 * Hook para gerenciar o estado do fluxo de análise
 */
export function useAnalise() {
  const [dados, setDados] = useState<DadosAnalise>(DADOS_INICIAIS);
  const [etapaAtual, setEtapaAtual] = useState<EtapaFluxo>(1);
  const [passoEtapa4, setPassoEtapa4] = useState<PassoEtapa4>(1);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<ErrosCampo>({});
  const [alertas, setAlertas] = useState<string[]>([]);
  const [cardsExpandidos, setCardsExpandidos] = useState<string[]>(["receita"]);
  
  // ID da sessão para rastreamento de abandono
  const [sessaoId, setSessaoId] = useState<string | null>(() => {
    // Recupera sessão existente do localStorage (se houver)
    if (typeof window !== "undefined") {
      return localStorage.getItem(SESSAO_STORAGE_KEY);
    }
    return null;
  });

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

  // Validar passo específico da Etapa 4
  const validarPassoEtapa4 = useCallback((passo: PassoEtapa4): ResultadoValidacao => {
    const novosErros: ErrosCampo = {};
    const novosAlertas: string[] = [];

    switch (passo) {
      case 1: // Receita
        if (dados.receita_atual <= 0) {
          novosErros.receita_atual = "Informe a receita do mês";
        }
        break;

      case 2: // Custos e Despesas
        // Campos obrigatórios mas podem ser zero
        if (dados.custo_vendas > dados.receita_atual && dados.receita_atual > 0) {
          novosAlertas.push("Custo maior que receita. Verifique os valores.");
        }
        if (dados.despesas_fixas > dados.receita_atual && dados.receita_atual > 0) {
          novosAlertas.push("Despesas maiores que receita. Isso indica prejuízo.");
        }
        break;

      case 3: // Caixa e Fluxo
        // Todos opcionais, sem validação bloqueante
        break;

      case 4: // Estoque
        if (dados.tem_estoque && (!dados.estoque || dados.estoque <= 0)) {
          novosErros.estoque = "Informe o valor do estoque";
        }
        break;

      case 5: // Dívidas
        if (dados.tem_dividas && (!dados.dividas_totais || dados.dividas_totais <= 0)) {
          novosErros.dividas_totais = "Informe o valor das dívidas";
        }
        break;

      case 6: // Bens
        if (dados.tem_bens && (!dados.bens_equipamentos || dados.bens_equipamentos <= 0)) {
          novosErros.bens_equipamentos = "Informe o valor dos bens";
        }
        break;

      case 7: // Equipe
        if (dados.num_funcionarios < 1) {
          novosErros.num_funcionarios = "Mínimo 1 pessoa";
        }
        break;
    }

    return { valido: Object.keys(novosErros).length === 0, erros: novosErros, alertas: novosAlertas };
  }, [dados]);

  // Validar Etapa 4 completa (para submit final)
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

    if (dados.custo_vendas > dados.receita_atual) {
      novosAlertas.push("Custo maior que receita. Verifique os valores.");
    }
    if (dados.despesas_fixas > dados.receita_atual) {
      novosAlertas.push("Despesas maiores que receita. Isso indica prejuízo.");
    }

    return { valido: Object.keys(novosErros).length === 0, erros: novosErros, alertas: novosAlertas };
  }, [dados]);

  // Avançar para próximo passo dentro da Etapa 4
  const avancarPassoEtapa4 = useCallback(() => {
    const validacao = validarPassoEtapa4(passoEtapa4);
    setErros(validacao.erros);
    setAlertas(validacao.alertas);

    if (validacao.valido && passoEtapa4 < 7) {
      setPassoEtapa4((prev) => (prev + 1) as PassoEtapa4);
      return true;
    }

    return validacao.valido;
  }, [passoEtapa4, validarPassoEtapa4]);

  // Voltar para passo anterior dentro da Etapa 4
  const voltarPassoEtapa4 = useCallback(() => {
    if (passoEtapa4 > 1) {
      setPassoEtapa4((prev) => (prev - 1) as PassoEtapa4);
      setErros({});
      setAlertas([]);
      return true;
    }
    return false;
  }, [passoEtapa4]);

  // Criar sessão no backend (chamado ao sair da Etapa 1)
  const criarSessao = useCallback(async (): Promise<boolean> => {
    try {
      const resultado = await iniciarSessao(dados.nome_empresa, dados.email);
      const novoSessaoId = resultado.sessao_id;
      
      // Salva no state e localStorage
      setSessaoId(novoSessaoId);
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSAO_STORAGE_KEY, novoSessaoId);
      }
      
      return true;
    } catch (error) {
      // Não bloqueia o fluxo se falhar - apenas loga
      console.error("Erro ao criar sessão:", error);
      return true; // Continua mesmo se falhar
    }
  }, [dados.nome_empresa, dados.email]);

  // Limpar sessão do localStorage (chamado após conclusão)
  const limparSessao = useCallback(() => {
    setSessaoId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSAO_STORAGE_KEY);
    }
  }, []);

  // Avançar etapa principal
  // Etapa 3 removida — de Etapa 2 vai direto para Etapa 4
  const avancar = useCallback(async () => {
    let validacao: ResultadoValidacao = { valido: true, erros: {}, alertas: [] };

    if (etapaAtual === 1) validacao = validarEtapa1();
    else if (etapaAtual === 2) validacao = validarEtapa2();
    else if (etapaAtual === 4) validacao = validarEtapa4();

    setErros(validacao.erros);
    setAlertas(validacao.alertas);

    if (validacao.valido && etapaAtual < 4) {
      // Se saindo da Etapa 1, cria sessão no backend
      if (etapaAtual === 1) {
        await criarSessao();
      }
      
      // Se saindo da Etapa 2, pula para Etapa 4 (método manual é default)
      if (etapaAtual === 2) {
        setDados((prev) => ({ ...prev, metodo_entrada: "manual" }));
        setEtapaAtual(4 as EtapaFluxo);
      } else {
        setEtapaAtual((prev) => (prev + 1) as EtapaFluxo);
      }
      return true;
    }

    return validacao.valido;
  }, [etapaAtual, validarEtapa1, validarEtapa2, validarEtapa4, criarSessao]);

  // Voltar etapa principal
  // Etapa 3 removida — de Etapa 4 volta direto para Etapa 2
  const voltar = useCallback(() => {
    if (etapaAtual === 4) {
      setEtapaAtual(2 as EtapaFluxo);
    } else if (etapaAtual > 1) {
      setEtapaAtual((prev) => (prev - 1) as EtapaFluxo);
    }
    setErros({});
    setAlertas([]);
  }, [etapaAtual]);

  // Toggle card (mantido para compatibilidade)
  const toggleCard = useCallback((cardId: string) => {
    setCardsExpandidos((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  }, []);

  const isCardExpandido = useCallback(
    (cardId: string) => cardsExpandidos.includes(cardId),
    [cardsExpandidos]
  );

  // Cálculo de progresso com valores limpos
  // Etapa 3 removida — fluxo vai de Etapa 2 direto para Etapa 4
  const calcularProgresso = useCallback(() => {
    const progressoMap: Record<number, number> = {
      1: 0,   // Etapa 1: Identificação (barra escondida)
      2: 10,  // Etapa 2: Sobre sua empresa (Perfil)
    };

    if (etapaAtual < 4) {
      return progressoMap[etapaAtual] ?? 0;
    }

    // Etapa 4 (Saúde Financeira): 7 passos de 30% a 100%
    const progressoEtapa4: Record<number, number> = {
      1: 30,  // Receita
      2: 40,  // Custos
      3: 50,  // Caixa
      4: 60,  // Estoque
      5: 70,  // Dívidas
      6: 80,  // Bens
      7: 90,  // Equipe (botão "Gerar" leva a 100%)
    };

    return progressoEtapa4[passoEtapa4];
  }, [etapaAtual, passoEtapa4]);

  const progresso = calcularProgresso();

  return {
    // Estado
    dados,
    etapaAtual,
    passoEtapa4,
    carregando,
    erros,
    alertas,
    progresso,
    sessaoId, // Expõe para uso no submit final
    
    // Funções de dados
    atualizarDados,
    atualizarReceitaHistorico,
    setCarregando,
    
    // Navegação principal
    avancar,
    voltar,
    
    // Navegação Etapa 4
    avancarPassoEtapa4,
    voltarPassoEtapa4,
    
    // Sessão
    limparSessao,
    
    // Cards (compatibilidade)
    toggleCard,
    isCardExpandido,
  };
}