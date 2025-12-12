"use client";

import {
  BarChart3,
  LineChart,
  Timer,
  AlertTriangle,
  ListChecks,
  Globe2,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: BarChart3,
    title: "10 indicadores essenciais",
    description: "Uma visão clara da saúde financeira do seu negócio.",
  },
  {
    icon: LineChart,
    title: "Valuation aproximado",
    description: "Entenda o valor estimado da sua empresa.",
  },
  {
    icon: Timer,
    title: "Tempo de retorno",
    description: "Descubra em quanto tempo seu investimento se paga.",
  },
  {
    icon: AlertTriangle,
    title: "Diagnóstico das dores",
    description: "Mostramos os principais riscos e pontos de atenção.",
  },
  {
    icon: ListChecks,
    title: "Plano de ação inteligente",
    description: "Sugestões práticas criadas a partir dos seus próprios números.",
  },
  {
    icon: Globe2,
    title: "Score de mercado",
    description: "Entenda sua posição no mercado e na sua região.",
  },
];

export function Features() {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section className="bg-[#F7FAFD] py-32">
      <div className="px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-16 lg:gap-20 items-center">
          {/* Coluna Esquerda - Texto centralizado */}
          <div className="max-w-md text-center lg:text-center mx-auto lg:mx-0">
            <h2 className="text-4xl lg:text-4xl font-bold leading-tight mb-6">
              Tudo o que você precisa para entender seu negócio.
              <br />
              Em um só lugar.
            </h2>
            <p className="text-lg text-muted-foreground">
              O Leme transforma seus números em clareza. Basta informar os dados
              financeiros e você recebe indicadores, análises e cenários prontos
              para usar. Simples, rápido e inteligente.
            </p>
          </div>

          {/* Coluna Direita - Cards */}
          <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`bg-white/80 border border-border/40 rounded-xl p-6 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-500 ease-out ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                <feature.icon
                  className="w-10 h-10 text-primary mx-auto mb-4"
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-semibold mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}