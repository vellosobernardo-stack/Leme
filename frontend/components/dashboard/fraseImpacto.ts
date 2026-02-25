// lib/fraseImpacto.ts
// Calcula a frase de impacto personalizada baseada nos dados reais da empresa
// Usada no PaywallOverlay e como banner no Dashboard

interface DadosFraseImpacto {
  empresaNome: string;
  scoreValor: number;
  margemBruta?: number;         // em % (ex: 66)
  resultadoMes?: number;        // em R$ (positivo = lucro, negativo = prejuízo)
  folegoEmDias?: number;        // dias de caixa
  simuladorEstressePositivo?: boolean;  // true = ainda sobra com queda de 30%
}

export function calcularFraseImpacto(dados: DadosFraseImpacto): string {
  const nome = dados.empresaNome || 'sua empresa';

  // Prioridade 1: Resultado negativo (mais urgente)
  if (dados.resultadoMes !== undefined && dados.resultadoMes < 0) {
    const valor = Math.abs(dados.resultadoMes).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return `A ${nome} está perdendo R$ ${valor} por mês — e a maioria dos donos só percebe quando é tarde.`;
  }

  // Prioridade 2: Fôlego de caixa crítico
  if (dados.folegoEmDias !== undefined && dados.folegoEmDias < 30 && dados.folegoEmDias >= 0) {
    return `Sem novas vendas, o caixa da ${nome} zera em ${dados.folegoEmDias} dias.`;
  }

  // Prioridade 3: Margem baixa
  if (dados.margemBruta !== undefined && dados.margemBruta < 25 && dados.margemBruta >= 0) {
    const sobra = Math.round(dados.margemBruta);
    return `De cada R$ 100 que entra na ${nome}, só R$ ${sobra} realmente ficam.`;
  }

  // Prioridade 4: Simulador mostra vulnerabilidade
  if (dados.simuladorEstressePositivo === false) {
    return `Uma queda de 30% nas vendas faria a ${nome} operar no vermelho.`;
  }

  // Prioridade 5: Score baixo
  if (dados.scoreValor < 50) {
    return `O score da ${nome} é ${dados.scoreValor}/100. Empresas nessa faixa têm alto risco de problemas de caixa nos próximos 6 meses.`;
  }

  // Prioridade 6: Tudo ok (score > 75)
  if (dados.scoreValor > 75) {
    return `A ${nome} está saudável — mas você sabe exatamente o que fazer para crescer sem perder o controle?`;
  }

  // Fallback: score médio (50-75)
  return `O score da ${nome} é ${dados.scoreValor}/100. Descubra o que corrigir para chegar a 80+.`;
}
