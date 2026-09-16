import React, { useState, useMemo } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  CircleDot,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export function LessonsCurriculumSection({ lessons, lessonsDetail, timeSeries }) {
  const [filter, setFilter] = useState("ALL"); // ALL | COMPLETED | IN_PROGRESS | NOT_STARTED
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("orderIndex");
  const [sortDirection, setSortDirection] = useState("asc"); // asc | desc

  const totalActive = lessons?.totalActiveLessons ?? 0;
  const completed = lessons?.completedLessons ?? 0;
  const inProgress = lessons?.inProgressLessons ?? 0;
  const notStarted = lessons?.notStartedLessons ?? Math.max(0, totalActive - completed - inProgress);
  const completionPct = lessons?.completionPercentage ?? (
    totalActive > 0 ? Math.round((completed / totalActive) * 100) : 0
  );

  const rawList = useMemo(() => (Array.isArray(lessonsDetail) ? lessonsDetail : []), [lessonsDetail]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return rawList.filter((item) => {
      const matchFilter =
        filter === "ALL" ||
        (filter === "COMPLETED" && (item.status === "COMPLETED" || item.progressPercent === 100)) ||
        (filter === "IN_PROGRESS" && item.status === "IN_PROGRESS") ||
        (filter === "NOT_STARTED" && item.status === "NOT_STARTED");

      const matchSearch =
        !searchQuery ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.level && item.level.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchFilter && matchSearch;
    });
  }, [rawList, filter, searchQuery]);

  // Sort lessons without mutating original array
  const sortedLessons = useMemo(() => {
    if (!sortField) return filteredLessons;

    return [...filteredLessons].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle strings vs numbers
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal || "").toLowerCase();
        const cmp = aVal.localeCompare(bVal);
        return sortDirection === "asc" ? cmp : -cmp;
      }

      aVal = aVal != null ? aVal : -1;
      bVal = bVal != null ? bVal : -1;
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLessons, sortField, sortDirection]);

  // Pagination calculation
  const totalItems = sortedLessons.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLessons = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * pageSize;
    return sortedLessons.slice(startIndex, startIndex + pageSize);
  }, [sortedLessons, validCurrentPage, pageSize]);

  // Sorting toggle helper
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-400 opacity-60 ml-1 inline" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp size={12} className="text-indigo-600 dark:text-indigo-400 ml-1 inline" />
    ) : (
      <ArrowDown size={12} className="text-indigo-600 dark:text-indigo-400 ml-1 inline" />
    );
  };

  const getSortAria = (field) => {
    if (sortField !== field) return "none";
    return sortDirection === "asc" ? "ascending" : "descending";
  };

  // Lesson Growth Time Series (from Phase 2 DTO: timeSeries.lessonGrowth)
  const lessonGrowthPoints = Array.isArray(timeSeries?.lessonGrowth) ? timeSeries.lessonGrowth : [];
  const growthChartData = lessonGrowthPoints.map((pt, idx) => ({
    name: pt.date
      ? new Date(pt.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : `L${idx + 1}`,
    completed: pt.cumulativeCompletedLessons ?? 0,
  }));

  const renderStatusBadge = (status, pct) => {
    if (status === "COMPLETED" || pct === 100) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold">
          <CheckCircle2 size={11} /> Completed
        </span>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-bold">
          <Clock size={11} /> In Progress ({pct || 0}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold">
        <CircleDot size={11} /> Not Started
      </span>
    );
  };

  return (
    <div
      id="section-lessons"
      className="scroll-mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Curriculum Lessons & Progress
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Complete curriculum tracking against real active catalogue size ({totalActive} active lessons)
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
            Total Lesson Time
          </span>
          <span className="font-black text-slate-900 dark:text-white">
            {lessons?.totalLessonTimeMinutes ?? 0} mins
          </span>
        </div>
      </div>

      {/* Progress Breakdown Bar */}
      <div className="mt-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">Curriculum Completion</span>
          <span className="font-black text-indigo-600 dark:text-indigo-400">{completionPct}% Completed</span>
        </div>

        {/* Segmented bar */}
        <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 flex overflow-hidden">
          {totalActive > 0 ? (
            <>
              <div
                style={{ width: `${(completed / totalActive) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Completed: ${completed} (${Math.round((completed / totalActive) * 100)}%)`}
              />
              <div
                style={{ width: `${(inProgress / totalActive) * 100}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`In Progress: ${inProgress} (${Math.round((inProgress / totalActive) * 100)}%)`}
              />
              <div
                style={{ width: `${(notStarted / totalActive) * 100}%` }}
                className="bg-slate-300 dark:bg-slate-600 transition-all duration-500"
                title={`Not Started: ${notStarted} (${Math.round((notStarted / totalActive) * 100)}%)`}
              />
            </>
          ) : null}
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Completed: <strong className="text-slate-900 dark:text-white">{completed}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              In Progress: <strong className="text-slate-900 dark:text-white">{inProgress}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Not Started: <strong className="text-slate-900 dark:text-white">{notStarted}</strong>
            </span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-semibold">
            Total Active Catalogue: <strong>{totalActive}</strong>
          </div>
        </div>
      </div>

      {/* Lesson Growth Chart (from Phase 2 DTO: timeSeries.lessonGrowth) */}
      {growthChartData.length > 0 && (
        <div className="mt-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Curriculum Completion Progress Over Time
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              {growthChartData.length} completion {growthChartData.length === 1 ? "milestone" : "milestones"}
            </span>
          </div>

          <div className="h-36 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="lessonGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} interval="preserveStartEnd" stroke="#64748b" />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} stroke="#64748b" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val} lessons`, "Cumulative Completed"]}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Cumulative Completed Lessons"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#lessonGrowthGrad)"
                  dot={growthChartData.length === 1 ? { r: 5, fill: "#10b981" } : { r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl text-xs font-semibold">
          {[
            { key: "ALL", label: `All (${rawList.length})` },
            { key: "COMPLETED", label: `Completed (${completed})` },
            { key: "IN_PROGRESS", label: `In Progress (${inProgress})` },
            { key: "NOT_STARTED", label: `Not Started (${notStarted})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setFilter(tab.key);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                filter === tab.key
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input and Page Size */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-52 pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Lessons per page"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
          </select>
        </div>
      </div>

      {/* Detailed Lesson Table with Interactive Sorting */}
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
            <tr>
              <th
                scope="col"
                aria-sort={getSortAria("title")}
                onClick={() => handleSort("title")}
                className="px-4 py-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Lesson Title {renderSortIcon("title")}
              </th>
              <th
                scope="col"
                aria-sort={getSortAria("category")}
                onClick={() => handleSort("category")}
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Category {renderSortIcon("category")}
              </th>
              <th
                scope="col"
                aria-sort={getSortAria("level")}
                onClick={() => handleSort("level")}
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Level {renderSortIcon("level")}
              </th>
              <th
                scope="col"
                aria-sort={getSortAria("status")}
                onClick={() => handleSort("status")}
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Status {renderSortIcon("status")}
              </th>
              <th
                scope="col"
                aria-sort={getSortAria("progressPercent")}
                onClick={() => handleSort("progressPercent")}
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Progress {renderSortIcon("progressPercent")}
              </th>
              <th
                scope="col"
                aria-sort={getSortAria("timeSpentMinutes")}
                onClick={() => handleSort("timeSpentMinutes")}
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                Time Spent {renderSortIcon("timeSpentMinutes")}
              </th>
              <th
                scope="col"
                aria-sort={getSortAria("xpReward")}
                onClick={() => handleSort("xpReward")}
                className="px-3 py-3 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                XP Reward {renderSortIcon("xpReward")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedLessons.length > 0 ? (
              paginatedLessons.map((l, idx) => (
                <tr
                  key={l.lessonId || idx}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {l.title}
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {l.category || "General"}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {l.level || "Beginner"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {renderStatusBadge(l.status, l.progressPercent)}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            l.progressPercent === 100
                              ? "bg-emerald-500"
                              : l.progressPercent > 0
                              ? "bg-blue-500"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${l.progressPercent || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {l.progressPercent || 0}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                    {l.timeSpentMinutes ? `${l.timeSpentMinutes} mins` : "—"}
                  </td>
                  <td className="px-3 py-3 font-bold text-amber-600 dark:text-amber-400">
                    {l.xpReward ? `+${l.xpReward} XP` : "—"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {rawList.length === 0 ? "No lesson curriculum data available." : "No lessons match the selected filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            Showing{" "}
            <strong className="text-slate-900 dark:text-white">
              {(validCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-900 dark:text-white">
              {Math.min(validCurrentPage * pageSize, totalItems)}
            </strong>{" "}
            of <strong className="text-slate-900 dark:text-white">{totalItems}</strong> lessons
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <span className="font-semibold text-slate-800 dark:text-slate-200 px-2">
              Page {validCurrentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={validCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Next page"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonsCurriculumSection;
