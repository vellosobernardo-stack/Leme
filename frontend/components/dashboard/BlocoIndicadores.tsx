// components/dashboard/BlocoIndicadores.tsx
// Bloco que agrupa indicadores por categoria
// v3 — Pro: recebe analiseAnterior, calcula variação e passa para cada card

import { BlocoIndicadores as BlocoIndicadoresType } from '@/types/dashboard';
import IndicadorCard from './IndicadorCard';

// Mapa de campo do indicador (pelo id) → chave no objeto de indicadores da análise anterior
// Deve bater com os ids usados na montagem dos blocos no dashboard
const INDICADOR_PARA_CAMPO: Record<string, string> = {
  margem_bruta:        'margem_bruta',
  resultado_mes:       'resultado_mes',
  folego_caixa:        'folego_caixa',
  ponto_equilibrio:    'ponto_equilibrio',
  ciclo_financeiro:    'ciclo_financeiro',
  capital_minimo:      'capital_minimo',
  receita_funcionario: 'receita_funcionario',
  peso_divida:         'peso_divida',
};

// Indicadores onde valor menor = melhor (para calcular status corretamente no frontend)
const MENOR_E_MELHOR = new Set(['ponto_equilibrio', 'ciclo_financeiro', 'peso_divida']);

interface IndicadoresAnteriores {
  [campo: string]: number | null;
}

interface BlocoIndicadoresProps {
  bloco: BlocoIndicadoresType;
  isPago?: boolean;
  // Pro only: indicadores da análise anterior para calcular variação
  analiseAnterior?: IndicadoresAnteriores | null;
}

function calcularVariacao(
  valorAtual: number | string,
  campo: string,
  analiseAnterior: IndicadoresAnteriores
): { valor: number; status: 'melhorou' | 'piorou' | 'estavel' } | null {
  if (typeof valorAtual !== 'number') return null;

  const valorAnterior = analiseAnterior[campo];
  if (valorAnterior === null || valorAnterior === undefined) return null;

  const delta = valorAtual - valorAnterior;
  const threshold = Math.max(Math.abs(valorAnterior) * 0.02, 0.01);

  if (Math.abs(delta) < threshold) {
    return { valor: delta, status: 'estavel' };
  }

  const maiorEMelhor = !MENOR_E_MELHOR.has(campo);
  const melhorou = maiorEMelhor ? delta > 0 : delta < 0;

  return {
    valor: delta,
    status: melhorou ? 'melhorou' : 'piorou',
  };
}

export default function BlocoIndicadores({
  bloco,
  isPago = false,
  analiseAnterior,
}: BlocoIndicadoresProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border/40 p-6 hover:shadow-md transition duration-300">
      {/* Header do bloco */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-primary mb-1">
          {bloco.titulo}
        </h3>
        <p className="text-sm text-muted-foreground">
          {bloco.subtitulo}
        </p>
      </div>

      {/* Grid de indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bloco.indicadores.map((indicador) => {
          const campo = INDICADOR_PARA_CAMPO[indicador.id];
          const variacao =
            isPago && analiseAnterior && campo
              ? calcularVariacao(indicador.valor, campo, analiseAnterior)
              : null;

          return (
            <IndicadorCard
              key={indicador.id}
              indicador={indicador}
              isPago={isPago}
              variacao={variacao}
            />
          );
        })}
      </div>
    </div>
  );
}