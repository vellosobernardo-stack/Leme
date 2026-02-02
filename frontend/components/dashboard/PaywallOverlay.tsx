// components/dashboard/PaywallOverlay.tsx
// Overlay que mostra conteúdo borrado com CTA para desbloquear

"use client";

import { Lock, CheckCircle } from 'lucide-react';

interface PaywallOverlayProps {
  onDesbloquear: () => void;
  children: React.ReactNode;
}

export default function PaywallOverlay({ onDesbloquear, children }: PaywallOverlayProps) {
  return (
    <div className="relative">
      {/* Conteúdo borrado */}
      <div className="blur-sm pointer-events-none select-none opacity-60">
        {children}
      </div>

      {/* Overlay com CTA */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/40 via-white/80 to-white/40">
        <div className="bg-white rounded-2xl shadow-xl border border-border/40 p-8 max-w-md mx-4 text-center">
          {/* Ícone */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          {/* Título */}
          <h3 className="text-2xl font-bold text-primary mb-2">
            Saiba o que fazer nos próximos 90 dias
          </h3>

          {/* Preço */}
          <div className="mb-4">
            <span className="text-4xl font-bold text-primary">R$ 19,90</span>
            <span className="text-muted-foreground ml-2">pagamento único</span>
          </div>

          {/* Benefícios */}
          <ul className="text-left space-y-3 mb-6">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Planos de ação baseado nos seus números</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Checklist interativo para execução</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Histórico de evolução da sua empresa</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700">Relatório em PDF </span>
            </li>
          </ul>

          {/* Botão */}
          <button
            onClick={onDesbloquear}
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Ver meu plano de ação
          </button>

          {/* Formas de pagamento */}
          <p className="text-sm text-muted-foreground mt-4">
            PIX ou Cartão de Crédito/Débito
          </p>
        </div>
      </div>
    </div>
  );
}