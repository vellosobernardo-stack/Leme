"use client";

import Link from "next/link";

export function AIAssistant() {
  return (
    <section className="bg-[#F7FAFD] py-32">
      <div className="px-6 lg:px-20 max-w-6xl mx-auto">
        {/* Card central escuro */}
        <div className="rounded-3xl bg-gradient-to-br from-black via-[#0a1628] to-[#112d4e] px-16 py-24 text-center text-white shadow-xl">
          <div className="flex flex-col items-center gap-6">
            {/* Título */}
            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
              Seu assistente financeiro de IA.
              <br />
              Sempre ativo.
            </h2>

            {/* Subtítulo */}
            <p className="text-lg lg:text-xl text-white/70 max-w-2xl">
              Personalizado com os dados do seu negócio, pronto para responder
              dúvidas, explicar métricas e orientar decisões — 24 horas por dia.
            </p>

            {/* CTA */}
            <Link
              href="/analise"
              className="mt-4 inline-flex items-center justify-center px-10 py-4 rounded-lg bg-[#2a3f5f] hover:bg-[#354d73] text-white text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Conversar agora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}