// components/dashboard/PaywallOverlay.tsx
// Paywall v2 — contextualizado por seção, com variação por perfil

"use client";

import { Lock, CheckCircle, Zap } from 'lucide-react';

interface PaywallOverlayProps {
  onDesbloquear: () => void;
  titulo?: string;
  descricao?: string;
  textoBotao?: string;
  children?: React.ReactNode;
}

const BENEFICIOS = [
  "Diagnóstico dos pontos fortes e de melhoria",
  "12 ações práticas baseadas nos seus números",
  "Histórico de evolução da empresa",
  "Relatório completo em PDF",
];

export default function PaywallOverlay({
  onDesbloquear,
  titulo = "Seu plano de ação está pronto",
  descricao = "12 ações práticas divididas em 30, 60 e 90 dias — personalizadas para o seu negócio",
  textoBotao = "Desbloquear por R$ 19,90",
}: PaywallOverlayProps) {
  return (
    <div className="px-4 sm:px-0 py-6">
      <div className="bg-white rounded-2xl shadow-lg border border-border/60 p-6 sm:p-8 max-w-md mx-auto text-center">
        {/* Ícone */}
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-primary" />
        </div>

        {/* Título */}
        <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
          {titulo}
        </h3>

        <p className="text-sm text-muted-foreground mb-5">
          {descricao}
        </p>

        {/* Preço */}
        <div className="mb-5">
          <span className="text-3xl sm:text-4xl font-bold text-primary">R$ 19,90</span>
          <span className="text-muted-foreground ml-2 text-sm">único</span>
        </div>

        {/* Benefícios */}
        <div className="text-left space-y-2.5 mb-6">
          {BENEFICIOS.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>

        {/* Botão */}
        <button
          onClick={onDesbloquear}
          className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-base hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" />
          {textoBotao}
        </button>

        {/* Formas de pagamento */}
        <p className="text-xs text-muted-foreground mt-3">
          PIX ou Cartão de Crédito/Débito
        </p>
      </div>
    </div>
  );
}