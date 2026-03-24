"use client";

import { Gem, Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const ITENS = [
  "Plano de ação completo: hoje, no mês e no trimestre",
  "Todos os 8 indicadores financeiros com explicação",
  "Valuation e payback do seu negócio",
  "Comparativo com empresas do seu setor",
  "Consultor de IA com os dados da sua empresa",
];

export default function ProUpgradeCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: "#003054" }}>

      {/* Faixa laranja no topo — mais grossa para dar mais peso */}
      <div className="h-1.5 w-full" style={{ background: "#E07B2A" }} />

      {/* Brilho decorativo no canto superior direito */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 pointer-events-none"
        style={{ background: "#E07B2A", transform: "translate(30%, -30%)" }}
      />

      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">

          {/* Lado esquerdo — ícone + título + lista */}
          <div className="flex-1">
            {/* Label */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.10)" }}
              >
                <Gem size={18} className="text-white" />
              </div>
              <span
                className="text-xs font-bold tracking-[0.18em] uppercase"
                style={{ color: "#E07B2A" }}
              >
                Leme Pro
              </span>
            </div>

            {/* Título */}
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-5 max-w-xl">
              Desbloqueie o Leme Pro e veja o que fazer hoje, no mês e no trimestre — com todos os indicadores e um diagnóstico completo da sua empresa.
            </h3>

            {/* Lista */}
            <ul className="space-y-2.5">
              {ITENS.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check
                    size={15}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "#00c894" }}
                  />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Lado direito — CTA em destaque */}
          <div className="flex flex-col items-start md:items-center gap-4 md:flex-shrink-0">
            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90 active:opacity-80 shadow-lg"
              style={{ background: "#E07B2A" }}
            >
              <Sparkles size={16} />
              Quero o Leme Pro
              <ArrowRight size={16} />
            </Link>
            <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.40)" }}>
              Cadastro gratuito · Assine quando quiser
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}