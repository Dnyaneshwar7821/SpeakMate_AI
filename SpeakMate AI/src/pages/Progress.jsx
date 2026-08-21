import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { getLiveProgressStats } from "../utils/progressTracker";

const SKILLS = [
  { name: "Speaking Fluency", score: 88, color: "bg-[#6C63FF]" },
  { name: "Grammar Accuracy", score: 92, color: "bg-emerald-500" },
  { name: "Vocabulary Range", score: 85, color: "bg-amber-500" },
  { name: "Pronunciation Clarity", score: 94, color: "bg-[#FF6584]" },
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
    window.addEventListener("speakmate_progress_updated", updateStats);
    return () => {
      window.removeEventListener("focus", updateStats);
      window.removeEventListener("speakmate_progress_updated", updateStats);
    };
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
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#312E81] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-amber-300">
            📊 Learning Intelligence
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Progress & Analytics</h1>
          <p className="text-xs sm:text-sm font-medium text-indigo-100 leading-relaxed">
            Track your level rank, XP milestones, daily speaking statistics, and weekly study rhythm.
          </p>
        </div>
        <button
          onClick={updateStats}
          className="px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-black border border-white/25 backdrop-blur-md transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
        >
          <span>🔄 Refresh Metrics</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 rounded-3xl glass-card text-center space-y-3 shadow-xl">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#6C63FF] border-t-transparent" />
          <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
            Loading Live Progress Analytics...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-black text-center space-y-3">
          <p>⚠️ {error}</p>
          <button
            onClick={updateStats}
            className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-black"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <>
          {/* LEVEL TRACKER & XP CARD */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] via-[#7C74FF] to-[#FF6584] text-white font-black text-2xl grid place-items-center shadow-lg shadow-[#6C63FF]/30 shrink-0">
                  {level}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">Level {level} Speaker</h2>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    Earn <strong className="text-[#6C63FF]">{Math.max(0, nextLevelXp - xp)} XP</strong> more to unlock Level {level + 1}!
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-black text-[#6C63FF]">{xp} XP</span>
                <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">Total XP Earned</p>
              </div>
            </div>

            {/* Level XP Progress Bar */}
            <div className="space-y-2">
              <div className="h-3.5 w-full rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#6C63FF] via-[#8B5CF6] to-[#FF6584] rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${levelPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-black text-[var(--text-secondary)]">
                <span>Level {level} ({currentLevelBaseXp} XP)</span>
                <span className="text-[#6C63FF]">{levelPercentage.toFixed(0)}% Complete</span>
                <span>Level {level + 1} ({nextLevelXp} XP)</span>
              </div>
            </div>
          </div>

          {/* 4 LEARNING STATS CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-card glass-card-hover p-6 rounded-3xl border border-[var(--border-default)] shadow-lg space-y-2">
              <span className="text-2xl p-2.5 rounded-2xl bg-[#6C63FF]/15">🗣️</span>
              <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Total Hours</p>
              <p className="text-2xl sm:text-3xl font-black text-[#6C63FF]">{totalHours} hrs</p>
            </div>

            <div className="glass-card glass-card-hover p-6 rounded-3xl border border-[var(--border-default)] shadow-lg space-y-2">
              <span className="text-2xl p-2.5 rounded-2xl bg-emerald-500/15">🎯</span>
              <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Fluency Rate</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-500">{accuracy}%</p>
            </div>

            <div className="glass-card glass-card-hover p-6 rounded-3xl border border-[var(--border-default)] shadow-lg space-y-2">
              <span className="text-2xl p-2.5 rounded-2xl bg-amber-500/15">📚</span>
              <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Words Mastered</p>
              <p className="text-2xl sm:text-3xl font-black text-amber-500">{wordsLearned}</p>
            </div>

            <div className="glass-card glass-card-hover p-6 rounded-3xl border border-[var(--border-default)] shadow-lg space-y-2">
              <span className="text-2xl p-2.5 rounded-2xl bg-rose-500/15">🔥</span>
              <p className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pt-1">Active Streak</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-500">{streak} Days</p>
            </div>
          </div>

          {/* WEEKLY ACTIVITY GRAPH & SKILLS BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Weekly Activity Bar Chart */}
            <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">Weekly Study Rhythm</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">Daily practice minutes over the last 7 days</p>
                </div>
                <span className="text-xs font-black text-[#6C63FF] bg-[#6C63FF]/15 px-3 py-1 rounded-full">
                  7-Day Trend
                </span>
              </div>

              {/* Bar Chart Bars */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-6">
                {weeklyData.map((d, i) => {
                  const heightPct = Math.max(12, ((d.studyMinutes || 0) / maxMins) * 100);
                  const isToday = i === weeklyData.length - 1;
                  return (
                    <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-black text-[var(--text-secondary)] group-hover:text-[#6C63FF] opacity-0 group-hover:opacity-100 transition-opacity">
                        {d.studyMinutes}m
                      </span>
                      <div className="w-full bg-[var(--bg-elevated)] h-full rounded-2xl flex items-end p-1 border border-[var(--border-default)]">
                        <div
                          className={`w-full rounded-xl transition-all duration-500 shadow-sm ${
                            isToday
                              ? "bg-gradient-to-t from-[#6C63FF] to-[#FF6584]"
                              : "bg-gradient-to-t from-[#6C63FF]/50 to-[#6C63FF]"
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-black ${isToday ? "text-[#6C63FF]" : "text-[var(--text-secondary)]"}`}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Language Skills Breakdown */}
            <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)]">Skill Competencies</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">CEFR Spoken & Written Performance</p>
              </div>

              <div className="space-y-4">
                {SKILLS.map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-[var(--text-primary)]">{skill.name}</span>
                      <span className="text-[var(--text-secondary)]">{skill.score}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] overflow-hidden">
                      <div
                        className={`h-full ${skill.color} rounded-full transition-all duration-500`}
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Progress;
