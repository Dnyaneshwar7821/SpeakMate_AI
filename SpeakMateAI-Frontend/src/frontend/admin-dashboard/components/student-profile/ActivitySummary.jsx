import React from "react";
import {
  Calendar,
  Clock,
  Flame,
  Mic,
  BookOpen,
  ListChecks
} from "lucide-react";

export function ActivitySummary({ engagement }) {
  const lastActiveFormatted = engagement?.recentActivityDate
    ? new Date(engagement.recentActivityDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No practice recorded yet";

  const habitItems = [
    {
      label: "Practice Frequency (7 Days)",
      value: `${engagement?.activityDaysLast7Days ?? 0} Days`,
      suffix: "Active in the last 7 calendar days",
      icon: Calendar,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    },
    {
      label: "Practice Frequency (30 Days)",
      value: `${engagement?.activityDaysLast30Days ?? 0} Days`,
      suffix: "Active in the last 30 calendar days",
      icon: Calendar,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    },
    {
      label: "Recent Speaking Pace",
      value: `${engagement?.speakingSessionsLast7Days ?? 0} Sessions`,
      suffix: `${engagement?.speakingSessionsLast30Days ?? 0} total sessions in past 30 days`,
      icon: Mic,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    },
    {
      label: "Last Recorded Practice",
      value: lastActiveFormatted,
      suffix: engagement?.activityStatusDescription || "Verified timestamp across all learning modules",
      icon: Clock,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
      isDate: true,
    },
    {
      label: "Total Practice Time",
      value: `${engagement?.totalPracticeMinutes ?? 0} mins`,
      suffix: "Cumulative practice across speaking & lessons",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    },
    {
      label: "Speaking Practice Time",
      value: `${engagement?.speakingMinutes ?? 0} mins`,
      suffix: "Dedicated conversational AI practice",
      icon: Mic,
      color: "text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    },
    {
      label: "Lesson Study Time",
      value: `${engagement?.lessonStudyMinutes ?? 0} mins`,
      suffix: "Dedicated syllabus & curriculum study",
      icon: BookOpen,
      color: "text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    },
    {
      label: "Consistency Habit",
      value: `${engagement?.currentStreak ?? 0} Days Active`,
      suffix: `Longest recorded streak: ${engagement?.longestStreak ?? 0} consecutive days`,
      icon: Flame,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
    },
  ];

  return (
    <div
      id="section-habits"
      className="scroll-mt-16 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
    >
      <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
          <ListChecks size={20} />
        </div>
        <div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Learning Habits & Practice Frequency
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Validated recency, active days, and learning time allocation (no metric duplication)
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {habitItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 flex flex-col justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${item.color}`}>
                  <Icon size={16} strokeWidth={2} />
                </div>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate">
                  {item.label}
                </p>
              </div>

              <div className="mt-3">
                <p
                  className={`${
                    item.isDate ? "text-xs font-bold" : "text-xl font-black"
                  } text-slate-900 dark:text-white truncate`}
                  title={item.value}
                >
                  {item.value}
                </p>
                {item.suffix && (
                  <p
                    className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight"
                    title={item.suffix}
                  >
                    {item.suffix}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivitySummary;
