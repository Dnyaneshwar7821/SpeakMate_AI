import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Cpu } from "lucide-react";
import InsightCard from "./InsightCard";

/**
 * frontend/admin-dashboard/components/insights/MonitoringInsights.jsx
 *
 * Super Admin AI Insights - Rule-Based Monitoring Observations (Phase 4)
 *
 * Displays prioritized, data-driven monitoring cards summarizing:
 *  - Cohort activity patterns (Active vs Inactive)
 *  - School-level participation highlights & dormant student concentrations
 *  - Standard & division participation trends
 *  - Filter-aware contextual observations
 */
export function MonitoringInsights({ insights = [], loading = false }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      {/* Section Header */}
      <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 text-[var(--color-primary)]">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)] sm:text-lg">
                AI Monitoring Insights
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-500">
                <Cpu className="h-3 w-3" />
                Rule-Based Engine
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Data-driven observations based on the current filters.
            </p>
          </div>
        </div>

        <span className="self-start text-[11px] font-medium text-[var(--text-muted)] sm:self-center">
          {loading ? "Analyzing cohort..." : `${insights.length} active observation${insights.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Body / Insight Cards Grid */}
      <div className="mt-5">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-4"
              />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 text-center text-xs text-[var(--text-muted)]">
            No active monitoring observations for the current criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight, idx) => (
              <InsightCard key={insight.id || idx} insight={insight} index={idx} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default MonitoringInsights;
