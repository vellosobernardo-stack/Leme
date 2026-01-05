"use client";

import Link from "next/link";
import { ArrowRight, Shield, Clock, Target, TrendingUp, DollarSign, PieChart, BarChart3 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-[#0a1628] via-[#112d4e] to-[#1a3a5c] overflow-hidden">
      {/* Elemento decorativo - blur orgânico no canto inferior direito */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] bg-gradient-to-tl from-[#F5793B]/40 via-[#F5793B]/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] right-[-50px] w-[300px] h-[300px] bg-gradient-to-tl from-[#FF9F6B]/30 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-[50px] right-[100px] w-[200px] h-[200px] bg-gradient-to-br from-[#3B82F6]/20 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Overlay sutil para profundidade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

      {/* Conteúdo principal */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Coluna esquerda - Texto */}
          <div className="text-left">
            {/* Título principal */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6 animate-fade-in">
              Entenda as finanças
              <br />
              da sua empresa.
              <br />
              <span className="text-[#F5793B]">Em segundos.</span>
            </h1>

            {/* Subtítulo */}
            <p
              className="text-lg lg:text-xl font-light text-white/70 max-w-lg mb-8 animate-fade-in"
              style={{ animationDelay: "0.15s" }}
            >
              Envie seu PDF ou digite seus números.
              <br />
              O Leme analisa tudo automaticamente.
            </p>

            {/* Micro-provas */}
            <div 
              className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60 mb-10 animate-fade-in"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#F5793B]" />
                <span>Pronto em 3 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#F5793B]" />
                <span>100% confidencial</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#F5793B]" />
                <span>Ações claras</span>
              </div>
            </div>

            {/* CTA */}
            <div className="animate-fade-in" style={{ animationDelay: "0.35s" }}>
              <Link
                href="/analise"
                className="inline-flex items-center gap-3 bg-[#F5793B] hover:bg-[#E56A2C] text-white px-10 py-5 text-lg font-semibold rounded-full shadow-lg shadow-[#F5793B]/25 hover:shadow-xl hover:shadow-[#F5793B]/30 transition-all duration-300 hover:scale-[1.02]"
              >
                Começar agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Coluna direita - Mockup construído em código */}
          <div 
            className="relative lg:pl-8 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Container dos mockups */}
            <div className="relative">
              
              {/* Mockup principal - Dashboard simulado */}
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
                {/* Header do dashboard */}
                <div className="bg-[#112d4e] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-xs">Análise Financeira</p>
                      <p className="text-white font-semibold">Padaria do João</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-xs">Score</p>
                      <p className="text-[#F5793B] font-bold text-2xl">88</p>
                    </div>
                  </div>
                </div>
                
                {/* Conteúdo do dashboard */}
                <div className="p-6 space-y-4">
                  {/* Linha de indicadores principais */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-gray-500">Margem Bruta</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">42,5%</p>
                      <p className="text-xs text-green-600">↑ Saudável</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-gray-500">Fôlego de Caixa</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">67 dias</p>
                      <p className="text-xs text-green-600">↑ Confortável</p>
                    </div>
                  </div>
                  
                  {/* Mais indicadores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <PieChart className="w-4 h-4 text-purple-500" />
                        <span className="text-xs text-gray-500">Ponto de Equilíbrio</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">R$ 45k</p>
                      <p className="text-xs text-green-600">Atingido</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-gray-500">Resultado</span>
                      </div>
                      <p className="text-lg font-bold text-gray-800">R$ 12k</p>
                      <p className="text-xs text-green-600">Positivo</p>
                    </div>
                  </div>

                  {/* Barra de progresso do score */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Saúde Financeira</span>
                      <span className="text-green-600 font-medium">Muito Boa</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-[88%] bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card flutuante - Score */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl shadow-black/20 p-4 border border-gray-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">88</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Score de Saúde</p>
                    <p className="text-sm font-semibold text-gray-800">Empresa Saudável</p>
                  </div>
                </div>
              </div>

              {/* Badge flutuante - Indicadores */}
              <div className="absolute -top-4 -right-4 bg-[#112d4e] text-white rounded-lg shadow-lg px-4 py-2 animate-float-delayed">
                <p className="text-xs font-medium">10 indicadores</p>
                <p className="text-xs text-white/60">calculados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos de animação */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}