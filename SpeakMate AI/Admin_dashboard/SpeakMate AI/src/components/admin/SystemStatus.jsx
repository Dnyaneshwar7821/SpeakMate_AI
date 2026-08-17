import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Zap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

const statusItems = [
  {
    label: "API Server",
    status: "operational",
    uptime: "99.98%",
    icon: Zap,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    label: "Database",
    status: "operational",
    uptime: "99.95%",
    icon: Activity,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    label: "Auth Service",
    status: "operational",
    uptime: "99.99%",
    icon: ShieldCheck,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  {
    label: "Last Deploy",
    status: "success",
    uptime: "2h ago",
    icon: Clock,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
  },
];

function StatusDot({ status }) {
  if (status === "operational" || status === "success") {
    return <CheckCircle2 size={14} className="text-emerald-600" />;
  }
  return <AlertCircle size={14} className="text-amber-600" />;
}

function StatusItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
        <div className="h-2.5 w-12 rounded bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

export function SystemStatus({ loading, error, onRetry }) {
  if (loading) {
    return (
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          <div className="h-6 w-14 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatusItemSkeleton key={i} />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-3 p-6">
        <AlertCircle size={20} className="text-red-400" />
        <p className="text-xs text-slate-500">Failed to load status</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 text-xs">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-950">System Status</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Healthy
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {statusItems.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-3 py-2.5"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.color}`}>
              <item.icon size={14} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{item.label}</p>
              <p className="text-xs text-slate-500">{item.uptime}</p>
            </div>
            <StatusDot status={item.status} />
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

export default SystemStatus;
