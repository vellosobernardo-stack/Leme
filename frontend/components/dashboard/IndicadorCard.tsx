// components/dashboard/IndicadorCard.tsx
// Card individual de indicador financeiro
// v3 — Pro: badge Melhorou/Piorou/Estável | Free: sem badge (isPago=false)

import {
  Percent,
  DollarSign,
  Scale,
  Wallet,
  Banknote,
  RefreshCw,
  Users,
  CreditCard,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Indicador } from '@/types/dashboard';

interface Variacao {
  valor: number;
  status: 'melhorou' | 'piorou' | 'estavel';
}

interface IndicadorCardProps {
  indicador: Indicador;
  isPago?: boolean;
  variacao?: Variacao | null; // só passado no Pro quando há análise anterior
}

// Mapa de ícones
const icones: Record<string, React.ComponentType<{ className?: string }>> = {
  Percent,
  DollarSign,
  Scale,
  Wallet,
  Banknote,
  RefreshCw,
  Users,
  CreditCard,
};

function formatarValor(valor: number | string, unidade: string): string {
  if (typeof valor === 'string') return valor;

  if (unidade === 'R$' || unidade === 'R$/mês') {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  if (unidade === '%') return `${valor}%`;
  if (unidade === 'dias') return `${valor} dias`;
  return String(valor);
}

function BadgeVariacao({ variacao, unidade }: { variacao: Variacao; unidade: string }) {
  const delta = variacao.valor;
  const sinal = delta > 0 ? '+' : '';

  // Formata o delta com a mesma unidade do indicador
  let deltaFormatado: string;
  if (unidade === 'R$' || unidade === 'R$/mês') {
    deltaFormatado = `${sinal}${Math.abs(delta).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
    if (delta < 0) deltaFormatado = `-${deltaFormatado.replace('-', '')}`;
  } else if (unidade === '%') {
    deltaFormatado = `${sinal}${delta.toFixed(1)}%`;
  } else if (unidade === 'dias') {
    deltaFormatado = `${sinal}${Math.round(delta)} dias`;
  } else {
    deltaFormatado = `${sinal}${delta}`;
  }

  if (variacao.status === 'melhorou') {
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit mt-2">
        <TrendingUp className="w-3 h-3" />
        <span>{deltaFormatado}</span>
      </div>
    );
  }

  if (variacao.status === 'piorou') {
    return (
      <div className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit mt-2">
        <TrendingDown className="w-3 h-3" />
        <span>{deltaFormatado}</span>
      </div>
    );
  }

  // estavel
  return (
    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full w-fit mt-2">
      <Minus className="w-3 h-3" />
      <span>Estável</span>
    </div>
  );
}

export default function IndicadorCard({ indicador, isPago = false, variacao }: IndicadorCardProps) {
  const Icone = icones[indicador.icone] || Percent;

  const getStatusStyles = () => {
    switch (indicador.status) {
      case 'saudavel':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'bg-green-100 text-green-600',
          badge: 'bg-green-100 text-green-700',
        };
      case 'atencao':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'bg-yellow-100 text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-700',
        };
      case 'critico':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'bg-red-100 text-red-600',
          badge: 'bg-red-100 text-red-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'bg-gray-100 text-gray-600',
          badge: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-5 hover:shadow-md transition duration-300`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${styles.icon}`}>
          <Icone className="w-5 h-5" />
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles.badge}`}>
          {indicador.benchmark}
        </span>
      </div>

      {/* Nome */}
      <h4 className="text-sm font-medium text-muted-foreground mb-1">
        {indicador.nome}
      </h4>

      {/* Valor */}
      <p className="text-2xl font-bold text-gray-900">
        {formatarValor(indicador.valor, indicador.unidade)}
      </p>

      {/* Badge de evolução — só no Pro com análise anterior disponível */}
      {isPago && variacao && (
        <BadgeVariacao variacao={variacao} unidade={indicador.unidade} />
      )}

      {/* Explicação — só no Pro */}
      {isPago && indicador.explicacao && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground mt-3">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p>{indicador.explicacao}</p>
        </div>
      )}
    </div>
  );
}