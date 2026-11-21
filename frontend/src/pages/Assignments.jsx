import { useEffect, useState, useCallback } from "react";
import { Plus, Search } from "lucide-react";
import { getAssignments } from "../api/assignments";
import AssignmentCard from "../components/AssignmentCard";
import AssignmentFormModal from "../components/AssignmentFormModal";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("due_date");

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    const params = { ordering: sortBy };
    if (search) params.search = search;
    if (priorityFilter) params.priority = priorityFilter;
    if (statusFilter) params.status = statusFilter;
    try {
      const data = await getAssignments(params);
      setAssignments(data.results || data);
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter, statusFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchAssignments, 300); // debounce search typing
    return () => clearTimeout(timer);
  }, [fetchAssignments]);

  const handleUpdated = (updated) => {
    setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleDeleted = (id) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreated = (created) => {
    setAssignments((prev) => [created, ...prev]);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">Assignments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-heading font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Assignment
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <select
          value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="due_date">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="-created_at">Sort: Newest</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-dark-muted text-sm">Loading...</p>
      ) : assignments.length === 0 ? (
        <p className="text-slate-400 dark:text-dark-muted text-sm">No assignments match — try adding one.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <AssignmentCard key={a.id} assignment={a} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </div>
      )}

      {showModal && (
        <AssignmentFormModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}