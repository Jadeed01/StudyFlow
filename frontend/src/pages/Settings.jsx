import { useState } from "react";
import { LogOut, Moon, Sun, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { updateProfile } from "../api/auth";

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [studyHours, setStudyHours] = useState(user?.daily_study_hours ?? 3);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ daily_study_hours: studyHours });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">Settings</h1>

      {/* Account info */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-4">Account</h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-heading font-semibold text-xl">
            {user?.user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.user?.username}</p>
            <p className="text-xs text-slate-400 dark:text-dark-muted">{user?.user?.email || "No email set"}</p>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-4">Appearance</h2>
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border transition-colors"
        >
          <span className="flex items-center gap-3 text-sm text-slate-900 dark:text-white">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            Dark Mode
          </span>
          <span
            className={`w-10 h-5.5 rounded-full p-0.5 transition-colors ${darkMode ? "bg-primary" : "bg-slate-300"}`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? "translate-x-4.5" : "translate-x-0"}`}
            />
          </span>
        </button>
      </div>

      {/* Study preferences */}
      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
        <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-1">Study Preferences</h2>
        <p className="text-xs text-slate-400 dark:text-dark-muted mb-4">
          This controls how much time your Study Plan schedules for you each day.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Daily study hours
              </label>
              <span className="text-sm font-heading font-semibold text-primary">{studyHours}h</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="8"
              step="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-heading font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors"
      >
        <LogOut className="w-4 h-4" /> Log Out
      </button>
    </div>
  );
}