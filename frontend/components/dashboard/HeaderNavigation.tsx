// components/dashboard/HeaderNavigation.tsx
// Header integrado com navegação sticky — versão Free (sem cadeados)

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, BarChart3, Stethoscope, Lightbulb } from 'lucide-react';

const navItems = [
  { id: 'resumo',      label: 'Saúde',       icon: LayoutDashboard },
  { id: 'diagnostico', label: 'Diagnóstico',  icon: Stethoscope },
  { id: 'indicadores', label: 'Indicadores',  icon: BarChart3 },
  { id: 'plano',       label: 'O que fazer',  icon: Lightbulb },
];

export default function HeaderNavigation() {
  const [activeSection, setActiveSection] = useState('resumo');

  useEffect(() => {
    const sectionIds = ['resumo', 'simulador', 'diagnostico', 'indicadores', 'plano', 'pro'];

    const sectionToNav: Record<string, string> = {
      resumo:      'resumo',
      simulador:   'resumo',
      diagnostico: 'diagnostico',
      indicadores: 'indicadores',
      plano:       'plano',
      pro:         'plano',
    };

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

        for (const id of sectionIds) {
          if (visibleSections.has(id)) {
            const navId = sectionToNav[id];
            if (navId) setActiveSection(navId);
            break;
          }
        }
      },
      { rootMargin: '-140px 0px -40% 0px', threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({ top: element.offsetTop - 140, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* Logo e Nova Análise */}
        <div className="flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.svg" alt="Leme" width={32} height={32} className="h-8 w-auto" />
            <span className="font-bold text-primary text-xl">Leme</span>
          </Link>
          <Link href="/analise" className="text-sm text-primary hover:text-primary/80 transition-colors">
            Nova Análise
          </Link>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
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
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}