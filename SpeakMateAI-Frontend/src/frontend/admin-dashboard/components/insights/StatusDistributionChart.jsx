import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon, CheckCircle2, XCircle } from "lucide-react";
import SectionCard from "@admin/components/SectionCard";

const STATUS_COLORS = {
  active: "#10b981",
  inactive: "#f59e0b",
};

/**
 * Custom Tooltip for Status Distribution
 */
function StatusTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0];
  const percent = dataPoint.payload?.percentage ?? 0;

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-xs shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: dataPoint.payload?.color }}
        />
        <span className="font-bold text-[var(--text-primary)]">
          {dataPoint.name}:
        </span>
        <span className="font-bold text-[var(--text-primary)]">
          {dataPoint.value}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
        {percent}% of current cohort
      </p>
    </div>
  );
}

/**
 * frontend/admin-dashboard/components/insights/StatusDistributionChart.jsx
 *
 * Visualizes Active vs. Inactive student distribution in a donut chart.
 */
export function StatusDistributionChart({ data = { active: 0, inactive: 0 }, totalStudents = 0 }) {
  const activeCount = data?.active ?? 0;
  const inactiveCount = data?.inactive ?? 0;
  const hasData = totalStudents > 0 && (activeCount > 0 || inactiveCount > 0);

  const activePercent = hasData ? ((activeCount / totalStudents) * 100).toFixed(1) : "0.0";
  const inactivePercent = hasData ? ((inactiveCount / totalStudents) * 100).toFixed(1) : "0.0";

  const chartData = [
    {
      name: "Active Students",
      value: activeCount,
      percentage: activePercent,
      color: STATUS_COLORS.active,
    },
    {
      name: "Inactive Students",
      value: inactiveCount,
      percentage: inactivePercent,
      color: STATUS_COLORS.inactive,
    },
  ];

  return (
    <SectionCard
      title="Status Distribution"
      subtitle="Active vs. inactive learner breakdown"
      action={
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <PieIcon className="h-4 w-4 text-[var(--color-primary)]" />
          <span>{totalStudents} Total</span>
        </div>
      }
    >
      <div className="flex h-[300px] flex-col items-center justify-between sm:flex-row">
        {!hasData ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-[var(--bg-elevated)] p-3 text-[var(--text-muted)]">
              <PieIcon className="h-6 w-6 opacity-60" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
              No status distribution available.
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Filtered student population is zero.
            </p>
          </div>
        ) : (
          <>
            {/* Donut Chart with Centered Metric */}
            <div className="relative flex h-[240px] w-full items-center justify-center sm:h-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Tooltip content={<StatusTooltip />} />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="var(--bg-surface)"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Total Label inside Donut */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
                  {totalStudents}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Students
                </span>
              </div>
            </div>

            {/* Accompanying Status Breakdown Legend */}
            <div className="flex w-full flex-col justify-center gap-3 px-2 sm:w-1/2 sm:px-4">
              {/* Active Item */}
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Active</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{activePercent}% of cohort</p>
                  </div>
                </div>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {activeCount}
                </span>
              </div>

              {/* Inactive Item */}
              <div className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2.5">
                  <XCircle className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Inactive</p>
                    <p className="text-[11px] text-[var(--text-secondary)]">{inactivePercent}% of cohort</p>
                  </div>
                </div>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {inactiveCount}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </SectionCard>
  );
}

export default StatusDistributionChart;
