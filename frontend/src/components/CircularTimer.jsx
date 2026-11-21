export default function CircularTimer({ totalSeconds, remainingSeconds, size = 240 }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0;
  const offset = circumference * (1 - progress);

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor" strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-dark-border"
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#6366F1" strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-semibold text-4xl text-slate-900 dark:text-white tabular-nums">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
        <span className="text-xs text-slate-400 dark:text-dark-muted mt-1">Focus Session</span>
      </div>
    </div>
  );
}