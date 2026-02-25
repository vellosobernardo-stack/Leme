// lib/fraseImpacto.ts
// Calcula UMA frase de impacto personalizada baseada nos dados reais da empresa
// Usada no PaywallOverlay para criar urgência de conversão

interface FraseImpactoParams {
  empresaNome: string;
  scoreValor: number;
  margemBruta?: number;       // em % (ex: 25 = 25%)
  resultadoMes?: number;      // em R$ (negativo = prejuízo)
  folegoEmDias?: number;      // dias de caixa
  simuladorEstressePositivo?: boolean; // true = sobrevive ao estresse
}

export function calcularFraseImpacto({
  empresaNome,
  scoreValor,
  margemBruta,
  resultadoMes,
  folegoEmDias,
  simuladorEstressePositivo,
}: FraseImpactoParams): string {
  const nome = empresaNome || 'sua empresa';

  // Prioridade 1: Resultado negativo (mais urgente)
  if (resultadoMes != null && resultadoMes < 0) {
    const perda = Math.abs(resultadoMes).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `A ${nome} está perdendo R$ ${perda} por mês — e a maioria dos donos só percebe quando é tarde.`;
  }

  // Prioridade 2: Fôlego de caixa crítico
  if (folegoEmDias != null && folegoEmDias < 30) {
    return `Sem novas vendas, o caixa da ${nome} zera em ${Math.round(folegoEmDias)} dias.`;
  }

  // Prioridade 3: Margem baixa
  if (margemBruta != null && margemBruta < 25) {
    const ficam = Math.round(margemBruta);
    return `De cada R$ 100 que entra na ${nome}, só R$ ${ficam} realmente ficam.`;
  }

  // Prioridade 4: Simulador mostra vulnerabilidade
  if (simuladorEstressePositivo === false) {
    return `Uma queda de 30% nas vendas faria a ${nome} operar no vermelho.`;
  }

  // Prioridade 5: Score baixo
  if (scoreValor < 50) {
    return `O score da ${nome} é ${scoreValor}/100. Empresas nessa faixa têm alto risco de problemas de caixa nos próximos 6 meses.`;
  }

  // Prioridade 6: Tudo saudável (score > 75)
  if (scoreValor > 75) {
    return `A ${nome} está saudável — mas você sabe exatamente o que fazer para crescer sem perder o controle?`;
  }

  // Prioridade 7: Fallback (score entre 50-75)
  return `O score da ${nome} é ${scoreValor}/100. Descubra o que corrigir para chegar a 80+.`;
}
