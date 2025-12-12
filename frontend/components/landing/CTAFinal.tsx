"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTAFinal() {
  return (
    <section className="bg-[#112D4E] py-32">
      <div className="px-6 lg:px-20 max-w-4xl mx-auto text-center space-y-8">
        {/* Título */}
        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
          Comece agora.
          <br />
          Leva menos de 1 minuto.
        </h2>

        {/* Subtítulo */}
        <p className="text-xl text-white/70">
          Análises financeiras inteligentes, sem complicação.
        </p>

        {/* CTA */}
        <div>
          <Link
            href="/analise"
            className="inline-flex items-center gap-3 bg-[#2a3f5f] hover:bg-[#354d73] text-white px-12 py-5 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Começar agora
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}