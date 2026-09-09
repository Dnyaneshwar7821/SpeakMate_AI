import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import ROUTES from "../constants/routes";
import { dashboardService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { getLiveProgressStats, recordSpeakingSession, buyStreakFreeze, syncBackendProgress } from "../utils/progressTracker";
import { StreakModal } from "../components/dashboard/StreakModal";

const getRankTier = (xp = 0) => {
  if (xp < 100) return { name: "Bronze III", icon: "🥉", badgeColor: "bg-amber-700/20 text-amber-500 border-amber-600/30" };
  if (xp < 300) return { name: "Bronze II", icon: "🥉", badgeColor: "bg-amber-600/20 text-amber-500 border-amber-500/30" };
  if (xp < 600) return { name: "Bronze I", icon: "🥉", badgeColor: "bg-amber-500/20 text-amber-400 border-amber-400/30" };
  if (xp < 1000) return { name: "Silver III", icon: "🥈", badgeColor: "bg-slate-400/20 text-slate-300 border-slate-300/30" };
  if (xp < 1500) return { name: "Silver II", icon: "🥈", badgeColor: "bg-slate-300/20 text-slate-200 border-slate-200/30" };
  if (xp < 2200) return { name: "Silver I", icon: "🥈", badgeColor: "bg-slate-200/20 text-slate-100 border-slate-100/30" };
  if (xp < 3000) return { name: "Gold III", icon: "🥇", badgeColor: "bg-amber-400/20 text-yellow-400 border-yellow-400/30" };
  if (xp < 4000) return { name: "Gold II", icon: "🥇", badgeColor: "bg-amber-400/20 text-yellow-400 border-yellow-400/30" };
  if (xp < 5000) return { name: "Gold I", icon: "🥇", badgeColor: "bg-amber-400/20 text-yellow-400 border-yellow-400/30" };
  if (xp < 7000) return { name: "Platinum Master", icon: "💎", badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" };
  return { name: "Diamond Orator", icon: "👑", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/30" };
};

const MOTIVATIONAL_QUOTES = [
  { quote: "The limits of my language mean the limits of my world.", author: "Ludwig Wittgenstein" },
  { quote: "Language is the road map of a culture. It tells you where its people come from and where they are going.", author: "Rita Mae Brown" },
  { quote: "To have another language is to possess a second soul.", author: "Charlemagne" },
  { quote: "Learning another language is not only learning different words for the same things, but learning another way to think about things.", author: "Flora Lewis" },
];

const safeString = (val, fallback = "") => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    if (typeof val.ageGroup === "string") return val.ageGroup;
    if (typeof val.schoolGrade === "string") return val.schoolGrade;
    if (typeof val.englishLevel === "string") return val.englishLevel;
    if (typeof val.role === "string") return val.role;
    if (typeof val.accountType === "string") return val.accountType;
    if (typeof val.label === "string") return val.label;
    if (typeof val.name === "string") return val.name;
    return fallback;
  }
  return String(val);
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme();

  const [accountType, setAccountType] = useState(
    () => safeString(user?.accountType || localStorage.getItem("speakmate_account_type"), "INDIVIDUAL_USER")
  );
  const [activeGrade, setActiveGrade] = useState(
    () => safeString(user?.schoolGrade || localStorage.getItem("speakmate_school_grade"), "1st Std")
  );
  const [activeAgeGroup, setActiveAgeGroup] = useState(
    () => safeString(user?.ageGroup || localStorage.getItem("speakmate_age_group"), "Professional")
  );
  const [activeEnglishLevel, setActiveEnglishLevel] = useState(
    () => safeString(user?.englishLevel || localStorage.getItem("speakmate_english_level"), "Beginner")
  );

  const isStudent = accountType === "STUDENT" || user?.role === "STUDENT" || Boolean(user?.isSchoolStudent);

  useEffect(() => {
    if (user?.accountType) setAccountType(safeString(user.accountType, "INDIVIDUAL_USER"));
    if (user?.schoolGrade) setActiveGrade(safeString(user.schoolGrade, "1st Std"));
    if (user?.ageGroup) setActiveAgeGroup(safeString(user.ageGroup, "Professional"));
    if (user?.englishLevel) setActiveEnglishLevel(safeString(user.englishLevel, "Beginner"));
  }, [user?.accountType, user?.schoolGrade, user?.ageGroup, user?.englishLevel]);

  const [stats, setStats] = useState(() => getLiveProgressStats(user));
  const [streakModalOpen, setStreakModalOpen] = useState(false);

  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [challengeClaimed, setChallengeClaimed] = useState(false);

  const calculatedRank = getRankTier(stats.xp || user?.xp || 0);
  const currentRankName = stats.rank || user?.rank || calculatedRank.name;
  const currentRankIcon = currentRankName.includes("Bronze")
    ? "🥉"
    : currentRankName.includes("Silver")
    ? "🥈"
    : currentRankName.includes("Gold")
    ? "🥇"
    : currentRankName.includes("Platinum")
    ? "💎"
    : "👑";

  const refreshStats = useCallback(() => {
    const liveStats = getLiveProgressStats();
    setStats((prev) => ({
      ...prev,
      ...liveStats,
      streak: Number(liveStats.streak ?? 0),
      xp: Number(liveStats.xp ?? 0),
      todayMins: liveStats.todayMins ?? prev.todayMins ?? 0,
      completedMins: liveStats.todayMins ?? prev.todayMins ?? 0,
      dailyGoalMins: parseInt(localStorage.getItem("speakmate_daily_goal") || "15", 10),
    }));

    dashboardService
      .summary()
      .then((data) => {
        if (data) {
          if (data.profile) {
            if (data.profile.ageGroup) setActiveAgeGroup(safeString(data.profile.ageGroup, "Professional"));
            if (data.profile.schoolGrade) setActiveGrade(safeString(data.profile.schoolGrade, "1st Std"));
            if (data.profile.englishLevel) setActiveEnglishLevel(safeString(data.profile.englishLevel, "Beginner"));
            if (data.profile.role) setAccountType(safeString(data.profile.role, "INDIVIDUAL_USER"));
          }
          const synced = syncBackendProgress(data);
          setStats((prev) => ({
            ...prev,
            ...data,
            ...synced,
            streak: Number(data.streak ?? data.progress?.streak ?? synced.streak ?? 0),
            xp: Number(data.xp ?? data.progress?.xp ?? synced.xp ?? 0),
            todayMins: synced.todayMins ?? prev.todayMins ?? 0,
            completedMins: synced.todayMins ?? prev.todayMins ?? 0,
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshStats();
    const handleAgeEvent = (e) => {
      const raw = e?.detail?.ageGroup || (typeof e?.detail === "string" ? e.detail : null) || localStorage.getItem("speakmate_age_group");
      if (raw) setActiveAgeGroup(safeString(raw, "Professional"));
    };
    const handleSettingsEvent = (e) => {
      const d = e?.detail;
      if (d?.ageGroup) setActiveAgeGroup(safeString(d.ageGroup, "Professional"));
      if (d?.schoolGrade) setActiveGrade(safeString(d.schoolGrade, "1st Std"));
      if (d?.englishLevel) setActiveEnglishLevel(safeString(d.englishLevel, "Beginner"));
      if (d?.accountType) setAccountType(safeString(d.accountType, "INDIVIDUAL_USER"));
    };
    const handleStorage = (e) => {
      if (e.key === "speakmate_age_group" && e.newValue) setActiveAgeGroup(safeString(e.newValue, "Professional"));
      if (e.key === "speakmate_school_grade" && e.newValue) setActiveGrade(safeString(e.newValue, "1st Std"));
      if (e.key === "speakmate_english_level" && e.newValue) setActiveEnglishLevel(safeString(e.newValue, "Beginner"));
      if (e.key === "speakmate_account_type" && e.newValue) setAccountType(safeString(e.newValue, "INDIVIDUAL_USER"));
    };

    window.addEventListener("focus", refreshStats);
    window.addEventListener("speakmate_progress_updated", refreshStats);
    window.addEventListener("speakmate_settings_updated", handleSettingsEvent);
    window.addEventListener("speakmate_age_group_changed", handleAgeEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("speakmate_progress_updated", refreshStats);
      window.removeEventListener("speakmate_settings_updated", handleSettingsEvent);
      window.removeEventListener("speakmate_age_group_changed", handleAgeEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshStats]);

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
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Welcome Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#4F46E5] via-[#6C63FF] to-[#8B5CF6] text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Refined Identity & Status Bar */}
            <div className="flex flex-wrap items-center gap-2.5 mb-3.5 sm:mb-4">
              {/* Pro VIP Badge */}
              {!isStudent && (user?.isPro || user?.pro) && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md border border-amber-300/80 flex items-center gap-1.5 animate-pulse">
                  <span>👑</span>
                  <span>PRO VIP</span>
                </span>
              )}

              {/* Learner Identity Pill */}
              <span className="text-xs font-bold px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 border border-white/15 shadow-sm flex items-center gap-1.5">
                {isStudent ? (
                  <>
                    <span>🎓</span>
                    <span>Standard: {safeString(activeGrade, "1st Std")}</span>
                  </>
                ) : (
                  <>
                    <span>👤</span>
                    <span>{safeString(activeAgeGroup, "Professional")}</span>
                    <span className="opacity-40">·</span>
                    <span>🎯 {safeString(activeEnglishLevel, "Beginner")}</span>
                  </>
                )}
              </span>

              {/* Unified Gamification Metrics Capsule */}
              <div className="flex items-center rounded-full bg-black/20 backdrop-blur-md border border-white/15 p-0.5 shadow-inner">
                {/* Rank */}
                <div
                  className="text-xs font-bold px-3 py-1 text-white/90 flex items-center gap-1.5"
                  title="Current Rank"
                >
                  <span className="text-sm">{currentRankIcon}</span>
                  <span>{currentRankName}</span>
                </div>

                <div className="h-3.5 w-[1px] bg-white/15" />

                {/* Streak Hub Button */}
                <button
                  onClick={() => setStreakModalOpen(true)}
                  className="text-xs font-black px-3 py-1 rounded-full hover:bg-white/15 text-amber-300 hover:text-amber-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Open Streak Hub"
                >
                  <span className="text-sm">🔥</span>
                  <span>{stats.streak}-Day Streak</span>
                </button>

                <div className="h-3.5 w-[1px] bg-white/15" />

                {/* Streak Freezes Button */}
                <button
                  onClick={() => setStreakModalOpen(true)}
                  className="text-xs font-black px-3 py-1 rounded-full hover:bg-white/15 text-cyan-300 hover:text-cyan-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Manage Streak Freezes"
                >
                  <span className="text-sm">❄️</span>
                  <span>{stats.streakFreezes || 0} Freezes</span>
                </button>

                <div className="h-3.5 w-[1px] bg-white/15" />

                {/* XP Score */}
                <div
                  className="text-xs font-black px-3 py-1 text-emerald-300 flex items-center gap-1.5"
                  title="Total XP"
                >
                  <span className="text-sm">⭐</span>
                  <span>{stats.xp} XP</span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-2.5">
              Welcome back, {user?.firstName || user?.name || "Learner"}! 👋
            </h1>
            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed font-medium">
              Your AI English tutor is ready. Practice live speaking conversations, analyze real-time grammar, or test 3D vocabulary flashcards!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=free-speak`)}
              className="px-7 py-4 rounded-2xl bg-white text-[#4F46E5] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>🎙️</span>
              <span>Start Live AI Voice Chat</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.PROGRESS)}
              className="px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm backdrop-blur-md border border-white/25 text-center transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>📊</span>
              <span>Progress Analytics</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Key Metric Statistics Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-2 border border-[var(--border-default)] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-[#6C63FF]/15">🗣️</span>
            <span className="text-[10px] font-black uppercase text-[#6C63FF] tracking-wider px-2.5 py-1 rounded-full bg-[#6C63FF]/10">
              Practice Time
            </span>
          </div>
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Total Hours</p>
          <p className="text-2xl sm:text-3xl font-black text-[#6C63FF]">{stats.totalHours} hrs</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-2 border border-[var(--border-default)] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-emerald-500/15">🎯</span>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10">
              Fluency Rate
            </span>
          </div>
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Accuracy Score</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-500">{stats.accuracy}%</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-2 border border-[var(--border-default)] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-amber-500/15">📚</span>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10">
              Vocabulary
            </span>
          </div>
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Words Mastered</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-500">{stats.wordsLearned}</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-2 border border-[var(--border-default)] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-rose-500/15">🏆</span>
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10">
              Milestones
            </span>
          </div>
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Badges Unlocked</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-500">{stats.badgesUnlocked || (stats.streak > 0 ? 1 : 0)} / 6</p>
        </div>
      </motion.div>

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
                  <span>PRINCIPAL / ADMIN • GRADE {activeGrade}</span>
                  <span className="text-[10px] opacity-75">2 hours ago</span>
                </div>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Speaking practice assignment due tomorrow 🚨</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Please complete the assigned conversation practice before 5 PM.</p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-1">
                <div className="flex items-center justify-between text-xs font-black text-[#6C63FF]">
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
                <h2 className="text-lg font-black text-[var(--text-primary)]">Homework Assignments</h2>
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
                <span className="text-[var(--text-secondary)] font-bold">Standard: {activeGrade}</span>
              </div>

              <div>
                <h3 className="font-black text-base text-[var(--text-primary)]">Practice Dialogue & Phonics Drill</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">Complete 15 minutes of speaking practice with a minimum 70% accuracy score.</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-black text-[var(--text-primary)] pt-1">
                <span className="flex items-center gap-1 text-[#6C63FF]">⏱️ Target: 15 Mins</span>
                <span className="flex items-center gap-1 text-amber-500">🏆 Min Score: 70%</span>
              </div>

              <button
                onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=free-speak&assignmentId=101`)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-black shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>Start Homework Assignment ➔</span>
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
                <span className="text-xs font-black text-[#6C63FF] uppercase tracking-wider">Daily Target</span>
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">
                  Practice for {stats.dailyGoalMins} Minutes Today
                </h2>
              </div>
              <span className="text-xs font-black text-emerald-500 bg-emerald-500/15 px-4 py-1.5 rounded-full border border-emerald-500/20">
                {stats.completedMins} / {stats.dailyGoalMins} Mins
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--bg-elevated)] h-3.5 rounded-full overflow-hidden p-0.5 border border-[var(--border-default)]">
              <div
                className="bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#FF6584] h-full rounded-full transition-all duration-500 shadow-md"
                style={{ width: `${Math.min(100, (stats.completedMins / stats.dailyGoalMins) * 100)}%` }}
              />
            </div>

            {/* Interactive 5-Min Warmup Timer Drill Card */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-4">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl ${timerActive ? "bg-rose-500 text-white animate-pulse" : "bg-[#6C63FF]/15 text-[#6C63FF]"} text-2xl font-bold shrink-0 shadow-md`}>
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
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white text-xs font-black shadow-lg shrink-0 w-full sm:w-auto transition-all active:scale-95"
                >
                  {timerCompleted ? "Restart Warmup" : "Start Warmup"}
                </button>
              ) : (
                <button
                  onClick={() => setTimerActive(false)}
                  className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black shadow-lg shrink-0 w-full sm:w-auto transition-all active:scale-95"
                >
                  Pause Timer ({formatTimer(timeLeft)})
                </button>
              )}
            </div>
          </div>

          {/* Quick Learning Action Hub - FEATURING ALL 6 MODULES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">Practice Modules</h2>
              <span className="text-xs font-black text-[#6C63FF]">6 Interactive Studios</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Module 1: Speaking Practice */}
              <div
                onClick={() => navigate(ROUTES.SPEAKING)}
                className="glass-card glass-card-hover p-6 rounded-3xl space-y-3 cursor-pointer group border border-[var(--border-default)] hover:border-[#6C63FF]/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-[#6C63FF]/15 group-hover:scale-110 transition-transform">🎙️</span>
                  <span className="text-xs font-black text-[#6C63FF] group-hover:translate-x-1 transition-transform">Practice →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[#6C63FF] transition-colors">Speaking Practice Studio</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    {isStudent ? `Curated ${safeString(activeGrade, "1st Std")} grade scenarios with Live2D coach.` : `10 real-world scenarios tailored to your ${safeString(activeAgeGroup, "Professional")} profile.`}
                  </p>
                </div>
              </div>

              {/* Module 2: AI Tutor Chat */}
              <div
                onClick={() => navigate(ROUTES.AI_CHAT)}
                className="glass-card glass-card-hover p-6 rounded-3xl space-y-3 cursor-pointer group border border-[var(--border-default)] hover:border-indigo-400/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-indigo-500/15 group-hover:scale-110 transition-transform">💬</span>
                  <span className="text-xs font-black text-indigo-400 group-hover:translate-x-1 transition-transform">Chat →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors">AI Tutor Chat Studio</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    2-column interactive live avatar chat with inline grammar evaluation & lip-sync.
                  </p>
                </div>
              </div>

              {/* Module 3: Grammar Doctor */}
              <div
                onClick={() => navigate(ROUTES.GRAMMAR)}
                className="glass-card glass-card-hover p-6 rounded-3xl space-y-3 cursor-pointer group border border-[var(--border-default)] hover:border-emerald-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-emerald-500/15 group-hover:scale-110 transition-transform">✍️</span>
                  <span className="text-xs font-black text-emerald-500 group-hover:translate-x-1 transition-transform">Diagnose →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-emerald-500 transition-colors">Grammar Doctor & Quizzes</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    Instant sentence checker with audio feedback, 16-topic handbook & daily quiz.
                  </p>
                </div>
              </div>

              {/* Module 4: 3D Flashcards & Vocab */}
              <div
                onClick={() => navigate(ROUTES.VOCABULARY)}
                className="glass-card glass-card-hover p-6 rounded-3xl space-y-3 cursor-pointer group border border-[var(--border-default)] hover:border-amber-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-amber-500/15 group-hover:scale-110 transition-transform">📚</span>
                  <span className="text-xs font-black text-amber-500 group-hover:translate-x-1 transition-transform">Explore →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-amber-500 transition-colors">3D Flashcards & Word Bank</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    Master definitions, phonetics, audio pronunciations, and spaced repetition.
                  </p>
                </div>
              </div>

              {/* Module 5: CEFR Lessons */}
              <div
                onClick={() => navigate(ROUTES.LESSONS)}
                className="glass-card glass-card-hover p-6 rounded-3xl space-y-3 cursor-pointer group border border-[var(--border-default)] hover:border-rose-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-rose-500/15 group-hover:scale-110 transition-transform">📖</span>
                  <span className="text-xs font-black text-rose-500 group-hover:translate-x-1 transition-transform">Study →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-rose-500 transition-colors">Curriculum & CEFR Lessons</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    Structured audio lessons with comprehension tests from A1 to C2 and Grades 1-10.
                  </p>
                </div>
              </div>

              {/* Module 6: Analytics & Fluency Studio */}
              <div
                onClick={() => navigate(ROUTES.PROGRESS)}
                className="glass-card glass-card-hover p-6 rounded-3xl space-y-3 cursor-pointer group border border-[var(--border-default)] hover:border-cyan-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2.5 rounded-2xl bg-cyan-500/15 group-hover:scale-110 transition-transform">📊</span>
                  <span className="text-xs font-black text-cyan-500 group-hover:translate-x-1 transition-transform">Analyze →</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-cyan-500 transition-colors">Analytics & Fluency Studio</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    Speech rate (WPM) diagnostics, CEFR mastery roadmap ladder & habit rhythm.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Daily Motivation & Audio Quote Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#6C63FF]/30 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#6C63FF] uppercase tracking-wider">Daily Inspiration</span>
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
              <p className="text-xs font-black text-[#6C63FF]">— {currentQuote.author}</p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <button
                onClick={() => handleSpeakQuote(currentQuote.quote)}
                className="px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-black text-[var(--text-primary)] hover:bg-[#6C63FF] hover:text-white transition-all flex items-center gap-2 shadow-sm active:scale-95"
              >
                <span>🔊 Listen Quote</span>
              </button>

              {!challengeClaimed ? (
                <button
                  onClick={handleAcceptChallenge}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#FF6584] text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  Accept (+50 XP)
                </button>
              ) : (
                <span className="text-xs font-black text-emerald-500 bg-emerald-500/15 px-4 py-1.5 rounded-full border border-emerald-500/20">
                  ✓ Goal Accepted!
                </span>
              )}
            </div>
          </div>

          {/* Streak & Freeze Protection Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-cyan-500/30 bg-gradient-to-br from-[var(--bg-surface)] to-cyan-500/5 shadow-xl">
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
                  ? "bg-gradient-to-r from-cyan-500 to-[#6C63FF] text-white hover:scale-[1.02] active:scale-[0.98]"
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
              <Link to={ROUTES.ACHIEVEMENTS} className="text-xs font-black text-[#6C63FF] hover:underline">
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
                  <span className="text-2xl p-2 rounded-xl bg-[#6C63FF]/10">📚</span>
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

      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => {
          setStreakModalOpen(false);
          refreshStats();
        }}
        userContext={user}
      />
    </div>
  );
}

export default Dashboard;
