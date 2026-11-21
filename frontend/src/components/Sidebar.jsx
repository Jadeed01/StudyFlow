import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  GraduationCap, LayoutDashboard, ClipboardList, Calendar,
  BarChart2, Bell, Grid3x3, Settings, Moon, Sun,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { getNotifications } from "../api/notifications";

export default function Sidebar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotifications({ is_read: false }).then((data) => {
      const list = data.results || data;
      setUnreadCount(list.length);
    });
  }, []);

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/calendar", label: "Calendar", icon: Calendar },
    { to: "/study-plan", label: "Study Plan", icon: BarChart2 },
    { to: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    { to: "/categories", label: "Categories", icon: Grid3x3 },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-white dark:bg-dark-surface border-r border-slate-200 dark:border-dark-border">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-semibold text-base text-slate-900 dark:text-white leading-tight">
            StudyFlow
          </h1>
          <p className="text-xs text-slate-400 dark:text-dark-muted leading-tight">
            Smart Assignment Tracker
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-bg"
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            <span className="flex-1">{label}</span>
            {badge > 0 && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-danger text-white">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-dark-border">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors"
        >
          {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}