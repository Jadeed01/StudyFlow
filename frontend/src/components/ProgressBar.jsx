export default function ProgressBar({ progress }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-dark-bg overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 dark:text-dark-muted w-8 text-right">{progress}%</span>
    </div>
  );
}