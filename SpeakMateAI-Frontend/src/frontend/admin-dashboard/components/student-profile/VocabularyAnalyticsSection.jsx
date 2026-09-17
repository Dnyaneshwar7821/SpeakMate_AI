import React from "react";
import {
  BookOpen,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export function VocabularyAnalyticsSection({ vocabulary, timeSeries }) {
  if (!vocabulary) return null;

  // Use the actual Phase 2 DTO field name: timeSeries.vocabularyGrowth
  const trendPoints = Array.isArray(timeSeries?.vocabularyGrowth) ? timeSeries.vocabularyGrowth : [];
  const chartData = trendPoints.map((pt, idx) => {
    const dateObj = pt.date ? new Date(pt.date) : null;
    const dateLabel = dateObj
      ? dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : `Point ${idx + 1}`;
    const timeLabel = dateObj
      ? dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "";
    return {
      idx,
      name: dateLabel,
      time: timeLabel,
      fullDate: dateObj ? `${dateLabel}, ${timeLabel}` : `Point ${idx + 1}`,
      total: pt.cumulativeWords ?? 0,
      mastered: pt.masteredWords ?? 0,
    };
  });

  const totalWords = vocabulary.totalWords ?? 0;
  const masteredWords = vocabulary.masteredWords ?? 0;
  const learningWords = vocabulary.learningWords ?? Math.max(0, totalWords - masteredWords);
  const masteryPct =
    vocabulary.masteryPercentage ??
    (totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0);

  return (
    <div
      id="section-vocabulary"
      className="scroll-mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Vocabulary Acquisition & Mastery
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Track cumulative vocabulary growth and verified word retention over time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
            {masteryPct}% Verified Mastery Rate
          </span>
        </div>
      </div>

      {/* Vocabulary Metric Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Total Logged Words
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalWords}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Words actively logged in student dictionary
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/20 p-4">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Mastered Words
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {masteredWords}
          </p>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
            Independently verified as mastered ({masteryPct}%)
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/20 p-4">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            In Active Learning
          </p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {learningWords}
          </p>
          <p className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-1">
            Words undergoing active practice & retention
          </p>
        </div>
      </div>

      {/* Vocabulary Growth Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Cumulative Vocabulary Growth
          </h4>
          {chartData.length > 0 && (
            <span className="text-[11px] font-medium text-slate-500">
              {chartData.length} recording {chartData.length === 1 ? "point" : "points"}
            </span>
          )}
        </div>

        {/* Single Data Point Baseline State */}
        {chartData.length === 1 && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 p-3 text-xs text-blue-800 dark:text-blue-300">
            <Sparkles size={14} className="text-blue-500 shrink-0" />
            <span>
              <strong>Initial Baseline:</strong> First vocabulary record established ({chartData[0].total} total words, {chartData[0].mastered} mastered).
            </span>
          </div>
        )}

        {chartData.length > 0 ? (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="vocabTotalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="vocabMasteredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  tickLine={false}
                  stroke="#64748b"
                  tickFormatter={(val, idx) => {
                    if (idx > 0 && chartData[idx - 1]?.name === val) {
                      return "";
                    }
                    return val;
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  itemSorter={(item) => (item.dataKey === "total" ? -1 : 1)}
                  labelFormatter={(label, items) => {
                    const payload = items?.[0]?.payload;
                    return payload?.fullDate || label;
                  }}
                  formatter={(val, name, item) => {
                    const isTotal = item?.dataKey === "total" || name === "total" || name === "Total Vocabulary";
                    return [`${val} words`, isTotal ? "Total Vocabulary" : "Mastered Words"];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Vocabulary"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#vocabTotalGrad)"
                  dot={chartData.length === 1 ? { r: 5, fill: "#3b82f6" } : false}
                />
                <Area
                  type="monotone"
                  dataKey="mastered"
                  name="Mastered Words"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#vocabMasteredGrad)"
                  dot={chartData.length === 1 ? { r: 5, fill: "#10b981" } : false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center p-4">
            <BookOpen size={24} className="mb-2 text-slate-400 dark:text-slate-600" />
            <p>No vocabulary growth time-series recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VocabularyAnalyticsSection;
