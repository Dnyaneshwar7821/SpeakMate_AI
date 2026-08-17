export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-xl text-center space-y-3">
        <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl font-extrabold">
          SM
        </div>
        <h1 className="text-3xl font-extrabold">SpeakMate AI</h1>
        <p className="text-xs opacity-90 max-w-md mx-auto">
          Your personal 24/7 AI-powered English speaking partner, fluency evaluator, and language learning coach.
        </p>
        <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20">
          Version 2.0.0 (Web & Mobile Parity Edition)
        </span>
      </div>

      {/* Features Grid */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Core Features</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <span className="text-2xl">🎙️</span>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)] mt-2">Real-Time Voice AI</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Interactive speech synthesis and live Web Speech voice recognition.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <span className="text-2xl">📊</span>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)] mt-2">Fluency & Grammar Evaluation</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Instant scorecard breakdown with fluency, vocabulary, and grammar metrics.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <span className="text-2xl">📖</span>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)] mt-2">Interactive CEFR Lessons</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Bite-sized modules from A1 to C2 with flashcards and pronunciation quizzes.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <span className="text-2xl">🏆</span>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)] mt-2">Gamified Streak & Badges</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Daily streak counters, XP points, and unlockable achievement badges.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
