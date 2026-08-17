import { Link, useLocation } from "react-router-dom";
import ROUTES from "../constants/routes";

export function SpeakingSummary() {
  const location = useLocation();
  const summary = location.state?.summary || {
    score: 88,
    xpEarned: 20,
    duration: 360,
    messagesExchanged: 6,
    summary: "Great job completing your AI speaking session. You demonstrated good vocabulary variety and clear pronunciation.",
    vocabularyLearned: "Proficiency, Natural fluency, Articulate, Scenario",
    grammarCorrections: "Excellent overall tense consistency. Tip: Use Present Perfect Continuous for ongoing duration.",
    betterSentences: "I would like to enhance my English speaking proficiency for professional meetings.",
    motivationalMessage: "Keep practicing every day to sound more natural and confident!",
  };

  const score = Math.round(summary.score || 0);
  const xp = summary.xpEarned || 0;
  const mins = summary.duration ? Math.floor(summary.duration / 60) : 0;
  const secs = summary.duration ? summary.duration % 60 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header Banner matching SpeakingSummaryScreen.js */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#6c63ff] text-white shadow-xl flex flex-col items-center justify-center text-center space-y-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full">
          Session Results & Feedback
        </span>

        {/* Score Ring */}
        <div className="grid h-28 w-28 place-items-center rounded-full bg-white/10 border-4 border-[#6c63ff] shadow-inner my-2">
          <div>
            <span className="text-3xl font-extrabold">{score}%</span>
            <p className="text-[9px] font-bold uppercase opacity-75">Overall Score</p>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold">Excellent Work! 🎉</h1>
        <p className="text-xs text-[#A5B4FC] max-w-md">
          {summary.motivationalMessage || "Keep practicing every day to sound more natural and confident."}
        </p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm text-center">
          <span className="text-xl">⚡</span>
          <p className="text-lg font-extrabold text-amber-500 mt-1">+{xp} XP</p>
          <p className="text-[10px] font-bold text-[var(--text-secondary)]">XP Awarded</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm text-center">
          <span className="text-xl">⏱️</span>
          <p className="text-lg font-extrabold text-[#6c63ff] mt-1">
            {mins > 0 ? `${mins}m ` : ""}{secs}s
          </p>
          <p className="text-[10px] font-bold text-[var(--text-secondary)]">Time Spent</p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm text-center">
          <span className="text-xl">💬</span>
          <p className="text-lg font-extrabold text-emerald-500 mt-1">{summary.messagesExchanged || 0}</p>
          <p className="text-[10px] font-bold text-[var(--text-secondary)]">Turns Made</p>
        </div>
      </div>

      {/* Feedback Sections */}
      <div className="space-y-4">
        {/* Session Summary */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-2">
          <h2 className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <span>📄 Session Summary</span>
          </h2>
          <p className="text-xs font-semibold text-[var(--text-secondary)] leading-relaxed">{summary.summary}</p>
        </div>

        {/* Vocabulary Suggested */}
        {summary.vocabularyLearned && (
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-2">
            <h2 className="text-sm font-extrabold text-amber-500 flex items-center gap-2">
              <span>💡 Vocabulary Suggested</span>
            </h2>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{summary.vocabularyLearned}</p>
          </div>
        )}

        {/* Grammar Notes */}
        {summary.grammarCorrections && (
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-2">
            <h2 className="text-sm font-extrabold text-emerald-500 flex items-center gap-2">
              <span>✓ Grammar Notes</span>
            </h2>
            <p className="text-xs font-semibold text-[var(--text-primary)]">{summary.grammarCorrections}</p>
          </div>
        )}

        {/* Native Expressions */}
        {summary.betterSentences && (
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-2">
            <h2 className="text-sm font-extrabold text-[#6c63ff] flex items-center gap-2">
              <span>📈 Native Expressions</span>
            </h2>
            <p className="text-xs font-semibold text-[var(--text-primary)]">💡 "{summary.betterSentences}"</p>
          </div>
        )}
      </div>

      {/* Done Action Button */}
      <div className="pt-4 flex justify-center">
        <Link
          to={ROUTES.SPEAKING}
          className="w-full py-3.5 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-extrabold text-sm shadow-lg text-center"
        >
          Return to Speaking Practice Home
        </Link>
      </div>
    </div>
  );
}

export default SpeakingSummary;
