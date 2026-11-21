import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createAssignment, getSubjects, getCategories } from "../api/assignments";
import { Link } from "react-router-dom";

export default function AssignmentFormModal({ onClose, onCreated }) {
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: "", description: "", subject: "", category: "", priority: "medium", due_date: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getSubjects(), getCategories()]).then(([s, c]) => {
      setSubjects(s.results || s);
      setCategories(c.results || c);
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        category: form.category || null,
        due_date: new Date(form.due_date).toISOString(),
      };
      const created = await createAssignment(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const firstError = data ? Object.values(data)[0]?.[0] : null;
      setError(firstError || "Couldn't create assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white">Add Assignment</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-bg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
            {error}
          </div>
        )}
        {subjects.length === 0 && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
            No subjects yet — <Link to="/categories" className="underline font-medium">add one here</Link> first.
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Title</label>
            <input
              name="title" value={form.title} onChange={handleChange} required
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange} rows={2}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
              <select
                name="subject" value={form.subject} onChange={handleChange} required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select...</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
              <select
                name="category" value={form.category} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Priority</label>
              <select
                name="priority" value={form.priority} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Due date</label>
              <input
                type="datetime-local" name="due_date" value={form.due_date} onChange={handleChange} required
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <button
            type="submit" disabled={saving}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-heading font-medium transition-colors"
          >
            {saving ? "Adding..." : "Add Assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}