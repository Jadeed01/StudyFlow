import { useEffect, useState } from "react";
import { Bell, AlertCircle, Clock, Info } from "lucide-react";
import { getNotifications, markNotificationRead } from "../api/notifications";

const ICONS = {
  deadline: { icon: AlertCircle, color: "#EF4444" },
  reminder: { icon: Clock, color: "#F59E0B" },
  system: { icon: Info, color: "#6366F1" },
};

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | unread

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = filter === "unread" ? { is_read: false } : {};
      const data = await getNotifications(params);
      setNotifications(data.results || data);
      setLoading(false);
    }
    load();
  }, [filter]);

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await markNotificationRead(id);
    } catch {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading font-semibold text-2xl text-slate-900 dark:text-white">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary font-medium hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {["all", "unread"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f
                ? "bg-primary text-white"
                : "bg-white dark:bg-dark-surface text-slate-500 dark:text-dark-muted border border-slate-200 dark:border-dark-border"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl divide-y divide-slate-100 dark:divide-dark-border overflow-hidden">
        {loading ? (
          <p className="p-5 text-sm text-slate-500 dark:text-dark-muted">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="p-10 flex flex-col items-center text-center">
            <Bell className="w-8 h-8 text-slate-300 dark:text-dark-muted mb-3" />
            <p className="text-sm text-slate-400 dark:text-dark-muted">
              {filter === "unread" ? "No unread notifications." : "No notifications yet."}
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const { icon: Icon, color } = ICONS[n.notification_type] || ICONS.system;
            return (
              <button
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`w-full flex items-start gap-3 p-4 text-left transition-colors ${
                  n.is_read ? "" : "bg-primary/5"
                } hover:bg-slate-50 dark:hover:bg-dark-bg`}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}1A` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.is_read ? "text-slate-600 dark:text-slate-300" : "text-slate-900 dark:text-white font-medium"}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-dark-muted mt-0.5">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}