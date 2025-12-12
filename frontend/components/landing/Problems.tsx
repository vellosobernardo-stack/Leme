"use client";

import Image from "next/image";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const problems = [
  {
    image: "/images/problem-1.png",
    title: "Dificuldade em entender os números",
    description:
      "Relatórios técnicos demais e planilhas extensas dificultam entender a saúde financeira do negócio.",
  },
  {
    image: "/images/problem-2.png",
    title: "Decisões importantes sem previsibilidade",
    description:
      "Sem cenários claros, fica difícil planejar o futuro, avaliar riscos e agir com segurança.",
  },
  {
    image: "/images/problem-3.png",
    title: "Falta de agilidade para entender sua empresa",
    description:
      "Análises demoradas e processos manuais atrasam decisões que deveriam ser rápidas.",
  },
  {
    image: "/images/problem-4.png",
    title: "Soluções complexas demais — ou caras demais",
    description:
      "Ferramentas difíceis e consultorias inacessíveis tornam a gestão financeira mais pesada do que deveria ser.",
  },
];

export function Problems() {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section className="bg-[#F7FAFD] py-32">
      <div className="px-6 lg:px-20 max-w-6xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
          Você não está sozinho nessa
        </h2>

        {/* Subtítulo */}
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-16">
          Milhares de empreendedores enfrentam os mesmos desafios todos os dias.
        </p>

        {/* Cards */}
        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-500 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
              }}
            >
              {/* Imagem */}
              <div className="w-full aspect-square relative mb-5">
                <Image
                  src={problem.image}
                  alt={problem.title}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Título */}
{/* Título */}
<h3 className="text-xl font-semibold mb-3 text-center min-h-[56px] flex items-end justify-center">
  {problem.title}
</h3>

{/* Descrição */}
<p className="text-base text-gray-600 leading-relaxed text-center">
  {problem.description}
</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}