import React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  School,
  BookOpen,
  Users,
  Layers,
} from "lucide-react";

/**
 * Priority visual configurations
 */
const PRIORITY_THEMES = {
  critical: {
    border: "border-rose-500/30",
    bg: "bg-rose-500/[0.04]",
    accentBg: "bg-rose-500/10",
    accentText: "text-rose-500",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: AlertCircle,
  },
  warning: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/[0.04]",
    accentBg: "bg-amber-500/10",
    accentText: "text-amber-500",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: AlertTriangle,
  },
  positive: {
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/[0.04]",
    accentBg: "bg-emerald-500/10",
    accentText: "text-emerald-500",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
  info: {
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/[0.04]",
    accentBg: "bg-indigo-500/10",
    accentText: "text-indigo-500",
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: Info,
  },
};

/**
 * Type icon resolver for contextual category icons
 */
function getContextIcon(type, priority) {
  if (type === "school") return School;
  if (type === "standard") return BookOpen;
  if (type === "division") return Layers;
  if (type === "status") return Users;
  if (priority === "positive") return TrendingUp;
  if (priority === "critical") return AlertCircle;
  if (priority === "warning") return AlertTriangle;
  return Info;
}

/**
 * InsightCard
 *
 * Renders a single rule-based monitoring insight observation card.
 */
export function InsightCard({ insight, index = 0 }) {
  if (!insight) return null;

  const {
    type = "network",
    priority = "info",
    category = "Monitoring",
    title = "",
    message = "",
    metric = "",
    context = "",
  } = insight;

  const theme = PRIORITY_THEMES[priority] || PRIORITY_THEMES.info;
  const IconComponent = getContextIcon(type, priority);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
      className={`flex flex-col justify-between rounded-2xl border ${theme.border} ${theme.bg} p-4 shadow-[var(--shadow-sm)] transition-all hover:shadow-md sm:p-5`}
    >
      {/* Header: Icon + Category Badge */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${theme.accentBg} ${theme.accentText}`}
            >
              <IconComponent className="h-4 w-4" />
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${theme.badgeBg}`}
            >
              {category}
            </span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {priority}
          </span>
        </div>

        {/* Title */}
        <h4 className="mt-3 text-sm font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h4>

        {/* Descriptive Message */}
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
          {message}
        </p>
      </div>

      {/* Footer: Supporting Metric & Optional Context */}
      <div className="mt-4 border-t border-[var(--border-subtle)] pt-3">
        {metric && (
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Metric:
            </span>
            <span className="font-semibold text-[var(--text-primary)]">
              {metric}
            </span>
          </div>
        )}
        {context && (
          <p className="mt-1 text-[11px] italic text-[var(--text-muted)]">
            {context}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default InsightCard;
