import React from "react";
import {
  FileText,
  Sparkles,
  Compass,
  Activity
} from "lucide-react";

/**
 * Deterministic Teacher Evaluation Synthesis component.
 * Synthesizes existing Phase 2 analytics data into an executive summary for educators.
 * Strictly rule-based — zero LLM, zero fabricated claims.
 */
export function TeacherEvaluationSynthesis({
  learningPhase,
  engagement,
  strengths,
  areasNeedingAttention,
  summary
}) {
  const activityStatus = engagement?.activityStatus || "NO_ACTIVITY";
  const phaseName = learningPhase?.displayName || "Getting Started";
  const totalActions =
    (summary?.completedLessons || 0) +
    (summary?.totalSpeakingSessions || 0) +
    (summary?.totalGrammarChecks || 0) +
    (summary?.totalVocabularyWords || 0);

  const topStrength = Array.isArray(strengths) && strengths.length > 0 ? strengths[0] : null;
  const topAttention = Array.isArray(areasNeedingAttention) && areasNeedingAttention.length > 0 ? areasNeedingAttention[0] : null;

  // Determine synthesis text based purely on deterministic data thresholds
  let headline = "";
  let evaluationStatement = "";
  let recommendationNote = "";

  if (totalActions === 0 || activityStatus === "NO_ACTIVITY") {
    headline = "Newly Enrolled — No Activity Recorded";
    evaluationStatement =
      "No practice sessions have been completed yet. Foundational introductory exercises and initial conversation onboarding are recommended to establish a learning baseline.";
    recommendationNote = "Recommended Action: Encourage completion of first syllabus lesson and orientation speaking session.";
  } else if (totalActions < 4) {
    headline = "Early Exploration — Initial Baseline";
    evaluationStatement = `Learner is currently in the ${phaseName} phase with preliminary practice recorded. A minimum of 4 sessions per module is required before reliable trend indicators can be evaluated.`;
    recommendationNote = topAttention
      ? `Early Observation: Focus on ${topAttention.area.toLowerCase()} while establishing a daily practice habit.`
      : "Recommended Action: Guide student toward regular 10-minute daily practice sessions.";
  } else {
    // Substantial activity exists
    const statusPhrase =
      activityStatus === "ACTIVE"
        ? "Active learner practicing consistently"
        : activityStatus === "RECENTLY_ACTIVE"
        ? "Recently active learner with intermittent practice"
        : "Inactive learner requiring re-engagement";

    headline = `${phaseName} • ${activityStatus === "ACTIVE" ? "Consistent Engagement" : activityStatus === "RECENTLY_ACTIVE" ? "Moderate Engagement" : "Attention Required"}`;

    const strengthSentence = topStrength
      ? `${topStrength.area} is currently a demonstrated strength (${topStrength.reason.toLowerCase()})`
      : "Demonstrating steady progression across core modules";

    const attentionSentence = topAttention
      ? `${topAttention.area} requires educator attention (${topAttention.reason.toLowerCase()})`
      : "Maintaining stable accuracy with no critical deficits detected";

    evaluationStatement = `${statusPhrase} in the ${phaseName} stage. ${strengthSentence}. Conversely, ${attentionSentence}.`;

    recommendationNote = topAttention
      ? `Priority Focus: Target ${topAttention.area} in upcoming assignments and review exercises.`
      : "Priority Focus: Continue advancing through next curriculum milestones to maintain momentum.";
  }

  return (
    <div id="section-evaluation" className="scroll-mt-16 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100/80 dark:border-indigo-900/30 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <FileText size={18} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Teacher Evaluation Synthesis
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Deterministic executive analysis derived from verified learning records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            <Compass size={12} />
            {phaseName}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              activityStatus === "ACTIVE"
                ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800"
                : activityStatus === "RECENTLY_ACTIVE"
                ? "text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800"
                : "text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800"
            }`}
          >
            <Activity size={12} />
            {activityStatus.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-black text-slate-900 dark:text-white">
          {headline}
        </h4>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {evaluationStatement}
        </p>

        {/* Actionable Educator Callout */}
        <div className="mt-3.5 flex items-start gap-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-3 text-xs text-slate-700 dark:text-slate-300">
          <Sparkles size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="text-slate-900 dark:text-white">{recommendationNote}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TeacherEvaluationSynthesis;
