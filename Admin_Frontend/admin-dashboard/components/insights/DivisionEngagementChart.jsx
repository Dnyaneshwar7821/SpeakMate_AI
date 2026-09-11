import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users2, BarChart3 } from "lucide-react";
import SectionCard from "@admin/components/SectionCard";
import { formatStandardLabel } from "../../hooks/useAdminInsights";

/**
 * Custom Tooltip for Division Participation
 */
function DivisionTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload || {};
  const rate = dataPoint.engagementRate ?? 0;
  const displayLabel = label === "Unassigned" ? "Unassigned Division" : `Division ${label}`;

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-xs shadow-lg">
      <p className="font-bold text-[var(--text-primary)]">{displayLabel}</p>
      <div className="mt-2 space-y-1">
        <p className="flex items-center justify-between gap-4 text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#6366f1]" />
            Total Students:
          </span>
          <span className="font-semibold text-[var(--text-primary)]">
            {dataPoint.totalStudents ?? 0}
          </span>
        </p>
        <p className="flex items-center justify-between gap-4 text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            Active Students:
          </span>
          <span className="font-semibold text-[#10b981]">
            {dataPoint.activeStudents ?? 0}
          </span>
        </p>
        <p className="flex items-center justify-between gap-4 text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
            Inactive Students:
          </span>
          <span className="font-semibold text-[#f59e0b]">
            {dataPoint.inactiveStudents ?? 0}
          </span>
        </p>
        <div className="mt-1.5 border-t border-[var(--border-subtle)] pt-1 text-right">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Engagement Rate:{" "}
          </span>
          <span className="font-bold text-[var(--color-primary)]">{rate}%</span>
        </div>
      </div>
    </div>
  );
}

/**
 * frontend/admin-dashboard/components/insights/DivisionEngagementChart.jsx
 *
 * Compares student engagement across divisions (sections) within the active cohort.
 */
export function DivisionEngagementChart({
  data = [],
  selectedStandard = "all",
  selectedDivision = "all",
}) {
  const hasData = Array.isArray(data) && data.length > 0;

  const subtitle =
    selectedStandard !== "all"
      ? `Divisions for ${formatStandardLabel(selectedStandard)}`
      : selectedDivision !== "all"
      ? `Division ${selectedDivision} student participation`
      : "Student participation across academic divisions";

  return (
    <SectionCard
      title="Division Participation"
      subtitle={subtitle}
      action={
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]">
          <Users2 className="h-4 w-4 text-[var(--color-primary)]" />
          <span>{hasData ? `${data.length} Division${data.length === 1 ? "" : "s"}` : "0 Divisions"}</span>
        </div>
      }
    >
      <div className="h-[300px] w-full">
        {!hasData ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-[var(--bg-elevated)] p-3 text-[var(--text-muted)]">
              <BarChart3 className="h-6 w-6 opacity-60" />
            </div>
            <p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
              No division records match the active filters.
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Try selecting a different standard or resetting your division filter.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 15, left: -10, bottom: 15 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border-subtle)"
              />
              <XAxis
                dataKey="division"
                tickFormatter={(d) => (d === "Unassigned" ? d : `Div ${d}`)}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 11 }}
              />
              <Tooltip content={<DivisionTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />
              <Bar
                dataKey="totalStudents"
                name="Total Students"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="activeStudents"
                name="Active Students"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                dataKey="inactiveStudents"
                name="Inactive Students"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </SectionCard>
  );
}

export default DivisionEngagementChart;
