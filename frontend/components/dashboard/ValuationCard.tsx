// components/dashboard/ValuationCard.tsx
// Card de Valuation com estilo premium

import { Gem, Info } from 'lucide-react';
import { Valuation } from '@/types/dashboard';

interface ValuationCardProps {
  valuation: Valuation;
}

// Formata valores em R$
function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function ValuationCard({ valuation }: ValuationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/40 p-8 hover:shadow-md transition duration-300">
      {/* Ícone */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Gem className="w-6 h-6 text-primary" />
        </div>
      </div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-center text-muted-foreground mb-4">
        Valor da Empresa
      </h3>

      {/* Valor em destaque */}
      <div className="text-center mb-4">
        <p className="text-3xl lg:text-4xl font-bold text-primary">
          {formatarMoeda(valuation.valor_minimo)} - {formatarMoeda(valuation.valor_maximo)}
        </p>
      </div>

      {/* Explicação */}
      <p className="text-sm text-muted-foreground text-center mb-4">
        {valuation.explicacao}
      </p>

      {/* Divider */}
      <div className="border-t border-border/40 my-4"></div>

      {/* Nota de rodapé */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Valores estimativos baseados no múltiplo {valuation.multiplo_usado}. 
          Consulte um especialista para avaliação precisa.
        </p>
      </div>
    </div>
  );
}