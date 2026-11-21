import { Search, Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 md:px-8 py-4 bg-white/80 dark:bg-dark-surface/80 backdrop-blur border-b border-slate-200 dark:border-dark-border">
      <div className="hidden sm:flex items-center flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search assignments..."
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors"
        >
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-heading font-semibold text-sm">
            {user?.avatar?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight">
              {user?.user?.username || "..."}
            </p>
            <p className="text-xs text-slate-400 dark:text-dark-muted leading-tight">Student</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block"m />
        </div>
      </div>
    </header>
  );
}