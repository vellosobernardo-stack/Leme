"use client";

import { TrendingUp, Building2, Users, Award } from "lucide-react";

export function Authority() {
  const stats = [
    {
      icon: TrendingUp,
      value: "10+",
      label: "Indicadores financeiros",
      description: "Os mesmos usados por consultorias e analistas profissionais"
    },
    {
      icon: Building2,
      value: "PMEs",
      label: "Foco total",
      description: "Ferramentas pensadas para sua realidade"
    },
    {
      icon: Award,
      value: "100%",
      label: "Metodologia validada",
      description: "Práticas consagradas de mercado"
    }
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-[#f8fafc] to-white overflow-hidden">
      {/* Elemento decorativo de fundo */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#F5793B]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#112d4e]/5 to-transparent rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Coluna esquerda - Texto */}
          <div>
            {/* Título */}
            <h2 className="text-3xl lg:text-4xl font-bold text-[#112d4e] leading-tight mb-6">
              Análise de verdade.
              <br />
              <span className="text-[#F5793B]">Agora acessível.</span>
            </h2>

            {/* Descrição */}
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Grandes empresas investem milhares de reais em consultorias financeiras. 
              O Leme traz as <strong className="text-[#112d4e]">mesmas metodologias e indicadores</strong> usados 
              por especialistas de forma simples e acessível para micro e pequenas empresas.
            </p>

            <p className="text-gray-600 leading-relaxed">
              Não criamos métricas inventadas. Utilizamos indicadores consagrados como 
              Margem Bruta, Ponto de Equilíbrio, Ciclo Financeiro e outros que realmente 
              mostram a saúde do seu negócio.
            </p>
          </div>

          {/* Coluna direita - Stats */}
          <div className="space-y-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#F5793B]/20 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#112d4e] to-[#1a3f6f] flex items-center justify-center flex-shrink-0">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold text-[#112d4e]">{stat.value}</span>
                    <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{stat.description}</p>
                </div>
              </div>
            ))}

            {/* Citação/Destaque */}
            <div className="p-5 bg-gradient-to-r from-[#112d4e] to-[#1a3f6f] rounded-2xl text-white">
              <p className="text-sm leading-relaxed opacity-90">
                Democratizamos a análise financeira profissional. O que antes era exclusivo de grandes empresas, agora está ao alcance de quem empreende no Brasil.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
