import React from "react";
import {
  Zap,
  Flame,
  Trophy,
  Mic,
  BookOpen,
  SpellCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight
} from "lucide-react";

export function ProgressKpiGrid({ summary, speaking, grammar, vocabulary, onScrollToSection }) {
  if (!summary) return null;

  const renderTrendBadge = (trend) => {
    if (!trend || trend.trendDirection === "INSUFFICIENT_DATA") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <Minus size={12} />
          Needs 4+ sessions
        </span>
      );
    }
    if (trend.trendDirection === "IMPROVING") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
          <TrendingUp size={12} />
          +{Math.abs(trend.change || 0).toFixed(1)}% Improving
        </span>
      );
    }
    if (trend.trendDirection === "DECLINING") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
          <TrendingDown size={12} />
          -{Math.abs(trend.change || 0).toFixed(1)}% Declining
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded">
        <Minus size={12} />
        Stable
      </span>
    );
  };

  const handleKeyDown = (e, sectionId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onScrollToSection?.(sectionId);
    }
  };

  const cards = [
    {
      id: "section-overview",
      title: "Total XP",
      value: (summary.totalXP ?? 0).toLocaleString(),
      subtitle: `Level ${summary.currentLevel ?? 1} Progression`,
      details: "Lifetime XP earned across all activities",
      icon: Zap,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30",
      accent: "hover:border-amber-400 dark:hover:border-amber-600",
      trend: null,
    },
    {
      id: "section-habits",
      title: "Practice Streak",
      value: `${summary.currentStreak ?? 0} Days`,
      subtitle: `Best: ${summary.longestStreak ?? 0} consecutive days`,
      details: "Consecutive daily learning frequency",
      icon: Flame,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/30",
      accent: "hover:border-orange-400 dark:hover:border-orange-600",
      trend: null,
    },
    {
      id: "section-overview",
      title: "Platform Level",
      value: `Level ${summary.currentLevel ?? 1}`,
      subtitle: `${(summary.totalXP ?? 0).toLocaleString()} XP milestone`,
      details: "Gamified platform progression (not CEFR)",
      icon: Trophy,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/30",
      accent: "hover:border-purple-400 dark:hover:border-purple-600",
      trend: null,
    },
    {
      id: "section-speaking",
      title: "Speaking Practice",
      value: `${summary.totalSpeakingSessions ?? 0} Sessions`,
      subtitle: `${summary.totalSpeakingMinutes ?? 0} mins total practice`,
      details: speaking?.averageOverallScore != null ? `Avg: ${Math.round(speaking.averageOverallScore)}% overall` : "No scored sessions yet",
      icon: Mic,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/30",
      accent: "hover:border-indigo-400 dark:hover:border-indigo-600",
      trend: speaking?.speakingTrend,
    },
    {
      id: "section-grammar",
      title: "Grammar Checks",
      value: `${summary.totalGrammarChecks ?? 0} Checks`,
      subtitle: grammar?.averageScore != null ? `Avg: ${Math.round(grammar.averageScore)}% accuracy` : "No checks evaluated",
      details: "Interactive syntax & sentence checks",
      icon: SpellCheck,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30",
      accent: "hover:border-emerald-400 dark:hover:border-emerald-600",
      trend: grammar?.grammarTrend,
    },
    {
      id: "section-vocabulary",
      title: "Vocabulary Words",
      value: `${summary.totalVocabularyWords ?? 0} Words`,
      subtitle: `${summary.masteredVocabularyWords ?? 0} Mastered (${vocabulary?.masteryPercentage ?? 0}%)`,
      details: "Mastery verified from backend records",
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30",
      accent: "hover:border-blue-400 dark:hover:border-blue-600",
      trend: null,
    },
  ];

  return (
    <div
      id="section-overview"
      className="scroll-mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5"
    >
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onScrollToSection?.(card.id)}
            onKeyDown={(e) => handleKeyDown(e, card.id)}
            role="button"
            tabIndex={0}
            aria-label={`Jump to ${card.title} section`}
            className={`group relative flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${card.accent}`}
          >
            <div>
              {/* Header row: Icon & jump icon */}
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${card.color}`}>
                  <Icon size={18} strokeWidth={2} />
                </div>
                <ArrowUpRight
                  size={14}
                  className="text-slate-400 dark:text-slate-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                />
              </div>

              {/* Title & Primary Value */}
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  {card.title}
                </p>
                <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>

            {/* Subtitle & Trend */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={card.subtitle}>
                {card.subtitle}
              </p>
              {card.trend ? (
                <div className="mt-1.5">{renderTrendBadge(card.trend)}</div>
              ) : (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate" title={card.details}>
                  {card.details}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProgressKpiGrid;
