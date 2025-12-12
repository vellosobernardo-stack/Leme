interface ProgressBarProps {
  progresso: number;
}

export default function ProgressBar({ progresso }: ProgressBarProps) {
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${progresso}%` }}
      />
    </div>
  );
}