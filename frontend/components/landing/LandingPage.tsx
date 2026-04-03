"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Lock,
  CheckCircle2,
  ChevronDown,
  Mail,
  Instagram,
  MessageCircle,
  MapPin,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Target,
  MessageSquare,
  Play,
  Clock,
} from "lucide-react";
import { useEffect, useState, useRef, type ReactNode } from "react";

// ============================================
// HOOK: Scroll-triggered animation (Reveal on Scroll)
// ============================================
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================
// HOOK: Animated counter
// ============================================
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { ref, count };
}

// ============================================
// HEADER — Transparente → sólido no scroll
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
          <span className={`text-xl font-bold transition-colors ${scrolled ? "text-[#003054]" : "text-white"}`}>
            Leme
          </span>
        </Link>

        {/* Nav — desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Como funciona", href: "#como-funciona" },
            { label: "Preço", href: "#preco" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                scrolled ? "text-[#003054]/60 hover:text-[#003054]" : "text-white/60 hover:text-white"
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className={`text-sm font-medium transition-colors ${
              scrolled ? "text-[#003054]/60 hover:text-[#003054]" : "text-white/60 hover:text-white"
            }`}
          >
            Entrar
          </Link>
          <Link
            href="/analise"
            className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
              scrolled
                ? "bg-[#E07B2A] text-white hover:bg-[#d06b1e]"
                : "bg-white text-[#003054] hover:bg-gray-100"
            }`}
          >
            Comece grátis
          </Link>
        </div>
      </div>
    </header>
  );
}

// ============================================
// HERO
// ============================================
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-[#003054] overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[70%] bg-gradient-to-bl from-[#004a7c]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[50%] h-[60%] bg-gradient-to-tr from-[#E07B2A]/10 to-transparent" />
        <div className="hidden md:block absolute top-[20%] left-[10%] w-2 h-2 bg-[#E07B2A] rounded-full animate-pulse" />
        <div className="hidden md:block absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-white/30 rounded-full" />
        <div className="hidden md:block absolute bottom-[25%] left-[20%] w-3 h-3 border border-white/15 rounded-full" />
        <div className="hidden md:block absolute -bottom-[200px] -left-[100px] w-[400px] h-[400px] border border-white/5 rounded-full" />
        <div className="hidden md:block absolute -top-[150px] -right-[150px] w-[500px] h-[500px] border border-[#E07B2A]/8 rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
                <Lock className="w-4 h-4 text-[#E07B2A]" />
                <span className="text-sm text-white/80">Seus dados não são compartilhados</span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-3xl sm:text-4xl lg:text-[3.2rem] font-bold leading-[1.35] mb-6">
                <span className="text-white">Entenda suas finanças.</span>
                <br />
                <span className="text-[#E07B2A]">Tome decisões melhores.</span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-lg text-white/60 max-w-md mb-2">
                Uma análise feita sob medida para o seu negócio — sem planilha, sem jargão.
              </p>
            </Reveal>

            <Reveal delay={250}>
              <p className="text-sm text-white/35 mb-8">
                Criado por especialistas em finanças para pequenas empresas.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-wrap gap-6 mb-10 text-white/60 text-sm">
                {["Sem planilhas", "Sem CNPJ", "100% online"].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E07B2A]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div>
                <Link
                  href="/analise"
                  className="group inline-flex items-center gap-3 bg-[#E07B2A] hover:bg-[#d06b1e] text-white px-8 py-4 text-lg font-semibold rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-[#E07B2A]/20"
                >
                  Comece grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <p className="text-white/40 text-sm mt-3 ml-1">Sem cadastro. Resultado em minutos.</p>
              </div>
            </Reveal>
          </div>

          {/* Dashboard mockup — GIF placeholder */}
          <Reveal delay={300} className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-[#E07B2A]/8 rounded-3xl blur-3xl scale-90" />
              <div className="relative animate-float">
                <div className="bg-white/95 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header do mockup */}
                  <div className="bg-gradient-to-r from-[#003054] to-[#004a7c] px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/50 text-xs uppercase tracking-wide">Dashboard Pro</p>
                      <p className="text-white font-semibold">Sua Empresa</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">Score</p>
                      <p className="text-[#00c894] font-bold text-3xl">72</p>
                    </div>
                  </div>

                  {/* Indicadores */}
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: TrendingUp, label: "Margem Bruta", value: "34%", status: "Saudável", statusColor: "text-green-600" },
                        { icon: Clock, label: "Fôlego de Caixa", value: "47 dias", status: "Atenção", statusColor: "text-yellow-600" },
                        { icon: Target, label: "Equilíbrio", value: "R$ 38k", status: "Atingido", statusColor: "text-green-600" },
                        { icon: MessageSquare, label: "Chat IA", value: "Online", status: "24/7", statusColor: "text-[#00c894]" },
                      ].map((item, i) => (
                        <div key={i} className="bg-gray-50/80 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <item.icon className="w-4 h-4 text-[#003054]" />
                            <span className="text-xs text-gray-500">{item.label}</span>
                          </div>
                          <p className="text-lg font-bold text-[#003054]">{item.value}</p>
                          <p className={`text-xs ${item.statusColor}`}>● {item.status}</p>
                        </div>
                      ))}
                    </div>

                    {/* Health bar */}
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Saúde Financeira</span>
                        <span className="text-green-600 font-medium">Boa</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full w-[72%] bg-gradient-to-r from-[#00c894] to-[#00a87a] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-3 -left-3 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#00c894] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">Diagnóstico</p>
                    <p className="text-sm font-bold text-[#003054]">Completo</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

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
// COMO FUNCIONA — 3 passos
// ============================================
export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 lg:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-16">
            <p className="text-[#E07B2A] font-semibold mb-3 uppercase tracking-wide text-sm">Como funciona</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#003054] mb-3">Simples assim</h2>
            <p className="text-gray-500">Você responde. Nós analisamos. Você decide.</p>
          </div>
        </Reveal>

        <div className="relative">
          {/* Linha conectora desktop */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#E07B2A] via-[#003054] to-[#00c894] opacity-20" />

          <div className="grid md:grid-cols-3 gap-10 md:gap-8">
            {[
              {
                num: "01",
                title: "Responda perguntas simples",
                desc: "Sobre o dia a dia do seu negócio. Estimativas já são suficientes.",
                color: "bg-[#E07B2A]",
              },
              {
                num: "02",
                title: "Receba seu diagnóstico",
                desc: "Score, indicadores, pontos fortes e o que merece atenção.",
                color: "bg-[#003054]",
              },
              {
                num: "03",
                title: "Aja com clareza",
                desc: "Plano de ação, simuladores e consultor IA para te guiar.",
                color: "bg-[#00c894]",
              },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="text-center relative">
                  <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg relative z-10`}>
                    <span className="text-white font-bold text-xl">{step.num}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#003054] mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SPOTLIGHT — ChatConsultor IA
// ============================================
export function SpotlightChat() {
  const [typing, setTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const { ref, visible } = useReveal();

  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setTyping(true), 600);
    const t2 = setTimeout(() => { setTyping(false); setShowResponse(true); }, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  return (
    <section className="py-20 lg:py-28 bg-[#003054] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[40%] h-[50%] bg-gradient-to-bl from-[#004a7c]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-[30%] h-[40%] bg-gradient-to-tr from-[#E07B2A]/8 to-transparent" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <Reveal>
              <p className="text-[#E07B2A] font-semibold mb-3 uppercase tracking-wide text-sm">Consultor IA</p>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Um consultor que já conhece
                <br />
                <span className="text-[#00c894]">seus números.</span>
              </h2>
              <p className="text-white/60 text-lg mb-6 max-w-md">
                Disponível 24 horas, 7 dias por semana. Sem precisar explicar tudo de novo.
              </p>
            </Reveal>

            <Reveal delay={200}>
              <div className="space-y-4 mb-8">
                {[
                  "Respostas baseadas nos dados reais da sua empresa",
                  "Sugestões práticas, não teoria genérica",
                  "Pergunte qualquer coisa sobre seus números",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#00c894] flex-shrink-0" />
                    <p className="text-white/70 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={300}>
              <p className="text-white/40 text-sm italic">Feito sob medida para o seu negócio.</p>
            </Reveal>
          </div>

          {/* Chat simulation */}
          <div ref={ref}>
            <Reveal delay={200}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 max-w-md mx-auto lg:mx-0 lg:ml-auto">
                {/* Chat header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#00c894] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">ChatConsultor Leme</p>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#00c894] animate-pulse" />
                      <p className="text-[#00c894] text-xs">Online agora</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 min-h-[200px]">
                  {/* User message */}
                  <div className={`flex justify-end transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                    <div className="bg-[#E07B2A]/20 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                      <p className="text-[#E07B2A] text-sm">Como posso melhorar minha margem?</p>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  {typing && (
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#00c894] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">L</span>
                      </div>
                      <div className="bg-white/8 rounded-2xl rounded-bl-sm px-4 py-3">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bot response */}
                  {showResponse && (
                    <div className="flex items-start gap-2 transition-all duration-500 opacity-100 translate-y-0">
                      <div className="w-7 h-7 rounded-full bg-[#00c894] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">L</span>
                      </div>
                      <div className="bg-white/8 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%]">
                        <p className="text-white/85 text-sm leading-relaxed">
                          Sua margem bruta está em <span className="text-[#00c894] font-semibold">34%</span>. O principal peso são os custos com fornecedores (<span className="text-[#E07B2A] font-semibold">42% da receita</span>). Renegociar prazos com os 3 maiores pode subir a margem para ~40%.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// O QUE VOCÊ RECEBE (GRÁTIS)
// ============================================
export function FreeValue() {
  const features = [
    { icon: TrendingUp, title: "Score 0–100", desc: "Saúde geral da empresa" },
    { icon: BarChart3, title: "8 indicadores", desc: "Margem, fôlego, equilíbrio" },
    { icon: Zap, title: "Pontos fortes", desc: "O que está funcionando" },
    { icon: Target, title: "Pontos de atenção", desc: "Onde agir primeiro" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F8F7F5]">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-[#E07B2A] font-semibold mb-3 uppercase tracking-wide text-sm">Gratuito</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#003054] mb-3">O que você recebe — sem pagar nada</h2>
            <p className="text-gray-500">Valor real desde o primeiro acesso.</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300 h-full">
                <div className="w-12 h-12 rounded-xl bg-[#003054]/5 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-[#003054]" />
                </div>
                <h3 className="font-bold text-[#003054] mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400}>
          <div className="text-center mt-10">
            <Link
              href="/analise"
              className="inline-flex items-center gap-2 text-[#E07B2A] font-semibold hover:gap-3 transition-all"
            >
              Começar minha análise
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================
// O QUE O PRO DESBLOQUEIA
// ============================================
export function ProFeatures() {
  const features = [
    { icon: Shield, title: "Simulador de sobrevivência", desc: "Quantos dias seu caixa aguenta sem faturar", color: "text-[#E07B2A]", bg: "bg-[#E07B2A]/10" },
    { icon: BarChart3, title: "Simulador de cenários", desc: "\"E se eu cortasse 20% dos custos?\"", color: "text-[#00c894]", bg: "bg-[#00c894]/10" },
    { icon: MessageSquare, title: "ChatConsultor IA 24/7", desc: "Já conhece seus números", color: "text-[#003054]", bg: "bg-[#003054]/10" },
    { icon: Target, title: "Plano de ação personalizado", desc: "O que fazer hoje, no mês e no trimestre — com resultado esperado", color: "text-[#E07B2A]", bg: "bg-[#E07B2A]/10" },
    { icon: Zap, title: "Resumo executivo IA", desc: "Análise completa em linguagem clara", color: "text-[#00c894]", bg: "bg-[#00c894]/10" },
    { icon: TrendingUp, title: "Histórico e evolução", desc: "Acompanhe mês a mês como seu score evolui", color: "text-[#003054]", bg: "bg-[#003054]/10" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-[#E07B2A] font-semibold mb-3 uppercase tracking-wide text-sm">Leme Pro</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#003054] mb-3">O que o Pro desbloqueia</h2>
            <p className="text-gray-500">Tudo do gratuito, mais as ferramentas que mudam o jogo.</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="border border-gray-100 rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg hover:border-gray-200 transition-all duration-300 h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center flex-shrink-0`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#003054] mb-1 text-sm">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Video placeholder */}
        <Reveal delay={300}>
          <div className="max-w-2xl mx-auto bg-[#003054] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 hover:bg-white/20 transition-colors cursor-pointer">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
            <p className="text-white/60 text-sm">Veja o Leme Pro em ação</p>
            <p className="text-white/30 text-xs mt-1">Vídeo em breve</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================
// PARA QUEM É O LEME — Carrossel
// ============================================
export function ParaQuem() {
  const perfis = [
    { emoji: "🍽", label: "Restaurantes" },
    { emoji: "🏪", label: "Comércio local" },
    { emoji: "💼", label: "Prestadores de serviço" },
    { emoji: "💇", label: "Saúde e beleza" },
    { emoji: "🎓", label: "Educação" },
    { emoji: "🔧", label: "Profissionais liberais" },
    { emoji: "🏗", label: "Construção" },
    { emoji: "🚗", label: "Automotivo" },
  ];

  // Duplica para loop infinito
  const duplicated = [...perfis, ...perfis];

  return (
    <section className="py-20 lg:py-28 bg-[#F8F7F5] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 mb-10">
        <Reveal>
          <div className="text-center">
            <p className="text-[#E07B2A] font-semibold mb-3 uppercase tracking-wide text-sm">Para quem</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#003054] mb-3">O Leme é para o seu tipo de negócio</h2>
            <p className="text-gray-500">Funciona para qualquer segmento de micro e pequena empresa.</p>
          </div>
        </Reveal>
      </div>

      {/* Carrossel auto-scroll */}
      <div className="relative">
        <div className="flex gap-4 animate-scroll">
          {duplicated.map((p, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[140px] bg-white rounded-2xl p-5 text-center border border-gray-100 hover:shadow-md transition-shadow"
            >
              <span className="text-3xl block mb-2">{p.emoji}</span>
              <p className="text-sm font-semibold text-[#003054]">{p.label}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
          width: max-content;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

// ============================================
// PREÇO
// ============================================
export function Preco() {
  const [anual, setAnual] = useState(false);

  return (
    <section id="preco" className="py-20 lg:py-28 bg-white">
      <div className="max-w-xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-[#E07B2A] font-semibold mb-3 uppercase tracking-wide text-sm">Preço</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#003054]">Comece de graça. Evolua quando quiser.</h2>
          </div>
        </Reveal>

        <Reveal delay={100}>
          {/* Toggle */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setAnual(false)}
              className={`px-6 py-2 text-sm font-semibold rounded-l-full transition-all ${
                !anual ? "bg-[#003054] text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setAnual(true)}
              className={`px-6 py-2 text-sm font-semibold rounded-r-full transition-all ${
                anual ? "bg-[#003054] text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              Anual
            </button>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="border-2 border-[#E07B2A] rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E07B2A]/5 rounded-full blur-2xl" />

            <div className="relative">
              <p className="text-sm text-gray-500 mb-1">Leme Pro</p>

              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-lg text-gray-400">R$</span>
                <span className="text-5xl font-bold text-[#003054] transition-all duration-300">
                  {anual ? "75" : "97"}
                </span>
                <span className="text-gray-400">/mês</span>
              </div>

              {anual && (
                <p className="text-[#00c894] font-semibold text-sm mb-4">
                  R$ 900/ano — economize 2 meses
                </p>
              )}
              {!anual && (
                <p className="text-gray-400 text-sm mb-4">
                  No anual: R$ 75/mês (economize 2 meses)
                </p>
              )}

              <Link
                href="/assinar"
                className="block w-full bg-[#E07B2A] hover:bg-[#d06b1e] text-white py-4 rounded-full font-semibold text-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-[#E07B2A]/20"
              >
                Comece agora →
              </Link>

              <p className="text-gray-400 text-sm mt-4">Sem compromisso. Cancele quando quiser.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <p className="text-center text-gray-400 text-sm mt-6 italic">
            Feito sob medida para o seu negócio.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================
// FAQ
// ============================================
export function FAQ() {
  const [aberto, setAberto] = useState<number | null>(null);

  const perguntas = [
    {
      q: "Preciso de CNPJ ou contador para usar?",
      r: "Não. O Leme foi feito para ser usado por qualquer dono de negócio, com ou sem CNPJ formal, com ou sem contador. Você não precisa saber nada de contabilidade.",
    },
    {
      q: "Meus dados ficam seguros?",
      r: "Seus dados são seus. O Leme não vende, não compartilha e não usa suas informações para nada além de gerar sua análise. O que você coloca aqui fica aqui.",
    },
    {
      q: "Posso cancelar a qualquer momento?",
      r: "Sim. Sem multa, sem burocracia. Você cancela quando quiser diretamente pelo painel, e o acesso continua até o fim do período já pago.",
    },
    {
      q: "O que muda do Free para o Pro?",
      r: "O Free entrega seu score, indicadores e diagnóstico. O Pro adiciona simuladores, plano de ação completo, histórico, resumo executivo e o ChatConsultor IA — seu consultor financeiro 24h.",
    },
    {
      q: "Preciso ter os números exatos na cabeça?",
      r: "Estimativas já funcionam bem. O diagnóstico é útil mesmo com valores aproximados — e ao longo do tempo, conforme você atualiza com mais precisão, o resultado fica mais afinado.",
    },
    {
      q: "Qual a diferença entre o Leme e um contador?",
      r: "O contador cuida da parte legal, fiscal e tributária. O Leme cuida da gestão financeira do dia a dia: margem real, fôlego de caixa, onde você pode estar perdendo dinheiro. São complementares.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#F8F7F5]">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <div className="text-center mb-14">
            <p className="text-[#E07B2A] font-semibold mb-3 uppercase tracking-wide text-sm">Dúvidas</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#003054]">
              Perguntas que todo empresário faz antes de começar
            </h2>
          </div>
        </Reveal>

        <div className="divide-y divide-gray-200">
          {perguntas.map((item, i) => (
            <Reveal key={i} delay={i * 50}>
              <div>
                <button
                  onClick={() => setAberto(aberto === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-semibold text-[#003054]">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      aberto === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    aberto === i ? "max-h-96 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="text-gray-600 leading-relaxed">{item.r}</p>
                </div>
              </div>
            </Reveal>
          ))}
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
    <section className="py-24 lg:py-32 bg-[#003054] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E07B2A]/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Entenda suas finanças. <span className="text-[#E07B2A]">Decida com mais segurança.</span>
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <p className="text-lg text-white/60 mb-3 max-w-xl mx-auto">
            Grátis e confidencial. Resultado em minutos.
          </p>
          <p className="text-white/40 mb-10">
            Sem compromisso. Dados sob seu controle.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <Link
            href="/analise"
            className="group inline-flex items-center gap-3 bg-[#E07B2A] hover:bg-[#d06b1e] text-white px-10 py-5 text-lg font-semibold rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-[#E07B2A]/20"
          >
            Comece grátis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Reveal>

        <Reveal delay={300}>
          <div className="flex items-center justify-center gap-2 mt-6 text-white/30">
            <Lock className="w-3.5 h-3.5" />
            <span className="text-sm">Seus dados permanecem privados</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================
// STICKY CTA MOBILE
// ============================================
export function StickyCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setShow(scrollPercent > 0.15 && scrollPercent < 0.9);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 md:hidden transition-transform duration-300 ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <Link
        href="/analise"
        className="block w-full bg-[#E07B2A] hover:bg-[#d06b1e] text-white py-3.5 rounded-full font-semibold text-center transition-all shadow-lg shadow-[#E07B2A]/20"
      >
        Comece grátis →
      </Link>
    </div>
  );
}

// ============================================
// FOOTER
// ============================================
export function Footer() {
  return (
    <footer className="py-10 bg-[#001f3a]">
      <div className="max-w-6xl mx-auto px-6">
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

        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-white/25 text-xs">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Rio de Janeiro, RJ</span>
            </div>
            <span>Especialistas com +10 anos em análise de empresas</span>
          </div>
          <p className="text-white/25 text-xs">© 2026 Leme. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}