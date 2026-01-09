interface ProgressBarProps {
  progresso: number;
  mostrarPercentual?: boolean;
}

export default function ProgressBar({ progresso, mostrarPercentual = true }: ProgressBarProps) {
  return (
    <div className="w-full">
      {/* Container da barra */}
      <div className="progress-bar relative">
        <div
          className="progress-bar-fill transition-all duration-500 ease-out"
          style={{ width: `${progresso}%` }}
        />
      </div>
      
      {/* Percentual */}
      {mostrarPercentual && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-foreground-muted font-medium">
            {progresso}% concluído
          </span>
        </div>
      )}
    </div>
  );
}