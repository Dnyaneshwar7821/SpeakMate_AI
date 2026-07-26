import { useState } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";

const FEATURES = [
  {
    icon: "🎙️",
    title: "Live AI Conversation Practice",
    desc: "Practice 25+ real-world scenario roles (Job Interviews, Airport, Business Meetings, IELTS) with an empathetic AI tutor.",
  },
  {
    icon: "⚡",
    title: "Instant Audio Feedback",
    desc: "AI automatically reads out loud what you said, corrects grammar errors, and suggests natural native phrasing out loud.",
  },
  {
    icon: "🎴",
    title: "3D Flashcards & Quizzes",
    desc: "Master CEFR vocabulary with 3D flip card decks, pronunciation audio playback, and XP reward challenges.",
  },
  {
    icon: "🌍",
    title: "Multi-Accent AI Voices",
    desc: "Switch between US, UK, Australian, and Indian accents with adjustable speech speeds (0.5x to 2.0x).",
  },
];

const STATS = [
  { value: "50,000+", label: "Practice Sessions" },
  { value: "98%", label: "Accuracy Improvement" },
  { value: "4.9 / 5 ⭐", label: "User Rating" },
  { value: "11 Modes", label: "AI Tutoring Scenarios" },
];

export function LandingPage() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [previewText, setPreviewText] = useState(
    "Hello! I am your SpeakMate AI coach. Practice speaking English with me every day to build confidence!"
  );

  const handlePlaySampleVoice = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(previewText);
      utterance.rate = 1.0;
      utterance.lang = "en-US";
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-20 overflow-hidden">
        {/* Glow Background Circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#6c63ff]/20 to-[#ff6584]/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#6c63ff] text-xs font-extrabold shadow-sm animate-float">
              <span className="text-sm">✨</span>
              <span>AI-Powered Personal English Speaking Coach</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
              Speak English with <span className="gradient-text">Confidence</span> in Real Life.
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Practice real interactive conversations, receive spoken grammar corrections, master vocabulary flashcards, and build a daily streak habit without any fear of judgement.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to={ROUTES.ONBOARDING}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:from-[#7c74ff] hover:to-[#ff7593] text-white font-extrabold text-sm shadow-xl shadow-[#6c63ff]/30 hover:scale-105 transition-all text-center"
              >
                🚀 Start Free Practice Now
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] text-white font-extrabold text-sm hover:scale-105 transition-all text-center"
              >
                🔑 Login to Account
              </Link>
            </div>

            {/* Micro Stats */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs font-bold text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span> No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-amber-400">★</span> 4.9/5 Rating
              </span>
            </div>
          </div>

          {/* Right Column Interactive Audio Widget Card */}
          <div className="lg:col-span-5">
            <div className="glass-card glass-card-hover p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#6c63ff] text-white text-xl font-bold shadow-md">
                    🤖
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white">SpeakMate AI Tutor</h3>
                    <span className="text-xs font-bold text-emerald-400">● Live Voice Interactive</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#6c63ff]/20 text-[#6c63ff] text-xs font-extrabold">
                  Sample Drill
                </span>
              </div>

              {/* Sample Dialogue Chat Cards */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-xs space-y-1">
                  <span className="font-extrabold text-[#6c63ff] uppercase text-[10px]">Student</span>
                  <p className="font-semibold text-white">"I am living in London since 2 years and I discuss about my job."</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-400 uppercase text-[10px]">AI Coach Correction (Spoken Out Loud)</span>
                    <span className="text-emerald-400 font-bold text-[10px]">92% Accuracy</span>
                  </div>
                  <p className="font-bold text-emerald-300">
                    "I have been living in London for 2 years and I discussed my job."
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] italic">
                    Rule: Duration requires 'for' with Present Perfect Continuous.
                  </p>
                </div>
              </div>

              {/* Play Audio Sample Button */}
              <button
                onClick={handlePlaySampleVoice}
                className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>{isPlayingAudio ? "🔊 Speaking Sample Audio..." : "🔊 Listen AI Sample Voice"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-8 rounded-3xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-2xl sm:text-4xl font-black gradient-text">{s.value}</p>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff] uppercase tracking-wider">
            Comprehensive Learning Ecosystem
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Everything You Need for Fluency</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Built specifically to eliminate hesitation and accelerate your speaking skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, idx) => (
            <div key={idx} className="glass-card glass-card-hover p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-4xl p-3 rounded-2xl bg-[var(--bg-elevated)] inline-block">{f.icon}</span>
                <h3 className="font-extrabold text-lg text-white">{f.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#8b85ff] to-[#ff6584] text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black">Ready to Transform Your English Speaking?</h2>
            <p className="text-xs sm:text-sm text-white/90">
              Join thousands of learners practicing daily with SpeakMate AI.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-4">
            <Link
              to={ROUTES.ONBOARDING}
              className="px-8 py-3.5 rounded-2xl bg-white text-[#6c63ff] font-extrabold text-xs shadow-xl hover:scale-105 transition-transform"
            >
              Start Personal Setup →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
