import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";
import { dashboardService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";

import { getLiveProgressStats, recordSpeakingSession, buyStreakFreeze } from "../utils/progressTracker";

const MOTIVATIONAL_QUOTES = [
  { quote: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { quote: "Language is the road map of a culture. It tells you where its people come from and where they are going.", author: "Rita Mae Brown" },
  { quote: "To have another language is to possess a second soul.", author: "Charlemagne" },
  { quote: "Learning another language is not only learning different words for the same things, but learning another way to think about things.", author: "Flora Lewis" },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const accountType = localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";
  const isStudent = accountType === "STUDENT";

  const activeGrade =
    user?.schoolGrade ||
    localStorage.getItem("speakmate_school_grade") ||
    "1st Std";
  const activeAgeGroup =
    localStorage.getItem("speakmate_age_group") ||
    user?.ageGroup ||
    "Professional";

  const [stats, setStats] = useState(() => getLiveProgressStats(user));

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [challengeClaimed, setChallengeClaimed] = useState(false);

  const refreshStats = () => {
    const liveStats = getLiveProgressStats(user);
    setStats((prev) => ({
      ...prev,
      ...liveStats,
      level: isStudent ? activeGrade : activeAgeGroup,
      dailyGoalMins: parseInt(localStorage.getItem("speakmate_daily_goal") || "15", 10),
    }));
  };

  useEffect(() => {
    refreshStats();
    window.addEventListener("focus", refreshStats);
    dashboardService
      .summary()
      .then((data) => {
        if (data) {
          setStats((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("focus", refreshStats);
  }, [user, activeGrade, activeAgeGroup]);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setTimerCompleted(true);
      recordSpeakingSession(5, 95);
      refreshStats();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSpeakQuote = (text) => {
    speakGlobalText(text);
  };

  const handleAcceptChallenge = () => {
    setChallengeClaimed(true);
    setStats((prev) => ({ ...prev, xp: prev.xp + 50 }));
  };

  const handleBuyFreeze = () => {
    const res = buyStreakFreeze(100, user);
    if (res.success) {
      refreshStats();
    }
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-4">
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#4f46e5] via-[#6c63ff] to-[#8b5cf6] text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md uppercase tracking-wider text-amber-300 border border-white/20">
                {isStudent ? `🎓 Standard: ${activeGrade}` : `👤 Level: ${activeAgeGroup}`}
              </span>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-md">
                🔥 {stats.streak}-Day Streak
              </span>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-cyan-400 text-slate-950 shadow-md">
                ❄️ {stats.streakFreezes || 0} Freezes
              </span>
              <span className="text-xs font-black px-3.5 py-1 rounded-full bg-emerald-400 text-slate-950 shadow-md">
                ⭐ {stats.xp} XP Points
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Welcome back, {user?.firstName || user?.name || "Learner"}! 👋
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-medium">
              Your AI English tutor is ready. Practice live speaking, test dynamic vocabulary quizzes, check grammar, or track your progress analytics!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=free-speak`)}
              className="px-6 py-4 rounded-2xl bg-white text-[#4f46e5] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all text-center"
            >
              🎙️ Start Live AI Voice Chat
            </button>
            <button
              onClick={() => navigate(ROUTES.PROGRESS)}
              className="px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm backdrop-blur-md border border-white/25 text-center transition-all"
            >
              📊 Progress Analytics
            </button>
          </div>
        </div>
      </motion.div>

      {/* Key Metric Statistics Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl p-2.5 rounded-2xl bg-[#6c63ff]/10">🗣️</span>
            <span className="text-[10px] font-black uppercase text-[#6c63ff] tracking-wider px-2.5 py-1 rounded-full bg-[#6c63ff]/10">
              Practice Time
            </span>
          </div>
          <p className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider pt-1">Total Hours</p>
          <p className="text-3xl font-black text-[#6c63ff]">{stats.totalHours} hrs</p>
        </div>

        <div className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl p-2.5 rounded-2xl bg-emerald-500/10">🎯</span>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10">
              Fluency Rate
            </span>
          </div>
          <p className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider pt-1">Accuracy Score</p>
          <p className="text-3xl font-black text-emerald-500">{stats.accuracy}%</p>
        </div>

        <div className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl p-2.5 rounded-2xl bg-amber-500/10">📚</span>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10">
              Vocabulary
            </span>
          </div>
          <p className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider pt-1">Words Mastered</p>
          <p className="text-3xl font-black text-amber-500">{stats.wordsLearned}</p>
        </div>

        <div className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-3xl p-2.5 rounded-2xl bg-rose-500/10">🏆</span>
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10">
              Milestones
            </span>
          </div>
          <p className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider pt-1">Badges Unlocked</p>
          <p className="text-3xl font-black text-rose-500">{stats.badgesUnlocked || (stats.streak > 0 ? 1 : 0)} / 6</p>
        </div>
      {/* School Student Specific Announcements & Assignments Cards */}
      {isStudent && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* School Announcements Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                <h2 className="text-lg font-black text-[var(--text-primary)]">School Announcements</h2>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
                2 New
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-rose-500">
                  <span>PRINCIPAL / ADMIN • GRADE 8-B</span>
                  <span className="text-[10px] opacity-75">2 hours ago</span>
                </div>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Grade 8-B speaking assessment due tomorrow 🚨</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">All students must complete the Job Interview conversation assignment before 5 PM.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-[#6c63ff]">
                  <span>ENGLISH DEPT • ALL CLASSES</span>
                  <span className="text-[10px] opacity-75">Yesterday</span>
                </div>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Weekly English Challenge Available 🏆</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Earn +100 bonus XP by maintaining a 5-day speaking practice streak!</p>
              </div>
            </div>
          </div>

          {/* My Assignments Homework Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <h2 className="text-lg font-black text-[var(--text-primary)]">My Homework Assignments</h2>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                1 Pending
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-500 border border-amber-400/30">
                  DUE: TOMORROW
                </span>
                <span className="text-[var(--text-secondary)] font-bold">Prof. Sharma (Grade 10-A)</span>
              </div>

              <div>
                <h3 className="font-black text-base text-[var(--text-primary)]">Practice Job Interview Conversation</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Complete 15 minutes of speaking practice on the Job Interview scenario with a minimum 70% score.</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-black text-[var(--text-primary)] pt-1">
                <span className="flex items-center gap-1 text-[#6c63ff]">⏱️ Target: 15 Mins</span>
                <span className="flex items-center gap-1 text-amber-500">🏆 Min Score: 70%</span>
              </div>

              <button
                onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=job_interview&assignmentId=101`)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white text-xs font-black shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Start Homework ➔</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Daily Goal & Interactive Warmup Drill */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-[var(--border-default)] shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-[#6c63ff] uppercase tracking-wider">Daily Target</span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                  Practice for {stats.dailyGoalMins} Minutes Today
                </h2>
              </div>
              <span className="text-xs font-black text-emerald-500 bg-emerald-500/15 px-4 py-1.5 rounded-full border border-emerald-500/20">
                {stats.completedMins} / {stats.dailyGoalMins} Mins
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--bg-elevated)] h-3.5 rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)]">
              <div
                className="bg-gradient-to-r from-[#6c63ff] via-[#8b85ff] to-[#ff6584] h-full rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${Math.min(100, (stats.completedMins / stats.dailyGoalMins) * 100)}%` }}
              />
            </div>

            {/* Interactive 5-Min Warmup Timer Drill Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl ${timerActive ? "bg-rose-500 text-white animate-pulse" : "bg-[#6c63ff]/15 text-[#6c63ff]"} text-2xl font-bold shrink-0 shadow-md`}>
                  ⏱️
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">Quick 5-Min Speaking Warmup</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 leading-relaxed">
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
                  className="px-6 py-3.5 rounded-2xl bg-[#6c63ff] hover:bg-[#7c74ff] text-white text-xs font-black shadow-lg shrink-0 w-full sm:w-auto transition-all"
                >
                  {timerCompleted ? "Restart Warmup" : "Start Warmup"}
                </button>
              ) : (
                <button
                  onClick={() => setTimerActive(false)}
                  className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black shadow-lg shrink-0 w-full sm:w-auto transition-all"
                >
                  Pause Timer ({formatTimer(timeLeft)})
                </button>
              )}
            </div>
          </div>

          {/* Quick Learning Action Hub - FEATURING ALL MODULES */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-[var(--text-primary)]">All Learning Modules</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Module 1: Speaking Practice */}
              <div
                onClick={() => navigate(ROUTES.SPEAKING)}
                className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-4 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-[#6c63ff]/15 group-hover:scale-110 transition-transform">🗣️</span>
                  <span className="text-xs font-black text-[#6c63ff] group-hover:translate-x-1 transition-transform">Practice →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">Speaking Practice</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    {isStudent ? `Curated ${activeGrade} grade scenarios & phonics.` : "Real-world conversations, interviews & speeches."}
                  </p>
                </div>
              </div>

              {/* Module 2: Grammar Practice */}
              <div
                onClick={() => navigate(ROUTES.GRAMMAR)}
                className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-4 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-emerald-500/15 group-hover:scale-110 transition-transform">✍️</span>
                  <span className="text-xs font-black text-emerald-500 group-hover:translate-x-1 transition-transform">Analyze →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">AI Live Grammar Practice</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">Instant sentence correction with AI audio explanation.</p>
                </div>
              </div>

              {/* Module 3: CEFR Lessons */}
              <div
                onClick={() => navigate(ROUTES.LESSONS)}
                className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-4 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-rose-500/15 group-hover:scale-110 transition-transform">📖</span>
                  <span className="text-xs font-black text-rose-500 group-hover:translate-x-1 transition-transform">Study →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] group-hover:text-rose-500 transition-colors">CEFR Lesson Modules</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">Structured bite-sized lessons & quizzes from A1 to C2.</p>
                </div>
              </div>

              {/* Module 4: Vocabulary Builder */}
              <div
                onClick={() => navigate(ROUTES.VOCABULARY)}
                className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-4 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-amber-500/15 group-hover:scale-110 transition-transform">📚</span>
                  <span className="text-xs font-black text-amber-500 group-hover:translate-x-1 transition-transform">Explore →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">Vocabulary Builder</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">Study definitions, phonetics & AI audio pronunciations.</p>
                </div>
              </div>

              {/* Module 5: Progress & Analytics */}
              <div
                onClick={() => navigate(ROUTES.PROGRESS)}
                className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-4 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-cyan-500/15 group-hover:scale-110 transition-transform">📊</span>
                  <span className="text-xs font-black text-cyan-500 group-hover:translate-x-1 transition-transform">View →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] group-hover:text-cyan-500 transition-colors">Progress & Analytics</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">Level tracker, weekly study rhythm & skill competency.</p>
                </div>
              </div>

              {/* Module 6: AI Chat Coach */}
              <div
                onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=free-speak`)}
                className="glass-card-premium glass-card-hover p-6 rounded-3xl space-y-4 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 rounded-2xl bg-indigo-500/15 group-hover:scale-110 transition-transform">💬</span>
                  <span className="text-xs font-black text-indigo-500 group-hover:translate-x-1 transition-transform">Chat →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">AI Voice Chat Coach</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">Freeform voice conversation with speed controls.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Daily Motivation & Audio Quote Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#6c63ff]/30 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#6c63ff] uppercase tracking-wider">Daily Inspiration</span>
              <button
                onClick={() => setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="Next Quote"
              >
                ↻ Next Quote
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-base font-extrabold text-[var(--text-primary)] italic leading-relaxed">
                "{currentQuote.quote}"
              </p>
              <p className="text-xs font-black text-[#6c63ff]">— {currentQuote.author}</p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => handleSpeakQuote(currentQuote.quote)}
                className="px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-black text-[var(--text-primary)] hover:bg-[#6c63ff] hover:text-white transition-all flex items-center gap-2 shadow-sm"
              >
                <span>🔊 Listen Quote</span>
              </button>

              {!challengeClaimed ? (
                <button
                  onClick={handleAcceptChallenge}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-xs font-black shadow-md transition-all hover:scale-105"
                >
                  Accept Goal (+50 XP)
                </button>
              ) : (
                <span className="text-xs font-black text-emerald-500 bg-emerald-500/15 px-4 py-1.5 rounded-full border border-emerald-500/20">
                  ✓ Goal Accepted!
                </span>
              )}
            </div>
          </div>

          {/* Streak & Freeze Protection Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-cyan-500/30 bg-gradient-to-br from-[var(--bg-card)] to-cyan-500/5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-500 uppercase tracking-wider">Streak Protection</span>
              <span className="text-xs font-black text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                ❄️ {stats.streakFreezes || 0} Freezes Active
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">Protect Your Streak ❄️</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                Missed a day? A Streak Freeze automatically saves your streak! Spend 100 XP to add a Freeze to your reserve.
              </p>
            </div>

            <button
              onClick={handleBuyFreeze}
              disabled={stats.xp < 100}
              className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                stats.xp >= 100
                  ? "bg-gradient-to-r from-cyan-500 to-[#6c63ff] text-white hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-gray-400/20 text-gray-400 cursor-not-allowed border border-gray-400/20"
              }`}
            >
              <span>❄️ Buy 1 Freeze (100 XP)</span>
            </button>
          </div>

          {/* Milestones & Achievements Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 border border-[var(--border-default)] shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-[var(--text-primary)]">Milestones</h3>
              <Link to={ROUTES.ACHIEVEMENTS} className="text-xs font-black text-[#6c63ff] hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-amber-500/10">🔥</span>
                  <div>
                    <p className="font-black text-xs text-[var(--text-primary)]">3-Day Streak Master</p>
                    <p className="text-[11px] text-emerald-500 font-bold mt-0.5">Unlocked ✓</p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">+50 XP</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-[#6c63ff]/10">📚</span>
                  <div>
                    <p className="font-black text-xs text-[var(--text-primary)]">Vocabulary Virtuoso</p>
                    <p className="text-[11px] text-emerald-500 font-bold mt-0.5">Unlocked ✓</p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">+50 XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
