'use client';

// components/pro/SimuladorCenarios.tsx
// Simulador de Cenários Pro — 3 cenários de estresse com controles ajustáveis.
// 100% frontend: useState + useMemo, sem chamada ao backend ou à IA.
// Visual e linguagem seguem o padrão do SimuladorSobrevivencia existente.

import { useState, useMemo, useEffect, useRef } from 'react';
import { TrendingDown, PackageOpen, Percent, Info } from 'lucide-react';

interface SimuladorCenariosProps {
  caixa_disponivel: number;
  receita_mensal: number;
  custo_vendas: number;
  despesas_fixas: number;
  score_atual: number;
}

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────

function fmt(v: number): string {
  return `R$ ${Math.abs(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ─── BARRA DE FÔLEGO (idêntica ao SimuladorSobrevivencia) ─────────────────────

function Barra({ dias, delay }: { dias: number; delay: number }) {
  const [w, setW] = useState(0);
  const pct = Math.min(100, (dias / 180) * 100);
  const cor =
    dias >= 90 ? 'bg-emerald-500' : dias >= 60 ? 'bg-amber-500' : 'bg-red-500';

  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="relative w-full mt-2">
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${cor}`}
          style={{ width: `${w}%` }}
        />
      </div>
      <div
        className="absolute top-0 h-2 border-r-2 border-dashed border-gray-300"
        style={{ left: `${(90 / 180) * 100}%` }}
      />
      <div className="flex justify-between mt-1 text-xs text-muted-foreground/50">
        <span>0</span>
        <span>90 dias</span>
        <span>180+</span>
      </div>
    </div>
  );
}

// ─── SCORE ESTIMADO ────────────────────────────────────────────────────────────

function ScoreEstimado({
  score,
  tooltip,
}: {
  score: number;
  tooltip: string;
}) {
  const [aberto, setAberto] = useState(false);
  const cor =
    score >= 70 ? '#15803d' : score >= 40 ? '#b45309' : '#b91c1c';
  const bg =
    score >= 70
      ? 'rgba(21,128,61,0.08)'
      : score >= 40
      ? 'rgba(180,83,9,0.08)'
      : 'rgba(185,28,28,0.08)';

  return (
    <div className="cenarios-score-estimado-wrap">
      <div className="cenarios-score-estimado" style={{ background: bg, color: cor }}>
        <span className="cenarios-score-estimado-label">Score estimado</span>
        <span className="cenarios-score-estimado-valor">{score}</span>
        <button
          className="cenarios-score-tooltip-btn"
          onClick={() => setAberto((v) => !v)}
          title="Sobre o score estimado"
          style={{ color: cor }}
        >
          <Info size={13} />
        </button>
      </div>
      {aberto && (
        <div className="cenarios-score-tooltip-box">
          {tooltip}
        </div>
      )}
    </div>
  );
}

// ─── CÁLCULO DE RESULTADO POR CENÁRIO ─────────────────────────────────────────

interface ResultadoCenario {
  saldo: number;
  folego_dias: number;
  score_estimado: number;
  frase: string;
}

function calcularResultado(
  caixa: number,
  nova_receita: number,
  novo_custo_vendas: number,
  novas_despesas_fixas: number,
  score_atual: number,
): ResultadoCenario {
  const novos_custos = novo_custo_vendas + novas_despesas_fixas;
  const saldo = nova_receita - novos_custos;

  let folego_dias = 999;
  if (saldo < 0 && novos_custos > 0) {
    folego_dias =
      caixa > 0 ? Math.max(0, Math.round(caixa / (Math.abs(saldo) / 30))) : 0;
  }

  // Score estimado (simplificado)
  let score_estimado = score_atual;
  if (saldo < 0) score_estimado -= 15;
  if (folego_dias < 30) score_estimado -= 10;
  else if (folego_dias < 60) score_estimado -= 5;
  score_estimado = clamp(Math.round(score_estimado), 0, 100);

  // Frase interpretativa em linguagem leiga
  let frase = '';
  if (saldo >= 0) {
    frase = `Sua empresa continuaria gerando uma sobra de ${fmt(saldo)} por mês.`;
  } else if (folego_dias === 0) {
    frase = `Seu caixa não cobriria o déficit de ${fmt(saldo)} por mês. Ação imediata necessária.`;
  } else if (folego_dias < 60) {
    frase = `Seu caixa cobriria o déficit por apenas ${folego_dias} dias. Situação de risco.`;
  } else if (folego_dias < 90) {
    frase = `Seu caixa sustentaria a operação por ${folego_dias} dias com esse déficit.`;
  } else {
    frase = `Apesar do déficit, seu caixa garantiria ${folego_dias} dias de operação.`;
  }

  return { saldo, folego_dias, score_estimado, frase };
}

