import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, RefreshCw, Layers, Users } from "lucide-react";

import KpiCard from "@admin/components/KpiCard";
import InsightsFilterBar from "../components/insights/InsightsFilterBar";
import SchoolEngagementChart from "../components/insights/SchoolEngagementChart";
import StandardEngagementChart from "../components/insights/StandardEngagementChart";
import StatusDistributionChart from "../components/insights/StatusDistributionChart";
import DivisionEngagementChart from "../components/insights/DivisionEngagementChart";
import MonitoringInsights from "../components/insights/MonitoringInsights";
import { generateMonitoringInsights } from "../components/insights/insightsRules";
import { useAdminInsights } from "../hooks/useAdminInsights";

/**
 * frontend/admin-dashboard/pages/AdminInsights.jsx
 *
 * Super Admin Panel > AI Insights (Phase 3)
 *
 * Command-center dashboard providing:
 *  - 4-Tier cascading filter bar
 *  - 5 Real-time engagement KPI metrics
 *  - School Engagement Comparison (Grouped BarChart)
 *  - Status Distribution (Donut Chart)
 *  - Standard Engagement Analysis (Grouped BarChart)
 *  - Division Participation (Grouped BarChart)
 *  - Graceful zero-record and empty filter handling
 */
export function AdminInsights() {
  const {
    schools,
    paginationMeta,
    filteredStudents,
    kpis,
    aggregations,
    availableStandards,
    availableDivisions,
    selectedSchool,
    selectedStandard,
    selectedDivision,
    selectedStatus,
    setSelectedSchool,
    setSelectedStandard,
    setSelectedDivision,
    setSelectedStatus,
    resetFilters,
    loading,
    error,
    refetch,
  } = useAdminInsights();

  // Phase 4: Rule-Based Monitoring Insights Generation
  const monitoringInsights = useMemo(() => {
    return generateMonitoringInsights({
      filteredStudents,
      aggregations,
      kpis,
      filters: {
        selectedSchool,
        selectedStandard,
        selectedDivision,
        selectedStatus,
      },
    });
  }, [
    filteredStudents,
    aggregations,
    kpis,
    selectedSchool,
    selectedStandard,
    selectedDivision,
    selectedStatus,
  ]);

  // Primary Engagement KPI Cards
  const kpiCardConfigs = [
    {
      id: "total-students",
      label: "Total Students",
      value: kpis.totalStudents,
      subtitle: selectedSchool !== "All Schools" ? `In ${selectedSchool}` : "Across network",
      icon: "users",
      accent: "#3b82f6",
    },
    {
      id: "active-students",
      label: "Active Students",
      value: kpis.activeStudents,
      subtitle: "Engaged learners",
      icon: "user-check",
      accent: "#10b981",
    },
    {
      id: "inactive-students",
      label: "Inactive Students",
      value: kpis.inactiveStudents,
      subtitle: "Dormant / pending",
      icon: "user-x",
      accent: "#f59e0b",
    },
    {
      id: "engagement-rate",
      label: "Engagement Rate",
      value: `${kpis.engagementRate}%`,
      subtitle: "Active / Total ratio",
      icon: "trending",
      accent: "#8b5cf6",
    },
    {
      id: "monitored-schools",
      label: "Monitored Schools",
      value: kpis.monitoredSchools,
      subtitle: `${schools.length} total registered`,
      icon: "school",
      accent: "#6366f1",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/15 text-[var(--color-primary)]">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                AI Insights
              </h1>
              <span className="rounded-full bg-[var(--color-primary)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-primary)]">
                Super Admin
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
              Monitor student engagement and school activity across the network.
            </p>
          </div>
        </div>

        {/* Diagnostic / Coverage Meta Chip */}
        <div className="flex items-center gap-2 self-start rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[var(--text-secondary)] sm:self-center">
          <Layers className="h-4 w-4 text-[var(--text-muted)]" />
          <span>
            {loading
              ? "Ingesting student records..."
              : `Ingested ${paginationMeta.totalElements} records (${paginationMeta.pagesFetched} page${paginationMeta.pagesFetched === 1 ? "" : "s"})`}
          </span>
        </div>
      </motion.div>

      {/* Error Alert Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-500"
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-1 rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-600"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* 2. Cascading 4-Tier Filter Bar */}
      <InsightsFilterBar
        schools={schools}
        availableStandards={availableStandards}
        availableDivisions={availableDivisions}
        selectedSchool={selectedSchool}
        selectedStandard={selectedStandard}
        selectedDivision={selectedDivision}
        selectedStatus={selectedStatus}
        onSchoolChange={setSelectedSchool}
        onStandardChange={setSelectedStandard}
        onDivisionChange={setSelectedDivision}
        onStatusChange={setSelectedStatus}
        onReset={resetFilters}
        disabled={loading}
      />

      {/* 3. Core Engagement KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpiCardConfigs.map((kpi, idx) => (
          <KpiCard
            key={kpi.id}
            kpi={{
              ...kpi,
              value: loading ? "..." : kpi.value,
            }}
            index={idx}
          />
        ))}
      </div>

      {/* 4. Phase 4: Rule-Based Monitoring Insights */}
      <MonitoringInsights insights={monitoringInsights} loading={loading} />

      {/* Empty State Banner when filtered students is 0 */}
      {!loading && filteredStudents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center shadow-[var(--shadow-sm)]"
        >
          <Users className="h-10 w-10 text-[var(--text-muted)] opacity-50" />
          <h3 className="mt-3 text-sm font-bold text-[var(--text-primary)]">
            No students match the selected filters.
          </h3>
          <p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">
            No student records were found for the selected school, standard, division, or status criteria.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-hover)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset All Filters
          </button>
        </motion.div>
      )}

      {/* 4. Chart Row 1: School Comparison (7 Cols) + Status Distribution (5 Cols) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <SchoolEngagementChart
            data={aggregations.schoolAggregation}
            selectedSchool={selectedSchool}
          />
        </div>
        <div className="lg:col-span-5">
          <StatusDistributionChart
            data={aggregations.statusAggregation}
            totalStudents={kpis.totalStudents}
          />
        </div>
      </div>

      {/* 5. Chart Row 2: Standard Analysis (1 Col) + Division Comparison (1 Col) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <StandardEngagementChart
          data={aggregations.standardAggregation}
          selectedStandard={selectedStandard}
        />
        <DivisionEngagementChart
          data={aggregations.divisionAggregation}
          selectedStandard={selectedStandard}
          selectedDivision={selectedDivision}
        />
      </div>
    </div>
  );
}

export default AdminInsights;
