'use client';

// components/pro/ProHeader.tsx
// Header fixo do dashboard Pro — nome da empresa + mês de referência,
// badge PRO, botão Nova Análise e logout.
// Fica acima do conteúdo, NÃO acima da sidebar (a sidebar tem seu próprio topo).

import Link from 'next/link';
import { PlusCircle, LogOut, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProHeaderProps {
  nomeEmpresa: string;
  mesLabel: string;
  setor: string;
}

export default function ProHeader({ nomeEmpresa, mesLabel, setor }: ProHeaderProps) {
  const { logout } = useAuth();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

        .pro-header-bar {
          position: fixed;
          top: 0;
          left: 240px;
          right: 0;
          height: 60px;
          background: #ffffff;
          border-bottom: 1px solid rgba(0, 48, 84, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 28px;
          z-index: 30;
          font-family: 'DM Sans', sans-serif;
        }

        /* Mobile: ocupa largura toda, faixa de topo gradiente */
        @media (max-width: 1023px) {
          .pro-header-bar {
            left: 0;
            padding: 0 16px;
            border-top: 3px solid transparent;
            background:
              linear-gradient(#fff, #fff) padding-box,
              linear-gradient(90deg, #003054 0%, #E07B2A 50%, #003054 100%) border-box;
          }
        }

        /* Botão voltar */
        .header-back {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #9ca3af;
          text-decoration: none;
          flex-shrink: 0;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .header-back:hover { color: #003054; }

        /* Mobile: esconde label, mantém só a seta */
        .header-back-label { display: inline; }
        @media (max-width: 1023px) {
          .header-back-label { display: none; }
        }

        /* Separador vertical — só desktop */
        .header-sep {
          width: 1px;
          height: 20px;
          background: rgba(0, 48, 84, 0.1);
          flex-shrink: 0;
        }
        @media (max-width: 1023px) {
          .header-sep { display: none; }
        }

        /* Empresa + meta — ocupa o espaço disponível */
        .header-empresa {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .header-empresa-nome {
          font-size: 14px;
          font-weight: 700;
          color: #003054;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .header-empresa-meta {
          font-size: 11px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Mobile: esconde nome, mostra só a meta (setor + mês) */
        @media (max-width: 639px) {
          .header-empresa-nome { display: none; }
        }

        /* Ações à direita */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          margin-left: auto;
        }

        /* Badge PRO — esconde no mobile (já aparece na barra inferior) */
        .pro-badge-header {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border: 1.5px solid #4ECBA4;
          border-radius: 100px;
          color: #4ECBA4;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(78, 203, 164, 0.08);
          white-space: nowrap;
        }
        @media (max-width: 1023px) {
          .pro-badge-header { display: none; }
        }

        /* Botão Nova Análise */
        .btn-nova-header {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #003054;
          color: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .btn-nova-header:hover { background: #004070; }

        /* Mobile: esconde label, mantém só ícone */
        .btn-nova-label { display: inline; }
        @media (max-width: 639px) {
          .btn-nova-label { display: none; }
          .btn-nova-header { padding: 8px 10px; }
        }

        /* Logout */
        .btn-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid rgba(0, 48, 84, 0.15);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.15s, border-color 0.15s;
          flex-shrink: 0;
        }
        .btn-logout:hover {
          color: #003054;
          border-color: rgba(0, 48, 84, 0.3);
        }
      `}</style>

      <header className="pro-header-bar">

        {/* Voltar */}
        <Link href="/dashboard/pro" className="header-back">
          <ArrowLeft size={15} />
          <span className="header-back-label">Minhas análises</span>
        </Link>

        {/* Separador — só desktop */}
        <div className="header-sep" />

        {/* Empresa + mês */}
        <div className="header-empresa">
          <span className="header-empresa-nome">{nomeEmpresa}</span>
          <span className="header-empresa-meta">
            <Calendar size={11} />
            {setor} · Ref. {mesLabel}
          </span>
        </div>

        {/* Ações */}
        <div className="header-actions">
          <span className="pro-badge-header">Pro</span>

          <Link href="/analise" className="btn-nova-header">
            <PlusCircle size={15} />
            <span className="btn-nova-label">Nova Análise</span>
          </Link>

          <button
            className="btn-logout"
            onClick={logout}
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut size={16} />
          </button>
        </div>

      </header>
    </>
  );
}