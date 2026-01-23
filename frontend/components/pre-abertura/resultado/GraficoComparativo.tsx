"use client";

interface GraficoComparativoProps {
  titulo: string;
  valorUsuario: number;
  valorReferencia: number;
  diferencaPercentual: number;
  status: string;
  labelUsuario: string;
  labelReferencia: string;
}

export default function GraficoComparativo({
  titulo,
  valorUsuario,
  valorReferencia,
  diferencaPercentual,
  status,
  labelUsuario,
  labelReferencia,
}: GraficoComparativoProps) {
  // Calcular largura das barras (máximo é o maior valor)
  const maxValor = Math.max(valorUsuario, valorReferencia);
  const larguraUsuario = maxValor > 0 ? (valorUsuario / maxValor) * 100 : 0;
  const larguraReferencia = maxValor > 0 ? (valorReferencia / maxValor) * 100 : 0;

  // Formatar valores em R$
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Determinar cor e texto do status
  const getStatusInfo = () => {
    if (status === "acima" || status === "adequado") {
      return {
        cor: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200",
        texto: diferencaPercentual >= 0 
          ? `${Math.abs(diferencaPercentual).toFixed(0)}% acima da referência`
          : "Dentro da referência",
      };
    } else if (status === "abaixo") {
      return {
        cor: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        texto: `${Math.abs(diferencaPercentual).toFixed(0)}% abaixo da referência`,
      };
    } else {
      return {
        cor: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        texto: `${Math.abs(diferencaPercentual).toFixed(0)}% abaixo da referência`,
      };
    }
  };

  const statusInfo = getStatusInfo();

  // Cores das barras
  const corUsuario = status === "acima" || status === "adequado" 
    ? "bg-green-500" 
    : status === "abaixo" 
      ? "bg-yellow-500" 
      : "bg-red-500";

  return (
    <div className="bg-white rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{titulo}</h3>
        <span className={`text-sm px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.border} border ${statusInfo.cor}`}>
          {statusInfo.texto}
        </span>
      </div>

      <div className="space-y-4">
        {/* Barra do usuário */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-foreground-muted">{labelUsuario}</span>
            <span className="font-medium text-foreground">{formatarValor(valorUsuario)}</span>
          </div>
          <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className={`h-full ${corUsuario} rounded-lg transition-all duration-500`}
              style={{ width: `${larguraUsuario}%` }}
            />
          </div>
        </div>

        {/* Barra de referência */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-foreground-muted">{labelReferencia}</span>
            <span className="font-medium text-foreground">{formatarValor(valorReferencia)}</span>
          </div>
          <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
            <div
              className="h-full bg-primary/30 rounded-lg transition-all duration-500"
              style={{ width: `${larguraReferencia}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
