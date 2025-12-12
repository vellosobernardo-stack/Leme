"use client";

import { Upload, LineChart, Lightbulb } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Escreva seus números ou envie um PDF",
    description:
      "A única etapa manual é informar seus dados. Todo o resto fica por nossa conta.",
  },
  {
    number: "2",
    icon: LineChart,
    title: "Nós interpretamos os seus dados",
    description:
      "O Leme cruza informações, entende padrões e descobre o que realmente importa.",
  },
  {
    number: "3",
    icon: Lightbulb,
    title: "Geramos um diagnóstico claro e completo",
    description:
      "Você recebe uma visão simples, organizada e fácil de usar sobre a saúde do seu negócio.",
  },
];

export function HowItWorks() {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section className="bg-[#F7FAFD] py-32">
      <div className="px-6 lg:px-20 max-w-6xl mx-auto">
        {/* Título */}
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
          Menos trabalho. Mais facilidade.
        </h2>

        {/* Subtítulo */}
        <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-20">
          O Leme transforma seus dados em apenas 3 passos — sem complicação, sem
          fórmulas e sem planilhas.
        </p>

        {/* Steps */}
        <div ref={ref} className="relative">
          {/* Linha de conexão - desktop */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-[2px] bg-gray-200" />

          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex flex-col items-center text-center transition-all duration-500 ease-out ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 150}ms` : "0ms",
                }}
              >
                {/* Card do ícone com número */}
                <div className="relative mb-6">
                  {/* Card azul */}
                  <div className="w-28 h-28 bg-[#112D4E] rounded-2xl flex items-center justify-center shadow-lg">
                    <step.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>

                  {/* Número laranja */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#F5793B] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {step.number}
                  </div>
                </div>

                {/* Título */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>

                {/* Descrição */}
                <p className="text-gray-600 leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}