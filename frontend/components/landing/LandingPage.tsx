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
  Users,
  Star,
  Instagram,
  MessageCircle,
  Mail,
  MapPin,
  // Lightbulb // Usado apenas no HeroPreAbertura (temporariamente desativado)
} from "lucide-react";
import { useEffect, useState } from "react";

// ============================================
// HEADER (SEM LINK PRÉ-ABERTURA)
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
        {/* Logo */}
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

        {/* CTA principal */}
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
    <section id="inicio" className="relative min-h-screen flex items-center bg-[#112d4e] overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradientes */}
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-[#1a4578]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-gradient-to-tr from-[#F5793B]/15 to-transparent" />
        
        {/* Círculos decorativos - apenas desktop */}
        <div className="hidden md:block absolute top-[20%] left-[10%] w-2 h-2 bg-[#F5793B] rounded-full animate-pulse" />
        <div className="hidden md:block absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white/40 rounded-full" />
        <div className="hidden md:block absolute bottom-[25%] left-[20%] w-3 h-3 border border-white/20 rounded-full" />
        <div className="hidden md:block absolute top-[60%] right-[25%] w-2 h-2 bg-white/20 rounded-full" />
        
        {/* Linhas decorativas - apenas desktop */}
        <div className="hidden md:block absolute top-0 left-[25%] w-px h-32 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="hidden md:block absolute bottom-0 right-[35%] w-px h-40 bg-gradient-to-t from-[#F5793B]/20 to-transparent" />
        
        {/* Círculo grande decorativo - apenas desktop */}
        <div className="hidden md:block absolute -bottom-[200px] -left-[100px] w-[400px] h-[400px] border border-white/5 rounded-full" />
        <div className="hidden md:block absolute -top-[150px] -right-[150px] w-[500px] h-[500px] border border-[#F5793B]/10 rounded-full" />
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

<h1 className="text-3xl sm:text-4xl lg:text-[3.2rem] font-bold text-white leading-[1.2] sm:leading-[1.25] lg:leading-[1.2] mb-6">
  Sua empresa está realmente saudável
  <br className="hidden lg:block" />
  {" "}
  <span className="text-[#F5793B]">— ou só parece estar?</span>
</h1>

            <p className="text-lg text-white/60 max-w-md mb-2">
              Descubra em 3 minutos se você tem riscos escondidos no seu caixa, na sua margem ou no seu crescimento.
            </p>

            <p className="text-sm text-white/35 mb-8">
              Criado por especialistas em finanças para pequenas empresas.
            </p>

            <div className="flex flex-wrap gap-6 mb-10 text-white/60 text-sm">
              {["Sem planilhas", "Sem CNPJ", "100% online"].map((item, i) => (
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
                Fazer meu diagnóstico
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-white/40 text-sm mt-3 ml-1">Resultado na hora — você vê seu risco real em segundos.</p>
            </div>
          </div>

          {/* Mockup - apenas desktop/tablet */}
          <div className="relative hidden lg:block">
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
                    <p className="text-yellow-500 font-bold text-3xl">54</p>
                  </div>
                </div>
                
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: TrendingUp, label: "Margem Bruta", value: "42,5%", status: "Saudável", color: "text-green-500", statusColor: "text-green-600" },
                      { icon: DollarSign, label: "Fôlego de Caixa", value: "18 dias", status: "Risco", color: "text-red-500", statusColor: "text-red-600" },
                      { icon: PieChart, label: "Ponto de Equilíbrio", value: "R$ 45k", status: "Atingido", color: "text-purple-500", statusColor: "text-green-600" },
                      { icon: BarChart3, label: "Resultado", value: "R$ 3,2k", status: "Atenção", color: "text-yellow-500", statusColor: "text-yellow-600" },
                    ].map((item, i) => (
                      <div key={i} className="bg-gray-50/80 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-xs text-gray-500">{item.label}</span>
                        </div>
                        <p className="text-lg font-bold text-[#112d4e]">{item.value}</p>
                        <p className={`text-xs ${item.statusColor}`}>● {item.status}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Saúde Financeira</span>
                      <span className="text-yellow-600 font-medium">Atenção</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-[54%] bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" />
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
              <p className="text-xs font-semibold">Indicadores</p>
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
// SOCIAL PROOF — Prova social com dados reais
// ============================================
export function SocialProof() {
  return (
    <section className="py-8 bg-[#0d2240] border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        {/* Números em grid — 3 colunas mesmo no mobile */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-5">
          {[
            { value: "100+", label: "análises realizadas" },
            { value: "92%", label: "avaliaram como relevante" },
            { value: "3 min", label: "tempo médio de análise" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/40 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        
        {/* Credibilidade — sem estrelas */}
        <p className="text-center text-sm text-white/30">
          Criado por especialistas com experiência em consultoria financeira
        </p>
      </div>
    </section>
  );
}

// ============================================
// TRUST BAR
// ============================================
export function TrustBar() {
  return (
    <section id="seguranca" className="py-6 bg-[#0d2240]">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-start gap-3 pl-[25%] sm:pl-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8 lg:gap-14">
        {[
          { icon: Lock, text: "Criptografia de ponta a ponta" },
          { icon: Shield, text: "100% conforme LGPD" },
          { icon: FileCheck, text: "Dados nunca compartilhados" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <item.icon className="w-4 h-4 text-[#F5793B] flex-shrink-0" />
            <span className="text-sm text-white/70">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================
// SEÇÃO DE DOR — Espelho emocional
// ============================================
export function PainSection() {
  const doubts = [
    {
      question: "Quanto realmente sobra no fim do mês — depois de tudo?",
      subtext: "Não o que parece sobrar. O que de fato fica.",
    },
    {
      question: "Se um cliente grande atrasar, quantos dias você aguenta?",
      subtext: "Muitos donos descobrem a resposta tarde demais.",
    },
    {
      question: "Você sabe o custo real de cada venda, com imposto e tudo?",
      subtext: "Vender muito e lucrar pouco é mais comum do que parece.",
    },
    {
      question: "As retiradas do caixa estão controladas — ou no feeling?",
      subtext: "Misturar contas é o erro mais silencioso que existe.",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10 lg:mb-14">
          <h2 className="text-2xl lg:text-3xl font-bold text-[#112d4e] mb-3">
            Você sabe responder essas perguntas sobre seu negócio?
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Se bateu dúvida em qualquer uma, seu negócio pode ter riscos que você ainda não enxerga.
          </p>
        </div>

        {/* Grid de perguntas — 2 colunas no desktop */}
        <div className="grid sm:grid-cols-2 gap-4 lg:gap-5 mb-10 max-w-3xl mx-auto">
          {doubts.map((doubt, i) => (
            <div 
              key={i} 
              className="flex items-start gap-3 bg-[#f8fafc] rounded-xl p-5 border border-gray-100"
            >
              <span className="text-[#F5793B] text-lg font-bold flex-shrink-0 mt-0.5">?</span>
              <div>
                <p className="text-gray-800 font-medium text-base mb-1">{doubt.question}</p>
                <p className="text-gray-400 text-sm">{doubt.subtext}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 mb-5">
            O Leme responde todas essas perguntas em <span className="text-[#112d4e] font-semibold">3 minutos</span>.
          </p>
          <Link
            href="/analise"
            className="inline-flex items-center gap-2 text-[#F5793B] font-semibold hover:gap-3 transition-all"
          >
            Fazer meu diagnóstico
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// HERO PRÉ-ABERTURA (TEMPORARIAMENTE DESATIVADO)
// Código preservado para reativação futura
// ============================================
/*
export function HeroPreAbertura() {
  return (
    <section id="pre-abertura" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F5793B]/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full mb-6">
              <Lightbulb className="w-4 h-4 text-[#112d4e]" />
              <span className="text-sm text-[#112d4e]/80">Para quem está planejando</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-[#112d4e] mb-6 leading-tight">
              Ainda não abriu sua empresa?
              <br />
              <span className="text-[#F5793B]">Comece pelo planejamento.</span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 max-w-md">
              Descubra quanto capital você precisa, compare com referências do setor 
              e receba um checklist para os primeiros 30 dias.
            </p>

            <div className="space-y-3 mb-8">
              {[
                "Compare seu capital com a média do setor",
                "Receba alertas sobre pontos de atenção",
                "Checklist prático para os primeiros passos",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#112d4e]/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#112d4e]" />
                  </div>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/pre-abertura"
              className="group inline-flex items-center gap-3 bg-[#112d4e] hover:bg-[#1a4578] text-white px-8 py-4 text-lg font-semibold rounded-full transition-all hover:-translate-y-0.5"
            >
              Analisar minha ideia
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-gray-400 text-sm mt-3 ml-1">
              Leva menos de 2 minutos • Sem CNPJ
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#112d4e]/5 rounded-3xl blur-2xl scale-95" />
            
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-[#112d4e] px-6 py-5">
                <p className="text-white/60 text-sm mb-1">Análise Pré-abertura</p>
                <p className="text-white font-semibold text-lg">Seu projeto de negócio</p>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Seu capital</span>
                    <span className="font-semibold text-[#112d4e]">R$ 30.000</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-green-500 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-400">Referência: R$ 25.000</span>
                    <span className="text-green-600 font-medium">20% acima</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Faturamento esperado</span>
                    <span className="font-semibold text-[#112d4e]">R$ 12.000</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-yellow-500 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-400">Média do setor: R$ 15.000</span>
                    <span className="text-yellow-600 font-medium">20% abaixo</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800 text-sm">Capital adequado</p>
                      <p className="text-blue-600 text-xs mt-0.5">Você tem margem para imprevistos iniciais</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Primeiros 30 dias</p>
                  <div className="space-y-2">
                    {["Definir estrutura jurídica", "Abrir conta PJ"].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 rounded border-2 border-gray-300" />
                        <span>{item}</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 mt-1">+ mais itens no resultado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
*/

// ============================================
// VALUE DELIVERY
// ============================================
export function ValueDelivery() {
  // Hierarquia: Gancho → Ação → Síntese → Prova
  const features = [
    { icon: Zap, title: "Diagnóstico inteligente", description: "Mostra onde você ganha, onde perde e onde pode estar desperdiçando dinheiro" },
    { icon: Target, title: "Plano de ação 30/60/90", description: "Passos claros para corrigir agora o que pode virar prejuízo depois" },
    { icon: TrendingUp, title: "Score de saúde financeira", description: "Uma nota de 0 a 100 que revela se seu negócio está seguro ou em risco" },
    { icon: BarChart3, title: "Indicadores essenciais", description: "Os números que mostram se sua empresa está estruturada para crescer — ou vulnerável" },
  ];

  return (
    <section id="o-que-voce-recebe" className="py-20 lg:py-28 bg-[#f8fafc] relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#F5793B]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-[#112d4e]/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-[#F5793B] font-semibold mb-3 uppercase tracking-wide text-sm">O que você recebe</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#112d4e]">
            O que você não está vendo pode estar custando caro
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
      title: "Saiba exatamente o que corrigir", 
      description: "Receba um diagnóstico com riscos, forças e um plano prático do que fazer — e do que parar de fazer.", 
      color: "bg-emerald-500",
      isFirst: false
    }
  ];

  return (
    <section id="como-funciona" className="py-20 lg:py-28 bg-white relative">
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
    <section id="metodologia" className="py-20 lg:py-28 bg-[#f8fafc] relative overflow-hidden">
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
                { value: "100%", label: "Online" },
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
    <section id="comecar" className="py-24 lg:py-32 bg-[#112d4e] relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F5793B]/10 rounded-full blur-[100px]" />
      </div>
      <div className="hidden md:block absolute top-10 left-10 w-3 h-3 border border-white/10 rounded-full" />
      <div className="hidden md:block absolute bottom-10 right-10 w-2 h-2 bg-[#F5793B]/30 rounded-full" />
      
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
          Comece agora. <span className="text-[#F5793B]">Decida com mais segurança.</span>
        </h2>
        
        <p className="text-lg text-white/60 mb-3 max-w-xl mx-auto">
          Descubra em 3 minutos. Grátis e confidencial.
        </p>
        
        <p className="text-white/40 mb-10">
          Sem compromisso. Dados sob seu controle.
        </p>
        
        <Link
          href="/analise"
          className="group inline-flex items-center gap-3 bg-[#F5793B] hover:bg-[#e86a2e] text-white px-10 py-5 text-lg font-semibold rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-[#F5793B]/20"
        >
          Fazer diagnóstico
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        {/* Frase anti-medo de trabalho */}
        <p className="text-white/50 text-sm mt-6 max-w-md mx-auto">
          Você recebe ações práticas que cabem na sua rotina. Sem planilha. Sem reunião. Sem complicação.
        </p>

        {/* Elemento de tranquilidade */}
        <div className="flex items-center justify-center gap-2 mt-4 text-white/30">
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
        {/* Linha principal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
          
          {/* Canais de contato */}
          <div className="flex items-center gap-5">
            <a href="mailto:contato@leme.app.br" className="text-white/40 hover:text-white transition-colors" title="Email">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://instagram.com/leme.app" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" title="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://wa.me/5521999999999" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors" title="WhatsApp">
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        {/* Info de credibilidade */}
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-white/25 text-xs">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Rio de Janeiro, RJ</span>
            </div>
            <span>Especialistas com +10 anos em análise de empresas</span>
          </div>
          <p className="text-white/25 text-xs">
            © 2026 Leme. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}