"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { DadosAnalise, ErrosCampo, ReceitaHistorico, MESES } from "@/types/analise";
import { criarAnalise, concluirSessao } from "@/lib/api";
import { PassoEtapa4, PASSOS_ETAPA4_INFO } from "@/hooks/useAnalise";

interface Etapa4Props {
  dados: DadosAnalise;
  erros: ErrosCampo;
  alertas: string[];
  carregando: boolean;
  passoEtapa4: PassoEtapa4;
  sessaoId: string | null;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
  atualizarReceitaHistorico: (campo: keyof ReceitaHistorico, valor: number) => void;
  setCarregando: (v: boolean) => void;
  avancarPassoEtapa4: () => boolean;
  voltarPassoEtapa4: () => boolean;
  voltar: () => void;
  limparSessao: () => void;
}

export default function Etapa4SaudeFinanceira({
  dados,
  erros,
  alertas,
  carregando,
  passoEtapa4,
  sessaoId,
  atualizarDados,
  atualizarReceitaHistorico,
  setCarregando,
  avancarPassoEtapa4,
  voltarPassoEtapa4,
  voltar,
  limparSessao,
}: Etapa4Props) {
  const router = useRouter();
  const [animando, setAnimando] = useState(false);
  const [direcao, setDirecao] = useState<"frente" | "tras">("frente");

  const getMesLabel = (mesesAtras: number) => {
    let mes = dados.mes_referencia - mesesAtras;
    let ano = dados.ano_referencia;
    while (mes <= 0) {
      mes += 12;
      ano -= 1;
    }
    return MESES.find((m) => m.value === mes)?.label || "";
  };

  const mesReferenciaLabel = MESES.find((m) => m.value === dados.mes_referencia)?.label || "";
  const passoInfo = PASSOS_ETAPA4_INFO[passoEtapa4];

  // ========== MINI-INSIGHTS entre passos ==========
  const getInsight = (): { texto: string; tipo: 'positivo' | 'atencao' | 'neutro' | 'educativo' } | null => {
    // Após Receita (passo 1) → antes de Custos (passo 2)
    if (passoEtapa4 === 2 && dados.receita_atual > 0) {
      return {
        texto: `Receita de R$ ${dados.receita_atual.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} registrada. Agora vamos entender quanto disso realmente fica com você.`,
        tipo: 'neutro',
      };
    }

    // Após Custos (passo 2) → antes de Caixa (passo 3)
    if (passoEtapa4 === 3 && dados.receita_atual > 0 && dados.custo_vendas >= 0) {
      const margem = dados.receita_atual > 0 
        ? ((dados.receita_atual - dados.custo_vendas - dados.despesas_fixas) / dados.receita_atual * 100)
        : 0;
      const sobra = dados.receita_atual - dados.custo_vendas - dados.despesas_fixas;
      
      if (sobra > 0) {
        return {
          texto: `Boa: de cada R$ 100 que entra, sobram R$ ${Math.round(margem)}. Agora vamos ver se o caixa acompanha esse resultado.`,
          tipo: 'positivo',
        };
      } else {
        return {
          texto: `Atenção: suas despesas estão maiores que o faturamento em R$ ${Math.abs(Math.round(sobra)).toLocaleString('pt-BR')}. Vamos entender a situação do seu caixa.`,
          tipo: 'atencao',
        };
      }
    }

    // Após Caixa (passo 3) → antes de Estoque (passo 4)
    if (passoEtapa4 === 4 && dados.caixa_bancos > 0) {
      const despesaDiaria = dados.despesas_fixas > 0 ? dados.despesas_fixas / 30 : 0;
      const diasFolego = despesaDiaria > 0 ? Math.round(dados.caixa_bancos / despesaDiaria) : 0;
      
      if (diasFolego > 60) {
        return {
          texto: `Seu caixa cobre cerca de ${diasFolego} dias de despesas. É uma reserva confortável.`,
          tipo: 'positivo',
        };
      } else if (diasFolego > 0) {
        return {
          texto: `Seu caixa cobre cerca de ${diasFolego} dias de despesas. Vamos ver o cenário completo.`,
          tipo: diasFolego < 30 ? 'atencao' : 'neutro',
        };
      }
    }

    // Após Estoque (passo 4) → antes de Dívidas (passo 5)
    if (passoEtapa4 === 5) {
      return {
        texto: 'Dica: separar o dinheiro da empresa do pessoal é o primeiro passo pra saber de verdade quanto seu negócio ganha.',
        tipo: 'educativo',
      };
    }

    // Após Dívidas (passo 5) → antes de Bens (passo 6)
    if (passoEtapa4 === 6) {
      if (dados.tem_dividas && dados.dividas_totais && dados.dividas_totais > 0) {
        return {
          texto: 'Ter dívida pode ser estratégico — o importante é saber se ela cabe no seu faturamento. Já estamos calculando isso.',
          tipo: 'educativo',
        };
      }
      return {
        texto: 'Estamos montando o retrato completo do seu negócio. Falta pouco.',
        tipo: 'neutro',
      };
    }

    // Após Bens (passo 6) → antes de Equipe (passo 7)
    if (passoEtapa4 === 7) {
      return {
        texto: 'Última pergunta! Com essa informação vamos calcular a produtividade da sua equipe.',
        tipo: 'neutro',
      };
    }

    return null;
  };

  const insight = getInsight();

  const handleAvancar = () => {
    if (passoEtapa4 === 7) {
      handleSubmit();
      return;
    }

    const sucesso = avancarPassoEtapa4();
    if (sucesso) {
      setDirecao("frente");
      setAnimando(true);
      setTimeout(() => setAnimando(false), 300);
    }
  };

  const handleVoltar = () => {
    const voltouPasso = voltarPassoEtapa4();
    if (voltouPasso) {
      setDirecao("tras");
      setAnimando(true);
      setTimeout(() => setAnimando(false), 300);
    } else {
      voltar();
    }
  };

  const handleSubmit = async () => {
    setCarregando(true);
    try {
      const resultado = await criarAnalise(dados);
      
      if (sessaoId) {
        await concluirSessao(sessaoId, resultado.id);
        limparSessao();
      }
      
      router.push(`/dashboard/${resultado.id}`);
    } catch (error) {
      console.error("Erro ao criar análise:", error);
      alert("Erro ao processar análise. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // Form submit = avançar (faz o "Ir" do Samsung funcionar)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAvancar();
  };

  const animacaoClass = animando
    ? direcao === "frente"
      ? "animate-slide-in-right"
      : "animate-slide-in-left"
    : "animate-fade-in";

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Cabeçalho do passo */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          {passoInfo.titulo}
        </h1>
      </div>

      {/* Mini-insight entre passos */}
      {insight && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 animate-fade-in ${
          insight.tipo === 'positivo' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : insight.tipo === 'atencao'
            ? 'bg-amber-50 border border-amber-200 text-amber-800'
            : insight.tipo === 'educativo'
            ? 'bg-blue-50 border border-blue-200 text-blue-800'
            : 'bg-gray-50 border border-gray-200 text-gray-700'
        }`}>
          <span className="flex-shrink-0 mt-0.5">
            {insight.tipo === 'positivo' && '✓'}
            {insight.tipo === 'atencao' && '⚠'}
            {insight.tipo === 'educativo' && '💡'}
            {insight.tipo === 'neutro' && '→'}
          </span>
          <p>{insight.texto}</p>
        </div>
      )}

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-4 space-y-2">
          {alertas.map((alerta, i) => (
            <div key={i} className="alert alert-warning">{alerta}</div>
          ))}
        </div>
      )}

      {/* Form wrapper — faz o "Ir"/"Go" do teclado mobile submeter */}
      <form onSubmit={handleFormSubmit}>
        {/* Conteúdo do passo atual */}
        <div className={`bg-white rounded-xl shadow-sm border border-border p-4 sm:p-6 mb-4 ${animacaoClass}`}>
          {passoEtapa4 === 1 && (
            <PassoReceita
              dados={dados}
              erros={erros}
              mesReferenciaLabel={mesReferenciaLabel}
              getMesLabel={getMesLabel}
              atualizarDados={atualizarDados}
              atualizarReceitaHistorico={atualizarReceitaHistorico}
            />
          )}

          {passoEtapa4 === 2 && (
            <PassoCustos
              dados={dados}
              atualizarDados={atualizarDados}
            />
          )}

          {passoEtapa4 === 3 && (
            <PassoCaixa
              dados={dados}
              atualizarDados={atualizarDados}
            />
          )}

          {passoEtapa4 === 4 && (
            <PassoEstoque
              dados={dados}
              erros={erros}
              atualizarDados={atualizarDados}
            />
          )}

          {passoEtapa4 === 5 && (
            <PassoDividas
              dados={dados}
              erros={erros}
              atualizarDados={atualizarDados}
            />
          )}

          {passoEtapa4 === 6 && (
            <PassoBens
              dados={dados}
              erros={erros}
              atualizarDados={atualizarDados}
            />
          )}

          {passoEtapa4 === 7 && (
            <PassoEquipe
              dados={dados}
              erros={erros}
              atualizarDados={atualizarDados}
            />
          )}
        </div>

        {/* Botão submit invisível — necessário para o "Ir" do teclado funcionar */}
        <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
      </form>

      {/* Indicador de passos */}
      <div className="flex justify-center gap-1.5 mb-4">
        {[1, 2, 3, 4, 5, 6, 7].map((passo) => (
          <div
            key={passo}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              passo === passoEtapa4
                ? "bg-primary w-6"
                : passo < passoEtapa4
                ? "bg-primary w-1.5"
                : "bg-gray-200 w-1.5"
            }`}
          />
        ))}
      </div>

      {/* Botões sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 sm:relative sm:border-0 sm:p-0 sm:bg-transparent z-40">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            type="button"
            onClick={handleVoltar}
            className="btn-secondary flex-1 py-3 sm:py-2.5"
            disabled={carregando}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleAvancar}
            className="btn-primary flex-1 py-3 sm:py-2.5"
            disabled={carregando}
          >
            {carregando
              ? "Analisando seus números..."
              : passoEtapa4 === 7
              ? "Ver meu diagnóstico"
              : "Próximo"
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== COMPONENTES DOS PASSOS ==========

interface PassoReceitaProps {
  dados: DadosAnalise;
  erros: ErrosCampo;
  mesReferenciaLabel: string;
  getMesLabel: (mesesAtras: number) => string;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
  atualizarReceitaHistorico: (campo: keyof ReceitaHistorico, valor: number) => void;
}

function PassoReceita({ dados, erros, mesReferenciaLabel, getMesLabel, atualizarDados, atualizarReceitaHistorico }: PassoReceitaProps) {
  const [mostrarExtras, setMostrarExtras] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Quanto entrou de dinheiro?
        </h2>
        <p className="hidden sm:block text-sm text-foreground-muted">
          Tudo que sua empresa faturou em {mesReferenciaLabel}.
        </p>
      </div>

      <InputMonetario
        label={`Receita total em ${mesReferenciaLabel} *`}
        valor={dados.receita_atual}
        onChange={(v) => atualizarDados("receita_atual", v)}
        erro={erros.receita_atual}
        dica="Tudo que entrou de venda de produto ou serviço. Valor aproximado já vale."
        autoFocus
        enterKeyHint="done"
      />

      <button
        type="button"
        onClick={() => setMostrarExtras(!mostrarExtras)}
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        {mostrarExtras ? "▼" : "▶"} Informar receita dos meses anteriores (opcional)
      </button>

      {mostrarExtras && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/20 animate-fade-in">
          <p className="text-xs text-foreground-muted">
            Isso ajuda a calcular tendências. Deixe em branco se não souber.
          </p>
          <InputMonetario
            label={`Receita em ${getMesLabel(1)}`}
            valor={dados.receita_historico?.mes_passado || 0}
            onChange={(v) => atualizarReceitaHistorico("mes_passado", v)}
            enterKeyHint="next"
          />
          <InputMonetario
            label={`Receita em ${getMesLabel(2)}`}
            valor={dados.receita_historico?.dois_meses_atras || 0}
            onChange={(v) => atualizarReceitaHistorico("dois_meses_atras", v)}
            enterKeyHint="next"
          />
          <InputMonetario
            label={`Receita em ${getMesLabel(3)}`}
            valor={dados.receita_historico?.tres_meses_atras || 0}
            onChange={(v) => atualizarReceitaHistorico("tres_meses_atras", v)}
            enterKeyHint="done"
          />
        </div>
      )}
    </div>
  );
}

interface PassoCustosProps {
  dados: DadosAnalise;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoCustos({ dados, atualizarDados }: PassoCustosProps) {
  const segundoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Pra onde vai o seu dinheiro?
        </h2>
        <p className="hidden sm:block text-sm text-foreground-muted">
          Aqui a gente descobre quanto realmente sobra pra você.
        </p>
      </div>

      <InputMonetario
        label="Custo direto das vendas (CMV) *"
        valor={dados.custo_vendas}
        onChange={(v) => atualizarDados("custo_vendas", v)}
        dica="Quanto você paga pelo que vende: mercadoria, matéria-prima, insumos diretos."
        autoFocus
        enterKeyHint="next"
        onEnter={() => segundoInputRef.current?.focus()}
      />

      <InputMonetario
        label="Despesas fixas mensais *"
        valor={dados.despesas_fixas}
        onChange={(v) => atualizarDados("despesas_fixas", v)}
        dica="Aluguel, salários, contador, internet, energia... O que vem todo mês."
        enterKeyHint="done"
        inputRef={segundoInputRef}
      />
    </div>
  );
}

interface PassoCaixaProps {
  dados: DadosAnalise;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoCaixa({ dados, atualizarDados }: PassoCaixaProps) {
  const segundoRef = useRef<HTMLInputElement>(null);
  const terceiroRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Quanto você tem pra respirar?
        </h2>
        <p className="hidden sm:block text-sm text-foreground-muted">
          Vamos entender se o caixa da empresa está tranquilo ou apertado.
        </p>
      </div>

      <InputMonetario
        label="Quanto tem em caixa hoje? *"
        valor={dados.caixa_bancos}
        onChange={(v) => atualizarDados("caixa_bancos", v)}
        dica="Conta corrente + aplicações de curto prazo + dinheiro em espécie."
        autoFocus
        enterKeyHint="next"
        onEnter={() => segundoRef.current?.focus()}
      />

      <InputMonetario
        label="Quanto você tem pra receber nos próximos 30 dias? *"
        valor={dados.contas_receber}
        onChange={(v) => atualizarDados("contas_receber", v)}
        dica="Clientes que ainda vão te pagar."
        enterKeyHint="next"
        inputRef={segundoRef}
        onEnter={() => terceiroRef.current?.focus()}
      />

      <InputMonetario
        label="E pra pagar, quanto tem comprometido pros próximos 30 dias? *"
        valor={dados.contas_pagar}
        onChange={(v) => atualizarDados("contas_pagar", v)}
        dica="Fornecedores, aluguel, folha, parcelas, impostos..."
        enterKeyHint="done"
        inputRef={terceiroRef}
      />
    </div>
  );
}

interface PassoEstoqueProps {
  dados: DadosAnalise;
  erros: ErrosCampo;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoEstoque({ dados, erros, atualizarDados }: PassoEstoqueProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Tem dinheiro parado em estoque?
        </h2>
        <p className="hidden sm:block text-sm text-foreground-muted">
          Estoque é dinheiro — só que em forma de produto. Nem todo negócio tem, e tudo bem.
        </p>
      </div>

      <PerguntaSimNao
        pergunta="Sua empresa trabalha com estoque de produtos?"
        valor={dados.tem_estoque}
        onChange={(v) => atualizarDados("tem_estoque", v)}
      />

      {dados.tem_estoque && (
        <div className="animate-fade-in">
          <InputMonetario
            label="Quanto vale esse estoque hoje, mais ou menos? *"
            valor={dados.estoque || 0}
            onChange={(v) => atualizarDados("estoque", v)}
            erro={erros.estoque}
            dica="Pense no que você pagou, não no preço de venda."
            enterKeyHint="done"
          />
        </div>
      )}
    </div>
  );
}

interface PassoDividasProps {
  dados: DadosAnalise;
  erros: ErrosCampo;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoDividas({ dados, erros, atualizarDados }: PassoDividasProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          E as dívidas?
        </h2>
        <p className="hidden sm:block text-sm text-foreground-muted">
          Ter dívida não é pecado — o que importa é se ela cabe no seu faturamento.
        </p>
      </div>

      <PerguntaSimNao
        pergunta="A empresa tem algum empréstimo ou financiamento ativo?"
        valor={dados.tem_dividas}
        onChange={(v) => atualizarDados("tem_dividas", v)}
      />

      {dados.tem_dividas && (
        <div className="animate-fade-in">
          <InputMonetario
            label="Somando tudo, quanto ainda falta pagar? *"
            valor={dados.dividas_totais || 0}
            onChange={(v) => atualizarDados("dividas_totais", v)}
            erro={erros.dividas_totais}
            dica="Empréstimos, financiamentos, cartão parcelado da empresa..."
            enterKeyHint="done"
          />
        </div>
      )}
    </div>
  );
}

interface PassoBensProps {
  dados: DadosAnalise;
  erros: ErrosCampo;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoBens({ dados, erros, atualizarDados }: PassoBensProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          O que sua empresa tem de valor?
        </h2>
        <p className="hidden sm:block text-sm text-foreground-muted">
          Máquinas, equipamentos, veículos — tudo que poderia ser vendido se precisasse.
        </p>
      </div>

      <PerguntaSimNao
        pergunta="A empresa tem máquinas, equipamentos ou veículos próprios?"
        valor={dados.tem_bens}
        onChange={(v) => atualizarDados("tem_bens", v)}
      />

      {dados.tem_bens && (
        <div className="animate-fade-in">
          <InputMonetario
            label="Se fosse vender hoje, quanto acha que valeria tudo junto? *"
            valor={dados.bens_equipamentos || 0}
            onChange={(v) => atualizarDados("bens_equipamentos", v)}
            erro={erros.bens_equipamentos}
            dica="Máquinas, móveis, computadores, veículos..."
            enterKeyHint="done"
          />
        </div>
      )}
    </div>
  );
}

interface PassoEquipeProps {
  dados: DadosAnalise;
  erros: ErrosCampo;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoEquipe({ dados, erros, atualizarDados }: PassoEquipeProps) {
  const [inputValue, setInputValue] = useState(dados.num_funcionarios.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const parsed = parseInt(value);
    if (!isNaN(parsed) && parsed >= 1) {
      atualizarDados("num_funcionarios", parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue);
    if (isNaN(parsed) || parsed < 1) {
      setInputValue("1");
      atualizarDados("num_funcionarios", 1);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Quase lá: sua equipe
        </h2>
        <p className="hidden sm:block text-sm text-foreground-muted">
          Última pergunta! Vamos calcular quanto sua empresa gera por pessoa.
        </p>
      </div>

      <div>
        <label className="label">
          Quantas pessoas trabalham na empresa, contando você? *
        </label>
        <input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          min="1"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={(e) => e.target.select()}
          className={`input w-32 py-3 sm:py-2 focus:ring-2 focus:ring-primary/20 transition-all ${erros.num_funcionarios ? "input-error" : ""}`}
          autoFocus
        />
        {erros.num_funcionarios && (
          <p className="text-danger text-sm mt-1">{erros.num_funcionarios}</p>
        )}
        <p className="help-text">
          Todo mundo: CLT, PJ, sócios que põem a mão na massa, freelancer fixo...
        </p>
      </div>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

interface InputMonetarioProps {
  label: string;
  valor: number;
  onChange: (valor: number) => void;
  erro?: string;
  dica?: string;
  autoFocus?: boolean;
  enterKeyHint?: "next" | "done" | "go";
  onEnter?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

function InputMonetario({ label, valor, onChange, erro, dica, autoFocus, enterKeyHint = "done", onEnter, inputRef }: InputMonetarioProps) {
  const [displayValue, setDisplayValue] = useState(
    valor > 0 ? valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""
  );
  const [focado, setFocado] = useState(false);
  const localRef = useRef<HTMLInputElement>(null);
  const activeRef = inputRef || localRef;

  useEffect(() => {
    setDisplayValue(
      valor > 0 ? valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""
    );
  }, [valor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numero = parseInt(raw) / 100 || 0;
    setDisplayValue(numero > 0 ? numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
    onChange(numero);
  };

  // Enter: pula para próximo input ou submete o form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onEnter) {
        onEnter();
      } else {
        // Se não tem onEnter, faz blur (fecha teclado) e deixa o form submit cuidar
        (e.target as HTMLInputElement).blur();
      }
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-foreground-muted pointer-events-none select-none">
          R$
        </span>
        <input
          ref={activeRef as React.LegacyRef<HTMLInputElement>}
          type="text"
          inputMode="numeric"
          enterKeyHint={enterKeyHint}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocado(true)}
          onBlur={() => setFocado(false)}
          placeholder="0,00"
          autoFocus={autoFocus}
          style={{ paddingLeft: "3.5rem" }}
          className={`input py-3 sm:py-2 focus:ring-2 focus:ring-primary/20 transition-all ${erro ? "input-error" : ""}`}
          data-hj-suppress
        />
      </div>
      {erro && <p className="text-danger text-sm mt-1">{erro}</p>}
      {dica && (
        <p className={`help-text transition-all duration-200 ${
          focado ? "opacity-100 max-h-10" : "sm:opacity-100 sm:max-h-10 opacity-0 max-h-0 overflow-hidden"
        }`}>
          {dica}
        </p>
      )}
    </div>
  );
}

interface PerguntaSimNaoProps {
  pergunta: string;
  valor: boolean;
  onChange: (valor: boolean) => void;
}

function PerguntaSimNao({ pergunta, valor, onChange }: PerguntaSimNaoProps) {
  return (
    <div>
      <p className="label mb-3">{pergunta}</p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-6 py-3 sm:py-2 rounded-lg border-2 transition-all min-w-[70px] ${
            !valor ? "border-primary bg-primary text-white" : "border-border hover:border-primary"
          }`}
        >
          Não
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-6 py-3 sm:py-2 rounded-lg border-2 transition-all min-w-[70px] ${
            valor ? "border-primary bg-primary text-white" : "border-border hover:border-primary"
          }`}
        >
          Sim
        </button>
      </div>
    </div>
  );
}