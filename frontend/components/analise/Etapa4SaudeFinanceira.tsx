"use client";

import { useState, useEffect } from "react";
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
  sessaoId: string | null; // Adicionado
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
  atualizarReceitaHistorico: (campo: keyof ReceitaHistorico, valor: number) => void;
  setCarregando: (v: boolean) => void;
  avancarPassoEtapa4: () => boolean;
  voltarPassoEtapa4: () => boolean;
  voltar: () => void;
  limparSessao: () => void; // Adicionado
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

  // Retorna o nome do mês baseado em quantos meses atrás
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

  // Animação de transição entre passos
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
      // Se não conseguiu voltar passo (está no passo 1), volta etapa
      voltar();
    }
  };

  const handleSubmit = async () => {
    setCarregando(true);
    try {
      const resultado = await criarAnalise(dados);
      
      // Conclui a sessão no backend (não bloqueia se falhar)
      if (sessaoId) {
        await concluirSessao(sessaoId, resultado.id);
        limparSessao(); // Limpa do localStorage
      }
      
      router.push(`/dashboard/${resultado.id}`);
    } catch (error) {
      console.error("Erro ao criar análise:", error);
      alert("Erro ao processar análise. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  // Classe de animação
  const animacaoClass = animando
    ? direcao === "frente"
      ? "animate-slide-in-right"
      : "animate-slide-in-left"
    : "animate-fade-in";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cabeçalho do passo atual */}
      <div className="text-center mb-6">
        <p className="text-sm text-primary font-medium mb-1">
          {passoInfo.titulo}
        </p>
        <h1 className="text-2xl font-bold text-foreground">
          Saúde Financeira
        </h1>
      </div>

      {/* Badge de valores aproximados */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-center">
        <p className="text-sm text-blue-800 font-medium">
          Use valores aproximados - não precisa ser exato.
        </p>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-6 space-y-2">
          {alertas.map((alerta, i) => (
            <div key={i} className="alert alert-warning">{alerta}</div>
          ))}
        </div>
      )}

      {/* Conteúdo do passo atual */}
      <div className={`bg-white rounded-xl shadow-sm border border-border p-6 mb-6 ${animacaoClass}`}>
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

      {/* Indicador de passos */}
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6, 7].map((passo) => (
          <div
            key={passo}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              passo === passoEtapa4
                ? "bg-primary w-6"
                : passo < passoEtapa4
                ? "bg-primary"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Botões de navegação */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleVoltar}
          className="btn-secondary flex-1"
          disabled={carregando}
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleAvancar}
          className="btn-primary flex-1"
          disabled={carregando}
        >
          {carregando
            ? "Processando..."
            : passoEtapa4 === 7
            ? "Gerar Análise Completa"
            : "Próximo"
          }
        </button>
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Vamos falar de receita
        </h2>
        <p className="text-sm text-foreground-muted">
          Quanto sua empresa faturou recentemente?
        </p>
      </div>

      {/* Pergunta obrigatória */}
      <InputMonetario
        label={`Quanto sua empresa faturou em ${mesReferenciaLabel}? *`}
        valor={dados.receita_atual}
        onChange={(v) => atualizarDados("receita_atual", v)}
        erro={erros.receita_atual}
        autoFocus
      />

      {/* Perguntas extras opcionais */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setMostrarExtras(!mostrarExtras)}
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          {mostrarExtras ? "▼" : "▶"} Quer informar os meses anteriores? (opcional)
        </button>

        {mostrarExtras && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-primary/20 animate-fade-in">
            <p className="text-sm text-foreground-muted">
              Isso nos ajuda a calcular a tendência de crescimento.
            </p>
            <InputMonetario
              label={`${getMesLabel(1)} (mês passado)`}
              valor={dados.receita_historico.mes_passado}
              onChange={(v) => atualizarReceitaHistorico("mes_passado", v)}
            />
            <InputMonetario
              label={`${getMesLabel(2)} (2 meses atrás)`}
              valor={dados.receita_historico.dois_meses_atras}
              onChange={(v) => atualizarReceitaHistorico("dois_meses_atras", v)}
            />
            <InputMonetario
              label={`${getMesLabel(3)} (3 meses atrás)`}
              valor={dados.receita_historico.tres_meses_atras}
              onChange={(v) => atualizarReceitaHistorico("tres_meses_atras", v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface PassoCustosProps {
  dados: DadosAnalise;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoCustos({ dados, atualizarDados }: PassoCustosProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Custos e despesas
        </h2>
        <p className="text-sm text-foreground-muted">
          O que sai do caixa pra manter a empresa rodando.
        </p>
      </div>

      <InputMonetario
        label="Quanto custa o que você vende? (CMV) *"
        valor={dados.custo_vendas}
        onChange={(v) => atualizarDados("custo_vendas", v)}
        dica="Mercadoria, matéria-prima, insumos, embalagens..."
        autoFocus
      />

      <InputMonetario
        label="E as despesas fixas mensais, quanto dá? *"
        valor={dados.despesas_fixas}
        onChange={(v) => atualizarDados("despesas_fixas", v)}
        dica="Aluguel, salários, conta de luz, internet, contador..."
      />
    </div>
  );
}

interface PassoCaixaProps {
  dados: DadosAnalise;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
}

function PassoCaixa({ dados, atualizarDados }: PassoCaixaProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Caixa e fluxo
        </h2>
        <p className="text-sm text-foreground-muted">
          Como está a liquidez da empresa hoje.
        </p>
      </div>

      <InputMonetario
        label="Quanto tem em caixa e banco hoje? *"
        valor={dados.caixa_bancos}
        onChange={(v) => atualizarDados("caixa_bancos", v)}
        dica="Conta corrente, poupança, dinheiro em espécie..."
        autoFocus
      />

      <InputMonetario
        label="Quanto você tem pra receber nos próximos 30 dias? *"
        valor={dados.contas_receber}
        onChange={(v) => atualizarDados("contas_receber", v)}
        dica="Clientes que ainda vão te pagar."
      />

      <InputMonetario
        label="E pra pagar, quanto tem comprometido pros próximos 30 dias? *"
        valor={dados.contas_pagar}
        onChange={(v) => atualizarDados("contas_pagar", v)}
        dica="Fornecedores, aluguel, folha, parcelas, impostos..."
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Sobre estoque
        </h2>
        <p className="text-sm text-foreground-muted">
          Nem todo negócio trabalha com estoque, e tudo bem.
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Sobre dívidas
        </h2>
        <p className="text-sm text-foreground-muted">
          Ter dívida não é necessariamente ruim - o importante é saber gerenciar.
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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Bens e equipamentos
        </h2>
        <p className="text-sm text-foreground-muted">
          Coisas que a empresa possui e que têm valor.
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Por último, sua equipe
        </h2>
        <p className="text-sm text-foreground-muted">
          Quase lá! Só mais uma informação.
        </p>
      </div>

      <div>
        <label className="label">
          Quantas pessoas trabalham na empresa, contando você? *
        </label>
        <input
          type="number"
          min="1"
          value={dados.num_funcionarios}
          onChange={(e) => atualizarDados("num_funcionarios", parseInt(e.target.value) || 1)}
          className={`input w-32 focus:ring-2 focus:ring-primary/20 transition-all ${erros.num_funcionarios ? "input-error" : ""}`}
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
}

function InputMonetario({ label, valor, onChange, erro, dica, autoFocus }: InputMonetarioProps) {
  const [displayValue, setDisplayValue] = useState(
    valor > 0 ? valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""
  );

  // Atualiza o display quando o valor externo muda
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

  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-foreground-muted pointer-events-none select-none">
          R$
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0,00"
          autoFocus={autoFocus}
          style={{ paddingLeft: "3.5rem" }}
          className={`input focus:ring-2 focus:ring-primary/20 transition-all ${erro ? "input-error" : ""}`}
          data-hj-suppress
        />
      </div>
      {erro && <p className="text-danger text-sm mt-1">{erro}</p>}
      {dica && <p className="help-text">{dica}</p>}
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
          className={`px-6 py-2 rounded-lg border-2 transition-all ${
            !valor ? "border-primary bg-primary text-white" : "border-border hover:border-primary"
          }`}
        >
          Não
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-6 py-2 rounded-lg border-2 transition-all ${
            valor ? "border-primary bg-primary text-white" : "border-border hover:border-primary"
          }`}
        >
          Sim
        </button>
      </div>
    </div>
  );
}