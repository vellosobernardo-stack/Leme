"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const reasons = [
  {
    image: "/images/why-1.png",
    title: "Indicadores que fazem sentido",
    description:
      "Veja seus principais números organizados em uma visão clara, sem fórmulas e sem jargões.",
  },
  {
    image: "/images/why-2.png",
    title: "Cenários para tomar boas decisões",
    description:
      "Enxergue o impacto das suas escolhas antes de agir, com projeções simples de entender.",
  },
  {
    image: "/images/why-3.png",
    title: "Insights em minutos",
    description:
      "Descubra o que está funcionando e o que precisa de atenção em poucos cliques.",
  },
  {
    image: "/images/why-4.png",
    title: "Seguro, privado e só seu",
    description:
      "Seus dados ficam protegidos e não são compartilhados com ninguém.",
  },
];

export function WhyLeme() {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <section className="bg-[#F7FAFD] py-32">
      <div className="px-6 lg:px-20 max-w-7xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
          O que o seu negócio precisa. De verdade.
        </h2>

        {/* Subtítulo */}
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          Soluções que ajudam você a entender, decidir e crescer com mais
          segurança.
        </p>

        {/* Cards */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className={`group relative h-96 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Imagem de fundo */}
              <Image
                src={reason.image}
                alt={reason.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500 group-hover:from-black/90 group-hover:via-black/40" />

              {/* Conteúdo */}
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                {/* Título - sempre visível */}
                <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>

                {/* Descrição - aparece no hover */}
                <p className="text-sm text-white/80 leading-relaxed max-h-0 overflow-hidden opacity-0 transition-all duration-500 ease-out group-hover:max-h-24 group-hover:opacity-100">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}