import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Plus, Trash2, RefreshCw } from "lucide-react";
import { getStudyPlan } from "../api/dashboard";
import { getStudySessions, createStudySession, updateStudySession, deleteStudySession } from "../api/studySessions";
import { toDateKey } from "../utils/date";
import PriorityBadge from "../components/PriorityBadge";
import { useTimer } from "../context/TimerContext";

export default function StudyPlan() {
  const navigate = useNavigate();
  const { startSession } = useTimer();
  const [suggestions, setSuggestions] = useState([]);
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  const todayKey = toDateKey(new Date());

  const loadEverything = async () => {
    setLoading(true);
    const [plan, sessions] = await Promise.all([
      getStudyPlan(),
      getStudySessions({ date: todayKey }),
    ]);
    setSuggestions(plan);
    const sessionsList = sessions.results || sessions;
    setTodaySessions(sessionsList);
    setAcceptedIds(new Set(sessionsList.filter((s) => s.assignment).map((s) => s.assignment)));
    setLoading(false);
  };

  useEffect(() => {
    loadEverything();
  }, []);

  const acceptSuggestion = async (suggestion) => {
    setAccepting(suggestion.assignment_id);
    try {
      const created = await createStudySession({
        assignment: suggestion.assignment_id,
        subject: suggestion.subject_id,
        date: suggestion.date,
        start_time: suggestion.start_time,
        end_time: suggestion.end_time,
        is_suggested: false,
      });
      setTodaySessions((prev) => [...prev, created]);
      setAcceptedIds((prev) => new Set(prev).add(suggestion.assignment_id));
    } finally {
      setAccepting(null);
    }
  };

  const toggleSessionDone = async (session) => {
    const updated = await updateStudySession(session.id, { completed: !session.completed });
    setTodaySessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const removeSession = async (session) => {
    await deleteStudySession(session.id);
    setTodaySessions((prev) => prev.filter((s) => s.id !== session.id));
    if (session.assignment) {
      setAcceptedIds((prev) => {
        const next = new Set(prev);
        next.delete(session.assignment);
        return next;
      });
    }
  };

  const handleStart = (session) => {
    const [sh, sm] = session.start_time.split(":").map(Number);
    const [eh, em] = session.end_time.split(":").map(Number);
    const totalSeconds = (eh * 60 + em - (sh * 60 + sm)) * 60;
    startSession(session, totalSeconds);
    navigate("/");
  };

  if (loading) {
    return <p className="text-slate-500 dark:text-dark-muted text-sm">Loading study plan...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">Study Plan</h1>
        <button
          onClick={loadEverything}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg text-slate-500 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white">
            Suggested Plan
          </h2>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
            Recommended
          </span>
        </div>

        {suggestions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-dark-muted">
            No suggestions right now — you're either all caught up or out of available study time today.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => {
              const isAccepted = acceptedIds.has(s.assignment_id);
              return (
                <div
                  key={s.assignment_id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-dark-border"
                >
                  <div className="w-14 text-center shrink-0">
                    <p className="text-xs font-semibold text-primary">{s.start_time}</p>
                    <p className="text-[10px] text-slate-400 dark:text-dark-muted">{s.duration_minutes}m</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {s.assignment_title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-dark-muted">
                      {s.subject_name || "General"} · {s.start_time} – {s.end_time}
                    </p>
                  </div>
                  <PriorityBadge priority={s.priority} />
                  <button
                    onClick={() => acceptSuggestion(s)}
                    disabled={isAccepted || accepting === s.assignment_id}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors ${
                      isAccepted
                        ? "bg-success/10 text-success cursor-default"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {isAccepted ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : accepting === s.assignment_id ? (
                      "Adding..."
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Accept
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-4">
          Today's Sessions
        </h2>

        {todaySessions.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-dark-muted">
            Nothing scheduled yet — accept a suggestion above to add it here.
          </p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-dark-border"
              >
                <button
                  onClick={() => toggleSessionDone(session)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    session.completed
                      ? "bg-success border-success"
                      : "border-slate-300 dark:border-dark-border hover:border-primary"
                  }`}
                >
                  {session.completed && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${session.completed ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
                    {session.start_time} – {session.end_time}
                  </p>
                </div>
                {!session.completed && (
                  <button
                    onClick={() => handleStart(session)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Start
                  </button>
                )}
                <button
                  onClick={() => removeSession(session)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}