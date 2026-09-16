import React from "react";
import { Check, Compass, CircleDot, Lock } from "lucide-react";

export function LearningJourney({ currentPhase }) {
  const phases = [
    {
      key: "GETTING_STARTED",
      name: "Getting Started",
      step: 1,
      description: "Exploring basic lessons & initiating initial practice",
    },
    {
      key: "BUILDING_THE_HABIT",
      name: "Building the Habit",
      step: 2,
      description: "Developing consistent practice routines across days",
    },
    {
      key: "ACTIVE_LEARNER",
      name: "Active Learner",
      step: 3,
      description: "Regularly practicing multiple pillars with stable scores",
    },
    {
      key: "DEVELOPING_PROFICIENCY",
      name: "Developing Proficiency",
      step: 4,
      description: "Achieving solid accuracy across speaking & grammar",
    },
    {
      key: "BUILDING_FLUENCY",
      name: "Building Fluency",
      step: 5,
      description: "High volume, sustained consistency & strong output",
    },
    {
      key: "INDEPENDENT_PRACTICE",
      name: "Independent Practice",
      step: 6,
      description: "Advanced autonomous usage with high mastery",
    },
  ];

  const currentKey = currentPhase?.phase || "GETTING_STARTED";
  const currentStepIndex = phases.findIndex((p) => p.key === currentKey);
  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Learning Journey Roadmap
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic progress through SpeakMate's 6 stages of continuous language practice
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
          Phase {activeIndex + 1} of 6
        </span>
      </div>

      {/* Responsive Horizontal / Vertical Stepper */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative">
        {phases.map((p, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isUpcoming = idx > activeIndex;

          return (
            <div
              key={p.key}
              className={`relative flex flex-col justify-between rounded-xl p-3.5 border transition-all duration-200 ${
                isCurrent
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-sm"
                  : isCompleted
                  ? "border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                  : "border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40 opacity-70"
              }`}
            >
              <div>
                {/* Step indicator circle */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                      isCurrent
                        ? "bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100 dark:ring-indigo-900/40"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={14} strokeWidth={3} />
                    ) : isCurrent ? (
                      <CircleDot size={14} className="animate-spin text-white" />
                    ) : (
                      p.step
                    )}
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Current
                    </span>
                  )}
                </div>

                {/* Phase Title */}
                <h4
                  className={`mt-3 text-xs font-black tracking-tight ${
                    isCurrent
                      ? "text-indigo-900 dark:text-indigo-200"
                      : isCompleted
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {p.name}
                </h4>

                {/* Description */}
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {p.description}
                </p>
              </div>

              {/* Status footer */}
              <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 text-[10px] font-semibold">
                {isCompleted && (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check size={10} /> Completed
                  </span>
                )}
                {isCurrent && (
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                    Active Stage
                  </span>
                )}
                {isUpcoming && (
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Lock size={10} /> Upcoming
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LearningJourney;
