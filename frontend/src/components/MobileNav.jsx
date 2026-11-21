import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, Calendar, BarChart2, Grid3x3 } from "lucide-react";

const items = [
  { to: "/", icon: LayoutDashboard, label: "Home", end: true },
  { to: "/assignments", icon: ClipboardList, label: "Tasks" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/study-plan", icon: BarChart2, label: "Plan" },
  { to: "/categories", icon: Grid3x3, label: "More" },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around bg-white dark:bg-dark-surface border-t border-slate-200 dark:border-dark-border py-2">
      {items.map(({ to, icon: Icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-3 py-1 text-xs ${
              isActive ? "text-primary" : "text-slate-400 dark:text-dark-muted"
            }`
          }
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}