"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DadosPreAbertura,
  DADOS_INICIAIS,
  PassoPreAbertura,
  ErrosCampo,
  ResultadoValidacao,
  PreAberturaResponse,
} from "@/types/pre_abertura";

/**
 * Hook para gerenciar o estado do fluxo de análise pré-abertura
 */
export function usePreAbertura() {
  const [dados, setDados] = useState<DadosPreAbertura>(DADOS_INICIAIS);
  const [passoAtual, setPassoAtual] = useState<PassoPreAbertura>(1);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<ErrosCampo>({});
  const [resultado, setResultado] = useState<PreAberturaResponse | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  // ========== ATUALIZAR DADOS ==========

  const atualizarDados = useCallback(
    <K extends keyof DadosPreAbertura>(campo: K, valor: DadosPreAbertura[K]) => {
      setDados((prev) => ({ ...prev, [campo]: valor }));
      if (erros[campo]) {
        setErros((prev) => ({ ...prev, [campo]: undefined }));
      }
    },
    [erros]
  );

  // ========== LÓGICA DE PASSOS CONDICIONAIS ==========

  // Verifica se o passo de estoque deve ser pulado
  const devePularEstoque = useMemo(() => {
    return dados.tipo_negocio === "servico";
  }, [dados.tipo_negocio]);

  // Verifica se o passo de quantidade de funcionários deve ser pulado
  const devePularFaixaFuncionarios = useMemo(() => {
    return dados.tem_funcionarios === false;
  }, [dados.tem_funcionarios]);

  // Calcula o próximo passo considerando condicionais
  const getProximoPasso = useCallback((passoAtual: PassoPreAbertura): PassoPreAbertura | null => {
    let proximo = passoAtual + 1;

    // Se está no passo 1 (tipo_negocio) e é serviço, pula o passo 2 (estoque)
    if (passoAtual === 1 && devePularEstoque) {
      proximo = 3;
    }

    // Se passou do último passo
    if (proximo > 10) {
      return null;
    }

    return proximo as PassoPreAbertura;
  }, [devePularEstoque]);

  // Calcula o passo anterior considerando condicionais
  const getPassoAnterior = useCallback((passoAtual: PassoPreAbertura): PassoPreAbertura | null => {
    let anterior = passoAtual - 1;

    // Se está no passo 3 e tipo é serviço, volta para 1 (pula estoque)
    if (passoAtual === 3 && devePularEstoque) {
      anterior = 1;
    }

    if (anterior < 1) {
      return null;
    }

    return anterior as PassoPreAbertura;
  }, [devePularEstoque]);

  // ========== VALIDAÇÕES ==========

  const validarPasso = useCallback((passo: PassoPreAbertura): ResultadoValidacao => {
    const novosErros: ErrosCampo = {};

    switch (passo) {
      case 1: // Tipo de negócio
        if (!dados.tipo_negocio) {
          novosErros.tipo_negocio = "Selecione o tipo de negócio";
        }
        break;

      case 2: // Estoque (só valida se for produto)
        if (dados.tipo_negocio === "produto" && dados.tem_estoque === null) {
          novosErros.tem_estoque = "Informe se terá estoque";
        }
        break;

      case 3: // Setor
        if (!dados.setor) {
          novosErros.setor = "Selecione o setor";
        }
        break;

      case 4: // Localização
        if (!dados.estado) {
          novosErros.estado = "Selecione o estado";
        }
        break;

      case 5: // Abertura
        // Mês e ano já vêm preenchidos, não precisa validar
        break;

      case 6: // Capital
        if (!dados.capital_disponivel || dados.capital_disponivel <= 0) {
          novosErros.capital_disponivel = "Informe o capital disponível";
        }
        break;

      case 7: // Pró-labore
        if (!dados.prolabore) {
          novosErros.prolabore = "Selecione uma opção";
        }
        break;

      case 8: // Funcionários
        if (dados.tem_funcionarios === null) {
          novosErros.tem_funcionarios = "Informe se terá funcionários";
        }
        if (dados.tem_funcionarios === true && !dados.faixa_funcionarios) {
          novosErros.faixa_funcionarios = "Selecione a faixa de funcionários";
        }
        break;

      case 9: // Faturamento
        if (!dados.faturamento_esperado || dados.faturamento_esperado <= 0) {
          novosErros.faturamento_esperado = "Informe o faturamento esperado";
        }
        break;

      case 10: // Clientes
        if (!dados.clientes_garantidos) {
          novosErros.clientes_garantidos = "Selecione uma opção";
        }
        break;
    }

    return {
      valido: Object.keys(novosErros).length === 0,
      erros: novosErros,
    };
  }, [dados]);

  // ========== NAVEGAÇÃO ==========

  const avancar = useCallback(() => {
    const validacao = validarPasso(passoAtual);
    setErros(validacao.erros);

    if (!validacao.valido) {
      return false;
    }

    const proximo = getProximoPasso(passoAtual);
    if (proximo) {
      setPassoAtual(proximo);
      return true;
    }

    // Se não tem próximo, é o fim do fluxo
    return true;
  }, [passoAtual, validarPasso, getProximoPasso]);

  const voltar = useCallback(() => {
    const anterior = getPassoAnterior(passoAtual);
    if (anterior) {
      setPassoAtual(anterior);
      setErros({});
      return true;
    }
    return false;
  }, [passoAtual, getPassoAnterior]);

  const irParaPasso = useCallback((passo: PassoPreAbertura) => {
    setPassoAtual(passo);
    setErros({});
  }, []);

  // ========== ENVIO ==========

  const enviarAnalise = useCallback(async (): Promise<boolean> => {
    // Validar passo atual primeiro
    const validacao = validarPasso(passoAtual);
    setErros(validacao.erros);

    if (!validacao.valido) {
      return false;
    }

    setCarregando(true);
    setErroEnvio(null);

    try {
      // Preparar dados para API
      const payload = {
        tipo_negocio: dados.tipo_negocio,
        tem_estoque: dados.tipo_negocio === "produto" ? dados.tem_estoque : null,
        setor: dados.setor,
        estado: dados.estado,
        cidade: dados.cidade || null,
        mes_abertura: dados.mes_abertura,
        ano_abertura: dados.ano_abertura,
        capital_disponivel: dados.capital_disponivel,
        prolabore: dados.prolabore,
        tem_funcionarios: dados.tem_funcionarios,
        faixa_funcionarios: dados.tem_funcionarios ? dados.faixa_funcionarios : null,
        faturamento_esperado: dados.faturamento_esperado,
        clientes_garantidos: dados.clientes_garantidos,
        email: dados.email || null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pre-abertura/nova`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Erro ao processar análise");
      }

      const data: PreAberturaResponse = await response.json();
      setResultado(data);
      return true;
    } catch (error) {
      console.error("Erro ao enviar análise:", error);
      setErroEnvio(
        error instanceof Error
          ? error.message
          : "Erro ao processar análise. Tente novamente."
      );
      return false;
    } finally {
      setCarregando(false);
    }
  }, [dados, passoAtual, validarPasso]);

  // ========== PROGRESSO ==========

  const calcularProgresso = useCallback(() => {
    // Total de passos possíveis (considerando condicionais)
    let totalPassos = 10;
    let passoEfetivo = passoAtual;

    // Se serviço, não conta o passo de estoque
    if (devePularEstoque) {
      totalPassos = 9;
      // Ajusta o passo efetivo
      if (passoAtual > 2) {
        passoEfetivo = passoAtual - 1;
      }
    }

    return Math.round((passoEfetivo / totalPassos) * 100);
  }, [passoAtual, devePularEstoque]);

  const progresso = calcularProgresso();

  // Verifica se é o último passo
  const isUltimoPasso = useMemo(() => {
    return passoAtual === 10;
  }, [passoAtual]);

  // ========== RESET ==========

  const resetar = useCallback(() => {
    setDados(DADOS_INICIAIS);
    setPassoAtual(1);
    setErros({});
    setResultado(null);
    setErroEnvio(null);
  }, []);

  return {
    // Estado
    dados,
    passoAtual,
    carregando,
    erros,
    progresso,
    resultado,
    erroEnvio,

    // Flags
    isUltimoPasso,
    devePularEstoque,
    devePularFaixaFuncionarios,

    // Funções de dados
    atualizarDados,
    setCarregando,

    // Navegação
    avancar,
    voltar,
    irParaPasso,

    // Envio
    enviarAnalise,

    // Reset
    resetar,
  };
}

export type UsePreAberturaReturn = ReturnType<typeof usePreAbertura>;
