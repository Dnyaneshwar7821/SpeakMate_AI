import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import ROUTES from "../constants/routes";
import { dashboardService, assignmentService, announcementService } from "../services/appServices";
import { speakGlobalText } from "../utils/speechHelper";
import { getEnglishLevelLabel } from "../utils/formatters";

import {
  getLiveProgressStats,
  buyStreakFreeze,
  repairBrokenStreak,
  syncBackendProgress,
  claimDailyQuoteXP,
  getLocalDateStr,
} from "../utils/progressTracker";
import { StreakModal } from "../components/dashboard/StreakModal";
import { LeaderboardModal } from "../components/dashboard/LeaderboardModal";

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
  const { user } = useAuth();
  const { isDark } = useTheme();
  const toast = useToast();

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

  // Aligned student detection matching Navbar and mobile app
  const isStudent = useMemo(() => {
    return (
      accountType === "STUDENT" ||
      user?.accountType === "STUDENT" ||
      user?.role === "STUDENT" ||
      Boolean(user?.isSchoolStudent) ||
      Boolean(user?.schoolGrade) ||
      Boolean(user?.schoolId) ||
      Boolean(localStorage.getItem("speakmate_school_grade"))
    );
  }, [accountType, user]);

  useEffect(() => {
    if (user?.accountType) setAccountType(safeString(user.accountType, "INDIVIDUAL_USER"));
    if (user?.schoolGrade) setActiveGrade(safeString(user.schoolGrade, "1st Std"));
    if (user?.ageGroup) setActiveAgeGroup(safeString(user.ageGroup, "Professional"));
    if (user?.englishLevel) setActiveEnglishLevel(safeString(user.englishLevel, "Beginner"));
  }, [user?.accountType, user?.schoolGrade, user?.ageGroup, user?.englishLevel]);

  // Initial stats with safe fallbacks
  const [stats, setStats] = useState(() => {
    const live = getLiveProgressStats(user);
    const initialGoal = parseInt(user?.dailyGoalMinutes || localStorage.getItem("speakmate_daily_goal") || "15", 10);
    return {
      ...live,
      completedMins: live.todayMins || 0,
      dailyGoalMins: initialGoal,
    };
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState(false);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [challengeClaimed, setChallengeClaimed] = useState(() => {
    const st = getLiveProgressStats(user);
    return st.lastQuoteClaimDate === getLocalDateStr();
  });

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
    const liveStats = getLiveProgressStats(user);
    const userGoal = parseInt(
      user?.dailyGoalMinutes ||
      user?.dailyGoal ||
      localStorage.getItem("speakmate_daily_goal") ||
      "15",
      10
    );

    setStats((prev) => ({
      ...prev,
      ...liveStats,
      streak: Number(liveStats.streak ?? prev.streak ?? 0),
      xp: Number(liveStats.xp ?? prev.xp ?? 0),
      streakFreezes: Number(liveStats.streakFreezes ?? prev.streakFreezes ?? 0),
      todayMins: liveStats.todayMins ?? prev.todayMins ?? 0,
      completedMins: liveStats.todayMins ?? prev.todayMins ?? 0,
      dailyGoalMins: userGoal,
    }));

    dashboardService
      .summary()
      .then((data) => {
        if (data) {
          setDashboardData(data);
          if (data.profile) {
            if (data.profile.ageGroup) setActiveAgeGroup(safeString(data.profile.ageGroup, "Professional"));
            if (data.profile.schoolGrade) setActiveGrade(safeString(data.profile.schoolGrade, "1st Std"));
            if (data.profile.englishLevel) setActiveEnglishLevel(safeString(data.profile.englishLevel, "Beginner"));
            if (data.profile.role) setAccountType(safeString(data.profile.role, "INDIVIDUAL_USER"));
          }
          const synced = syncBackendProgress(data, user);
          const backendStats = data.statistics || {};
          const backendAccuracy = backendStats.averageScore > 0 ? backendStats.averageScore : null;
          const finalAccuracy = synced.accuracy ?? backendAccuracy;
          const finalHours = backendStats.totalStudyHours != null ? backendStats.totalStudyHours : synced.totalHours;
          const finalWords = backendStats.vocabularyLearned ?? data.progress?.totalVocabularyWords ?? synced.wordsLearned;
          const targetFromBackend = data.dailyGoal?.targetSpeakingMinutes || data.dailyGoal?.dailyGoalMinutes;

          setStats((prev) => ({
            ...prev,
            ...data,
            ...synced,
            accuracy: finalAccuracy,
            totalHours: finalHours,
            wordsLearned: finalWords,
            streak: Number(synced.streak ?? data.streak ?? data.progress?.streak ?? 0),
            xp: Number(synced.xp ?? data.progress?.xp ?? data.xp ?? 0),
            streakFreezes: Number(synced.streakFreezes ?? prev.streakFreezes ?? 0),
            todayMins: synced.todayMins ?? prev.todayMins ?? 0,
            completedMins: synced.todayMins ?? prev.todayMins ?? 0,
            dailyGoalMins: targetFromBackend || userGoal,
          }));
        }
      })
      .catch(() => {});
  }, [user]);

  const [studentAssignments, setStudentAssignments] = useState([]);
  const [schoolAnnouncements, setSchoolAnnouncements] = useState([]);

  useEffect(() => {
    if (isStudent) {
      assignmentService
        .myAssignments()
        .then((res) => setStudentAssignments(Array.isArray(res) ? res : []))
        .catch(() => setStudentAssignments([]));
      announcementService
        .list()
        .then((res) => setSchoolAnnouncements(Array.isArray(res) ? res : []))
        .catch(() => setSchoolAnnouncements([]));
    }
  }, [isStudent]);

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
      if (d?.dailyGoalMinutes) {
        localStorage.setItem("speakmate_daily_goal", String(d.dailyGoalMinutes));
        setStats((prev) => ({ ...prev, dailyGoalMins: d.dailyGoalMinutes }));
      }
    };
    const handleStorage = (e) => {
      if (e.key === "speakmate_age_group" && e.newValue) setActiveAgeGroup(safeString(e.newValue, "Professional"));
      if (e.key === "speakmate_school_grade" && e.newValue) setActiveGrade(safeString(e.newValue, "1st Std"));
      if (e.key === "speakmate_english_level" && e.newValue) setActiveEnglishLevel(safeString(e.newValue, "Beginner"));
      if (e.key === "speakmate_account_type" && e.newValue) setAccountType(safeString(e.newValue, "INDIVIDUAL_USER"));
      if (e.key === "speakmate_daily_goal" && e.newValue) {
        const val = parseInt(e.newValue, 10);
        if (val) setStats((prev) => ({ ...prev, dailyGoalMins: val }));
      }
    };

    const handleProgressEvent = (e) => {
      const updated = e?.detail || getLiveProgressStats(user);
      const today = getLocalDateStr();
      if (updated?.lastQuoteClaimDate === today) {
        setChallengeClaimed(true);
      }
      setStats((prev) => ({
        ...prev,
        ...updated,
        streak: Number(updated.streak ?? prev.streak ?? 0),
        xp: Number(updated.xp ?? prev.xp ?? 0),
        streakFreezes: Number(updated.streakFreezes ?? prev.streakFreezes ?? 0),
        todayMins: updated.todayMins ?? prev.todayMins ?? 0,
        completedMins: updated.todayMins ?? prev.todayMins ?? 0,
      }));
    };

    window.addEventListener("focus", refreshStats);
    window.addEventListener("speakmate_progress_updated", handleProgressEvent);
    window.addEventListener("speakmate_settings_updated", handleSettingsEvent);
    window.addEventListener("speakmate_age_group_changed", handleAgeEvent);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("speakmate_progress_updated", handleProgressEvent);
      window.removeEventListener("speakmate_settings_updated", handleSettingsEvent);
      window.removeEventListener("speakmate_age_group_changed", handleAgeEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshStats, user]);

  const handleSpeakQuote = (text) => {
    speakGlobalText(text);
  };

  const handleAcceptChallenge = () => {
    const res = claimDailyQuoteXP(50, user);
    if (res.success) {
      setChallengeClaimed(true);
      setStats((prev) => ({
        ...prev,
        ...res.stats,
        xp: Number(res.stats.xp ?? prev.xp ?? 0),
        streakFreezes: Number(res.stats.streakFreezes ?? prev.streakFreezes ?? 0),
      }));
      toast.success(res.message);
    } else {
      setChallengeClaimed(true);
      toast.info(res.message);
    }
  };

  const handleBuyFreeze = async () => {
    try {
      const res = await buyStreakFreeze(100, user);
      if (res.success) {
        setStats((prev) => ({
          ...prev,
          ...res.stats,
          xp: Number(res.stats.xp ?? prev.xp ?? 0),
          streakFreezes: Number(res.stats.streakFreezes ?? prev.streakFreezes ?? 0),
        }));
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error("Failed to purchase streak freeze");
    }
  };

  const handleRepairStreak = () => {
    const res = repairBrokenStreak(150, user);
    if (res.success) {
      setStats((prev) => ({
        ...prev,
        ...res.stats,
        streak: Number(res.stats.streak ?? prev.streak ?? 0),
        xp: Number(res.stats.xp ?? prev.xp ?? 0),
      }));
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const currentQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  // Daily practice goal metrics connected directly to user's onboarding choice
  const dailyTargetMins = Number(
    dashboardData?.dailyGoal?.targetSpeakingMinutes ||
    dashboardData?.dailyGoal?.dailyGoalMinutes ||
    stats.dailyGoalMins ||
    localStorage.getItem("speakmate_daily_goal") ||
    15
  );

  const speakingMinsToday = Number(
    dashboardData?.dailyGoal?.speakingMinutesToday ?? stats.completedMins ?? stats.todayMins ?? 0
  );

  const lessonsToday = Number(
    dashboardData?.dailyGoal?.lessonsCompletedToday ?? stats.lessonsCompletedToday ?? (stats.lessonsCompleted > 0 ? 1 : 0)
  );

  const vocabToday = Number(
    dashboardData?.dailyGoal?.vocabularyCompleted ?? stats.wordsLearnedToday ?? Math.min(5, stats.wordsLearned || 0)
  );

  const vocabTarget = Number(dashboardData?.dailyGoal?.vocabularyTarget || 5);

  const goalPercentage = dashboardData?.dailyGoal?.percentage != null
    ? Math.round(dashboardData.dailyGoal.percentage)
    : Math.min(
        100,
        Math.round(
          (((speakingMinsToday / dailyTargetMins) + (vocabToday / vocabTarget) + (lessonsToday > 0 ? 1 : 0)) / 3) * 100
        )
      );

  const isGoalCompleted = goalPercentage >= 100 || speakingMinsToday >= dailyTargetMins;

  // Continue learning item from dashboard or active track fallback
  const continueItem = dashboardData?.continueLearning || {
    title: isStudent ? `${activeGrade} English Speech Masterclass` : `${activeAgeGroup} Fluent Speaking Track`,
    module: "Speaking Session",
    description: isStudent
      ? `Continue your structured syllabus dialogue practice for ${activeGrade}.`
      : `Resume real-world workplace scenarios tailored to ${activeAgeGroup} proficiency.`,
    progress: Math.min(85, Math.max(20, (stats.lessonsCompleted || 0) * 15)),
    targetRoute: ROUTES.SPEAKING,
  };

  const weeklyHabit = stats.weeklyData || [];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* ── SECTION 1: PERSONALIZED WELCOME HERO HEADER (Matching Mobile App DashboardHeader) ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[#4F46E5] via-[#6C63FF] to-[#8B5CF6] text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            {/* Identity & Status Bar */}
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
                    <span>🎯 Your English Level: {getEnglishLevelLabel(user?.englishLevel || activeEnglishLevel || stats?.level)}</span>
                  </>
                )}
              </span>

              {/* Unified Gamification Metrics Capsule */}
              <div className="flex items-center flex-wrap sm:flex-nowrap rounded-full bg-black/20 backdrop-blur-md border border-white/15 p-0.5 shadow-inner">
                {/* Rank Pill Interactive Button */}
                <button
                  type="button"
                  onClick={() => setLeaderboardModalOpen(true)}
                  className="text-xs font-bold px-3 py-1 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="View Global Leaderboard"
                >
                  <span className="text-sm">{currentRankIcon}</span>
                  <span>{currentRankName}</span>
                </button>

                <div className="hidden sm:block h-3.5 w-[1px] bg-white/15" />

                {/* Streak Hub Button */}
                <button
                  onClick={() => setStreakModalOpen(true)}
                  className="text-xs font-black px-3 py-1 rounded-full hover:bg-white/15 text-amber-300 hover:text-amber-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Open Streak Hub"
                >
                  <span className="text-sm">🔥</span>
                  <span>{stats.streak}-Day Streak</span>
                </button>

                <div className="hidden sm:block h-3.5 w-[1px] bg-white/15" />

                {/* Streak Freezes Button */}
                <button
                  onClick={() => setStreakModalOpen(true)}
                  className="text-xs font-black px-3 py-1 rounded-full hover:bg-white/15 text-cyan-300 hover:text-cyan-200 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  title="Manage Streak Freezes"
                >
                  <span className="text-sm">❄️</span>
                  <span>{stats.streakFreezes || 0} Freezes</span>
                </button>

                <div className="hidden sm:block h-3.5 w-[1px] bg-white/15" />

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
              className="px-7 py-4 rounded-2xl bg-white text-[#4F46E5] font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎙️</span>
              <span>Start Live AI Voice Chat</span>
            </button>
            <button
              onClick={() => navigate(ROUTES.PROGRESS)}
              className="px-6 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-sm backdrop-blur-md border border-white/25 text-center transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <span>📊</span>
              <span>Progress Analytics</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── SECTION 2: TODAY'S PRACTICE GOAL CARD (Connected directly with Onboarding Time Selection, No 15-min hardcode, No timer) ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="glass-card p-6 sm:p-8 rounded-3xl space-y-6 border border-[var(--border-default)] shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black text-[#6C63FF] uppercase tracking-wider">Daily Goal</span>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-0.5">
              Today Practice Goal
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
              Personalized target from your onboarding setup ({dailyTargetMins} min/day commitment)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-4 py-1.5 rounded-full border flex items-center gap-1.5 ${
                isGoalCompleted
                  ? "bg-amber-400/20 text-amber-500 border-amber-400/40"
                  : "bg-[#6C63FF]/15 text-[#6C63FF] border-[#6C63FF]/30"
              }`}
            >
              <span>{isGoalCompleted ? "🏅" : "🚩"}</span>
              <span>{goalPercentage}% Completed</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--bg-elevated)] h-3.5 rounded-full overflow-hidden p-0.5 border border-[var(--border-default)]">
          <div
            className={`h-full rounded-full transition-all duration-700 shadow-md ${
              isGoalCompleted
                ? "bg-gradient-to-r from-amber-400 to-emerald-500"
                : "bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#FF6584]"
            }`}
            style={{ width: `${goalPercentage}%` }}
          />
        </div>

        {/* 3 Goal Metrics (Matching Mobile App DailyGoalCard) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-emerald-500/10">✅</span>
            <div>
              <p className="text-lg font-black text-[var(--text-primary)]">{lessonsToday}</p>
              <p className="text-xs text-[var(--text-secondary)] font-bold">Lessons Today</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-[#6C63FF]/10">🎙️</span>
            <div>
              <p className="text-lg font-black text-[var(--text-primary)]">
                {speakingMinsToday} / {dailyTargetMins} Mins
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-bold">Speaking Time</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-amber-500/10">📚</span>
            <div>
              <p className="text-lg font-black text-[var(--text-primary)]">
                {vocabToday} / {vocabTarget}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-bold">Vocabulary Target</p>
            </div>
          </div>
        </div>

        {/* Footer & CTA */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[var(--border-default)]">
          <p className="text-xs font-bold text-[var(--text-secondary)]">
            {isGoalCompleted
              ? "🎉 Goal completed for today! Keep the flame streak alive tomorrow."
              : `${Math.max(0, dailyTargetMins - speakingMinsToday)} minutes of practice remaining to hit your daily goal.`}
          </p>

          <button
            onClick={() => navigate(ROUTES.SPEAKING)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Learning →</span>
          </button>
        </div>
      </motion.div>

      {/* ── SECTION 2.5: SCHOOL ANNOUNCEMENTS & HOMEWORK (STUDENTS ONLY) ── */}
      {isStudent && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* School Announcements Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔔</span>
                <h2 className="text-lg font-black text-[var(--text-primary)]">School Announcements</h2>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                {schoolAnnouncements.length} {schoolAnnouncements.length === 1 ? "Notice" : "Notices"}
              </span>
            </div>

            <div className="space-y-3">
              {schoolAnnouncements.length > 0 ? (
                schoolAnnouncements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-1">
                    <div className="flex items-center justify-between text-xs font-black text-indigo-400">
                      <span>{ann.sender || "SCHOOL ADMIN"}</span>
                      <span className="text-[10px] opacity-75">{ann.timestamp || "Recent"}</span>
                    </div>
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{ann.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">{ann.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-center space-y-1.5">
                  <p className="text-2xl">📢</p>
                  <p className="text-xs font-black text-[var(--text-primary)]">No New Announcements</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">You're all caught up on official school notices.</p>
                </div>
              )}
            </div>
          </div>

          {/* My Assignments Homework Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-emerald-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <h2 className="text-lg font-black text-[var(--text-primary)]">Homework Assignments</h2>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${studentAssignments.length > 0 ? "bg-amber-500/15 text-amber-500 border border-amber-500/30" : "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"}`}>
                {studentAssignments.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {studentAssignments.length > 0 ? (
                studentAssignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-500 border border-amber-400/30">
                        DUE: {asg.dueDate || "UPCOMING"}
                      </span>
                      <span className="text-[var(--text-secondary)] font-bold">{asg.className || `Standard: ${activeGrade}`}</span>
                    </div>

                    <div>
                      <h3 className="font-black text-base text-[var(--text-primary)]">{asg.title}</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">{asg.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-black text-[var(--text-primary)] pt-1">
                      {asg.targetMinutes && <span className="flex items-center gap-1 text-[#6C63FF]">⏱️ Target: {asg.targetMinutes} Mins</span>}
                      {asg.minimumScore && <span className="flex items-center gap-1 text-amber-500">🏆 Min Score: {asg.minimumScore}%</span>}
                    </div>

                    <button
                      onClick={() => navigate(`${ROUTES.CONVERSATION_SESSION}?scenario=free-speak&assignmentId=${asg.id}`)}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-black shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Start Homework Assignment ➔</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-center space-y-3">
                  <p className="text-2xl">✨</p>
                  <div>
                    <p className="text-xs font-black text-[var(--text-primary)]">No Pending Homework</p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Great job! You have no outstanding homework assignments.</p>
                  </div>
                  <button
                    onClick={() => navigate(ROUTES.SPEAKING)}
                    className="px-5 py-2.5 rounded-2xl bg-[#6C63FF]/15 hover:bg-[#6C63FF]/25 text-[#6C63FF] text-xs font-black transition-all cursor-pointer"
                  >
                    Practice Free Speaking ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── SECTION 3: CONTINUE LEARNING CARD (Matching Mobile App ContinueLearningCard) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="glass-card p-6 sm:p-7 rounded-3xl border border-[var(--border-default)] shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-[#6C63FF]/15 text-[#6C63FF]">
                {continueItem.module || "Speaking Session"}
              </span>
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">Recently Active</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
              {continueItem.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium max-w-2xl leading-relaxed">
              {continueItem.description}
            </p>
            {/* Progress bar */}
            <div className="pt-2 max-w-md space-y-1">
              <div className="flex justify-between text-[11px] font-black text-[var(--text-secondary)]">
                <span>Course Progress</span>
                <span className="text-[#6C63FF]">{continueItem.progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]"
                  style={{ width: `${continueItem.progress}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(continueItem.targetRoute || ROUTES.SPEAKING)}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-black shadow-md hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            Resume Session ➔
          </button>
        </div>
      </motion.div>

      {/* ── SECTION 4: PRACTICE MODULES HUB (6 Studios, Matching Mobile App QuickActionsCard) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">Practice Modules</h2>
          <span className="text-xs font-black text-[#6C63FF]">6 Interactive Studios</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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

      {/* ── SECTION 5: LEARNING STATISTICS (QuickStatistics, Matching Mobile App) ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
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
          <p className="text-2xl sm:text-3xl font-black text-[#6C63FF]">
            {stats.totalHours != null ? `${Number(stats.totalHours).toFixed(1)} hrs` : "0.0 hrs"}
          </p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-2 border border-[var(--border-default)] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-emerald-500/15">🎯</span>
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10">
              Fluency Rate
            </span>
          </div>
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Accuracy Score</p>
          {stats.accuracy != null && stats.accuracy > 0 ? (
            <p className="text-2xl sm:text-3xl font-black text-emerald-500">{stats.accuracy}%</p>
          ) : (
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-muted)]">--%</p>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">No sessions yet</span>
            </div>
          )}
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-2 border border-[var(--border-default)] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-amber-500/15">📚</span>
            <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10">
              Vocabulary
            </span>
          </div>
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Words Mastered</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-500">{stats.wordsLearned || 0}</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl space-y-2 border border-[var(--border-default)] shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-rose-500/15">🏆</span>
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider px-2.5 py-1 rounded-full bg-rose-500/10">
              Milestones
            </span>
          </div>
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Badges Unlocked</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-500">{stats.badgesUnlocked || 0} / 6</p>
        </div>
      </motion.div>

      {/* ── 2-COLUMN BALANCED DESKTOP GRID: HABIT RHYTHM & MILESTONES (LEFT) + MOTIVATION & FREEZE PROTECTION (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Weekly Practice Rhythm & Achievements */}
        <div className="space-y-8">
          {/* SECTION 6: WEEKLY HABIT RHYTHM */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5 border border-[var(--border-default)] shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-[#6C63FF] uppercase tracking-wider">Consistency</span>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mt-0.5">
                  7-Day Practice Rhythm
                </h3>
              </div>
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                {weeklyHabit.filter((d) => d.status === "completed").length}/7 Days Active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {weeklyHabit.map((item, idx) => {
                const isCompleted = item.status === "completed";
                const isFrozen = item.status === "frozen";
                const isToday = item.isToday;

                return (
                  <div
                    key={idx}
                    className={`py-3 px-1 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                      isToday
                        ? "border-[#6C63FF] bg-[#6C63FF]/10 ring-2 ring-[#6C63FF]/30 shadow-sm"
                        : "bg-[var(--bg-elevated)] border-[var(--border-default)]"
                    }`}
                  >
                    <span className={`text-[10px] font-extrabold uppercase ${isToday ? "text-[#6C63FF]" : "text-[var(--text-secondary)]"}`}>
                      {item.day}
                    </span>

                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${
                        isCompleted
                          ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-500/30"
                          : isFrozen
                          ? "bg-gradient-to-tr from-cyan-400 to-blue-500 text-white shadow-cyan-500/30"
                          : "bg-[var(--bg-base)] text-[var(--text-muted)]"
                      }`}
                    >
                      {isCompleted ? "🔥" : isFrozen ? "❄️" : "·"}
                    </div>

                    <span className={`text-[10px] font-bold ${isCompleted ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                      {item.studyMinutes > 0 ? `${item.studyMinutes}m` : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 11: MILESTONES & ACHIEVEMENTS CARD */}
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
                    <p className={`text-[11px] font-bold mt-0.5 ${(stats.streak || 0) >= 3 ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                      {(stats.streak || 0) >= 3 ? "Unlocked ✓" : `${Math.min(3, stats.streak || 0)} / 3 days`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${(stats.streak || 0) >= 3 ? "text-amber-500 bg-amber-500/10" : "text-[var(--text-muted)] bg-[var(--bg-base)]"}`}>
                  +50 XP
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-[#6C63FF]/10">📚</span>
                  <div>
                    <p className="font-black text-xs text-[var(--text-primary)]">Vocabulary Virtuoso</p>
                    <p className={`text-[11px] font-bold mt-0.5 ${(stats.wordsLearned || 0) >= 20 ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                      {(stats.wordsLearned || 0) >= 20 ? "Unlocked ✓" : `${Math.min(20, stats.wordsLearned || 0)} / 20 words`}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${(stats.wordsLearned || 0) >= 20 ? "text-amber-500 bg-amber-500/10" : "text-[var(--text-muted)] bg-[var(--bg-base)]"}`}>
                  +50 XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Motivation Quote & Streak Freeze Protection */}
        <div className="space-y-8">
          {/* DAILY MOTIVATION & AUDIO QUOTE CARD */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[#6C63FF]/30 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#6C63FF] uppercase tracking-wider">Daily Inspiration</span>
              <button
                onClick={() => setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length)}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
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
                className="px-4 py-2.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-black text-[var(--text-primary)] hover:bg-[#6C63FF] hover:text-white transition-all flex items-center gap-2 shadow-sm active:scale-95 cursor-pointer"
              >
                <span>🔊 Listen Quote</span>
              </button>

              {!challengeClaimed ? (
                <button
                  onClick={handleAcceptChallenge}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#FF6584] text-white text-xs font-black shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
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

          {/* STREAK & FREEZE PROTECTION CARD */}
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

            {/* Broken Streak Grace Alert */}
            {stats.brokenStreakSnapshot?.streak && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                    ⚠️ Recovery Available
                  </span>
                  <span className="text-[10px] font-black text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    Restores {stats.brokenStreakSnapshot.streak} Days
                  </span>
                </div>
                <button
                  onClick={handleRepairStreak}
                  disabled={Number(stats.xp || 0) < 150}
                  className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                    Number(stats.xp || 0) >= 150
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 cursor-pointer"
                      : "bg-slate-700/20 text-slate-400 cursor-not-allowed border border-slate-700/30"
                  }`}
                >
                  <span>🔥 Restore Streak (150 XP)</span>
                </button>
              </div>
            )}

            <button
              onClick={handleBuyFreeze}
              disabled={Number(stats.xp || 0) < 100}
              className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                Number(stats.xp || 0) >= 100
                  ? "bg-gradient-to-r from-cyan-500 to-[#6C63FF] text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "bg-gray-400/20 text-gray-400 cursor-not-allowed border border-gray-400/20"
              }`}
            >
              <span>❄️ Buy 1 Freeze (100 XP)</span>
            </button>
          </div>
        </div>
      </div>

      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => {
          setStreakModalOpen(false);
          refreshStats();
        }}
        onRefresh={refreshStats}
        userContext={user}
      />

      <LeaderboardModal
        isOpen={leaderboardModalOpen}
        onClose={() => setLeaderboardModalOpen(false)}
        currentUser={user}
      />
    </div>
  );
}

export default Dashboard;
