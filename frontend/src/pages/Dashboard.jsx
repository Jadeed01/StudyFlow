import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Clock, TrendingUp, Timer } from "lucide-react";
import { getAssignments } from "../api/assignments";
import { getDashboardStats, getStudyPlan } from "../api/dashboard";
import { getStudySessions } from "../api/studySessions";
import { toDateKey } from "../utils/date";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import PriorityBadge from "../components/PriorityBadge";
import ProgressBar from "../components/ProgressBar";
import StudyTimerWidget from "../components/StudyTimerWidget";

function useLiveTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

function getGreeting(hour) {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default function Dashboard() {
  const { user } = useAuth();
  const now = useLiveTime();
  const [stats, setStats] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, assignmentsData, planData, sessionsData] = await Promise.all([
          getDashboardStats(),
          getAssignments({ status: "pending,in_progress", ordering: "due_date" }),
          getStudyPlan(),
          getStudySessions({ date: toDateKey(new Date()) }),
        ]);
        setStats(statsData);
        setPriorities((assignmentsData.results || assignmentsData).slice(0, 3));
        setStudyPlan(planData.slice(0, 3));
        setTodaySessions(sessionsData.results || sessionsData);
      } catch (err) {
        setError("Couldn't load your dashboard. Try refreshing.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <p className="text-slate-500 dark:text-dark-muted">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  const nextSession = todaySessions.find((s) => !s.completed) || null;
  const sessionsCompleted = todaySessions.filter((s) => s.completed).length;

  const greeting = getGreeting(now.getHours());
  const timeString = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const dateString = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">
            Welcome, {user?.user?.username}! 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-1">
            {greeting} — here's what's happening with your assignments today.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-heading font-semibold text-lg text-slate-900 dark:text-white tabular-nums">
            {timeString}
          </p>
          <p className="text-xs text-slate-400 dark:text-dark-muted">{dateString}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Assignments" value={stats.total_assignments} icon={ClipboardList} iconColor="#6366F1" />
        <StatCard label="Due This Week" value={stats.due_this_week} icon={Clock} iconColor="#F59E0B" />
        <StatCard label="In Progress" value={stats.in_progress} sublabel={`${stats.completion_rate}% completion rate`} icon={TrendingUp} iconColor="#8B5CF6" />
        <StatCard label="Study Time Today" value={`${Math.floor(stats.study_time_today_minutes / 60)}h ${stats.study_time_today_minutes % 60}m`} icon={Timer} iconColor="#10B981" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-4">
              Today's Priorities
            </h2>
            {priorities.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-dark-muted">No pending assignments — you're clear.</p>
            ) : (
              <div className="space-y-4">
                {priorities.map((a) => (
                  <div key={a.id}>
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{a.title}</p>
                        <p className="text-xs text-slate-400 dark:text-dark-muted">
                          Due {new Date(a.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <PriorityBadge priority={a.priority} />
                    </div>
                    <ProgressBar progress={a.progress} />
                  </div>
                ))}
              </div>
            )}
            <Link to="/assignments" className="text-sm text-primary font-medium inline-block mt-4 hover:underline">
              View all assignments →
            </Link>
          </div>

          <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white">
                Study Plan for Today
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                Recommended
              </span>
            </div>
            {studyPlan.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-dark-muted">No study plan generated yet.</p>
            ) : (
              <div className="space-y-3">
                {studyPlan.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                      {s.start_time}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {s.subject_name || s.assignment_title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-dark-muted">
                        {s.start_time} – {s.end_time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link to="/study-plan" className="text-sm text-primary font-medium inline-block mt-4 hover:underline">
              View full study plan →
            </Link>
          </div>
        </div>

        <StudyTimerWidget
          studyMinutesToday={stats.study_time_today_minutes}
          sessionsCompleted={sessionsCompleted}
        />
      </div>
    </div>
  );
}