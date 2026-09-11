import { useState } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakGlobalText } from "../utils/speechHelper";

const FEATURES = [
  {
    icon: "🎙️",
    badge: "Interactive AI",
    title: "Live Voice Conversation Practice",
    desc: "Practice 25+ real-world scenario roles (Job Interviews, Airport, Business Meetings, IELTS) with an empathetic AI tutor with natural mouth movement.",
  },
  {
    icon: "⚡",
    badge: "Real-time AI",
    title: "Instant Audio Grammar Doctor",
    desc: "AI automatically reads out loud what you said, corrects mistakes with clear explanations, and speaks native phrasing out loud.",
  },
  {
    icon: "🎴",
    badge: "Gamified",
    title: "3D Flashcards & Daily Drills",
    desc: "Master CEFR A1-C2 vocabulary with interactive 3D flip card decks, pronunciation playback, and daily XP streak rewards.",
  },
  {
    icon: "🌍",
    badge: "Multi-Accent",
    title: "Global AI Voice Personas",
    desc: "Switch seamlessly between American, British, Australian, and Indian accents with speed controls (0.5x to 2.0x).",
  },
];

const CEFR_LEVELS = [
  { code: "A1-A2", title: "Beginner / Elementary", desc: "Everyday phrases, basic introductions & daily routines", color: "from-emerald-500 to-teal-600" },
  { code: "B1-B2", title: "Intermediate", desc: "Workplace discussions, travel situations & opinions", color: "from-indigo-500 to-purple-600" },
  { code: "C1-C2", title: "Advanced / Mastery", desc: "Complex debates, professional fluency & nuanced idiomatic speech", color: "from-rose-500 to-pink-600" },
];

const STATS = [
  { value: "50,000+", label: "Speaking Sessions Completed" },
  { value: "98.4%", label: "Pronunciation Accuracy Rate" },
  { value: "4.9 / 5 ⭐", label: "Learner Satisfaction Rating" },
  { value: "11 Modes", label: "Specialized AI Tutoring Scenarios" },
];

export function LandingPage() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [previewText] = useState(
    "Hello! I am your SpeakMate AI speaking coach. Practice English with me every day to build confidence and fluency without fear of judgment!"
  );

  const handlePlaySampleVoice = () => {
    setIsPlayingAudio(true);
    speakGlobalText(previewText, 1.0, {
      onend: () => setIsPlayingAudio(false),
      onerror: () => setIsPlayingAudio(false),
    });
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-6 pb-12 sm:pt-14 sm:pb-24 overflow-hidden">
        {/* Glow Background Circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#6C63FF]/20 via-[#8B5CF6]/15 to-[#FF6584]/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-[#6C63FF] text-xs font-black shadow-sm animate-float">
              <span className="text-sm">✨</span>
              <span>Next-Generation AI English Speaking Coach</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-[var(--text-primary)]">
              Speak English with <span className="gradient-text">Unstoppable</span> Confidence.
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Engage in live voice conversations with intelligent AI avatars, receive spoken grammar corrections, master CEFR vocabulary with 3D flashcards, and build a daily speaking habit.
            </p>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to={ROUTES.ONBOARDING}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#FF6584] hover:from-[#7C74FF] hover:to-[#FF7593] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/30 hover:scale-105 active:scale-95 transition-all text-center"
              >
                🚀 Start Free Practice Now
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] font-extrabold text-sm hover:scale-105 active:scale-95 transition-all text-center shadow-sm"
              >
                🔑 Log In to Dashboard
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-black">✓</span> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-amber-500 font-black">★</span> 4.9/5 Rating (50K+ learners)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-indigo-500 font-black">●</span> Real-time speech recognition
              </span>
            </div>
          </div>

          {/* Right Column Interactive Audio Widget Card */}
          <div className="lg:col-span-5">
            <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl border border-[var(--border-default)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#8B5CF6] text-white text-xl font-bold shadow-md shadow-[#6C63FF]/25">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-black text-base text-[var(--text-primary)]">SpeakMate Live AI Tutor</h3>
                    <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Speech Engine Active
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#6C63FF]/15 border border-[#6C63FF]/30 text-[#6C63FF] text-[10px] font-black uppercase tracking-wider">
                  Live Demo
                </span>
              </div>

              {/* Sample Dialogue Chat Cards */}
              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/20 space-y-1">
                  <span className="font-black text-[#6C63FF] uppercase text-[10px] tracking-wider">Student Spoke</span>
                  <p className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                    "I am living in London since two years and I discuss about my job."
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-500 uppercase text-[10px] tracking-wider">AI Spoken Correction</span>
                    <span className="text-emerald-500 font-black text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20">98% Accuracy</span>
                  </div>
                  <p className="font-extrabold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                    "I have been living in London for two years, and I discussed my job."
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                    💡 Rule: Duration requires <strong className="text-[var(--text-primary)]">'for'</strong> with Present Perfect Continuous.
                  </p>
                </div>
              </div>

              {/* Play Audio Sample Button */}
              <button
                onClick={handlePlaySampleVoice}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#6C63FF]/25 active:scale-95"
              >
                {isPlayingAudio ? (
                  <>
                    <span className="animate-spin">🔊</span>
                    <span>AI Coach Speaking Out Loud...</span>
                  </>
                ) : (
                  <>
                    <span>🔊</span>
                    <span>Test Spoken AI Sample Voice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 sm:p-10 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center shadow-xl border border-[var(--border-default)]">
          {STATS.map((s, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="text-3xl sm:text-4xl font-black gradient-text">{s.value}</p>
              <p className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CEFR CURRICULUM LEVELS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] uppercase tracking-wider">
            Standardized Framework
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">Personalized for Every CEFR Level</h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            From beginners practicing introductory questions to advanced professionals mastering business debates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CEFR_LEVELS.map((lvl, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-6 sm:p-8 rounded-3xl space-y-4 border border-[var(--border-default)]">
              <span className={`inline-block px-3.5 py-1.5 rounded-xl bg-gradient-to-r ${lvl.color} text-white font-black text-xs shadow-md`}>
                {lvl.code}
              </span>
              <h3 className="text-xl font-black text-[var(--text-primary)]">{lvl.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{lvl.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-black px-3.5 py-1.5 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] uppercase tracking-wider">
            Powerful Learning Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">Everything You Need for Spoken Fluency</h2>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Engineered to eliminate speaking anxiety and build muscle memory through daily repetition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between border border-[var(--border-default)]">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-[var(--bg-elevated)] inline-block shadow-inner">{f.icon}</span>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] uppercase tracking-wider">
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-[var(--text-primary)]">{f.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#FF6584] text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-3 max-w-2xl mx-auto relative z-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Ready to Master Fluent English Speaking?</h2>
            <p className="text-sm sm:text-base text-white/90 font-medium">
              Start practicing with your personal AI coach today. No judgment, unlimited patience, 24/7 availability.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-4 relative z-10">
            <Link
              to={ROUTES.ONBOARDING}
              className="px-8 py-4 rounded-2xl bg-white text-[#6C63FF] font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              Start Free Practice →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
