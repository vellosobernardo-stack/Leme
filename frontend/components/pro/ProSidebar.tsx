'use client';

// components/pro/ProSidebar.tsx
// Sidebar fixa desktop — navegação por views do dashboard Pro
// Visível apenas em lg+ (≥1024px). No mobile, substituída pelo ProBottomNav.

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Stethoscope,
  BarChart2,
  CheckSquare,
  Gem,
  History,
} from 'lucide-react';

export type ViewSlug =
  | 'visao-geral'
  | 'simuladores'
  | 'diagnostico'
  | 'indicadores'
  | 'plano-de-acao'
  | 'financeiro'
  | 'historico';

interface NavItem {
  slug: ViewSlug;
  label: string;
  icon: React.ReactNode;
  separator?: boolean; // exibe separador ANTES deste item
}

const NAV_ITEMS: NavItem[] = [
  { slug: 'visao-geral',   label: 'Visão Geral',   icon: <LayoutDashboard size={18} /> },
  { slug: 'simuladores',   label: 'Simuladores',   icon: <Activity        size={18} /> },
  { slug: 'diagnostico',   label: 'Diagnóstico',   icon: <Stethoscope     size={18} /> },
  { slug: 'indicadores',   label: 'Indicadores',   icon: <BarChart2       size={18} /> },
  { slug: 'plano-de-acao', label: 'Plano de Ação', icon: <CheckSquare     size={18} /> },
  { slug: 'financeiro',    label: 'Financeiro',    icon: <Gem             size={18} /> },
  { slug: 'historico',     label: 'Histórico',     icon: <History         size={18} />, separator: true },
];

interface ProSidebarProps {
  analiseId: string;
  viewAtiva: ViewSlug;
}

export default function ProSidebar({ analiseId, viewAtiva }: ProSidebarProps) {
  const router = useRouter();

  function navegar(slug: ViewSlug) {
    // shallow routing — não recarrega a página, só atualiza a query
    router.push(`/dashboard/pro/${analiseId}?view=${slug}`, { scroll: false });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .pro-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 240px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid rgba(0, 48, 84, 0.08);
          display: flex;
          flex-direction: column;
          z-index: 30;
          font-family: 'DM Sans', sans-serif;
        }

        /* Faixa de topo — igual ao restante do produto */
        .sidebar-topbar {
          height: 3px;
          background: linear-gradient(90deg, #003054 0%, #E07B2A 50%, #003054 100%);
          flex-shrink: 0;
        }

        /* Logo + badge Pro */
        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(0, 48, 84, 0.06);
          flex-shrink: 0;
          text-decoration: none;
        }
        .sidebar-brand-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sidebar-brand-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #003054;
          letter-spacing: -0.01em;
        }
        .sidebar-pro-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border: 1.5px solid #4ECBA4;
          border-radius: 100px;
          color: #4ECBA4;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(78, 203, 164, 0.08);
        }

        /* Lista de navegação */
        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 12px 12px 20px;
        }
        .sidebar-nav::-webkit-scrollbar { width: 0; }

        .sidebar-separator {
          height: 1px;
          background: rgba(0, 48, 84, 0.07);
          margin: 8px 4px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #6b7280;
          text-align: left;
          transition: background 0.15s, color 0.15s;
          border-left: 2px solid transparent;
        }
        .sidebar-item:hover {
          background: #f9fafb;
          color: #003054;
        }
        .sidebar-item.ativo {
          background: rgba(0, 48, 84, 0.07);
          color: #003054;
          font-weight: 600;
          border-left-color: #003054;
        }
        .sidebar-item-icon {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        /* Rodapé da sidebar — link para histórico geral */
        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(0, 48, 84, 0.06);
          flex-shrink: 0;
        }
        .sidebar-footer-link {
          font-size: 12px;
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.15s;
        }
        .sidebar-footer-link:hover {
          color: #003054;
        }

        /* Só exibe no desktop */
        @media (max-width: 1023px) {
          .pro-sidebar { display: none; }
        }
      `}</style>

      <aside className="pro-sidebar">
        <div className="sidebar-topbar" />

        {/* Brand */}
        <Link href="/" className="sidebar-brand">
          <div className="sidebar-brand-left">
            <Image
              src="/images/logo.svg"
              alt="Leme"
              width={28}
              height={28}
              style={{ height: 26, width: 'auto' }}
            />
            <span className="sidebar-brand-name">Leme</span>
          </div>
          <span className="sidebar-pro-badge">Pro</span>
        </Link>

        {/* Itens de navegação */}
        <nav className="sidebar-nav" aria-label="Navegação do dashboard">
          {NAV_ITEMS.map((item) => (
            <div key={item.slug}>
              {item.separator && <div className="sidebar-separator" />}
              <button
                className={`sidebar-item${viewAtiva === item.slug ? ' ativo' : ''}`}
                onClick={() => navegar(item.slug)}
                aria-current={viewAtiva === item.slug ? 'page' : undefined}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </nav>

        {/* Rodapé */}
        <div className="sidebar-footer">
          <Link href="/dashboard/pro" className="sidebar-footer-link">
            ← Todas as análises
          </Link>
        </div>
      </aside>
    </>
  );
}
