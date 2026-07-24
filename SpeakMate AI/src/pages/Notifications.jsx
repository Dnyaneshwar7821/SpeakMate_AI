import { useState } from "react";

const INITIAL_NOTIFICATIONS = [
  { id: "1", title: "Daily Practice Reminder", body: "Don't break your 3-day streak! Practice speaking for 5 minutes today.", time: "10 mins ago", read: false, type: "Learning" },
  { id: "2", title: "Lesson Complete!", body: "Congratulations on completing 'Mastering Self Introductions' +50 XP", time: "2 hours ago", read: false, type: "Learning" },
  { id: "3", title: "New AI Scenario Available", body: "Try the new 'Job Interview Speaking Skills' roleplay scenario.", time: "Yesterday", read: true, type: "System" },
  { id: "4", title: "Weekly Progress Report", body: "You practiced for 45 minutes this week with a 90% grammar accuracy score.", time: "2 days ago", read: true, type: "System" },
];

export function Notifications() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState("All");

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const filtered = notifications.filter((n) => filter === "All" || n.type === filter);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Stay updated with your daily streaks and learning milestones.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[#6c63ff] hover:bg-[#6c63ff]/10"
          >
            Mark all read
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl border border-red-500/20 text-xs font-bold text-red-500 hover:bg-red-500/10"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {["All", "Learning", "System"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === t
                ? "bg-[#6c63ff] text-white shadow-md"
                : "bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]">
            <p className="text-3xl mb-2">🔔</p>
            <p className="font-bold text-sm">No notifications right now!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? "bg-[var(--bg-surface)] border-[#6c63ff]/30 ring-1 ring-[#6c63ff]/20"
                  : "bg-[var(--bg-elevated)] border-[var(--border-default)] opacity-80"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl p-2 rounded-xl bg-[#6c63ff]/10 shrink-0">
                  {n.type === "Learning" ? "🎯" : "📢"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{n.body}</p>
                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold mt-2 block">{n.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
