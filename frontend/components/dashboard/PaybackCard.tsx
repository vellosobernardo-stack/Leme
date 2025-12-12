// components/dashboard/PaybackCard.tsx
// Card de Payback com estilo premium

import { Timer, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { Payback } from '@/types/dashboard';

interface PaybackCardProps {
  payback: Payback;
}

export default function PaybackCard({ payback }: PaybackCardProps) {
  
  // Verifica se os dados estão indisponíveis
  const isIndisponivel = payback.anos === null || payback.anos === undefined;
  const isCritico = payback.status === 'critico';
  
  // Formata o tempo de retorno
  const formatarTempo = () => {
    if (isIndisponivel) {
      return isCritico ? 'Indisponível' : 'Não calculado';
    }
    
    const anos = payback.anos || 0;
    const meses = payback.meses || 0;
    
    if (anos === 0 && meses === 0) {
      return 'Imediato';
    } else if (anos === 0) {
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    } else if (meses === 0) {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    } else {
      return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
  };

  // Calcula a posição na barra (simples: tempo atual / 5 anos)
  const calcularProgresso = () => {
    if (isIndisponivel) return 0;
    const tempoTotal = (payback.anos || 0) + ((payback.meses || 0) / 12);
    const percentual = (tempoTotal / 5) * 100;
    return Math.min(Math.round(percentual), 100);
  };

  // Define a cor da barra baseado no tempo
  const getBarColor = () => {
    if (isIndisponivel || isCritico) return 'bg-gray-300';
    const tempoTotal = (payback.anos || 0) + ((payback.meses || 0) / 12);
    if (tempoTotal <= 2) return 'bg-green-500';
    if (tempoTotal <= 4) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Verifica se o payback é excelente (já atingido ou muito curto)
  const isPaybackExcelente = !isIndisponivel && !isCritico && 
    ((payback.anos === 0) || (payback.anos === 1 && payback.meses === 0));

  const progresso = calcularProgresso();

  // Define o ícone e cor baseado no status
  const getIconConfig = () => {
    if (isCritico) {
      return {
        icon: AlertTriangle,
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600'
      };
    }
    if (isIndisponivel) {
      return {
        icon: HelpCircle,
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-500'
      };
    }
    if (isPaybackExcelente) {
      return {
        icon: CheckCircle2,
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    }
    return {
      icon: Timer,
      bgColor: 'bg-secondary/10',
      iconColor: 'text-secondary'
    };
  };

  const iconConfig = getIconConfig();
  const IconComponent = iconConfig.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/40 p-8 hover:shadow-md transition duration-300">
      {/* Ícone */}
      <div className="flex justify-center mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconConfig.bgColor}`}>
          <IconComponent className={`w-6 h-6 ${iconConfig.iconColor}`} />
        </div>
      </div>

      {/* Título */}
      <h3 className="text-lg font-semibold text-center text-muted-foreground mb-4">
        Retorno do Investimento
      </h3>

      {/* Valor em destaque */}
      <div className="text-center mb-4">
        {isCritico ? (
          <>
            <p className="text-3xl lg:text-4xl font-bold text-red-600">
              {formatarTempo()}
            </p>
            <p className="text-sm text-red-600 font-medium mt-1">
              Empresa em prejuízo
            </p>
          </>
        ) : isIndisponivel ? (
          <>
            <p className="text-3xl lg:text-4xl font-bold text-gray-400">
              {formatarTempo()}
            </p>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Dados insuficientes
            </p>
          </>
        ) : isPaybackExcelente ? (
          <>
            <p className="text-3xl lg:text-4xl font-bold text-green-600">
              {formatarTempo()}
            </p>
            <p className="text-sm text-green-600 font-medium mt-1">
              Retorno excelente!
            </p>
          </>
        ) : (
          <p className="text-3xl lg:text-4xl font-bold text-primary">
            {formatarTempo()}
          </p>
        )}
      </div>

      {/* Frase interpretativa */}
      <p className="text-sm text-muted-foreground text-center mb-6">
        {payback.frase_interpretativa}
      </p>

      {/* Barra de referência - só mostra se tiver dados válidos */}
      {!isIndisponivel && !isCritico && (
        <div className="space-y-2">
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${getBarColor()}`}
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progresso}% da média</span>
            <span>Média do setor: 5 anos</span>
          </div>

          {/* Nota explicativa */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Intervalo saudável para o setor: até 5 anos
          </p>
        </div>
      )}

      {/* Mensagem alternativa quando não tem dados */}
      {(isIndisponivel || isCritico) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            {isCritico 
              ? "Para calcular o retorno, a empresa precisa estar gerando lucro."
              : "Complete a análise com mais dados para calcular o retorno."
            }
          </p>
        </div>
      )}
    </div>
  );
}