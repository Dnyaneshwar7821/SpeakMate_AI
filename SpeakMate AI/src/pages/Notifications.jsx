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
    <div className="w-full max-w-4xl mx-auto space-y-6 px-2 sm:px-4 lg:px-6 py-2">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-2xl space-y-3 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-amber-300 border border-white/20">
            🔔 Activity Feed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Notifications</h1>
          <p className="text-xs text-indigo-200 font-medium">Stay updated with your daily streaks and learning milestones.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-black text-white transition-all active:scale-95"
          >
            Mark All Read
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-black text-rose-300 transition-all active:scale-95"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {["All", "Learning", "System"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 ${
              filter === t
                ? "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md shadow-[#6C63FF]/25 scale-102"
                : "glass-card border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border border-[var(--border-default)] text-[var(--text-secondary)] space-y-2">
            <p className="text-4xl">🔔</p>
            <p className="font-extrabold text-sm text-[var(--text-primary)]">No notifications right now!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !n.read
                  ? "glass-card border-[#6C63FF]/40 ring-1 ring-[#6C63FF]/20 shadow-md"
                  : "bg-[var(--bg-elevated)] border-[var(--border-default)] opacity-80"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <span className="text-xl p-2.5 rounded-2xl bg-[#6C63FF]/15 text-[#6C63FF] shrink-0">
                  {n.type === "Learning" ? "🎯" : "📢"}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm text-[var(--text-primary)]">{n.title}</h3>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">{n.body}</p>
                  <span className="text-[10px] text-[var(--text-muted)] font-bold mt-2 block">{n.time}</span>
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
