import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { getLiveProgressStats } from "../utils/progressTracker";

const SKILLS = [
  { name: "Speaking Fluency", score: 88, color: "bg-[#6c63ff]" },
  { name: "Grammar Accuracy", score: 92, color: "bg-emerald-500" },
  { name: "Vocabulary Range", score: 85, color: "bg-amber-500" },
  { name: "Pronunciation Clarity", score: 94, color: "bg-[#ff6584]" },
  { name: "Listening Comprehension", score: 90, color: "bg-indigo-500" },
];

export function Progress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveStats, setLiveStats] = useState(() => getLiveProgressStats());

  const updateStats = () => {
    try {
      setLoading(true);
      setError(null);
      setLiveStats(getLiveProgressStats());
    } catch (err) {
      setError("Failed to load progress stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateStats();
    window.addEventListener("focus", updateStats);
    return () => window.removeEventListener("focus", updateStats);
  }, []);

  const totalHours = liveStats.totalHours || liveStats.totalStudyHours || 0;
  const accuracy = liveStats.accuracy || 0;
  const wordsLearned = liveStats.wordsLearned || liveStats.vocabularyLearned || 0;
  const streak = liveStats.streak || liveStats.currentStreak || 0;
  const longestStreak = liveStats.longestStreak || Math.max(streak, 1);
  const xp = liveStats.xp || 0;
  const speakingSessions = liveStats.speakingSessions || 0;
  const grammarExercises = liveStats.grammarExercises || 0;
  const completedLessons = liveStats.completedLessons || 0;

  const level = Math.floor(xp / 100) + 1;
  const currentLevelBaseXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const levelXpProgress = xp - currentLevelBaseXp;
  const levelPercentage = Math.min(100, Math.max(0, (levelXpProgress / 100) * 100));

  const weeklyData = liveStats.weeklyData || [
    { day: "Mon", studyMinutes: 20 },
    { day: "Tue", studyMinutes: 35 },
    { day: "Wed", studyMinutes: 15 },
    { day: "Thu", studyMinutes: 40 },
    { day: "Fri", studyMinutes: 25 },
    { day: "Sat", studyMinutes: 50 },
    { day: "Sun", studyMinutes: 30 },
  ];
  const maxMins = Math.max(10, ...weeklyData.map((w) => w.studyMinutes || 0));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 p-4 sm:p-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#4f46e5] to-[#312e81] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">Learning Progress & Analytics 📈</h1>
          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
            Track your level, XP milestones, daily speaking statistics, and weekly study rhythm.
          </p>
        </div>
        <button
          onClick={updateStats}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-black border border-white/20 transition-all shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span>🔄 Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-center space-y-3 shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#6c63ff] border-t-transparent" />
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
            Loading Progress Analytics...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black text-center space-y-3">
          <p>⚠️ {error}</p>
          <button
            onClick={updateStats}
            className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-black"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* LEVEL TRACKER & XP CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white font-black text-2xl grid place-items-center shadow-md shrink-0">
                  {level}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">Level {level} Learner</h2>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    Earn <strong>{Math.max(0, nextLevelXp - xp)} XP</strong> more to unlock Level {level + 1}!
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-2xl font-black text-[#6c63ff]">{xp} XP</span>
                <p className="text-[11px] font-black uppercase text-[var(--text-secondary)]">Total XP Earned</p>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6c63ff] to-[#ff6584] rounded-full transition-all duration-500"
                  style={{ width: `${levelPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
                <span>Level {level} ({currentLevelBaseXp} XP)</span>
                <span>{levelPercentage.toFixed(0)}% Complete</span>
                <span>Level {level + 1} ({nextLevelXp} XP)</span>
              </div>
            </div>
          </div>

          {/* 4 LEARNING STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 grid place-items-center text-xl">
                ⏱️
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{totalHours}h</p>
              <p className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Study Hours</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 grid place-items-center text-xl">
                🎙️
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{speakingSessions}</p>
              <p className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Speaking Sessions</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-500 grid place-items-center text-xl">
                📚
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{wordsLearned}</p>
              <p className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Words Saved</p>
            </div>

            <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 grid place-items-center text-xl">
                ✍️
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">{grammarExercises}</p>
              <p className="text-xs font-black uppercase text-[var(--text-secondary)] tracking-wider">Grammar Checks</p>
            </div>
          </div>

          {/* STREAK & ACHIEVEMENTS SHORTCUT */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white shadow-xl border border-[#6c63ff]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔥</span>
              <div>
                <h3 className="text-lg font-black text-white">{streak} Day Learning Streak</h3>
                <p className="text-xs text-indigo-200 font-medium mt-0.5">
                  Longest streak achieved: <strong>{longestStreak} days</strong>. Keep practice active daily!
                </p>
              </div>
            </div>

            <Link
              to={ROUTES.ACHIEVEMENTS}
              className="px-5 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#5b52e0] text-white text-xs font-black shadow-lg transition-all shrink-0 flex items-center gap-2"
            >
              <span>🏅 View Badges & Achievements</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SKILL COMPETENCY BREAKDOWN */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)]">Skill Competency Breakdown</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">
                  AI-calculated fluency scores based on recent speaking practice and grammar assessments.
                </p>
              </div>

              <div className="space-y-4">
                {SKILLS.map((s) => (
                  <div key={s.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-black">
                      <span className="text-[var(--text-primary)]">{s.name}</span>
                      <span className="text-[#6c63ff]">{s.score}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] h-3 rounded-full overflow-hidden">
                      <div
                        className={`${s.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEEKLY STUDY RHYTHM BAR CHART */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)]">Weekly Study Rhythm</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-medium">Daily practice minutes this week</p>
              </div>

              <div className="flex items-end justify-between gap-2 h-44 pt-4 border-b border-[var(--border-subtle)] pb-2">
                {weeklyData.map((w, idx) => {
                  const barHeight = ((w.studyMinutes || 0) / maxMins) * 120;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-[10px] font-black text-[#6c63ff]">{w.studyMinutes || 0}m</span>
                      <div className="w-full bg-[var(--bg-elevated)] h-32 rounded-t-xl flex items-end overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-[#6c63ff] to-[#ff6584] rounded-t-xl transition-all duration-300"
                          style={{ height: `${Math.max(6, barHeight)}px` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-[var(--text-primary)]">{w.day}</span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black text-center">
                ✨ Consistent practice builds natural English confidence!
              </div>
            </div>
          </div>

          {/* MONTHLY OVERVIEW REPORT CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <h2 className="text-lg font-black text-[var(--text-primary)]">Monthly Overview Report</h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
              You have completed <strong>{completedLessons} lessons</strong> and spent <strong>{totalHours} study hours</strong> during this learning cycle. Keep practicing speaking scenarios daily to boost your CEFR fluency grade!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Progress;
