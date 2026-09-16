import React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert
} from "lucide-react";

export function StrengthsAndAttentionSection({ strengths, areasNeedingAttention }) {
  const strengthList = Array.isArray(strengths) ? strengths : [];
  const attentionList = Array.isArray(areasNeedingAttention) ? areasNeedingAttention : [];

  return (
    <div
      id="section-strengths"
      className="scroll-mt-16 grid grid-cols-1 md:grid-cols-2 gap-5"
    >
      {/* 1. Strengths Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Demonstrated Strengths
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Performance competencies calculated directly from validated records
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {strengthList.length > 0 ? (
              strengthList.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-3.5 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      <span className="font-black text-slate-900 dark:text-white">
                        {item.area}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-5">
                      {item.reason}
                    </p>
                  </div>

                  {item.scoreOrValue && (
                    <span className="shrink-0 font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded text-[11px]">
                      {item.scoreOrValue}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                <Info size={20} className="mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                <p>Not enough learning data recorded yet to confirm strengths.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 italic">
          Strengths reflect sustained consistency, strong output scores, or habit formation.
        </div>
      </div>

      {/* 2. Areas Needing Attention Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Areas Needing Attention
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Objective guidance based on activity gaps, low scores, or declining trends
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {attentionList.length > 0 ? (
              attentionList.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10 p-3.5 text-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={14} className="text-amber-500 shrink-0" />
                      <span className="font-black text-slate-900 dark:text-white">
                        {item.area}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-5">
                      {item.reason}
                    </p>
                  </div>

                  {item.scoreOrValue && (
                    <span className="shrink-0 font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded text-[11px]">
                      {item.scoreOrValue}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 size={20} className="mx-auto mb-2 text-emerald-400" />
                <p>No critical performance gaps or declining trends detected.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 italic">
          Areas needing attention highlight actionable opportunities for educator intervention.
        </div>
      </div>
    </div>
  );
}

export default StrengthsAndAttentionSection;
