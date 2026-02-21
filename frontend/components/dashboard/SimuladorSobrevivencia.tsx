// components/dashboard/SimuladorSobrevivencia.tsx
// Simulador de Sobrevivência v3 — linguagem leiga, narrativo
//
// Responde 3 perguntas:
// 1. Estou ganhando ou perdendo dinheiro?  → bloco HOJE
// 2. Estou seguro?                          → bloco SE SUAS VENDAS CAÍREM
// 3. O que pode dar errado?                 → bloco CONCLUSÃO

"use client";

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingDown, Clock, ArrowDown } from 'lucide-react';
import type { SimuladorData } from '@/types/dashboard';

// ============================================
// TIPOS
// ============================================
interface SimuladorSobrevivenciaProps {
  dados: SimuladorData;
}

interface Cenario {
  dias: number;       // 999 = não queima caixa
  saldo: number;      // positivo = sobra, negativo = falta
  deficit: number;    // valor absoluto da falta
  receita: number;
}

// ============================================
// CÁLCULO
// ============================================
function calcular(caixa: number, receita: number, custoVendas: number, despesasFixas: number) {
  caixa = Math.max(0, caixa || 0);
  receita = Math.max(0, receita || 0);
  custoVendas = Math.max(0, custoVendas || 0);
  despesasFixas = Math.max(0, despesasFixas || 0);
  const custoTotal = custoVendas + despesasFixas;

  function run(rec: number): Cenario {
    const saldo = rec - custoTotal;
    if (custoTotal === 0) return { dias: 999, saldo: rec, deficit: 0, receita: rec };
    if (saldo >= 0) return { dias: 999, saldo, deficit: 0, receita: rec };
    const deficit = Math.abs(saldo);
    if (caixa <= 0) return { dias: 0, saldo, deficit, receita: rec };
    return { dias: Math.max(0, Math.round(caixa / (deficit / 30))), saldo, deficit, receita: rec };
  }

  return { normal: run(receita), estresse: run(receita * 0.7), custoTotal };
}

// ============================================
// FORMATAÇÃO
// ============================================
function fmt(v: number): string {
  return `R$ ${Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ============================================
// BARRA (só quando tem dias contados)
// ============================================
function Barra({ dias, delay }: { dias: number; delay: number }) {
  const [w, setW] = useState(0);
  const pct = Math.min(100, (dias / 180) * 100);
  const cor = dias >= 90 ? 'bg-emerald-500' : dias >= 60 ? 'bg-amber-500' : 'bg-red-500';

  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="relative w-full mt-2">
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${cor}`} style={{ width: `${w}%` }} />
      </div>
      <div className="absolute top-0 h-2 border-r-2 border-dashed border-gray-300" style={{ left: `${(90 / 180) * 100}%` }} />
      <div className="flex justify-between mt-1 text-xs text-muted-foreground/50">
        <span>0</span>
        <span>90 dias</span>
        <span>180+</span>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE
