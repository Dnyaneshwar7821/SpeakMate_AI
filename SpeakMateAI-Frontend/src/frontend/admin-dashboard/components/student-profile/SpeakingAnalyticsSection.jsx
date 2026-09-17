import React, { useState } from "react";
import {
  Mic,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp
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

export function SpeakingAnalyticsSection({ speaking, timeSeries }) {
  const [showRecent, setShowRecent] = useState(false);

  if (!speaking) return null;

  // Use the actual Phase 2 DTO field name: timeSeries.speakingTrend
  const trendPoints = Array.isArray(timeSeries?.speakingTrend) ? timeSeries.speakingTrend : [];
  const chartData = trendPoints.map((pt, idx) => {
    const dateObj = pt.date ? new Date(pt.date) : null;
    const dateLabel = dateObj
      ? dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : `Session ${idx + 1}`;
    const timeLabel = dateObj
      ? dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "";
    return {
      idx,
      name: dateLabel,
      time: timeLabel,
      fullDate: dateObj ? `${dateLabel}, ${timeLabel}` : `Session ${idx + 1}`,
      overall: pt.overallScore != null ? Math.round(pt.overallScore) : null,
      fluency: pt.fluencyScore != null ? Math.round(pt.fluencyScore) : null,
      pronunciation: pt.pronunciationScore != null ? Math.round(pt.pronunciationScore) : null,
    };
  });

  const trend = speaking.speakingTrend;

  const renderTrendBanner = () => {
    if (!trend || trend.trendDirection === "INSUFFICIENT_DATA") {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-400">
          <Minus size={14} className="text-slate-400 shrink-0" />
          <span>
            {trend?.description || "At least 4 scored speaking sessions are required to evaluate a trend."}
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
              <strong>Speaking Improving:</strong> Recent sessions average {trend.recentAverage}% vs previous {trend.previousAverage}%.
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
              <strong>Speaking Declining:</strong> Recent sessions average {trend.recentAverage}% vs previous {trend.previousAverage}%.
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
            <strong>Speaking Performance Stable:</strong> Average performance remaining consistent around {trend.recentAverage}%.
          </span>
        </div>
        <span className="font-black text-blue-600 dark:text-blue-400 shrink-0">Stable</span>
      </div>
    );
  };

  const subScores = [
    { label: "Overall Score", value: speaking.averageOverallScore, color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Pronunciation", value: speaking.averagePronunciationScore, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Fluency", value: speaking.averageFluencyScore, color: "text-blue-600 dark:text-blue-400" },
    { label: "Grammar in Speech", value: speaking.averageGrammarScore, color: "text-purple-600 dark:text-purple-400" },
    { label: "Vocabulary in Speech", value: speaking.averageVocabularyScore, color: "text-teal-600 dark:text-teal-400" },
  ];

  return (
    <div
      id="section-speaking"
      className="scroll-mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Mic size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Speaking Performance & Analytics
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Evaluations based strictly on recorded AI conversation sessions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Total Practice
            </span>
            <span className="font-black text-slate-900 dark:text-white">
              {speaking.totalSpeakingMinutes ?? 0} mins
            </span>
          </div>
          <div className="text-right border-l border-slate-200 dark:border-slate-800 pl-3">
            <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Best Score
            </span>
            <span className="font-black text-indigo-600 dark:text-indigo-400">
              {speaking.bestScore != null ? `${Math.round(speaking.bestScore)}%` : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Trend Banner */}
      <div className="mt-4">{renderTrendBanner()}</div>

      {/* Real Score Breakdown Cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {subScores.map((score, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3 text-center"
          >
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate">
              {score.label}
            </p>
            <p className={`text-lg font-black mt-1 ${score.color}`}>
              {score.value != null ? `${Math.round(score.value)}%` : "Not enough data"}
            </p>
          </div>
        ))}
      </div>

      {/* Chronological Trend Chart */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Speaking Score Trend Over Time
          </h4>
          {chartData.length > 0 && (
            <span className="text-[11px] font-medium text-slate-500">
              {chartData.length} scored {chartData.length === 1 ? "session" : "sessions"} recorded
            </span>
          )}
        </div>

        {/* Single Data Point Baseline State */}
        {chartData.length === 1 && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 p-3 text-xs text-blue-800 dark:text-blue-300">
            <Sparkles size={14} className="text-blue-500 shrink-0" />
            <span>
              <strong>Initial Baseline:</strong> 1 speaking session recorded ({chartData[0].overall}% overall score). Complete additional sessions to establish a trendline.
            </span>
          </div>
        )}

        {chartData.length > 0 ? (
          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="speakingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  stroke="#64748b"
                  tickFormatter={(val, idx) => {
                    if (idx > 0 && chartData[idx - 1]?.name === val) {
                      return "";
                    }
                    return val;
                  }}
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
                  labelFormatter={(label, items) => {
                    const payload = items?.[0]?.payload;
                    return payload?.fullDate || label;
                  }}
                  formatter={(val, name) => [`${val}%`, String(name).toUpperCase()]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="overall"
                  name="Overall Score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#speakingGrad)"
                  connectNulls
                  dot={chartData.length === 1 ? { r: 5, fill: "#6366f1" } : { r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="fluency"
                  name="Fluency"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="none"
                  connectNulls
                  dot={chartData.length === 1 ? { r: 4, fill: "#3b82f6" } : false}
                />
                <Area
                  type="monotone"
                  dataKey="pronunciation"
                  name="Pronunciation"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  fill="none"
                  connectNulls
                  dot={chartData.length === 1 ? { r: 4, fill: "#10b981" } : false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs text-center p-4">
            <Mic size={24} className="mb-2 text-slate-400 dark:text-slate-600" />
            <p>No speaking session time-series recorded yet.</p>
          </div>
        )}
      </div>

      {/* Recent Sessions Toggle (Phase 2 DTO fields: sessionId, durationSeconds, feedbackSummary) */}
      {speaking.recentSessions && speaking.recentSessions.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            id="recent-speaking-toggle"
            aria-expanded={showRecent}
            aria-controls="recent-speaking-sessions-list"
            onClick={() => setShowRecent(!showRecent)}
            className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          >
            <span>Recent Speaking Sessions ({speaking.recentSessions.length})</span>
            {showRecent ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showRecent && (
            <div id="recent-speaking-sessions-list" role="region" aria-labelledby="recent-speaking-toggle" className="mt-3 space-y-2.5">
              {speaking.recentSessions.map((s, idx) => {
                const durationMins = s.durationSeconds != null ? Math.round(s.durationSeconds / 60) : 0;
                return (
                  <div
                    key={s.sessionId || idx}
                    className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 dark:text-white">
                          {s.scenario || s.topic || "Conversation Practice"}
                        </span>
                        {s.completed && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{s.date ? new Date(s.date).toLocaleString() : "Recent Session"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {durationMins} mins duration
                        </span>
                      </p>
                      {s.feedbackSummary && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                          "{s.feedbackSummary}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                      {s.overallScore != null && (
                        <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                          {Math.round(s.overallScore)}% Overall
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SpeakingAnalyticsSection;
