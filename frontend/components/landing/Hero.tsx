"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0a1628] to-[#112d4e]">
      {/* Overlay sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

      {/* Conteúdo */}
      <div className="relative z-10 px-6 lg:px-20 py-32 text-center max-w-6xl mx-auto">
        {/* Título principal */}
        <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in">
          Entenda as finanças
          <br />
            da sua empresa.
          <br />
          Em segundos.
        </h1>

        {/* Subtítulo - fonte fina */}
        <p
          className="text-xl lg:text-2xl font-light text-white/60 max-w-3xl mx-auto mb-10 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          Envie seu PDF ou digite seus números. 
          <br />
          O Leme analisa tudo automaticamente.
        </p>

        {/* CTA */}
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <Link
            href="/analise"
            className="inline-flex items-center gap-3 bg-[#2a3f5f] hover:bg-[#354d73] text-white px-10 py-5 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition duration-300"
          >
            Começar
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}