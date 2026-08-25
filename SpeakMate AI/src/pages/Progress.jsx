import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { getLiveProgressStats } from "../utils/progressTracker";

const CEFR_LEVELS = [
  { code: "A1", name: "Beginner", minXp: 0, maxXp: 500, color: "from-blue-500 to-indigo-600", desc: "Can understand basic phrases & introduce oneself." },
  { code: "A2", name: "Elementary", minXp: 500, maxXp: 1500, color: "from-cyan-500 to-teal-600", desc: "Can communicate in routine conversational tasks." },
  { code: "B1", name: "Intermediate", minXp: 1500, maxXp: 3000, color: "from-emerald-500 to-green-600", desc: "Can handle most everyday conversations with ease." },
  { code: "B2", name: "Upper Intermediate", minXp: 3000, maxXp: 5000, color: "from-purple-500 to-indigo-600", desc: "Can converse fluently with native speakers." },
  { code: "C1", name: "Advanced", minXp: 5000, maxXp: 8000, color: "from-pink-500 to-rose-600", desc: "Can express ideas fluently and spontaneously." },
  { code: "C2", name: "Mastery / Native", minXp: 8000, maxXp: 15000, color: "from-amber-400 to-yellow-600", desc: "Complete effortless fluency in complex discourse." },
];

