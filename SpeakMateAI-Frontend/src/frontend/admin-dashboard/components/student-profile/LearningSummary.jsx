import React from "react";
import {
  Compass,
  Activity,
  BookOpen,
  Sparkles
} from "lucide-react";

export function LearningSummary({ learningPhase, engagement, lessons }) {
  const phase = learningPhase || {
    phase: "GETTING_STARTED",
    displayName: "Getting Started",
    shortDescription: "Beginning the learning journey",
    reason: "Initial onboarding stage with introductory exercises.",
    confidence: "MEDIUM",
  };

  const activityStatus = engagement?.activityStatus || "NO_ACTIVITY";

  const renderStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Active Learner",
          color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          desc: "Practiced within the last 7 days",
          dot: "bg-emerald-500",
        };
      case "RECENTLY_ACTIVE":
        return {
          label: "Recently Active",
          color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          desc: "Active between 8 and 30 days ago",
          dot: "bg-blue-500",
        };
      case "INACTIVE":
        return {
          label: "Inactive (30+ days)",
          color: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800",
          desc: "No recorded practice for over 30 days",
          dot: "bg-amber-500",
        };
      case "NO_ACTIVITY":
      default:
        return {
          label: "No Activity Recorded",
          color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          desc: "Has not started speaking, grammar, or lesson sessions yet",
          dot: "bg-slate-400",
        };
    }
  };

  const statusMeta = renderStatusBadge(activityStatus);

  const completedLessons = lessons?.completedLessons ?? 0;
  const totalActiveLessons = lessons?.totalActiveLessons ?? 0;
  const completionPct = lessons?.completionPercentage ?? (
    totalActiveLessons > 0 ? Math.round((completedLessons / totalActiveLessons) * 100) : 0
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Learning Phase Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Compass size={18} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Learning Journey Phase
              </h3>
            </div>
            {phase.confidence && (
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
                {phase.confidence} Confidence
              </span>
            )}
          </div>

          <div className="mt-3.5">
            <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {phase.displayName || phase.phase}
            </h4>
            <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
              {phase.shortDescription}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
          <Sparkles size={14} className="text-indigo-500 shrink-0 mt-0.5" />
          <p className="leading-snug">{phase.reason || "Learning stage calculated deterministically from consistency, volume, and scores."}</p>
        </div>
      </div>

      {/* 2. Activity Status Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Activity size={18} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Engagement Status
              </h3>
            </div>
          </div>

          <div className="mt-3.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.color}`}>
                <span className={`h-2 w-2 rounded-full ${statusMeta.dot} animate-pulse`} />
                {statusMeta.label}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {statusMeta.desc}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Active Days (Last 30d):</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {engagement?.activityDaysLast30Days ?? 0} Days
          </span>
        </div>
      </div>

      {/* 3. Curriculum Progress Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                <BookOpen size={18} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Curriculum Progress
              </h3>
            </div>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
              {completionPct}%
            </span>
          </div>

          <div className="mt-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {completedLessons}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">
                  / {totalActiveLessons} Lessons
                </span>
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {totalActiveLessons > 0 ? `${totalActiveLessons - completedLessons} remaining` : "Catalogue loading"}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-2.5 h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, completionPct))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>In Progress: <strong className="text-slate-800 dark:text-slate-200">{lessons?.inProgressLessons ?? 0}</strong></span>
          <span>Not Started: <strong className="text-slate-800 dark:text-slate-200">{lessons?.notStartedLessons ?? 0}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default LearningSummary;
