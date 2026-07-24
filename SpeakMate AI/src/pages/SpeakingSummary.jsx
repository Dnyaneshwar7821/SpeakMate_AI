import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";

export function SpeakingSummary() {
  const scores = {
    overall: 88,
    fluency: 85,
    grammar: 90,
    vocabulary: 88,
    pronunciation: 92,
  };

  const grammarCorrections = [
    {
      original: "I am working here since 2 years.",
      corrected: "I have been working here for 2 years.",
      reason: "Use Present Perfect Continuous ('have been working') with 'for' to describe an ongoing action duration.",
    },
    {
      original: "He discuss about the project yesterday.",
      corrected: "He discussed the project yesterday.",
      reason: "'Discuss' does not require the preposition 'about', and past simple 'discussed' is required for yesterday.",
    },
  ];

  const vocabLearned = [
    { word: "Substantial", meaning: "Of considerable importance, size, or worth." },
    { word: "Articulate", meaning: "Having or showing the ability to speak fluently and coherently." },
    { word: "Initiative", meaning: "The ability to assess and initiate things independently." },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider">
            Speaking Evaluation Scorecard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Session Summary Report</h1>
          <p className="text-xs opacity-90">Great practice! Here is your instant AI feedback and performance metrics.</p>
        </div>

        {/* Overall Score Circle */}
        <div className="grid h-24 w-24 place-items-center rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 shrink-0">
          <div className="text-center">
            <span className="text-2xl font-extrabold">{scores.overall}%</span>
            <p className="text-[9px] font-bold uppercase opacity-80">Overall</p>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm text-center">
          <p className="text-xs font-bold text-[var(--text-secondary)]">Fluency</p>
          <p className="text-2xl font-extrabold text-[#6c63ff] mt-1">{scores.fluency}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm text-center">
          <p className="text-xs font-bold text-[var(--text-secondary)]">Grammar</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1">{scores.grammar}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm text-center">
          <p className="text-xs font-bold text-[var(--text-secondary)]">Vocabulary</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">{scores.vocabulary}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm text-center">
          <p className="text-xs font-bold text-[var(--text-secondary)]">Pronunciation</p>
          <p className="text-2xl font-extrabold text-[#ff6584] mt-1">{scores.pronunciation}%</p>
        </div>
      </div>

      {/* Grammar Corrections */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
          <span>📝 Grammar Suggestions & Corrections</span>
        </h2>

        <div className="space-y-3">
          {grammarCorrections.map((gc, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-red-500">
                <span>❌ Original:</span>
                <span className="line-through">{gc.original}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                <span>✓ Improved:</span>
                <span>{gc.corrected}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">{gc.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Vocabulary Learned */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Vocabulary Used & Key Words</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {vocabLearned.map((v, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <h3 className="font-extrabold text-sm text-[#6c63ff]">{v.word}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{v.meaning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <Link
          to={ROUTES.SPEAKING}
          className="px-6 py-3 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
        >
          ← Practice Another Scenario
        </Link>
        <Link
          to={ROUTES.DASHBOARD}
          className="px-8 py-3 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-xs font-extrabold shadow-md shadow-[#6c63ff]/20"
        >
          Return to Dashboard →
        </Link>
      </div>
    </div>
  );
}

export default SpeakingSummary;