// ============================================
export default function SimuladorSobrevivencia({ dados }: SimuladorSobrevivenciaProps) {
  const { normal, estresse, custoTotal } = calcular(
    dados.caixa_disponivel, dados.receita_mensal, dados.custo_vendas, dados.despesas_fixas
  );

  const queda = dados.receita_mensal - estresse.receita;
  const hojePositivo = normal.saldo >= 0;
  const estressePositivo = estresse.saldo >= 0;

  // Animação de entrada
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // ========== CONCLUSÃO (pergunta 3: o que pode dar errado?) ==========
  let conclusao = '';
  let conclusaoTipo: 'alerta' | 'critico' = 'alerta';

  if (hojePositivo && !estressePositivo) {
    // Lucro vira prejuízo — caso mais impactante
    conclusao = `Uma queda de ${fmt(queda)} nas vendas já faria sua empresa operar no prejuízo.`;
  } else if (hojePositivo && estressePositivo) {
    // Ainda positivo mas sobra menor
    const pctQueda = normal.saldo > 0 ? Math.round((1 - estresse.saldo / normal.saldo) * 100) : 0;
    conclusao = `Uma queda de ${fmt(queda)} reduziria sua sobra mensal em ${pctQueda}%.`;
  } else if (!hojePositivo && normal.dias === 0) {
    conclusao = 'Sem caixa e sem sobra, qualquer atraso pode travar sua operação.';
    conclusaoTipo = 'critico';
  } else if (!hojePositivo && normal.dias < 60) {
    conclusao = 'Seu caixa é vulnerável. Qualquer imprevisto pode comprometer a operação.';
    conclusaoTipo = 'critico';
  } else if (!hojePositivo) {
    conclusao = `Com a queda nas vendas, seu fôlego cairia de ${normal.dias} para ${estresse.dias} dias.`;
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className="bg-white rounded-xl shadow-sm border border-border/40 overflow-hidden hover:shadow-md transition duration-300">
        <div className="p-5 sm:p-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-primary">
                Simulador de Sobrevivência
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Seu negócio aguentaria um aperto?
              </p>
            </div>
          </div>

          {/* ================================================
              BLOCO 1: HOJE
              Pergunta 1: Estou ganhando ou perdendo dinheiro?
              ================================================ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">Hoje</span>
            </div>

            {hojePositivo ? (
              /* ✅ Empresa com sobra */
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Depois de pagar todas as despesas, sobram{' '}
                  <span className="font-bold text-emerald-700">{fmt(normal.saldo)} por mês</span>.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sua empresa se sustenta no ritmo atual.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  Receita {fmt(dados.receita_mensal)} – Custos {fmt(custoTotal)}
                </p>
              </div>

            ) : normal.dias === 0 ? (
              /* 🔴 Sem caixa */
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  As despesas superam o faturamento em{' '}
                  <span className="font-bold text-red-700">{fmt(normal.deficit)} por mês</span>.
                </p>
                <p className="text-sm text-red-700 font-medium mt-1">
                  Não há reserva de caixa para cobrir essa diferença.
                </p>
              </div>

            ) : (
              /* 🟡/🔴 Queimando caixa */
              <div className={`${normal.dias < 60 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'} border rounded-xl p-4`}>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  As despesas superam o faturamento em{' '}
                  <span className={`font-bold ${normal.dias < 60 ? 'text-red-700' : 'text-amber-700'}`}>
                    {fmt(normal.deficit)} por mês
                  </span>.
                  <br />
                  Seu caixa cobre essa diferença por mais
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-3xl sm:text-4xl font-extrabold ${normal.dias < 60 ? 'text-red-600' : 'text-amber-600'}`}>
                    {normal.dias}
                  </span>
                  <span className="text-sm text-muted-foreground">dias.</span>
                </div>
                <Barra dias={normal.dias} delay={300} />
              </div>
            )}
          </div>

          {/* ====== DIVISOR ====== */}
          <div className="flex items-center gap-2 mb-5">
            <ArrowDown className="w-4 h-4 text-muted-foreground/50" />
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* ================================================
              BLOCO 2: SE AS VENDAS CAÍREM
              Pergunta 2: Estou seguro?
              ================================================ */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-amber-500" />
              <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Se suas vendas caírem 30%
              </span>
            </div>

            <div className={`border rounded-xl p-4 ${
              !estressePositivo
                ? estresse.dias === 0
                  ? 'bg-red-50 border-red-200'
                  : estresse.dias < 60 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                : 'bg-gray-50 border-border/60'
            }`}>

              {/* Receita */}
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Receita: <span className="line-through">{fmt(dados.receita_mensal)}</span>{' '}
                → <span className="font-semibold text-gray-700">{fmt(estresse.receita)}</span>
              </p>

              {estressePositivo ? (
                /* Ainda sobra, mas menos */
                <div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    Depois de pagar tudo, sobrariam apenas{' '}
                    <span className="font-bold text-amber-700">{fmt(estresse.saldo)} por mês</span>.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Um pequeno imprevisto já poderia zerar essa sobra.
                  </p>
                </div>

              ) : estresse.dias === 0 ? (
                /* Sem fôlego nenhum */
                <div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    As despesas passariam a superar o faturamento em{' '}
                    <span className="font-bold text-red-700">{fmt(estresse.deficit)} por mês</span>.
                  </p>
                  <p className="text-sm text-red-700 font-medium mt-1">
                    Sem reserva para cobrir essa diferença.
                  </p>
                </div>

              ) : (
                /* Queimando com dias contados */
                <div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                    As despesas passariam a superar o faturamento em{' '}
                    <span className={`font-bold ${estresse.dias < 60 ? 'text-red-700' : 'text-amber-700'}`}>
                      {fmt(estresse.deficit)} por mês
                    </span>.
                    <br />
                    Seu caixa cobriria essa diferença por mais
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className={`text-3xl sm:text-4xl font-extrabold ${
                      estresse.dias < 60 ? 'text-red-600' : estresse.dias < 120 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {estresse.dias}
                    </span>
                    <span className="text-sm text-muted-foreground">dias.</span>
                  </div>
                  <Barra dias={estresse.dias} delay={600} />
                </div>
              )}
            </div>
          </div>

          {/* ================================================
              BLOCO 3: CONCLUSÃO
              Pergunta 3: O que pode dar errado?
              ================================================ */}
          {conclusao && (
            <div className={`rounded-xl p-4 flex items-start gap-3 ${
              conclusaoTipo === 'critico'
                ? 'bg-red-50 border border-red-200'
                : 'bg-orange-50 border border-orange-200/60'
            }`}>
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                conclusaoTipo === 'critico' ? 'text-red-500' : 'text-orange-500'
              }`} />
              <p className={`text-sm sm:text-base font-medium leading-relaxed ${
                conclusaoTipo === 'critico' ? 'text-red-800' : 'text-gray-800'
              }`}>
                {conclusao}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}