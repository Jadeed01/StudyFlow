import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { updateStudySession } from "../api/studySessions";

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null); // {id, start_time, end_time, assignment_title, totalSeconds}
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (activeSession) {
              updateStudySession(activeSession.id, { completed: true }).catch(() => {});
            }
            setActiveSession(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, activeSession]);

  const startSession = useCallback((session, totalSeconds) => {
    setActiveSession({ ...session, totalSeconds });
    setRemainingSeconds(totalSeconds);
    setIsRunning(true);
  }, []);

  const togglePause = useCallback(() => setIsRunning((r) => !r), []);

  const endSession = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setActiveSession(null);
    setRemainingSeconds(0);
  }, []);

  return (
    <TimerContext.Provider value={{ activeSession, remainingSeconds, isRunning, startSession, togglePause, endSession }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside TimerProvider");
  return ctx;
}