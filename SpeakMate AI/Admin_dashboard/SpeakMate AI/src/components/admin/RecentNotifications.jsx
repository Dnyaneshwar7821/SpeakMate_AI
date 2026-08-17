import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

const notifications = [
  {
    id: 1,
    title: "New user registration spike",
    message: "127 new users signed up in the last 24 hours.",
    time: "2 min ago",
    type: "success",
    icon: CheckCircle2,
  },
  {
    id: 2,
    title: "Server load warning",
    message: "CPU usage exceeded 80% on node-3.",
    time: "18 min ago",
    type: "error",
    icon: AlertTriangle,
  },
  {
    id: 3,
    title: "New lesson published",
    message: "15 new lessons have been added to the catalog.",
    time: "1 hour ago",
    type: "info",
    icon: Info,
  },
  {
    id: 4,
    title: "Scheduled maintenance",
    message: "Database backup completed successfully.",
    time: "3 hours ago",
    type: "success",
    icon: CheckCircle2,
  },
];

const typeStyles = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-indigo-600 bg-indigo-50 border-indigo-200",
};

function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-2.5 w-48 rounded bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

export function RecentNotifications({ loading, error, onRetry }) {
  if (loading) {
    return (
      <Card className="overflow-hidden p-5">
        <div className="h-4 w-28 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <NotificationItemSkeleton key={i} />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <AlertCircle size={20} className="text-red-400" />
        <p className="text-xs text-slate-500">Failed to load notifications</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 text-xs">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-950">Recent Notifications</h3>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
          3
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {notifications.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="flex items-start gap-3 px-1 py-3 last:pb-0"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${typeStyles[item.type]}`}>
                <IconComponent size={14} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.title}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="mt-0.5 text-xs leading-5 text-slate-500 line-clamp-2">
                  {item.message}
                </p>
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

export default RecentNotifications;
