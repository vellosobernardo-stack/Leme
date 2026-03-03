// components/dashboard/HeaderNavigation.tsx
// Header integrado com navegação sticky
// v2 — "Plano 30/60/90" → "O que fazer"

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  BarChart3, 
  Stethoscope, 
  Lightbulb, 
  History,
  Lock
} from 'lucide-react';

// Botões visíveis na navegação
const navItems = [
  { id: 'resumo', label: 'Saúde', icon: LayoutDashboard, pago: false },
  { id: 'diagnostico', label: 'Diagnóstico', icon: Stethoscope, pago: true },
  { id: 'plano', label: 'O que fazer', icon: Lightbulb, pago: true },
  { id: 'indicadores', label: 'Indicadores', icon: BarChart3, pago: false },
  { id: 'historico', label: 'Histórico', icon: History, pago: true },
];


export default function HeaderNavigation({ pago = false }: { pago?: boolean }) {
  const [activeSection, setActiveSection] = useState('resumo');

  // Detecta qual seção está visível via IntersectionObserver
  useEffect(() => {
    // IDs de todas as seções na página, na ordem real
    const sectionIds = ['resumo', 'simulador', 'diagnostico', 'plano', 'indicadores', 'valuation', 'historico'];
    
    // Mapeia seção da página → botão da nav
    const sectionToNav: Record<string, string> = {
      resumo: 'resumo',
      simulador: 'resumo',
      diagnostico: 'diagnostico',
      plano: 'plano',
      indicadores: 'indicadores',
      valuation: 'indicadores',
      historico: 'historico',
    };

    // Guarda qual seção está mais visível
    const visibleSections = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleSections.delete(entry.target.id);
          }
        });

        // Pega a seção visível que aparece primeiro na ordem da página
        for (const id of sectionIds) {
          if (visibleSections.has(id)) {
            const navId = sectionToNav[id];
            if (navId) {
              setActiveSection(navId);
            }
            break;
          }
        }
      },
      {
        rootMargin: '-140px 0px -40% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll suave para a seção
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 140;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Linha 1: Logo e Nova Análise */}
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/logo.svg" 
              alt="Leme" 
              width={32} 
              height={32} 
              className="h-8 w-auto" 
            />
            <span className="font-bold text-primary text-xl">Leme</span>
          </Link>
          <Link 
            href="/analise" 
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Nova Análise
          </Link>
        </div>

        {/* Linha 2: Navegação */}
        <div className="flex items-center justify-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const isLocked = item.pago && !pago;
            
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap transition-all duration-300
                  ${isActive 
                    ? isLocked
                      ? 'bg-amber-100 text-amber-700 shadow-sm'
                      : 'bg-primary text-white shadow-md'
                    : isLocked
                      ? 'text-amber-600/60 hover:bg-amber-50 hover:text-amber-700'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                  }
                `}
              >
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}