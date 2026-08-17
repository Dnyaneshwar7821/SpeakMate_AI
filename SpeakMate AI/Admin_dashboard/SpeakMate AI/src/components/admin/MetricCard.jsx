import { motion } from "framer-motion";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import { AlertCircle } from "lucide-react";

function formatValue(value) {
  if (value === null || value === undefined || value === "—") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function TrendBadge({ trend }) {
  if (!trend) return null;

  const color =
    trend.direction === "up"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : trend.direction === "down"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-slate-600 bg-slate-100 border-slate-200";

  const icon = trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→";

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${color}`}>
      {icon} {trend.value}
    </span>
  );
}

function MetricSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-slate-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-14 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>
    </Card>
  );
}

export function MetricCard({ icon: Icon, label, value, trend, loading, error, onRetry, index }) {
  if (loading) {
    return <MetricSkeleton />;
  }

  if (error) {
    return (
      <Card className="flex h-[140px] flex-col items-center justify-center gap-3 p-5">
        <AlertCircle size={18} className="text-red-400" />
        <p className="text-xs text-slate-500">Failed to load</p>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="h-7 text-xs">
            Retry
          </Button>
        )}
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -4, boxShadow: "0px 12px 40px rgba(0,0,0,0.06)" }}
      className="group relative h-[140px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-purple-100"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-100">
            {Icon && <Icon size={18} strokeWidth={1.5} />}
          </div>
          <TrendBadge trend={trend} />
        </div>
        <div>
          <p className="text-[28px] font-bold tracking-tight text-slate-950 leading-none">
            {formatValue(value)}
          </p>
          <p className="mt-1.5 text-sm font-medium text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function MetricCardGrid({ metrics, className = "" }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.label}
          icon={metric.icon}
          label={metric.label}
          value={metric.value}
          trend={metric.trend}
          loading={metric.loading}
          error={metric.error}
          onRetry={metric.onRetry}
          index={index}
        />
      ))}
    </div>
  );
}

export { formatValue };

export default MetricCard;
