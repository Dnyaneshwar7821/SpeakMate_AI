import React from "react";
import { Filter, ChevronDown, RotateCcw } from "lucide-react";
import { formatStandardLabel } from "../../hooks/useAdminInsights";

/**
 * frontend/admin-dashboard/components/insights/InsightsFilterBar.jsx
 *
 * 4-Tier cascading filter bar for Super Admin AI Insights:
 *   1. School: All Schools or specific school name
 *   2. Standard: All Standards or configured standards for the school
 *   3. Division: All Divisions or configured divisions for school + standard
 *   4. Status: All, Active, or Inactive
 *   + Reset Filters button
 */
export function InsightsFilterBar({
  schools = [],
  availableStandards = [],
  availableDivisions = [],
  selectedSchool = "All Schools",
  selectedStandard = "all",
  selectedDivision = "all",
  selectedStatus = "all",
  onSchoolChange,
  onStandardChange,
  onDivisionChange,
  onStatusChange,
  onReset,
  disabled = false,
}) {
  const isFiltered =
    selectedSchool !== "All Schools" ||
    selectedStandard !== "all" ||
    selectedDivision !== "all" ||
    selectedStatus !== "all";

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
      <div className="flex flex-col gap-4">
        {/* Top Header / Context */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Filter className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Filter Insights</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Drill down by school, standard, division, and status
              </p>
            </div>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
          )}
        </div>

        {/* 4 Filter Dropdowns in Responsive Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. School Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="school-filter" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              School
            </label>
            <div className="relative">
              <select
                id="school-filter"
                value={selectedSchool}
                onChange={(e) => onSchoolChange(e.target.value)}
                disabled={disabled}
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] pl-3.5 pr-10 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
              >
                <option value="All Schools">All Schools ({schools.length})</option>
                {schools.map((s) => (
                  <option key={s.id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>

          {/* 2. Standard Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="standard-filter" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Standard
            </label>
            <div className="relative">
              <select
                id="standard-filter"
                value={selectedStandard}
                onChange={(e) => onStandardChange(e.target.value)}
                disabled={disabled}
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] pl-3.5 pr-10 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
              >
                <option value="all">All Standards</option>
                {availableStandards.map((std) => (
                  <option key={std} value={std}>
                    {formatStandardLabel(std)}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>

          {/* 3. Division Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="division-filter" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Division
            </label>
            <div className="relative">
              <select
                id="division-filter"
                value={selectedDivision}
                onChange={(e) => onDivisionChange(e.target.value)}
                disabled={disabled}
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] pl-3.5 pr-10 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
              >
                <option value="all">All Divisions</option>
                {availableDivisions.map((div) => (
                  <option key={div} value={div}>
                    Division {div}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>

          {/* 4. Status Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status-filter" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Status
            </label>
            <div className="relative">
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => onStatusChange(e.target.value)}
                disabled={disabled}
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] pl-3.5 pr-10 text-xs font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-60"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsFilterBar;
