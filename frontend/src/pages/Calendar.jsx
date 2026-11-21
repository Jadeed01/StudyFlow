import { useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAssignments } from "../api/assignments";
import { getStudySessions } from "../api/studySessions";
import { getMonthGrid, isSameDay, toDateKey } from "../utils/date";
import PriorityBadge from "../components/PriorityBadge";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [assignments, setAssignments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [a, s] = await Promise.all([
        getAssignments({ page_size: 200 }),
        getStudySessions({ page_size: 200 }),
      ]);
      setAssignments(a.results || a);
      setSessions(s.results || s);
      setLoading(false);
    }
    load();
  }, []);

  const cells = useMemo(() => getMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor]);

  const itemsByDay = useMemo(() => {
    const map = {};
    assignments.forEach((a) => {
      const key = toDateKey(new Date(a.due_date));
      if (!map[key]) map[key] = { assignments: [], sessions: [] };
      map[key].assignments.push(a);
    });
    sessions.forEach((s) => {
      const key = s.date;
      if (!map[key]) map[key] = { assignments: [], sessions: [] };
      map[key].sessions.push(s);
    });
    return map;
  }, [assignments, sessions]);

  const changeMonth = (delta) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const selectedKey = toDateKey(selectedDate);
  const selectedItems = itemsByDay[selectedKey] || { assignments: [], sessions: [] };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">Calendar</h1>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg">
              <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-dark-muted" />
            </button>
            <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg">
              <ChevronRight className="w-4 h-4 text-slate-500 dark:text-dark-muted" />
            </button>
            <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white ml-2">
              {cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}
            </h2>
          </div>
          <button
            onClick={goToday}
            className="text-sm px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 dark:text-dark-muted py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            const key = toDateKey(cell.date);
            const dayItems = itemsByDay[key];
            const isToday = isSameDay(cell.date, today);
            const isSelected = isSameDay(cell.date, selectedDate);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(cell.date)}
                className={`min-h-[80px] p-2 rounded-lg text-left border transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-dark-bg"
                } ${!cell.currentMonth ? "opacity-40" : ""}`}
              >
                <span
                  className={`text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${
                    isToday ? "bg-primary text-white" : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {cell.day}
                </span>
                <div className="mt-1 space-y-1">
                  {dayItems?.assignments.slice(0, 2).map((a) => (
                    <div
                      key={`a-${a.id}`}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate text-white"
                      style={{ backgroundColor: a.subject_color || "#6366F1" }}
                    >
                      {a.title}
                    </div>
                  ))}
                  {dayItems?.sessions.slice(0, 1).map((s) => (
                    <div
                      key={`s-${s.id}`}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-muted"
                    >
                      Study: {s.start_time}
                    </div>
                  ))}
                  {dayItems && dayItems.assignments.length + dayItems.sessions.length > 3 && (
                    <div className="text-[10px] text-slate-400 dark:text-dark-muted">
                      +{dayItems.assignments.length + dayItems.sessions.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-base text-slate-900 dark:text-white mb-4">
          {selectedDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </h3>

        {selectedItems.assignments.length === 0 && selectedItems.sessions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-dark-muted">Nothing scheduled this day.</p>
        ) : (
          <div className="space-y-3">
            {selectedItems.assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.subject_color || "#6366F1" }} />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{a.title}</p>
                    <p className="text-xs text-slate-400 dark:text-dark-muted">{a.subject_name} — Due</p>
                  </div>
                </div>
                <PriorityBadge priority={a.priority} />
              </div>
            ))}
            {selectedItems.sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-300 dark:bg-dark-muted" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Study session — {s.subject_id ? "Subject #" + s.subject_id : "General"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-dark-muted">{s.start_time} – {s.end_time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}