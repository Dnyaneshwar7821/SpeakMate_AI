import React, { useState } from "react";
import {
  SpellCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export function GrammarAnalyticsSection({ grammar, timeSeries }) {
  const [showRecent, setShowRecent] = useState(false);

  if (!grammar) return null;

  // Use the actual Phase 2 DTO field name: timeSeries.grammarTrend
  const trendPoints = Array.isArray(timeSeries?.grammarTrend) ? timeSeries.grammarTrend : [];
  const chartData = trendPoints.map((pt, idx) => ({
    name: pt.date
      ? new Date(pt.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : `Check ${idx + 1}`,
    score: pt.grammarScore != null ? Math.round(pt.grammarScore) : null,
  }));

  const trend = grammar.grammarTrend;

  const renderTrendBanner = () => {
    if (!trend || trend.trendDirection === "INSUFFICIENT_DATA") {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-400">
          <Minus size={14} className="text-slate-400 shrink-0" />
          <span>
            {trend?.description || "At least 4 grammar checks are required to evaluate a trend."}
          </span>
        </div>
      );
    }
    if (trend.trendDirection === "IMPROVING") {
      return (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500 shrink-0" />
            <span>
              <strong>Grammar Accuracy Improving:</strong> Recent checks average {trend.recentAverage}% vs previous {trend.previousAverage}%.
            </span>
          </div>
          <span className="font-black text-emerald-600 dark:text-emerald-400 shrink-0">
            +{Math.abs(trend.change || 0).toFixed(1)}%
          </span>
        </div>
      );
    }
    if (trend.trendDirection === "DECLINING") {
      return (
        <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} className="text-amber-500 shrink-0" />
            <span>
              <strong>Grammar Accuracy Declining:</strong> Recent checks average {trend.recentAverage}% vs previous {trend.previousAverage}%.
            </span>
          </div>
          <span className="font-black text-amber-600 dark:text-amber-400 shrink-0">
            -{Math.abs(trend.change || 0).toFixed(1)}%
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-xs text-blue-800 dark:text-blue-300">
        <div className="flex items-center gap-2">
          <Minus size={16} className="text-blue-500 shrink-0" />
          <span>
            <strong>Grammar Performance Stable:</strong> Accuracy consistent at {trend.recentAverage}%.
          </span>
        </div>
        <span className="font-black text-blue-600 dark:text-blue-400 shrink-0">Stable</span>
      </div>
    );
  };

  return (
    <div
      id="section-grammar"
      className="scroll-mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <SpellCheck size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Grammar Accuracy & Analytics
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Evaluations of syntax, correction history, and accuracy rates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Total Checks
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {grammar.totalChecks ?? 0}
            </span>
          </div>
          <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-3">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Average Accuracy
            </span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {grammar.averageScore != null ? `${Math.round(grammar.averageScore)}%` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Trend Banner */}
      <div className="mt-4">{renderTrendBanner()}</div>

      {/* Chronological Accuracy Trend Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Grammar Accuracy Over Time
          </h4>
          {chartData.length > 0 && (
            <span className="text-[11px] font-medium text-slate-500">
              {chartData.length} {chartData.length === 1 ? "check" : "checks"} recorded
            </span>
          )}
        </div>

        {/* Single Data Point Baseline State */}
        {chartData.length === 1 && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-3 text-xs text-emerald-800 dark:text-emerald-300">
            <Sparkles size={14} className="text-emerald-500 shrink-0" />
            <span>
              <strong>Initial Baseline:</strong> 1 grammar evaluation recorded ({chartData[0].score}% accuracy). Complete additional checks to plot progression.
            </span>
          </div>
        )}

        {chartData.length > 0 ? (
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval="preserveStartEnd"
                  stroke="#64748b"
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "10px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val}%`, "Accuracy Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Accuracy Score"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: chartData.length === 1 ? 6 : 4, fill: "#10b981" }}
                  activeDot={{ r: 7 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center p-4">
            <SpellCheck size={24} className="mb-2 text-slate-400 dark:text-slate-600" />
            <p>No grammar check time-series recorded yet.</p>
          </div>
        )}
      </div>

      {/* Recent Grammar Checks Toggle */}
      {grammar.recentChecks && grammar.recentChecks.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            id="recent-grammar-toggle"
            aria-expanded={showRecent}
            aria-controls="recent-grammar-checks-list"
            onClick={() => setShowRecent(!showRecent)}
            className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
          >
            <span>Recent Grammar Checks ({grammar.recentChecks.length})</span>
            {showRecent ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showRecent && (
            <div id="recent-grammar-checks-list" role="region" aria-labelledby="recent-grammar-toggle" className="mt-3 space-y-2.5">
              {grammar.recentChecks.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {c.date ? new Date(c.date).toLocaleString() : "Recent Check"}
                    </span>
                    {c.grammarScore != null && (
                      <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        {Math.round(c.grammarScore)}% Accuracy
                      </span>
                    )}
                  </div>

                  {c.originalText && (
                    <div className="bg-red-50/60 dark:bg-red-950/30 border-l-2 border-red-400 p-2 rounded-r text-red-900 dark:text-red-200">
                      <span className="font-bold text-[10px] uppercase block text-red-600 dark:text-red-400">
                        Original Input:
                      </span>
                      {c.originalText}
                    </div>
                  )}

                  {c.correctedText && (
                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border-l-2 border-emerald-400 p-2 rounded-r text-emerald-900 dark:text-emerald-200">
                      <span className="font-bold text-[10px] uppercase block text-emerald-600 dark:text-emerald-400">
                        Suggested Correction:
                      </span>
                      {c.correctedText}
                    </div>
                  )}

                  {c.explanation && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                      {c.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GrammarAnalyticsSection;
