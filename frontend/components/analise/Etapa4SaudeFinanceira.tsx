"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DadosAnalise, ErrosCampo, ReceitaHistorico, MESES } from "@/types/analise";
import { ChevronDown, ChevronUp } from "lucide-react";
import { criarAnalise } from "@/lib/api";

interface Etapa4Props {
  dados: DadosAnalise;
  erros: ErrosCampo;
  alertas: string[];
  carregando: boolean;
  atualizarDados: <K extends keyof DadosAnalise>(campo: K, valor: DadosAnalise[K]) => void;
  atualizarReceitaHistorico: (campo: keyof ReceitaHistorico, valor: number) => void;
  setCarregando: (v: boolean) => void;
  avancar: () => boolean;
  voltar: () => void;
  toggleCard: (cardId: string) => void;
  isCardExpandido: (cardId: string) => boolean;
}

export default function Etapa4SaudeFinanceira({
  dados,
  erros,
  alertas,
  carregando,
  atualizarDados,
  atualizarReceitaHistorico,
  setCarregando,
  avancar,
  voltar,
  toggleCard,
  isCardExpandido,
}: Etapa4Props) {
  const router = useRouter();

  // Retorna o nome do mês/ano baseado em quantos meses atrás
  const getMesAno = (mesesAtras: number) => {
    let mes = dados.mes_referencia - mesesAtras;
    let ano = dados.ano_referencia;
    while (mes <= 0) {
      mes += 12;
      ano -= 1;
    }
    return `${MESES.find((m) => m.value === mes)?.label || ""}/${ano}`;
  };

  // Mês de referência atual
  const mesReferenciaLabel = `${MESES.find((m) => m.value === dados.mes_referencia)?.label || ""}/${dados.ano_referencia}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (avancar()) {
      setCarregando(true);
      try {
        // Envia para a API e recebe o resultado com o ID
        const resultado = await criarAnalise(dados);
        
        // Salva o ID e email no sessionStorage para o dashboard acessar
        sessionStorage.setItem("leme_analise_id", resultado.id);
        sessionStorage.setItem("leme_analise_email", dados.email);
        
        // Redireciona para URL limpa
        router.push("/dashboard");
      } catch (error) {
        console.error("Erro ao criar análise:", error);
        alert("Erro ao processar análise. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Cabeçalho */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Saúde Financeira
        </h1>
        <p className="text-foreground-muted">
          Preencha com os valores do mês de referência ({mesReferenciaLabel})
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

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          
          {/* Card Receita */}
          <CardExpansivel
            id="receita"
            titulo="Receita e Histórico"
            expandido={isCardExpandido("receita")}
            onToggle={() => toggleCard("receita")}
          >
            <p className="text-sm text-foreground-muted mb-4">
              Para entender a tendência do seu negócio, precisamos da receita dos últimos 3 meses:
            </p>
            <div className="space-y-4">
              <InputMonetario
                label={`Receita de ${getMesAno(3)}`}
                valor={dados.receita_historico.tres_meses_atras}
                onChange={(v) => atualizarReceitaHistorico("tres_meses_atras", v)}
              />
              <InputMonetario
                label={`Receita de ${getMesAno(2)}`}
                valor={dados.receita_historico.dois_meses_atras}
                onChange={(v) => atualizarReceitaHistorico("dois_meses_atras", v)}
              />
              <InputMonetario
                label={`Receita de ${getMesAno(1)}`}
                valor={dados.receita_historico.mes_passado}
                onChange={(v) => atualizarReceitaHistorico("mes_passado", v)}
              />
              <InputMonetario
                label={`Receita de ${mesReferenciaLabel} *`}
                valor={dados.receita_atual}
                onChange={(v) => atualizarDados("receita_atual", v)}
                erro={erros.receita_atual}
                dica="Todo o faturamento do mês (vendas + serviços)"
                tooltip="Último mês com receita completa"
              />
            </div>
          </CardExpansivel>

          {/* Card Custos */}
          <CardExpansivel
            id="custos"
            titulo="Custos e Despesas"
            expandido={isCardExpandido("custos")}
            onToggle={() => toggleCard("custos")}
          >
            <div className="space-y-4">
              <InputMonetario
                label="Custo das Vendas/Serviços *"
                valor={dados.custo_vendas}
                onChange={(v) => atualizarDados("custo_vendas", v)}
                dica="Quanto gastou para entregar o que vendeu (matéria-prima, mercadoria, mão de obra direta)"
              />
              <InputMonetario
                label="Despesas Fixas mensais *"
                valor={dados.despesas_fixas}
                onChange={(v) => atualizarDados("despesas_fixas", v)}
                dica="Aluguel, salários, contas de luz/água/internet, contador, sistemas"
              />
            </div>
          </CardExpansivel>

          {/* Card Caixa */}
          <CardExpansivel
            id="caixa"
            titulo="Caixa e Fluxo"
            expandido={isCardExpandido("caixa")}
            onToggle={() => toggleCard("caixa")}
          >
            <div className="space-y-4">
              <InputMonetario
                label="Caixa + Bancos *"
                valor={dados.caixa_bancos}
                onChange={(v) => atualizarDados("caixa_bancos", v)}
                dica="Dinheiro disponível agora (caixa + conta corrente + poupança)"
              />
              <InputMonetario
                label="Contas a Receber (próximos 30 dias) *"
                valor={dados.contas_receber}
                onChange={(v) => atualizarDados("contas_receber", v)}
                dica="Valores que clientes vão te pagar"
              />
              <InputMonetario
                label="Contas a Pagar (próximos 30 dias) *"
                valor={dados.contas_pagar}
                onChange={(v) => atualizarDados("contas_pagar", v)}
                dica="Fornecedores, aluguel, salários, parcelas, impostos"
              />
            </div>
          </CardExpansivel>

          {/* Card Estoque */}
          <CardExpansivel
            id="estoque"
            titulo="Estoque"
            expandido={isCardExpandido("estoque")}
            onToggle={() => toggleCard("estoque")}
          >
            <div className="space-y-4">
              <PerguntaSimNao
                pergunta="Você tem ESTOQUE de produtos?"
                valor={dados.tem_estoque}
                onChange={(v) => atualizarDados("tem_estoque", v)}
              />
              {dados.tem_estoque && (
                <InputMonetario
                  label="Valor total do estoque *"
                  valor={dados.estoque || 0}
                  onChange={(v) => atualizarDados("estoque", v)}
                  erro={erros.estoque}
                  dica="Valor de custo de todas as mercadorias/produtos que você tem para vender"
                />
              )}
            </div>
          </CardExpansivel>

          {/* Card Dívidas */}
          <CardExpansivel
            id="dividas"
            titulo="Dívidas"
            expandido={isCardExpandido("dividas")}
            onToggle={() => toggleCard("dividas")}
          >
            <div className="space-y-4">
              <PerguntaSimNao
                pergunta="Você tem DÍVIDAS ou financiamentos?"
                valor={dados.tem_dividas}
                onChange={(v) => atualizarDados("tem_dividas", v)}
              />
              {dados.tem_dividas && (
                <InputMonetario
                  label="Valor total das dívidas *"
                  valor={dados.dividas_totais || 0}
                  onChange={(v) => atualizarDados("dividas_totais", v)}
                  erro={erros.dividas_totais}
                  dica="Some todos os empréstimos, financiamentos e dívidas (saldo devedor total)"
                />
              )}
            </div>
          </CardExpansivel>

          {/* Card Bens */}
          <CardExpansivel
            id="bens"
            titulo="Bens e Equipamentos"
            expandido={isCardExpandido("bens")}
            onToggle={() => toggleCard("bens")}
          >
            <div className="space-y-4">
              <PerguntaSimNao
                pergunta="Você tem BENS ou EQUIPAMENTOS da empresa?"
                valor={dados.tem_bens}
                onChange={(v) => atualizarDados("tem_bens", v)}
              />
              {dados.tem_bens && (
                <InputMonetario
                  label="Valor total dos bens *"
                  valor={dados.bens_equipamentos || 0}
                  onChange={(v) => atualizarDados("bens_equipamentos", v)}
                  erro={erros.bens_equipamentos}
                  dica="Máquinas, móveis, computadores, veículos (valor atual de mercado)"
                />
              )}
            </div>
          </CardExpansivel>

          {/* Card Equipe */}
          <CardExpansivel
            id="equipe"
            titulo="Equipe"
            expandido={isCardExpandido("equipe")}
            onToggle={() => toggleCard("equipe")}
          >
            <div>
              <label className="label">
                Quantos FUNCIONÁRIOS trabalham na empresa? *
                <span className="text-foreground-muted font-normal"> (incluindo você)</span>
              </label>
              <input
                type="number"
                min="1"
                value={dados.num_funcionarios}
                onChange={(e) => atualizarDados("num_funcionarios", parseInt(e.target.value) || 1)}
                className={`input w-32 ${erros.num_funcionarios ? "input-error" : ""}`}
              />
              {erros.num_funcionarios && (
                <p className="text-danger text-sm mt-1">{erros.num_funcionarios}</p>
              )}
              <p className="help-text">
                Conte todos: CLT, PJ, sócios que trabalham, freelancers fixos
              </p>
            </div>
          </CardExpansivel>
        </div>

        {/* Botões */}
        <div className="flex gap-4 mt-8">
          <button type="button" onClick={voltar} className="btn-secondary flex-1" disabled={carregando}>
            Voltar
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={carregando}>
            {carregando ? "Processando..." : "Gerar Análise Completa"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

interface CardExpansivelProps {
  id: string;
  titulo: string;
  expandido: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CardExpansivel({ id, titulo, expandido, onToggle, children }: CardExpansivelProps) {
  return (
    <div className="card-expandable">
      <button type="button" onClick={onToggle} className="card-expandable-header w-full">
        <span className="font-semibold">{titulo}</span>
        {expandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {expandido && <div className="card-expandable-content">{children}</div>}
    </div>
  );
}

interface InputMonetarioProps {
  label: string;
  valor: number;
  onChange: (valor: number) => void;
  erro?: string;
  dica?: string;
  tooltip?: string;
}

function InputMonetario({ label, valor, onChange, erro, dica, tooltip }: InputMonetarioProps) {
  const [displayValue, setDisplayValue] = useState(
    valor > 0 ? valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""
  );
  const [showTooltip, setShowTooltip] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    const numero = parseInt(raw) / 100 || 0;
    setDisplayValue(numero > 0 ? numero.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
    onChange(numero);
  };

  return (
    <div>
      <label className="label inline-flex items-center gap-1">
        <span>{label}</span>
        {tooltip && (
          <span 
            className="relative cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-gray-400 text-xs">
              i
            </span>
            {showTooltip && (
              <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-foreground text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                {tooltip}
              </span>
            )}
          </span>
        )}
      </label>
      <div className="relative flex items-center">
        <span className="absolute left-4 text-foreground-muted pointer-events-none select-none">
          R$
        </span>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="0,00"
          style={{ paddingLeft: "3.5rem" }}
          className={`input ${erro ? "input-error" : ""}`}
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