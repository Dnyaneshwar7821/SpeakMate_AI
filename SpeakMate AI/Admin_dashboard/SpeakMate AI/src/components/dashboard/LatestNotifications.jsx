import { motion } from "framer-motion";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

const typeIcons = {
  info: "ℹ️",
  success: "✅",
  warning: "⚠️",
  error: "❌",
};

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
        <div className="h-2.5 w-48 rounded bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

export function LatestNotifications({ notifications, loading }) {
  if (loading) {
    return (
      <Card className="overflow-hidden p-5">
        <div className="h-4 w-28 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      </Card>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-black text-slate-950 mb-4">Notifications</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-2xl">🔔</span>
          <p className="mt-2 text-sm font-medium text-slate-600">All caught up!</p>
          <p className="text-xs text-slate-400">No new notifications.</p>
        </div>
      </Card>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-slate-950">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
              {unreadCount}
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold">
          Mark all read
        </Button>
      </div>
      <div className="space-y-1">
        {notifications.map((item, index) => {
          const isUnread = !item.read;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className={`flex items-start gap-3 rounded-2xl px-3 py-3 transition-colors ${
                isUnread ? "bg-indigo-50/40" : "hover:bg-slate-50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm">
                {typeIcons[item.type] || "🔔"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-xs font-bold ${isUnread ? "text-slate-900" : "text-slate-700"} truncate`}>
                    {item.title}
                  </p>
                  {isUnread && (
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                  )}
                </div>
                <p className="mt-0.5 text-[11px] leading-5 text-slate-500 line-clamp-2">
                  {item.message}
                </p>
                <p className="mt-1 text-[10px] font-semibold text-slate-400">{item.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      <Button variant="ghost" size="sm" className="mt-4 w-full justify-center text-xs">
        View all notifications
      </Button>
    </Card>
  );
}

export default LatestNotifications;
