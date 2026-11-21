import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pause, Play, X, Settings } from "lucide-react";
import { getStudySessions, updateStudySession } from "../api/studySessions";
import { getDashboardStats } from "../api/dashboard";
import CircularTimer from "../components/CircularTimer";
import { toDateKey } from "../utils/date";

function durationInSeconds(start, end) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) * 60;
}

export default function StudyTimer() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState(null);
  const [completedToday, setCompletedToday] = useState(0);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function load() {
      const todayKey = toDateKey(new Date());
      const [sessions, dashStats] = await Promise.all([
        getStudySessions({ date: todayKey }),
        getDashboardStats(),
      ]);
      const list = sessions.results || sessions;
      const found = list.find((s) => String(s.id) === sessionId);
      if (!found) {
        navigate("/study-plan");
        return;
      }
      const total = durationInSeconds(found.start_time, found.end_time);
      setSession(found);
      setTotalSeconds(total);
      setRemainingSeconds(total);
      setStats(dashStats);
      setCompletedToday(list.filter((s) => s.completed).length);
    }
    load();
  }, [sessionId, navigate]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const markComplete = useCallback(async () => {
    if (!session) return;
    await updateStudySession(session.id, { completed: true });
    navigate("/study-plan");
  }, [session, navigate]);

  useEffect(() => {
    if (finished) markComplete();
  }, [finished, markComplete]);

  const handleEndEarly = async () => {
    if (!confirm("End this session early? It won't be marked complete.")) return;
    navigate("/study-plan");
  };

  if (!session) {
    return <p className="text-slate-500 dark:text-dark-muted text-sm">Loading session...</p>;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-8">
      <div className="w-full max-w-sm bg-dark-bg dark:bg-dark-bg rounded-3xl p-8 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-8">
          <button onClick={handleEndEarly} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="font-heading font-semibold text-white text-sm">Study Timer</h2>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-sm text-white">
            {session.assignment ? "Assignment session" : "General session"}
          </span>
        </div>

        <CircularTimer totalSeconds={totalSeconds} remainingSeconds={remainingSeconds} />

        <button
          onClick={() => setIsRunning((r) => !r)}
          disabled={remainingSeconds === 0}
          className="mt-8 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {isRunning ? <Pause className="w-6 h-6 text-white" fill="white" /> : <Play className="w-6 h-6 text-white ml-0.5" fill="white" />}
        </button>
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <h3 className="font-heading font-semibold text-sm text-slate-900 dark:text-white mb-4">
          Today's Progress
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-semibold text-xl text-slate-900 dark:text-white">
              {stats ? `${Math.floor(stats.study_time_today_minutes / 60)}h ${stats.study_time_today_minutes % 60}m` : "—"}
            </p>
            <p className="text-xs text-slate-400 dark:text-dark-muted">Total Study Time</p>
          </div>
          <div>
            <p className="font-heading font-semibold text-xl text-slate-900 dark:text-white">
              {completedToday}
            </p>
            <p className="text-xs text-slate-400 dark:text-dark-muted">Sessions Completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}