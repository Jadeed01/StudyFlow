export default function StatCard({ label, value, sublabel, icon: Icon, iconColor }) {
  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-dark-muted mb-2">{label}</p>
        <p className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">{value}</p>
        {sublabel && <p className="text-xs text-slate-400 dark:text-dark-muted mt-1">{sublabel}</p>}
      </div>
      {Icon && (
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${iconColor}1A` }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor }} />
        </div>
      )}
    </div>
  );
}