"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BarChart2, MessageSquare, TrendingUp,
  Zap, Globe, Bell, ShieldCheck, ArrowLeft, Check,
} from "lucide-react";

const beneficios = [
  { icon: BarChart2, titulo: "8 indicadores financeiros completos", descricao: "Visão total da saúde do seu negócio, mês a mês" },
  { icon: MessageSquare, titulo: "Chat com consultora de IA", descricao: "Tire dúvidas com base nos seus próprios dados financeiros" },
  { icon: TrendingUp, titulo: "Histórico e evolução do score", descricao: "Acompanhe sua melhora ao longo do tempo" },
  { icon: Zap, titulo: "Simulador de cenários", descricao: "Simule decisões antes de tomá-las" },
  { icon: Globe, titulo: "Comparativo setorial com IA", descricao: "Veja como você se compara ao seu setor" },
  { icon: Bell, titulo: "Alertas mensais automáticos", descricao: "Resumo executivo direto no seu e-mail todo mês" },
];

type Plano = "mensal" | "anual";

export default function AssinarPage() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [plano, setPlano] = useState<Plano>("mensal");

  async function handleAssinar() {
    setErro("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stripe-pro/criar-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ plano }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) { window.location.href = "/login"; return; }
        setErro(data.detail || "Erro ao iniciar pagamento.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex flex-col">
      <div className="h-1 w-full bg-gradient-to-r from-[#003054] via-[#E07B2A] to-[#003054]" />

      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="mb-10 flex flex-col items-center gap-3">
          <Image src="/images/logo.svg" alt="Leme" width={52} height={52} className="select-none" />
        </div>

        <div
          className="w-full max-w-[460px] rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #001e38 0%, #003054 60%, #004070 100%)",
            boxShadow: "0 8px 40px 0 rgba(0,48,84,0.22)",
          }}
        >
          <div className="px-8 pt-8">
            <span
              className="inline-block text-[10px] font-bold tracking-[0.22em] uppercase px-3 py-1 rounded-full border"
              style={{ color: "#4ECBA4", borderColor: "rgba(78,203,164,0.35)", background: "rgba(78,203,164,0.10)" }}
            >
              Leme Pro
            </span>
          </div>

          <div className="px-8 pt-4 pb-2">
            <h1 className="text-[28px] font-bold text-white leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Acompanhamento financeiro{" "}
              <span style={{ color: "#4ECBA4" }}>completo</span>
            </h1>
            <p className="mt-2 text-sm text-white/55 leading-relaxed">
              Tudo que seu negócio precisa para crescer com clareza — IA, histórico, alertas e muito mais.
            </p>
          </div>

          {/* Seleção de plano */}
          <div className="px-8 pt-5 pb-2 grid grid-cols-2 gap-3">
            {/* Mensal */}
            <button
              onClick={() => setPlano("mensal")}
              className="rounded-xl border-2 p-4 text-left transition-all duration-200"
              style={{
                borderColor: plano === "mensal" ? "#E07B2A" : "rgba(255,255,255,0.12)",
                background: plano === "mensal" ? "rgba(224,123,42,0.12)" : "rgba(255,255,255,0.04)",
              }}
            >
              <p className="text-xs font-bold tracking-wide uppercase text-white/50 mb-1">Mensal</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                R$97
              </p>
              <p className="text-xs text-white/40 mt-0.5">por mês</p>
            </button>

            {/* Anual */}
            <button
              onClick={() => setPlano("anual")}
              className="rounded-xl border-2 p-4 text-left transition-all duration-200 relative"
              style={{
                borderColor: plano === "anual" ? "#4ECBA4" : "rgba(255,255,255,0.12)",
                background: plano === "anual" ? "rgba(78,203,164,0.10)" : "rgba(255,255,255,0.04)",
              }}
            >
              {/* Badge economize */}
              <span
                className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(78,203,164,0.20)", color: "#4ECBA4" }}
              >
                3 meses grátis
              </span>
              <p className="text-xs font-bold tracking-wide uppercase text-white/50 mb-1">Anual</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                R$75
              </p>
              <p className="text-xs text-white/40 mt-0.5">por mês · R$900/ano</p>
            </button>
          </div>

          {/* CTA */}
          <div className="px-8 pt-4 pb-2">
            {erro && (
              <p className="mb-3 text-xs text-red-300 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}
            <button
              onClick={handleAssinar}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-60"
              style={{
                background: loading ? "#cc6a20" : "linear-gradient(135deg, #E07B2A 0%, #f09040 100%)",
                color: "white",
                boxShadow: "0 4px 20px 0 rgba(224,123,42,0.35)",
              }}
            >
              {loading ? "Aguarde..." : (<>Assinar agora <ArrowRight size={16} /></>)}
            </button>
          </div>

          <div className="px-8 pb-8 pt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-white/30" />
            <span className="text-xs text-white/30">Pagamento seguro via Stripe</span>
          </div>
        </div>

        {/* Benefícios */}
        <div
          className="w-full max-w-[460px] mt-4 bg-white border border-[#E8E5E0] rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 2px 16px 0 rgba(0,48,84,0.05)" }}
        >
          <div className="px-8 pt-6 pb-2">
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-[#003054]/40">O que está incluído no Pro</p>
          </div>
          <ul className="px-8 pb-6 pt-3 space-y-4">
            {beneficios.map(({ icon: Icon, titulo, descricao }) => (
              <li key={titulo} className="flex items-start gap-4">
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-[#F8F7F5] border border-[#E8E5E0] flex items-center justify-center">
                  <Icon size={15} className="text-[#003054]/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#003054] leading-snug">{titulo}</p>
                  <p className="text-xs text-[#003054]/45 mt-0.5 leading-relaxed">{descricao}</p>
                </div>
                <Check size={14} className="flex-shrink-0 mt-1 text-[#4ECBA4]" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-sm text-[#003054]/50">
            Já tenho conta{" "}
            <Link href="/login" className="font-semibold text-[#E07B2A] hover:text-[#c96a1f] transition-colors">Entrar</Link>
          </p>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-[#003054]/40 hover:text-[#003054]/70 transition-colors">
            <ArrowLeft size={12} />
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}