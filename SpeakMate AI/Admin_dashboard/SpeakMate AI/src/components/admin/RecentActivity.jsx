import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  UserPlus,
  MessageSquare,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

const activities = [
  {
    id: 1,
    action: "New user registered",
    user: "Jane Cooper",
    email: "jane@example.com",
    time: "2 min ago",
    status: "success",
    icon: UserPlus,
  },
  {
    id: 2,
    action: "Lesson completed",
    user: "Alex Morgan",
    email: "alex@example.com",
    time: "15 min ago",
    status: "success",
    icon: CheckCircle2,
  },
  {
    id: 3,
    action: "Speaking session started",
    user: "Sarah Wilson",
    email: "sarah@example.com",
    time: "42 min ago",
    status: "info",
    icon: MessageSquare,
  },
  {
    id: 4,
    action: "Account deactivated",
    user: "Mike Johnson",
    email: "mike@example.com",
    time: "1 hour ago",
    status: "error",
    icon: XCircle,
  },
];

const statusStyles = {
  success: "text-emerald-600 bg-emerald-50 border-emerald-200",
  info: "text-indigo-600 bg-indigo-50 border-indigo-200",
  error: "text-red-600 bg-red-50 border-red-200",
};

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-2.5 w-48 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="h-3 w-12 rounded bg-slate-200 animate-pulse" />
    </div>
  );
}

export function RecentActivity({ loading, error, onRetry }) {
  if (loading) {
    return (
      <Card className="overflow-hidden p-5">
        <div className="h-4 w-28 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <AlertCircle size={20} className="text-red-400" />
        <p className="text-xs text-slate-500">Failed to load activity</p>
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
        <h3 className="text-sm font-semibold text-slate-950">Recent Activity</h3>
        <span className="text-xs text-slate-500">Last 24 hours</span>
      </div>
      <div className="divide-y divide-slate-100">
        {activities.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.04 }}
              className="flex items-start gap-3 px-1 py-3 last:pb-0"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${statusStyles[item.status]}`}>
                <IconComponent size={14} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {item.action}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500 truncate">
                  {item.user} &middot; {item.email}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

export default RecentActivity;
