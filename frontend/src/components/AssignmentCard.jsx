import { useState } from "react";
import { Trash2, Check } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import ProgressBar from "./ProgressBar";
import { updateAssignment, deleteAssignment } from "../api/assignments";

export default function AssignmentCard({ assignment, onUpdated, onDeleted }) {
  const [progress, setProgress] = useState(assignment.progress);
  const [saving, setSaving] = useState(false);

  const isCompleted = assignment.status === "completed";

  const commitProgress = async (value) => {
    setSaving(true);
    try {
      const updated = await updateAssignment(assignment.id, { progress: value });
      onUpdated(updated);
    } catch {
      setProgress(assignment.progress); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  const toggleComplete = async () => {
    const newProgress = isCompleted ? 0 : 100;
    setProgress(newProgress);
    setSaving(true);
    try {
      const updated = await updateAssignment(assignment.id, { progress: newProgress });
      onUpdated(updated);
    } catch {
      setProgress(assignment.progress);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${assignment.title}"?`)) return;
    await deleteAssignment(assignment.id);
    onDeleted(assignment.id);
  };

  return (
    <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-4 flex items-start gap-4">
      <button
        onClick={toggleComplete}
        disabled={saving}
        className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
          isCompleted
            ? "bg-success border-success"
            : "border-slate-300 dark:border-dark-border hover:border-primary"
        }`}
      >
        {isCompleted && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${isCompleted ? "line-through text-slate-400" : "text-slate-900 dark:text-white"}`}>
              {assignment.title}
            </p>
            <p className="text-xs text-slate-400 dark:text-dark-muted">
              {assignment.subject_name || "No subject"}
              {assignment.category_name ? ` · ${assignment.category_name}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PriorityBadge priority={assignment.priority} />
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 dark:text-dark-muted mb-3">
          Due {new Date(assignment.due_date).toLocaleString(undefined, {
            month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
          })}
        </p>

        {!isCompleted && (
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              onMouseUp={(e) => commitProgress(Number(e.target.value))}
              onTouchEnd={(e) => commitProgress(Number(e.target.value))}
              className="flex-1 h-1.5 accent-primary cursor-pointer"
            />
            <span className="text-xs text-slate-400 dark:text-dark-muted w-9 text-right">{progress}%</span>
          </div>
        )}
        {isCompleted && <ProgressBar progress={100} />}
      </div>
    </div>
  );
}