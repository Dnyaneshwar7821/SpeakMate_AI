import React from "react";
import {
  History,
  BookOpen,
  Mic,
  SpellCheck,
  GraduationCap,
  Clock,
  Layers
} from "lucide-react";

export function RecentActivityTimeline({ recentActivity }) {
  const activities = Array.isArray(recentActivity) ? recentActivity : [];

  const getActivityIcon = (type) => {
    switch (type) {
      case "SPEAKING":
        return {
          icon: Mic,
          color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
          tag: "Speaking Session",
        };
      case "GRAMMAR":
        return {
          icon: SpellCheck,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
          tag: "Grammar Check",
        };
      case "VOCABULARY":
        return {
          icon: BookOpen,
          color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
          tag: "Vocabulary Log",
        };
      case "ASSESSMENT":
      case "TEST":
        return {
          icon: GraduationCap,
          color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
          tag: "School Assessment",
        };
      case "LESSON":
      default:
        return {
          icon: Layers,
          color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
          tag: "Lesson Study",
        };
    }
  };

  return (
    <div
      id="section-activity"
      className="scroll-mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Recent Learning Activity Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chronological log of verified student actions across all learning modules
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {activities.length} Recorded Actions
        </span>
      </div>

      {/* Timeline List */}
      <div className="mt-5">
        {activities.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {activities.map((act, idx) => {
              const meta = getActivityIcon(act.type);
              const Icon = meta.icon;

              const formattedTime = act.timestamp
                ? new Date(act.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Recently";

              return (
                <div key={idx} className="relative flex items-start justify-between gap-3 group">
                  {/* Timeline Node Icon */}
                  <div
                    className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border bg-white dark:bg-slate-900 ${meta.color} ring-4 ring-white dark:ring-slate-900`}
                  >
                    <Icon size={12} strokeWidth={2.5} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3 text-xs transition hover:border-slate-200 dark:hover:border-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {act.title}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {meta.tag}
                        </span>
                      </div>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} /> {formattedTime}
                      </span>
                    </div>

                    {act.description && (
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                        {act.description}
                      </p>
                    )}
                  </div>

                  {/* Score or XP Badge */}
                  {act.scoreOrValue && (
                    <span className="shrink-0 font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg text-xs self-center">
                      {act.scoreOrValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
            <History size={24} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p>No learning activity recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentActivityTimeline;
