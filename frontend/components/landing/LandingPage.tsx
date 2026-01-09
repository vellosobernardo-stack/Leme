"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Shield, 
  Lock, 
  FileCheck, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  BarChart3,
  CheckCircle2,
  Zap,
  Target,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";

// ============================================
// HEADER
// ============================================
export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image 
            src={scrolled ? "/images/logo.svg" : "/images/logo-white.svg"}
            alt="Leme"
            width={100}
            height={32}
            className="h-7 w-auto"
            priority
          />
          <span className={`text-xl font-bold transition-colors ${scrolled ? "text-[#112d4e]" : "text-white"}`}>
            Leme
          </span>
        </Link>
        <Link
          href="/analise"
          className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
            scrolled 
              ? "bg-[#112d4e] text-white hover:bg-[#1a4578]" 
              : "bg-white text-[#112d4e] hover:bg-gray-100"
          }`}
        >
          Começar
        </Link>
      </div>
    </header>
  );
}

// ============================================
// HERO
// ============================================
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#112d4e] overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradientes */}
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-[#1a4578]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-gradient-to-tr from-[#F5793B]/15 to-transparent" />
        
        {/* Círculos decorativos */}
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-[#F5793B] rounded-full animate-pulse" />
        <div className="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white/40 rounded-full" />
        <div className="absolute bottom-[25%] left-[20%] w-3 h-3 border border-white/20 rounded-full" />
        <div className="absolute top-[60%] right-[25%] w-2 h-2 bg-white/20 rounded-full" />
        
        {/* Linhas decorativas */}
        <div className="absolute top-0 left-[25%] w-px h-32 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute bottom-0 right-[35%] w-px h-40 bg-gradient-to-t from-[#F5793B]/20 to-transparent" />
        
        {/* Círculo grande decorativo */}
        <div className="absolute -bottom-[200px] -left-[100px] w-[400px] h-[400px] border border-white/5 rounded-full" />
        <div className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] border border-[#F5793B]/10 rounded-full" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Texto */}
          <div>
            {/* Trust pill - foco em reduzir medo */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <Lock className="w-4 h-4 text-[#F5793B]" />
              <span className="text-sm text-white/80">Seus dados não são compartilhados</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-bold text-white leading-tight mb-6">
              Entenda as finanças
              <br />
              da sua empresa com
              <br />
              clareza e segurança.
              <br />
              <span className="text-[#F5793B]">Em minutos.</span>
            </h1>

            <p className="text-lg text-white/60 max-w-md mb-8">
              O Leme transforma dados financeiros em diagnósticos claros e acionáveis.
            </p>

            <div className="flex flex-wrap gap-6 mb-10 text-white/60 text-sm">
              {["Sem planilhas", "Sem fórmulas", "100% online"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F5793B]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA com microcopy de conforto */}
            <div>
              <Link
                href="/analise"
                className="group inline-flex items-center gap-3 bg-[#F5793B] hover:bg-[#e86a2e] text-white px-8 py-4 text-lg font-semibold rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-[#F5793B]/20"
              >
                Começar análise grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-white/40 text-sm mt-3 ml-1">Totalmente confidencial</p>
            </div>
          </div>

          {/* Mockup - contraste reduzido, menos animação */}
          <div className="relative">
            {/* Glow atrás do mockup - estático, mais sutil */}
            <div className="absolute inset-0 bg-[#F5793B]/10 rounded-3xl blur-3xl scale-90" />
            
            {/* Mockup principal - flutuação sutil */}
            <div className="relative animate-float">
              <div className="bg-white/95 rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#112d4e] to-[#1a4578] px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wide">Análise Financeira</p>
                    <p className="text-white font-semibold">Sua Empresa</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs">Score</p>
                    <p className="text-[#F5793B] font-bold text-3xl">88</p>
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: TrendingUp, label: "Margem Bruta", value: "42,5%", status: "Saudável", color: "text-green-500" },
                      { icon: DollarSign, label: "Fôlego de Caixa", value: "67 dias", status: "Confortável", color: "text-blue-500" },
                      { icon: PieChart, label: "Ponto de Equilíbrio", value: "R$ 45k", status: "Atingido", color: "text-purple-500" },
                      { icon: BarChart3, label: "Resultado", value: "R$ 12k", status: "Positivo", color: "text-[#F5793B]" },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50/80 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-xs text-gray-500">{item.label}</span>
                        </div>
                        <p className="text-lg font-bold text-[#112d4e]">{item.value}</p>
                        <p className="text-xs text-green-600">● {item.status}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Saúde Financeira</span>
                      <span className="text-green-600 font-medium">Muito Boa</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[88%] bg-gradient-to-r from-green-400 to-green-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card flutuante - Diagnóstico (sem animação própria) */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Diagnóstico</p>
                <p className="text-sm font-bold text-[#112d4e]">Completo</p>
              </div>
            </div>

            {/* Badge flutuante - Indicadores (sem animação própria) */}
            <div className="absolute -top-3 -right-3 bg-[#112d4e] text-white rounded-lg shadow-xl px-3 py-2">
              <p className="text-xs font-semibold">10 indicadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS para animação única */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

// ============================================
// TRUST BAR
// ============================================
export function TrustBar() {
  return (
    <section className="py-6 bg-[#0d2240]">
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-8 lg:gap-14">
        {[
          { icon: Lock, text: "Criptografia de ponta a ponta" },
          { icon: Shield, text: "100% conforme LGPD" },
          { icon: FileCheck, text: "Dados nunca compartilhados" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <item.icon className="w-4 h-4 text-[#F5793B]" />
            <span className="text-sm text-white/70">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// VALUE DELIVERY
// ============================================
export function ValueDelivery() {
  // Hierarquia: Gancho → Ação → Síntese → Prova
  const features = [
    { icon: Zap, title: "Diagnóstico inteligente", description: "Mostra onde você ganha, onde perde e onde agir" },
    { icon: Target, title: "Plano de ação 30/60/90", description: "Passos claros do que fazer agora, no próximo mês e no trimestre" },
    { icon: TrendingUp, title: "Score de saúde financeira", description: "Uma nota de 0 a 100 que resume tudo de forma simples" },
    { icon: BarChart3, title: "10 indicadores essenciais", description: "Os números que realmente importam para decidir" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#f8fafc] relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#F5793B]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#112d4e]/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[#F5793B] font-semibold mb-3 uppercase tracking-wide text-sm">O que você recebe</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#112d4e]">
            Um diagnóstico financeiro completo em minutos
          </h2>
        </div>
        
        {/* Linha de conforto */}
        <p className="text-center text-gray-500 mb-14">
          Feito para PMEs: sem termos técnicos e com ações práticas.
        </p>

        {/* Grid principal com preview */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cards - 2 colunas */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group bg-white p-6 rounded-xl border border-gray-100 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-gray-200"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 bg-[#112d4e] rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:bg-[#1a4578]">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#112d4e] mb-1">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini preview - mostra o que vai receber */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-full">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Exemplo de resultado</p>
              
              {/* Mini card de diagnóstico */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Margem Bruta</span>
                  <span className="text-sm font-semibold text-green-600">● Saudável</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Fôlego de Caixa</span>
                  <span className="text-sm font-semibold text-yellow-600">● Atenção</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Ponto de Equilíbrio</span>
                  <span className="text-sm font-semibold text-green-600">● Atingido</span>
                </div>
                
                {/* Ação sugerida */}
                <div className="bg-[#f8fafc] rounded-lg p-3 mt-4">
                  <p className="text-xs text-gray-400 mb-1">Ação sugerida</p>
                  <p className="text-sm text-[#112d4e] font-medium">Renegociar prazos com fornecedores para melhorar o caixa</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Micro-CTA */}
        <div className="text-center mt-10">
          <Link
            href="/analise"
            className="inline-flex items-center gap-2 text-[#F5793B] font-semibold hover:gap-3 transition-all"
          >
            Começar minha análise
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// HOW IT WORKS
// ============================================
export function HowItWorks() {
  const steps = [
    { 
      number: "01", 
      step: "Passo 1 de 3",
      title: "Informe seus números", 
      description: "Responda perguntas simples sobre seu negócio.", 
      highlight: "Estimativas já são suficientes.",
      subtext: "Não precisa ser exato",
      time: "~3 min",
      color: "bg-[#F5793B]",
      isFirst: true
    },
    { 
      number: "02", 
      step: "Passo 2 de 3",
      title: "Nós analisamos tudo", 
      description: "Transformamos seus dados em um diagnóstico claro. Mostramos riscos, pontos fortes e prioridades.", 
      color: "bg-[#112d4e]",
      isFirst: false
    },
    { 
      number: "03", 
      step: "Passo 3 de 3",
      title: "Você decide melhor", 
      description: "Receba um diagnóstico claro com riscos, forças e um plano de ação prático para os próximos meses.", 
      color: "bg-emerald-500",
      isFirst: false
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[#F5793B] font-semibold mb-3 uppercase tracking-wide text-sm">Como funciona</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#112d4e]">Simples assim</h2>
        </div>
        
        {/* Linha de reforço */}
        <p className="text-center text-gray-500 mb-16">
          Você responde. Nós analisamos. Você decide.
        </p>

        {/* Steps com linha de conexão */}
        <div className="relative">
          {/* Linha conectora - desktop */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#F5793B] via-[#112d4e] to-emerald-500 opacity-20" />
          
          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                {/* Micro texto de progresso */}
                <p className="text-xs text-gray-400 mb-3">{step.step}</p>
                
                {/* Número/ícone - maior no primeiro passo */}
                <div className={`${step.color} ${step.isFirst ? 'w-16 h-16' : 'w-14 h-14'} rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10`}>
                  <span className={`text-white font-bold ${step.isFirst ? 'text-xl' : 'text-lg'}`}>{step.number}</span>
                </div>
                
                {/* Título */}
                <h3 className="text-lg font-bold text-[#112d4e] mb-2">{step.title}</h3>
                
                {/* Descrição */}
                <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                  {step.description}
                </p>
                
                {/* Highlight e subtext apenas no passo 1 */}
                {step.isFirst && (
                  <div className="mt-3">
                    <p className="text-[#F5793B] text-sm font-medium">{step.highlight}</p>
                    <p className="text-gray-400 text-xs mt-1">{step.subtext}</p>
                    <span className="inline-block mt-2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{step.time}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// AUTHORITY
// ============================================
export function Authority() {
  return (
    <section className="py-20 lg:py-28 bg-[#f8fafc] relative overflow-hidden">
      {/* Elemento decorativo */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 w-px h-[60%] bg-gradient-to-b from-transparent via-[#F5793B]/20 to-transparent hidden lg:block" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Esquerda - Texto */}
          <div>
            <p className="text-[#F5793B] font-semibold mb-3 uppercase tracking-wide text-sm">Por que confiar</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#112d4e] mb-6">
              Metodologia profissional,
              <br />
              <span className="text-[#F5793B]">sem complexidade</span>
            </h2>
            
            <div className="space-y-4 text-gray-600 mb-8">
              <p>
                Utilizamos indicadores financeiros consagrados de mercado, usados por 
                analistas e especialistas para avaliar a saúde real de um negócio.
              </p>
              <p>
                O Leme traduz esses indicadores em diagnósticos claros e ações práticas, 
                sem termos técnicos ou complexidade.
              </p>
              <p>
                Tornamos a análise financeira profissional acessível a quem empreende no Brasil.
              </p>
            </div>

            {/* Números */}
            <div className="flex gap-8 mb-4">
              {[
                { value: "10+", label: "Indicadores" },
                { value: "3", label: "Minutos" },
                { value: "100%", label: "Gratuito" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-[#112d4e]">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            
            {/* Microtexto */}
            <p className="text-sm text-gray-400">
              Tudo isso sem planilhas ou termos técnicos.
            </p>
          </div>

          {/* Direita - Como pensamos */}
          <div className="bg-[#112d4e] rounded-2xl p-8 relative overflow-hidden">
            {/* Elemento decorativo interno */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5793B]/10 rounded-full blur-2xl" />
            
            <div className="relative">
              {/* Como pensamos */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-5">Como pensamos análise</h3>
                
                <div className="space-y-3">
                  {[
                    "Indicadores reconhecidos de mercado",
                    "Diagnósticos baseados em dados do próprio negócio",
                    "Foco em decisão, não em relatório",
                    "Ações práticas, não teoria",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#F5793B] flex-shrink-0" />
                      <p className="text-white/80 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Divisor */}
              <div className="border-t border-white/10 my-6" />
              
              {/* O que NÃO fazemos */}
              <div>
                <h3 className="text-lg font-semibold text-white/60 mb-4">O que não fazemos</h3>
                
                <div className="space-y-3">
                  {[
                    "Não usamos métricas inventadas",
                    "Não geramos relatórios genéricos",
                    "Não exigimos conhecimento técnico",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                      </div>
                      <p className="text-white/50 text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA FINAL
// ============================================
export function CTAFinal() {
  return (
    <section className="py-24 lg:py-32 bg-[#112d4e] relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F5793B]/10 rounded-full blur-[100px]" />
      </div>
      <div className="absolute top-10 left-10 w-3 h-3 border border-white/10 rounded-full" />
      <div className="absolute bottom-10 right-10 w-2 h-2 bg-[#F5793B]/30 rounded-full" />
      
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
          Comece agora. <span className="text-[#F5793B]">Decida com mais segurança.</span>
        </h2>
        
        <p className="text-lg text-white/60 mb-3 max-w-xl mx-auto">
          Descubra a saúde financeira da sua empresa em menos de 3 minutos.
        </p>
        
        <p className="text-white/40 mb-10">
          Sem compromisso. Dados sob seu controle.
        </p>
        
        <Link
          href="/analise"
          className="group inline-flex items-center gap-3 bg-[#F5793B] hover:bg-[#e86a2e] text-white px-10 py-5 text-lg font-semibold rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-[#F5793B]/20"
        >
          Começar análise grátis
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        {/* Elemento de tranquilidade */}
        <div className="flex items-center justify-center gap-2 mt-6 text-white/30">
          <Lock className="w-3.5 h-3.5" />
          <span className="text-sm">Seus dados permanecem privados</span>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
export function Footer() {
  return (
    <footer className="py-10 bg-[#081524]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/logo-white.svg"
              alt="Leme"
              width={80}
              height={26}
              className="h-5 w-auto opacity-70"
            />
            <span className="text-white/70 font-semibold">Leme</span>
          </Link>
          <a href="mailto:contato@leme.app.br" className="text-white/40 hover:text-white transition-colors text-sm">
            contato@leme.app.br
          </a>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5 text-center text-white/30 text-xs">
          © 2025 Leme. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
