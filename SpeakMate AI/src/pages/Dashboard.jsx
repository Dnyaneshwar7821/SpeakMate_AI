import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";
import { dashboardService } from "../services/appServices";

const MOTIVATIONAL_QUOTES = [
  { quote: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { quote: "Language is the road map of a culture. It tells you where its people come from and where they are going.", author: "Rita Mae Brown" },
  { quote: "To have another language is to possess a second soul.", author: "Charlemagne" },
  { quote: "Learning another language is not only learning different words for the same things, but learning another way to think about things.", author: "Flora Lewis" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic Dashboard States
  const [stats, setStats] = useState({
    level: user?.level || "B1 Intermediate",
    xp: 450,
    streak: user?.streak || 3,
    dailyGoalMins: 15,
    completedMins: 8,
    accuracy: 92,
    totalHours: 12.5,
    wordsLearned: 142,
  });

  // Interactive 5-Min Warmup Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins in seconds
  const [timerCompleted, setTimerCompleted] = useState(false);

  // Motivational Quote State
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [challengeClaimed, setChallengeClaimed] = useState(false);

  // Attempt live API fetch with fallback to state
  useEffect(() => {
    dashboardService
      .summary()
      .then((data) => {
        if (data) {
          setStats((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Fallback to local default stats
      });
  }, []);

  // Timer Countdown Effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setTimerCompleted(true);
      setStats((prev) => ({ ...prev, xp: prev.xp + 30, completedMins: prev.completedMins + 5 }));
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSpeakQuote = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAcceptChallenge = () => {
    setChallengeClaimed(true);
    setStats((prev) => ({ ...prev, xp: prev.xp + 50 }));
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="space-y-8">
      {/* Dynamic Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#8b85ff] to-[#ff6584] text-white shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/20 uppercase tracking-wider">
                {stats.level}
              </span>
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-400 text-slate-950">
                🔥 {stats.streak}-Day Streak
              </span>
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-400 text-slate-950">
                ⭐ {stats.xp} XP Points
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || "Learner"}! 👋
            </h1>
            <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
              Your AI English tutor is ready. Practice live speaking, review vocabulary flashcards, or take a quick lesson drill today!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=free-speak`)}
              className="px-6 py-3 rounded-2xl bg-white text-[#6c63ff] font-extrabold text-xs sm:text-sm shadow-lg hover:scale-105 transition-all text-center"
            >
              🎙️ Start Live AI Voice Chat
            </button>
            <button
              onClick={() => navigate(ROUTES.LESSONS)}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 text-center"
            >
              📖 Continue Lessons
            </button>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Statistics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
          <span className="text-2xl">🗣️</span>
          <p className="text-xs font-bold text-[var(--text-secondary)]">Speaking Time</p>
          <p className="text-2xl font-extrabold text-[#6c63ff]">{stats.totalHours} hrs</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
          <span className="text-2xl">🎯</span>
          <p className="text-xs font-bold text-[var(--text-secondary)]">Accuracy Score</p>
          <p className="text-2xl font-extrabold text-emerald-500">{stats.accuracy}%</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
          <span className="text-2xl">📚</span>
          <p className="text-xs font-bold text-[var(--text-secondary)]">Words Mastered</p>
          <p className="text-2xl font-extrabold text-amber-500">{stats.wordsLearned}</p>
        </div>

        <div className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
          <span className="text-2xl">🏆</span>
          <p className="text-xs font-bold text-[var(--text-secondary)]">Badges Unlocked</p>
          <p className="text-2xl font-extrabold text-[#ff6584]">3 / 6</p>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Goal & Interactive Warmup Drill */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#6c63ff] uppercase tracking-wider">Daily Target</span>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">
                  Practice for {stats.dailyGoalMins} Minutes Today
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                {stats.completedMins} / {stats.dailyGoalMins} Mins
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--border-subtle)] h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#6c63ff] to-[#ff6584] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (stats.completedMins / stats.dailyGoalMins) * 100)}%` }}
              />
            </div>

            {/* Interactive 5-Min Warmup Timer Drill */}
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${timerActive ? "bg-red-500 text-white animate-pulse" : "bg-[#6c63ff]/10 text-[#6c63ff]"} text-xl font-bold`}>
                  ⏱️
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Quick 5-Min Speaking Warmup</h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {timerActive ? `Warmup in progress: ${formatTimer(timeLeft)} remaining` : timerCompleted ? "✓ Warmup Completed! +30 XP claimed" : "Tap start to warm up your voice & earn +30 XP"}
                  </p>
                </div>
              </div>

              {!timerActive ? (
                <button
                  onClick={() => {
                    setTimeLeft(300);
                    setTimerActive(true);
                    setTimerCompleted(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-xs font-bold shadow-md shrink-0"
                >
                  {timerCompleted ? "Restart Warmup" : "Start Warmup"}
                </button>
              ) : (
                <button
                  onClick={() => setTimerActive(false)}
                  className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold shadow-md shrink-0"
                >
                  Pause Timer ({formatTimer(timeLeft)})
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Hub */}
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] mb-4">Quick Learning Actions</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=job-interview`)}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-[#6c63ff]/10">💼</span>
                  <span className="text-xs font-extrabold text-[#6c63ff] group-hover:translate-x-1 transition-transform">Start →</span>
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)] mt-3">Job Interview Roleplay</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Practice STAR method answers with AI voice evaluation.</p>
              </div>

              <div
                onClick={() => navigate(ROUTES.LESSONS)}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-[#ff6584]/10">📖</span>
                  <span className="text-xs font-extrabold text-[#ff6584] group-hover:translate-x-1 transition-transform">Browse →</span>
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)] mt-3">CEFR Lesson Modules</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Structured bite-sized quizzes & flashcards from A1 to C2.</p>
              </div>

              <div
                onClick={() => navigate(ROUTES.GRAMMAR)}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-emerald-500/10">✍️</span>
                  <span className="text-xs font-extrabold text-emerald-500 group-hover:translate-x-1 transition-transform">Check →</span>
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)] mt-3">AI Live Grammar Checker</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Analyze any sentence with instant error highlight feedback.</p>
              </div>

              <div
                onClick={() => navigate(ROUTES.VOCABULARY)}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-amber-500/10">📚</span>
                  <span className="text-xs font-extrabold text-amber-500 group-hover:translate-x-1 transition-transform">Study →</span>
                </div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)] mt-3">Vocabulary Flashcards</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Study definitions, phonetics, and audio pronunciations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* Daily Motivation & Audio Quote Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#6c63ff]/15 via-[#ff6584]/10 to-[var(--bg-surface)] border border-[#6c63ff]/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#6c63ff] uppercase tracking-wider">Daily Inspiration</span>
              <button
                onClick={() => setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Next Quote"
              >
                ↻ Next Quote
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-extrabold text-[var(--text-primary)] italic leading-relaxed">
                "{currentQuote.quote}"
              </p>
              <p className="text-xs font-bold text-[#6c63ff]">— {currentQuote.author}</p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleSpeakQuote(currentQuote.quote)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] hover:bg-[#6c63ff] hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>🔊 Listen Quote</span>
              </button>

              {!challengeClaimed ? (
                <button
                  onClick={handleAcceptChallenge}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-xs font-extrabold shadow-md"
                >
                  Accept Goal (+50 XP)
                </button>
              ) : (
                <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                  ✓ Goal Accepted!
                </span>
              )}
            </div>
          </div>

          {/* Quick Streak & Achievement Progress Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Achievement Milestones</h3>
              <Link to={ROUTES.ACHIEVEMENTS} className="text-xs font-bold text-[#6c63ff] hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="font-extrabold text-xs text-[var(--text-primary)]">3-Day Streak Master</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Unlocked ✓</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-500">+50 XP</span>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <p className="font-extrabold text-xs text-[var(--text-primary)]">Vocabulary Virtuoso</p>
                    <p className="text-[10px] text-emerald-500 font-bold">Unlocked ✓</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-amber-500">+50 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
