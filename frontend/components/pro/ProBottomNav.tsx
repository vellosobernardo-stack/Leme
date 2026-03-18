'use client';

// components/pro/ProBottomNav.tsx
// Barra inferior fixa mobile — navegação por views do dashboard Pro
// Visível apenas em <lg (≤1023px). No desktop, substituída pelo ProSidebar.
// 5 itens principais + item "Mais" que abre drawer com Financeiro e Histórico.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Stethoscope,
  BarChart2,
  CheckSquare,
  Gem,
  History,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { ViewSlug } from './ProSidebar';

// Os 5 itens fixos da barra inferior
const BOTTOM_ITEMS: { slug: ViewSlug; label: string; icon: React.ReactNode }[] = [
  { slug: 'visao-geral',   label: 'Visão Geral',   icon: <LayoutDashboard size={22} /> },
  { slug: 'simuladores',   label: 'Simuladores',   icon: <Activity        size={22} /> },
  { slug: 'diagnostico',   label: 'Diagnóstico',   icon: <Stethoscope     size={22} /> },
  { slug: 'indicadores',   label: 'Indicadores',   icon: <BarChart2       size={22} /> },
  { slug: 'plano-de-acao', label: 'Plano de Ação', icon: <CheckSquare     size={22} /> },
];

// Itens do drawer "Mais"
const MAIS_ITEMS: { slug: ViewSlug; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    slug: 'financeiro',
    label: 'Financeiro',
    icon: <Gem size={20} />,
    desc: 'Valuation e Payback da sua empresa',
  },
];

interface ProBottomNavProps {
  analiseId: string;
  viewAtiva: ViewSlug;
}

export default function ProBottomNav({ analiseId, viewAtiva }: ProBottomNavProps) {
  const router = useRouter();
  const [drawerAberto, setDrawerAberto] = useState(false);

  function navegar(slug: ViewSlug) {
    setDrawerAberto(false);
    router.push(`/dashboard/pro/${analiseId}?view=${slug}`, { scroll: false });
  }

  // O item "Mais" fica ativo quando a view atual é financeiro ou historico
  const maisAtivo = viewAtiva === 'financeiro';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        /* ---- Barra inferior ---- */
        .pro-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #ffffff;
          border-top: 1px solid rgba(0, 48, 84, 0.08);
          display: flex;
          align-items: stretch;
          z-index: 40;
          font-family: 'DM Sans', sans-serif;
        }

        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0 4px;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s;
        }
        .bottom-nav-item:active {
          background: rgba(0, 48, 84, 0.04);
        }

        .bottom-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          transition: color 0.15s;
        }
        .bottom-nav-label {
          font-size: 10px;
          font-weight: 500;
          color: #9ca3af;
          transition: color 0.15s;
          white-space: nowrap;
        }

        /* Estado ativo */
        .bottom-nav-item.ativo .bottom-nav-icon,
        .bottom-nav-item.ativo .bottom-nav-label {
          color: #003054;
        }
        .bottom-nav-item.ativo .bottom-nav-label {
          font-weight: 600;
        }

        /* ---- Overlay do drawer ---- */
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 45;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s;
        }
        .drawer-overlay.aberto {
          opacity: 1;
          pointer-events: all;
        }

        /* ---- Drawer de baixo ---- */
        .drawer-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #ffffff;
          border-radius: 20px 20px 0 0;
          z-index: 50;
          padding: 0 0 32px;
          transform: translateY(100%);
          transition: transform 0.28s cubic-bezier(0.32, 0.72, 0, 1);
          font-family: 'DM Sans', sans-serif;
        }
        .drawer-sheet.aberto {
          transform: translateY(0);
        }

        .drawer-handle {
          display: flex;
          justify-content: center;
          padding: 12px 0 8px;
        }
        .drawer-handle-bar {
          width: 36px;
          height: 4px;
          background: #e5e7eb;
          border-radius: 100px;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 20px 16px;
        }
        .drawer-titulo {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .drawer-close {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          -webkit-tap-highlight-color: transparent;
        }

        .drawer-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 12px;
        }

        .drawer-item {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 14px 12px;
          border-radius: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          -webkit-tap-highlight-color: transparent;
          transition: background 0.15s;
        }
        .drawer-item:active,
        .drawer-item:hover {
          background: #f9fafb;
        }
        .drawer-item.ativo {
          background: rgba(0, 48, 84, 0.06);
        }

        .drawer-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0, 48, 84, 0.06);
          color: #003054;
          flex-shrink: 0;
        }
        .drawer-item.ativo .drawer-item-icon {
          background: rgba(0, 48, 84, 0.12);
        }

        .drawer-item-text {}
        .drawer-item-label {
          font-size: 15px;
          font-weight: 600;
          color: #003054;
        }
        .drawer-item-desc {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 2px;
        }

        /* Só exibe no mobile */
        @media (min-width: 1024px) {
          .pro-bottom-nav,
          .drawer-overlay,
          .drawer-sheet { display: none; }
        }
      `}</style>

      {/* Barra inferior */}
      <nav className="pro-bottom-nav" aria-label="Navegação mobile">
        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.slug}
            className={`bottom-nav-item${viewAtiva === item.slug ? ' ativo' : ''}`}
            onClick={() => navegar(item.slug)}
            aria-label={item.label}
            aria-current={viewAtiva === item.slug ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}

        {/* Item "Mais" */}
        <button
          className={`bottom-nav-item${maisAtivo ? ' ativo' : ''}`}
          onClick={() => setDrawerAberto(true)}
          aria-label="Mais opções"
          aria-expanded={drawerAberto}
        >
          <span className="bottom-nav-icon">
            <MoreHorizontal size={22} />
          </span>
          <span className="bottom-nav-label">Mais</span>
        </button>
      </nav>

      {/* Overlay */}
      <div
        className={`drawer-overlay${drawerAberto ? ' aberto' : ''}`}
        onClick={() => setDrawerAberto(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`drawer-sheet${drawerAberto ? ' aberto' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mais opções de navegação"
      >
        <div className="drawer-handle">
          <div className="drawer-handle-bar" />
        </div>

        <div className="drawer-header">
          <span className="drawer-titulo">Mais seções</span>
          <button
            className="drawer-close"
            onClick={() => setDrawerAberto(false)}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-items">
          {MAIS_ITEMS.map((item) => (
            <button
              key={item.slug}
              className={`drawer-item${viewAtiva === item.slug ? ' ativo' : ''}`}
              onClick={() => navegar(item.slug)}
              aria-current={viewAtiva === item.slug ? 'page' : undefined}
            >
              <span className="drawer-item-icon">{item.icon}</span>
              <div className="drawer-item-text">
                <div className="drawer-item-label">{item.label}</div>
                <div className="drawer-item-desc">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
