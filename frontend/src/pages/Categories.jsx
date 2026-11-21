import { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen, Tag } from "lucide-react";
import {
  getSubjects, createSubject, deleteSubject,
  getCategories, createCategory, deleteCategory,
} from "../api/assignments";
import ColorPicker from "../components/ColorPicker";

export default function Categories() {
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [subjectName, setSubjectName] = useState("");
  const [subjectColor, setSubjectColor] = useState("#6366F1");
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, c] = await Promise.all([getSubjects(), getCategories()]);
    setSubjects(s.results || s);
    setCategories(c.results || c);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await createSubject({ name: subjectName, color: subjectColor });
      setSubjects((prev) => [...prev, created]);
      setSubjectName("");
      setSubjectColor("#6366F1");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.name?.[0] || "Couldn't add subject.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await createCategory({ name: categoryName });
      setCategories((prev) => [...prev, created]);
      setCategoryName("");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.name?.[0] || "Couldn't add category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!confirm("Delete this subject? Assignments using it will keep their data but lose the subject link.")) return;
    await deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  if (loading) {
    return <p className="text-slate-500 dark:text-dark-muted text-sm">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">Categories</h1>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subjects */}
        <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white">Subjects</h2>
          </div>

          <form onSubmit={handleAddSubject} className="mb-5 space-y-3">
            <div className="flex gap-2">
              <input
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Mathematics"
                required
                className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <ColorPicker value={subjectColor} onChange={setSubjectColor} />
          </form>

          {subjects.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-dark-muted">No subjects yet — add one above.</p>
          ) : (
            <div className="space-y-2">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-100 dark:border-dark-border"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-slate-900 dark:text-white">{s.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(s.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-secondary" />
            <h2 className="font-heading font-semibold text-lg text-slate-900 dark:text-white">Categories</h2>
          </div>

          <form onSubmit={handleAddCategory} className="mb-5 flex gap-2">
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Homework, Project, Lab Report"
              required
              className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {categories.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-dark-muted">No categories yet — add one above.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-100 dark:border-dark-border"
                >
                  <span className="text-sm text-slate-900 dark:text-white">{c.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}