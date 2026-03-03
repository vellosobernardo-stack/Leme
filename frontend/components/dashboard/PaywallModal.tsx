// components/dashboard/PaywallModal.tsx
// Modal que cria checkout Stripe e redireciona
// v2 — texto alinhado com PaywallOverlay v3

"use client";

import { useState } from 'react';
import { X, CreditCard, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  analiseId: string;
  empresaNome: string;
  onPagamentoConfirmado: () => void;
}

export default function PaywallModal({ 
  isOpen, 
  onClose, 
  analiseId, 
  empresaNome,
  onPagamentoConfirmado 
}: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Criar checkout e redirecionar
  const irParaCheckout = async () => {
    setLoading(true);
    setErro(null);

    try {
      const response = await fetch(`${API_URL}/pagamento/criar-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analise_id: analiseId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar checkout');
      }

      const data = await response.json();
      
      // Redireciona para página de checkout do Stripe
      window.location.href = data.checkout_url;

    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao processar. Tente novamente.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — slide up no mobile, centralizado no desktop */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-md w-full mx-0 sm:mx-4 max-h-[90vh] flex flex-col">
        {/* Header — sticky */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/40 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-primary">
            Finalizar compra
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo — scrollável */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Erro */}
          {erro && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{erro}</p>
            </div>
          )}

          {/* Resumo da compra */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5">
            <p className="text-sm text-muted-foreground mb-1">Você está desbloqueando:</p>
            <p className="font-semibold text-gray-900">{empresaNome}</p>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Diagnóstico + Plano de Correção</span>
                <span className="text-xl font-bold text-primary">R$ 19,90</span>
              </div>
            </div>
          </div>

          {/* O que está incluso */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-2">Incluso no desbloqueio:</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                Diagnóstico completo: pontos fortes e de atenção
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                Ações práticas com tempo estimado e dificuldade
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                Indicadores com explicação detalhada
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1.5"></span>
                PDF para compartilhar com contador ou sócio
              </li>
            </ul>
          </div>

          {/* Garantia */}
          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Se não te ajudar, devolvemos em 7 dias.</span>
            </div>
          </div>
        </div>

        {/* Botão — sticky no fundo do modal */}
        <div className="p-4 sm:p-6 pt-0 border-t border-border/40 bg-white rounded-b-2xl flex-shrink-0">
          <button
            onClick={irParaCheckout}
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white rounded-xl font-semibold text-base hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Ir para pagamento
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Pagamento único · PIX ou Cartão
          </p>
        </div>
      </div>
    </div>
  );
}