export function Progress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("7d");
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
  const grammarExercises = liveStats.grammarExercises || liveStats.grammarChecks || 0;
  const completedLessons = liveStats.completedLessons || liveStats.lessonsCompleted || 0;

  // Level & XP calculations (500 XP per level)
  const level = Math.floor(xp / 500) + 1;
  const currentLevelBaseXp = (level - 1) * 500;
  const nextLevelXp = level * 500;
  const levelXpProgress = Math.max(0, xp - currentLevelBaseXp);
  const levelPercentage = Math.min(100, Math.max(0, (levelXpProgress / 500) * 100));

  // CEFR calculations
  const currentCefr = CEFR_LEVELS.find((c) => xp >= c.minXp && xp < c.maxXp) || CEFR_LEVELS[CEFR_LEVELS.length - 1];
  const nextCefrIndex = CEFR_LEVELS.findIndex((c) => c.code === currentCefr.code) + 1;
  const nextCefr = nextCefrIndex < CEFR_LEVELS.length ? CEFR_LEVELS[nextCefrIndex] : null;
  const cefrRange = currentCefr.maxXp - currentCefr.minXp;
  const cefrProgress = Math.min(100, Math.max(0, ((xp - currentCefr.minXp) / cefrRange) * 100));

  // 6-Dimensional Skill Breakdown calculations
  const speakingScore = Math.min(98, Math.max(65, 70 + speakingSessions * 3));
  const grammarScore = Math.min(96, Math.max(60, 68 + grammarExercises * 4));
  const vocabScore = Math.min(95, Math.max(55, 62 + wordsLearned * 2));
  const pronunciationScore = Math.min(98, Math.max(72, 75 + speakingSessions * 2.5));
  const listeningScore = Math.min(97, Math.max(70, 74 + completedLessons * 4));
  const staminaScore = Math.min(99, Math.max(50, 60 + parseFloat(totalHours) * 5));

  const skillMatrix = [
    { name: "Speaking Fluency", score: Math.round(speakingScore), icon: "🎙️", color: "from-indigo-500 to-indigo-600", status: speakingScore > 85 ? "Strong" : "Developing" },
    { name: "Grammar Accuracy", score: Math.round(grammarScore), icon: "📝", color: "from-emerald-500 to-teal-600", status: grammarScore > 85 ? "Advanced" : "Improving" },
    { name: "Active Vocabulary", score: Math.round(vocabScore), icon: "💡", color: "from-amber-500 to-orange-500", status: vocabScore > 80 ? "Rich" : "Expanding" },
    { name: "Pronunciation Clarity", score: Math.round(pronunciationScore), icon: "🔊", color: "from-pink-500 to-rose-600", status: pronunciationScore > 85 ? "Clear" : "Refining" },
    { name: "Audio Comprehension", score: Math.round(listeningScore), icon: "👂", color: "from-cyan-500 to-blue-600", status: listeningScore > 85 ? "Sharp" : "Practicing" },
    { name: "Conversation Stamina", score: Math.round(staminaScore), icon: "⚡", color: "from-purple-500 to-violet-600", status: staminaScore > 80 ? "High" : "Building" },
  ];

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
  const totalWeeklyMinutes = weeklyData.reduce((acc, curr) => acc + (curr.studyMinutes || 0), 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#312E81] to-[#4338CA] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-amber-300">
            📊 Learning Intelligence & CEFR Matrix
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Progress & Skill Analytics</h1>
          <p className="text-xs sm:text-sm font-medium text-indigo-100 leading-relaxed">
            Monitor your CEFR proficiency level, 6-skill breakdown, daily practice rhythm, and streak protection.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ACHIEVEMENTS}
            className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-lg flex items-center gap-2"
          >
            <span>🏆 Medal Room</span>
          </Link>
          <button
            onClick={updateStats}
            className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-black border border-white/25 backdrop-blur-md transition-all shrink-0 flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
          >
            <span>🔄 Sync Stats</span>
          </button>
        </div>
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
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:bg-rose-700 transition-all cursor-pointer"
          >
            Retry Sync
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Top CEFR Proficiency Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl relative overflow-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${currentCefr.color} text-white shadow-lg shrink-0 font-black text-2xl`}>
                  {currentCefr.code}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                      {currentCefr.name} CEFR Speaker
                    </h2>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase">
                      Level {level}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-medium max-w-md">
                    {currentCefr.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-center min-w-[100px]">
                  <p className="text-xl font-black text-amber-500">{xp}</p>
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Total XP</p>
                </div>
                <div className="p-4 rounded-2xl bg-[var(--bg-base)] border border-[var(--border-subtle)] text-center min-w-[100px]">
                  <p className="text-xl font-black text-emerald-500">{accuracy}%</p>
                  <p className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Accuracy</p>
                </div>
              </div>
            </div>

            {nextCefr && (
              <div className="space-y-2 pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-[var(--text-secondary)]">
                    Target Milestone: <strong className="text-[var(--text-primary)]">{nextCefr.code} ({nextCefr.name})</strong>
                  </span>
                  <span className="text-[#6C63FF]">{cefrProgress.toFixed(0)}%</span>
                </div>
                <div className="h-3 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                    style={{ width: `${cefrProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-semibold text-right">
                  Earn {Math.max(0, currentCefr.maxXp - xp)} more XP to reach {nextCefr.code}
                </p>
              </div>
            )}
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
              <span className="text-2xl">🔥</span>
              <p className="text-xl font-black text-[#F97316]">{streak} Days</p>
              <p className="text-[11px] font-bold text-[var(--text-secondary)]">Current Streak</p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)]">Best: {longestStreak} days</p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
              <span className="text-2xl">❄️</span>
              <p className="text-xl font-black text-cyan-500">Shield Active</p>
              <p className="text-[11px] font-bold text-[var(--text-secondary)]">Streak Freeze</p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)]">Auto-protects missed days</p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
              <span className="text-2xl">⏱️</span>
              <p className="text-xl font-black text-indigo-500">{totalHours} Hours</p>
              <p className="text-[11px] font-bold text-[var(--text-secondary)]">Total Speaking Time</p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)]">{speakingSessions} sessions</p>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-1">
              <span className="text-2xl">📚</span>
              <p className="text-xl font-black text-emerald-500">{wordsLearned} Words</p>
              <p className="text-[11px] font-bold text-[var(--text-secondary)]">Word Bank Lexicon</p>
              <p className="text-[10px] font-semibold text-[var(--text-muted)]">{grammarExercises} grammar checks</p>
            </div>
          </div>

          {/* 6-Dimensional Skill Breakdown Matrix */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  Core Skill Competencies
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Dynamic analysis of your speaking, grammar, vocabulary, and stamina performance.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {skillMatrix.map((skill, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-[var(--bg-base)]/50 border border-[var(--border-subtle)] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{skill.icon}</span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                        {skill.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                        {skill.status}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                        {skill.score}%
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-[var(--border-subtle)] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-500`}
                      style={{ width: `${skill.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Rhythm Visualizer */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)]">
                  Weekly Practice Rhythm ({totalWeeklyMinutes} mins)
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Daily practice minutes compared against your 20m daily target.
                </p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                <button
                  onClick={() => setSelectedTimeframe("7d")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedTimeframe === "7d"
                      ? "bg-[#6C63FF] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setSelectedTimeframe("30d")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedTimeframe === "30d"
                      ? "bg-[#6C63FF] text-white"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  30 Days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 px-2">
              {weeklyData.map((d, i) => {
                const heightPct = Math.max(8, ((d.studyMinutes || 0) / maxMins) * 100);
                const isGoalMet = (d.studyMinutes || 0) >= 20;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-black text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all">
                      {d.studyMinutes || 0}m
                    </div>
                    <div className="w-full max-w-[36px] bg-[var(--bg-base)] rounded-xl h-28 flex items-end p-1 border border-[var(--border-subtle)]">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 ${
                          isGoalMet
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                            : "bg-gradient-to-t from-[#6C63FF] to-indigo-400"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-[var(--text-secondary)]">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Practice Recommendations */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💡</span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                  AI Practice Recommendations
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  Tailored suggestions to boost your CEFR proficiency level faster.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <Link
                to={ROUTES.SPEAKING}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[#6C63FF] transition-all space-y-1 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">🎙️</span>
                  <span className="text-[10px] font-black text-[#6C63FF] group-hover:translate-x-1 transition-all">Start →</span>
                </div>
                <h4 className="text-xs font-black text-[var(--text-primary)]">Scenario Chat</h4>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Complete 1 conversation to boost Speaking Stamina.
                </p>
              </Link>

              <Link
                to={ROUTES.GRAMMAR}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-emerald-500 transition-all space-y-1 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">📚</span>
                  <span className="text-[10px] font-black text-emerald-500 group-hover:translate-x-1 transition-all">Explore →</span>
                </div>
                <h4 className="text-xs font-black text-[var(--text-primary)]">Handbook Rules</h4>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Review 16 grammar topics and sharpen your syntax score.
                </p>
              </Link>

              <Link
                to={ROUTES.VOCABULARY}
                className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-amber-500 transition-all space-y-1 block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">💡</span>
                  <span className="text-[10px] font-black text-amber-500 group-hover:translate-x-1 transition-all">Review →</span>
                </div>
                <h4 className="text-xs font-black text-[var(--text-primary)]">Flashcard Bank</h4>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                  Master 10 new words to advance toward {nextCefr?.code || "C2"}.
                </p>
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Progress;
