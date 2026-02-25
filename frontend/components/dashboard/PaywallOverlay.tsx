// components/dashboard/PaywallOverlay.tsx
// Paywall v3 — frase de impacto personalizada + texto orientado a ação + garantia

"use client";

import { Lock, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

interface PaywallOverlayProps {
  onDesbloquear: () => void;
  empresaNome?: string;
  fraseImpacto?: string; // Frase calculada com dados reais da empresa
  titulo?: string;
  descricao?: string;
  textoBotao?: string;
}

const BENEFICIOS = [
  "Diagnóstico completo: o que está forte e o que precisa de atenção",
  "Ações práticas divididas em essa semana, este mês e próximos 90 dias",
  "Cada ação com tempo estimado e dificuldade",
  "PDF para compartilhar com seu contador ou sócio",
];

export default function PaywallOverlay({
  onDesbloquear,
  empresaNome,
  fraseImpacto,
  titulo = "Descubra o que corrigir primeiro",
  descricao,
  textoBotao = "Ver meu plano de correção — R$ 19,90",
}: PaywallOverlayProps) {

  // Descrição padrão usa nome da empresa se disponível
  const descricaoPadrao = empresaNome
    ? `Ações práticas baseadas nos números da ${empresaNome} — não conselhos genéricos.`
    : "Ações práticas baseadas nos seus números — não conselhos genéricos.";

  return (
    <div className="px-4 sm:px-0 py-6">
      <div className="bg-white rounded-2xl shadow-lg border border-border/60 p-6 sm:p-8 max-w-md mx-auto text-center">

        {/* Frase de impacto personalizada — aparece acima de tudo */}
        {fraseImpacto && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm sm:text-base font-medium text-amber-900 leading-relaxed">
              {fraseImpacto}
            </p>
          </div>
        )}

        {/* Ícone */}
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-primary" />
        </div>

        {/* Título */}
        <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
          {titulo}
        </h3>

        <p className="text-sm text-muted-foreground mb-5">
          {descricao || descricaoPadrao}
        </p>

        {/* Preço */}
        <div className="mb-5">
          <span className="text-3xl sm:text-4xl font-bold text-primary">R$ 19,90</span>
          <span className="text-muted-foreground ml-2 text-sm">único</span>
        </div>

        {/* Benefícios */}
        <div className="text-left space-y-2.5 mb-6">
          {BENEFICIOS.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
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

        {/* Info de pagamento */}
        <p className="text-xs text-muted-foreground mt-3">
          Pagamento único. Sem assinatura. Sem surpresas.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PIX ou Cartão de Crédito/Débito
        </p>

        {/* Garantia */}
        <div className="mt-4 pt-4 border-t border-border/40">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span>Se não te ajudar, devolvemos em 7 dias.</span>
          </div>
        </div>
      </div>
    </div>
  );
}