export function About() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Hero */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#FF6584] text-white shadow-2xl text-center space-y-4 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl pointer-events-none rounded-full" />
        <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl font-black shadow-lg">
          SM
        </div>
        <h1 className="text-3xl sm:text-4xl font-black">SpeakMate AI</h1>
        <p className="text-xs sm:text-sm opacity-95 max-w-md mx-auto font-medium leading-relaxed">
          Your personal 24/7 AI-powered English speaking partner, fluency evaluator, and language learning coach.
        </p>
        <span className="inline-block text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-white/20 border border-white/20">
          Version 2.0.0 (Web & Mobile Parity Edition)
        </span>
      </div>

      {/* Features Grid */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
        <h2 className="text-xl font-black text-[var(--text-primary)]">Core Capabilities</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
            <span className="text-3xl">🎙️</span>
            <h3 className="font-black text-base text-[var(--text-primary)]">Real-Time Voice AI</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Interactive Live2D animated speech synthesis and live Web Speech voice recognition.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
            <span className="text-3xl">📊</span>
            <h3 className="font-black text-base text-[var(--text-primary)]">Fluency & Grammar Evaluation</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Instant scorecard breakdown with fluency, vocabulary, and grammar metrics.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
            <span className="text-3xl">📖</span>
            <h3 className="font-black text-base text-[var(--text-primary)]">Interactive CEFR Lessons</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Bite-sized modules from A1 to C2 with flashcards and pronunciation quizzes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2">
            <span className="text-3xl">🏆</span>
            <h3 className="font-black text-base text-[var(--text-primary)]">Gamified Streak & Badges</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
              Daily streak counters, XP points, and unlockable achievement badges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
