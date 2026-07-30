const getStorageKey = (userContext = null) => {
  let user = userContext;
  if (!user) {
    try {
      const raw = localStorage.getItem("speakmate_user");
      if (raw) user = JSON.parse(raw);
    } catch (e) {}
  }
  const identifier = user?.id || user?.email || user?.username || "guest";
  return `speakmate_user_progress_stats_${identifier}`;
};

const getTodayDateStr = () => new Date().toISOString().split("T")[0];

export const getLiveProgressStats = (userContext = null) => {
  const today = getTodayDateStr();
  const storageKey = getStorageKey(userContext);
  let stored = null;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) stored = JSON.parse(raw);
  } catch (e) {}

  if (!stored) {
    stored = {
      speakingMins: 0,
      speakingSessions: 0,
      wordsLearned: 0,
      grammarChecks: 0,
      lessonsCompleted: 0,
      accuracySum: 0,
      accuracyCount: 0,
      xp: userContext?.xp || 0,
      streak: userContext?.streak || 0,
      streakFreezes: 1, // New users start with 1 Free Freeze ❄️
      lastActiveDate: today,
      badgesUnlocked: 0,
      todayMins: 0,
      lastGoalMetDate: null,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}
  }

  // Ensure streakFreezes defaults to 1 for existing records
  if (stored.streakFreezes === undefined) {
    stored.streakFreezes = 1;
  }

  // Handle consecutive days and missed days with Streak Freeze protection
  if (stored.lastActiveDate !== today) {
    const lastDate = new Date(stored.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Check if previous day's goal was met
      if (stored.lastGoalMetDate !== stored.lastActiveDate && stored.streak > 0) {
        if (stored.streakFreezes > 0) {
          stored.streakFreezes -= 1; // Auto-consume Freeze to protect streak
        } else {
          stored.streak = 0; // Reset streak if no freeze available
        }
      }
    } else if (diffDays === 2) {
      // Missed 1 full day
      if (stored.streakFreezes > 0) {
        stored.streakFreezes -= 1; // Auto-consume Freeze for the missed day
      } else {
        stored.streak = 0;
      }
    } else if (diffDays > 2) {
      // Missed 2+ consecutive days
      stored.streak = 0;
    }

    stored.todayMins = 0; // Reset daily accumulator for the new day
    stored.lastActiveDate = today;
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}
  }

  const accuracy = stored.accuracyCount > 0
    ? Math.round(stored.accuracySum / stored.accuracyCount)
    : 0;

  const totalHours = (stored.speakingMins / 60).toFixed(1);

  // Calculate badges unlocked dynamically based on real usage
  let badges = 0;
  if (stored.speakingSessions > 0) badges += 1;
  if (stored.wordsLearned >= 5) badges += 1;
  if (stored.grammarChecks >= 3) badges += 1;
  if (stored.lessonsCompleted >= 1) badges += 1;
  if (stored.streak >= 3) badges += 1;
  if (stored.speakingMins >= 30) badges += 1;

  stored.badgesUnlocked = badges;

  return {
    ...stored,
    accuracy,
    totalHours: parseFloat(totalHours),
  };
};

export const saveProgressStats = (stats, userContext = null) => {
  const key = getStorageKey(userContext);
  try {
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) {}
};

// Check & update goal completion for today
const checkAndUpdateDailyGoal = (stats, userContext = null) => {
  const today = getTodayDateStr();
  const rawGoal = localStorage.getItem("speakmate_daily_goal") || "15";
  const dailyGoalMins = parseInt(userContext?.dailyGoalMins || rawGoal, 10) || 15;

  stats.todayMins = (stats.todayMins || 0);
  
  if (stats.todayMins >= dailyGoalMins && stats.lastGoalMetDate !== today) {
    stats.lastGoalMetDate = today;
    stats.streak = (stats.streak || 0) + 1; // Increment streak only when daily goal is reached!
  }
};

// 1. Track Speaking Practice or Chat Session
export const recordSpeakingSession = (durationMins = 5, accuracyScore = 90, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.speakingMins += durationMins;
  stats.todayMins = (stats.todayMins || 0) + durationMins;
  stats.speakingSessions += 1;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += durationMins * 5 + 15;
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 2. Track Live Grammar Check
export const recordGrammarCheck = (accuracyScore = 95, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.grammarChecks += 1;
  stats.todayMins = (stats.todayMins || 0) + 2;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += 10;
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 3. Track Vocabulary Words Mastered
export const recordVocabularyMastered = (count = 1, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.wordsLearned += count;
  stats.todayMins = (stats.todayMins || 0) + count;
  stats.xp += count * 5;
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 4. Track CEFR Lesson Completion
export const recordLessonCompleted = (accuracyScore = 90, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.lessonsCompleted += 1;
  stats.todayMins = (stats.todayMins || 0) + 5;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += 25;
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 5. Buy a Streak Freeze using XP (100 XP per Freeze)
export const buyStreakFreeze = (costXP = 100, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  if (stats.xp >= costXP) {
    stats.xp -= costXP;
    stats.streakFreezes = (stats.streakFreezes || 0) + 1;
    saveProgressStats(stats, userContext);
    return { success: true, stats, message: "Streak Freeze ❄️ purchased successfully!" };
  }
  return { success: false, stats, message: "Insufficient XP. Earn more XP to buy a Freeze!" };
};
