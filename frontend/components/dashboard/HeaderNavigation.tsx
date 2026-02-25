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
  History 
} from 'lucide-react';

const anchors = [
  { id: 'resumo', label: 'Resumo', icon: LayoutDashboard },
  { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
  { id: 'diagnostico', label: 'Diagnóstico', icon: Stethoscope },
  { id: 'plano', label: 'O que fazer', icon: Lightbulb },
  { id: 'historico', label: 'Histórico', icon: History },
];

export default function HeaderNavigation() {
  const [activeSection, setActiveSection] = useState('resumo');

  // Detecta qual seção está visível
  useEffect(() => {
    const handleScroll = () => {
      const sections = anchors.map(a => document.getElementById(a.id));
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(anchors[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          {anchors.map((anchor) => {
            const Icon = anchor.icon;
            const isActive = activeSection === anchor.id;
            
            return (
              <button
                key={anchor.id}
                onClick={() => scrollToSection(anchor.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  whitespace-nowrap transition-all duration-300
                  ${isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{anchor.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}