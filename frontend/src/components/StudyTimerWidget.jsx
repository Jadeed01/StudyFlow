import { Link } from "react-router-dom";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTimer } from "../context/TimerContext";

function fmt(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function StudyTimerWidget({ studyMinutesToday, sessionsCompleted }) {
  const { activeSession, remainingSeconds, isRunning, togglePause, endSession } = useTimer();

  const size = 128;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = activeSession ? remainingSeconds / activeSession.totalSeconds : 0;
  const offset = circumference * (1 - progress);

  const handleReset = () => {
    if (!confirm("Stop this session? It won't be marked complete.")) return;
    endSession();
  };

  return (
    <div className="bg-dark-bg rounded-3xl p-6 flex flex-col items-center">
      <h2 className="font-heading font-semibold text-white text-sm w-full mb-6">Study Timer</h2>

      {activeSession ? (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-white truncate max-w-[180px]">
              {activeSession.assignment_title || "Study session"}
            </span>
          </div>

          <div className="relative mb-6" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#334155" strokeWidth={stroke} />
              <circle
                cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#6366F1" strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-heading font-semibold text-2xl text-white tabular-nums">
                {fmt(remainingSeconds)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title="Stop session"
            >
              <RotateCcw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={togglePause}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors"
            >
              {isRunning ? <Pause className="w-5 h-5 text-white" fill="white" /> : <Play className="w-5 h-5 text-white ml-0.5" fill="white" />}
            </button>
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-400 mb-3">No active session</p>
          <Link to="/study-plan" className="text-sm text-primary font-medium hover:underline">
            Go to Study Plan →
          </Link>
        </div>
      )}

      <div className="w-full mt-6 pt-5 border-t border-dark-border flex items-center justify-between">
        <div>
          <p className="font-heading font-semibold text-lg text-white">
            {Math.floor(studyMinutesToday / 60)}h {studyMinutesToday % 60}m
          </p>
          <p className="text-xs text-slate-400">Total Study Time</p>
        </div>
        <div>
          <p className="font-heading font-semibold text-lg text-white">{sessionsCompleted}</p>
          <p className="text-xs text-slate-400">Sessions Completed</p>
        </div>
      </div>
    </div>
  );
}