// ─── TOOLTIP SCORE ─────────────────────────────────────────────────────────────

const TOOLTIP_SCORE =
  'Simulação baseada nos seus dados. O score oficial é calculado com todos os indicadores da análise.';

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

type AbaAtiva = 'queda' | 'custos' | 'juros';

export default function SimuladorCenarios({
  caixa_disponivel,
  receita_mensal,
  custo_vendas,
  despesas_fixas,
  score_atual,
}: SimuladorCenariosProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('queda');

  // Cenário 1 — Queda de vendas
  const [quedaPct, setQuedaPct] = useState(20);

  // Cenário 2 — Aumento de custos
  const [custoPct, setCustoPct] = useState(15);

  // Cenário 3 — Variação de juros
  const [valorDivida, setValorDivida] = useState('');
  const [taxaAtual, setTaxaAtual] = useState('');
  const [taxaNova, setTaxaNova] = useState('');

  // Animação de entrada
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.1 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // ── Resultados calculados ──
  const resultadoQueda = useMemo(() => {
    const nova_receita = receita_mensal * (1 - quedaPct / 100);
    return calcularResultado(
      caixa_disponivel, nova_receita, custo_vendas, despesas_fixas, score_atual,
    );
  }, [quedaPct, caixa_disponivel, receita_mensal, custo_vendas, despesas_fixas, score_atual]);

  const resultadoCustos = useMemo(() => {
    const fator = 1 + custoPct / 100;
    return calcularResultado(
      caixa_disponivel, receita_mensal, custo_vendas * fator, despesas_fixas * fator, score_atual,
    );
  }, [custoPct, caixa_disponivel, receita_mensal, custo_vendas, despesas_fixas, score_atual]);

  const resultadoJuros = useMemo(() => {
    const divida = parseFloat(valorDivida.replace(',', '.')) || 0;
    const ta = parseFloat(taxaAtual.replace(',', '.')) || 0;
    const tn = parseFloat(taxaNova.replace(',', '.')) || 0;
    const delta_parcela = divida * (tn - ta) / 100;
    return calcularResultado(
      caixa_disponivel, receita_mensal, custo_vendas, despesas_fixas + delta_parcela, score_atual,
    );
  }, [valorDivida, taxaAtual, taxaNova, caixa_disponivel, receita_mensal, custo_vendas, despesas_fixas, score_atual]);

  const ABAS: { id: AbaAtiva; label: string; icone: React.ReactNode }[] = [
    { id: 'queda',  label: 'Queda de vendas',    icone: <TrendingDown size={15} /> },
    { id: 'custos', label: 'Aumento de custos',  icone: <PackageOpen  size={15} /> },
    { id: 'juros',  label: 'Variação de juros',  icone: <Percent      size={15} /> },
  ];

  return (
    <>
      <Styles />
      <div
        ref={ref}
        className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="bg-white rounded-xl shadow-sm border border-border/40 overflow-hidden hover:shadow-md transition duration-300">
          <div className="p-5 sm:p-6">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-primary">
                  Simulador de Cenários
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  O que acontece se algo mudar na sua empresa?
                </p>
              </div>
            </div>

            {/* Abas */}
            <div className="cenarios-abas">
              {ABAS.map((aba) => (
                <button
                  key={aba.id}
                  className={`cenarios-aba-btn ${abaAtiva === aba.id ? 'ativa' : ''}`}
                  onClick={() => setAbaAtiva(aba.id)}
                >
                  {aba.icone}
                  <span>{aba.label}</span>
                </button>
              ))}
            </div>

            {/* ── CENÁRIO 1: Queda de vendas ── */}
            {abaAtiva === 'queda' && (
              <CenarioLayout
                resultado={resultadoQueda}
                caixa={caixa_disponivel}
                controle={
                  <div className="cenarios-controle">
                    <div className="cenarios-controle-header">
                      <label className="cenarios-controle-label">Queda nas vendas</label>
                      <span className="cenarios-controle-valor">{quedaPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      step={5}
                      value={quedaPct}
                      onChange={(e) => setQuedaPct(Number(e.target.value))}
                      className="cenarios-slider"
                    />
                    <div className="cenarios-slider-labels">
                      <span>10%</span><span>60%</span>
                    </div>
                    <p className="cenarios-controle-contexto">
                      Receita passaria de {fmt(receita_mensal)} para{' '}
                      <strong>{fmt(receita_mensal * (1 - quedaPct / 100))}</strong>
                    </p>
                  </div>
                }
              />
            )}

            {/* ── CENÁRIO 2: Aumento de custos ── */}
            {abaAtiva === 'custos' && (
              <CenarioLayout
                resultado={resultadoCustos}
                caixa={caixa_disponivel}
                controle={
                  <div className="cenarios-controle">
                    <div className="cenarios-controle-header">
                      <label className="cenarios-controle-label">Aumento nos custos</label>
                      <span className="cenarios-controle-valor">{custoPct}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={5}
                      value={custoPct}
                      onChange={(e) => setCustoPct(Number(e.target.value))}
                      className="cenarios-slider"
                    />
                    <div className="cenarios-slider-labels">
                      <span>5%</span><span>40%</span>
                    </div>
                    <p className="cenarios-controle-contexto">
                      Custos totais passariam de{' '}
                      {fmt(custo_vendas + despesas_fixas)} para{' '}
                      <strong>{fmt((custo_vendas + despesas_fixas) * (1 + custoPct / 100))}</strong>
                    </p>
                  </div>
                }
              />
            )}

            {/* ── CENÁRIO 3: Variação de juros ── */}
            {abaAtiva === 'juros' && (
              <CenarioLayout
                resultado={resultadoJuros}
                caixa={caixa_disponivel}
                controle={
                  <div className="cenarios-controle cenarios-juros-campos">
                    <CampoJuros
                      label="Valor total da dívida"
                      prefix="R$"
                      value={valorDivida}
                      onChange={setValorDivida}
                      placeholder="Ex: 50000"
                    />
                    <CampoJuros
                      label="Taxa atual ao mês (%)"
                      prefix="%"
                      value={taxaAtual}
                      onChange={setTaxaAtual}
                      placeholder="Ex: 2,5"
                    />
                    <CampoJuros
                      label="Nova taxa ao mês (%)"
                      prefix="%"
                      value={taxaNova}
                      onChange={setTaxaNova}
                      placeholder="Ex: 4,0"
                    />
                  </div>
                }
              />
            )}

          </div>
        </div>
      </div>
    </>
  );
}

// ─── LAYOUT PADRÃO DE CENÁRIO ──────────────────────────────────────────────────

function CenarioLayout({
  controle,
  resultado,
  caixa,
}: {
  controle: React.ReactNode;
  resultado: ResultadoCenario;
  caixa: number;
}) {
  const { saldo, folego_dias, score_estimado, frase } = resultado;
  const temSaldo = saldo >= 0;
  const semCaixa = !temSaldo && folego_dias === 0;
  const risco = !temSaldo && folego_dias < 60;

  // Cores do card de resultado (mesmo padrão do SimuladorSobrevivencia)
  let bgCard = 'bg-gray-50 border-border/60';
  if (temSaldo) bgCard = 'bg-emerald-50 border-emerald-200';
  else if (semCaixa || risco) bgCard = 'bg-red-50 border-red-200';
  else bgCard = 'bg-amber-50 border-amber-200';

  let corValor = 'text-emerald-700';
  if (!temSaldo) corValor = folego_dias < 60 ? 'text-red-700' : 'text-amber-700';

  let corDias = 'text-emerald-600';
  if (!temSaldo) corDias = folego_dias < 60 ? 'text-red-600' : 'text-amber-600';

  return (
    <div className="cenarios-cenario-wrap">
      {/* Controle */}
      {controle}

      {/* Resultado */}
      <div className={`border rounded-xl p-4 ${bgCard}`}>
        {/* Saldo mensal */}
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-1">
          {temSaldo ? (
            <>
              Sobra mensal:{' '}
              <span className={`font-bold ${corValor}`}>{fmt(saldo)}</span>
            </>
          ) : (
            <>
              Déficit mensal:{' '}
              <span className={`font-bold ${corValor}`}>{fmt(saldo)}</span>
            </>
          )}
        </p>

        {/* Fôlego de caixa — só quando tem déficit */}
        {!temSaldo && caixa > 0 && folego_dias !== 999 && (
          <div className="mt-2">
            <p className="text-sm text-muted-foreground">
              Seu caixa cobriria essa diferença por mais
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-3xl sm:text-4xl font-extrabold ${corDias}`}>
                {folego_dias === 0 ? '0' : folego_dias}
              </span>
              <span className="text-sm text-muted-foreground">dias.</span>
            </div>
            <Barra dias={folego_dias} delay={200} />
          </div>
        )}
        {!temSaldo && caixa <= 0 && (
          <p className="text-sm font-medium text-red-700 mt-1">
            Sem reserva para cobrir essa diferença.
          </p>
        )}

        {/* Frase interpretativa */}
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{frase}</p>
      </div>

      {/* Score estimado */}
      <ScoreEstimado score={score_estimado} tooltip={TOOLTIP_SCORE} />
    </div>
  );
}

// ─── CAMPO DE JUROS ────────────────────────────────────────────────────────────

function CampoJuros({
  label,
  prefix,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  prefix: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="cenarios-juros-campo">
      <label className="cenarios-juros-campo-label">{label}</label>
      <div className="cenarios-juros-campo-wrap">
        <span className="cenarios-juros-campo-prefix">{prefix}</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          className="cenarios-juros-campo-input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── ESTILOS ───────────────────────────────────────────────────────────────────

function Styles() {
  return (
    <style>{`
      /* ── ABAS ── */
      .cenarios-abas {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }
      .cenarios-aba-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 10px;
        border: 1.5px solid #e5e7eb;
        background: #fff;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        font-family: 'DM Sans', sans-serif;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .cenarios-aba-btn:hover:not(.ativa) {
        border-color: #9ca3af;
        color: #374151;
      }
      .cenarios-aba-btn.ativa {
        border-color: #003054;
        background: rgba(0, 48, 84, 0.05);
        color: #003054;
      }

      /* ── CENÁRIO WRAP ── */
      .cenarios-cenario-wrap {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      /* ── CONTROLE (slider) ── */
      .cenarios-controle {
        background: rgba(0, 48, 84, 0.03);
        border: 1px solid rgba(0, 48, 84, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cenarios-controle-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cenarios-controle-label {
        font-size: 13px;
        font-weight: 600;
        color: #003054;
        font-family: 'DM Sans', sans-serif;
      }
      .cenarios-controle-valor {
        font-size: 20px;
        font-weight: 700;
        color: #003054;
        font-family: 'DM Sans', sans-serif;
        min-width: 48px;
        text-align: right;
      }
      .cenarios-slider {
        width: 100%;
        accent-color: #003054;
        cursor: pointer;
        height: 4px;
      }
      .cenarios-slider-labels {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #9ca3af;
        margin-top: -4px;
      }
      .cenarios-controle-contexto {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.5;
        font-family: 'DM Sans', sans-serif;
      }

      /* ── CAMPOS DE JUROS ── */
      .cenarios-juros-campos {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cenarios-juros-campo {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .cenarios-juros-campo-label {
        font-size: 12px;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-family: 'DM Sans', sans-serif;
      }
      .cenarios-juros-campo-wrap {
        display: flex;
        align-items: center;
        border: 1.5px solid #d1d5db;
        border-radius: 10px;
        overflow: hidden;
        background: #fff;
        transition: border-color 0.15s;
      }
      .cenarios-juros-campo-wrap:focus-within {
        border-color: #003054;
      }
      .cenarios-juros-campo-prefix {
        padding: 9px 12px;
        font-size: 13px;
        color: #9ca3af;
        background: #f9f8f7;
        border-right: 1px solid #e5e7eb;
        flex-shrink: 0;
        font-family: 'DM Sans', sans-serif;
      }
      .cenarios-juros-campo-input {
        flex: 1;
        padding: 9px 14px;
        font-size: 14px;
        color: #003054;
        font-family: 'DM Sans', sans-serif;
        font-weight: 500;
        border: none;
        outline: none;
        background: transparent;
        min-width: 0;
      }
      .cenarios-juros-campo-input::placeholder { color: #d1d5db; }

      /* ── SCORE ESTIMADO ── */
      .cenarios-score-estimado-wrap {
        position: relative;
      }
      .cenarios-score-estimado {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 12px;
        border-radius: 100px;
        font-family: 'DM Sans', sans-serif;
      }
      .cenarios-score-estimado-label {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        opacity: 0.8;
      }
      .cenarios-score-estimado-valor {
        font-size: 16px;
        font-weight: 700;
      }
      .cenarios-score-tooltip-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        opacity: 0.7;
        transition: opacity 0.15s;
      }
      .cenarios-score-tooltip-btn:hover { opacity: 1; }
      .cenarios-score-tooltip-box {
        position: absolute;
        bottom: calc(100% + 8px);
        left: 0;
        background: #1f2937;
        color: #f9fafb;
        font-size: 12px;
        line-height: 1.6;
        padding: 10px 14px;
        border-radius: 10px;
        max-width: 280px;
        z-index: 20;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-family: 'DM Sans', sans-serif;
      }
    `}</style>
  );
}
