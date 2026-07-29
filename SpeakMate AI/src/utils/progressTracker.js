// src/utils/progressTracker.js
const STORAGE_KEY = "speakmate_user_progress_stats";

const getTodayDateStr = () => new Date().toISOString().split("T")[0];

export const getLiveProgressStats = (userContext = null) => {
  const today = getTodayDateStr();
  let stored = null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
      streak: userContext?.streak || 1,
      lastActiveDate: today,
      badgesUnlocked: 0,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {}
  }

  // Update streak if active on a new consecutive day
  if (stored.lastActiveDate !== today) {
    const lastDate = new Date(stored.lastActiveDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      stored.streak = (stored.streak || 0) + 1;
    } else if (diffDays > 1) {
      stored.streak = 1;
    }
    stored.lastActiveDate = today;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
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

export const saveProgressStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {}
};

// 1. Track Speaking Practice or Chat Session
export const recordSpeakingSession = (durationMins = 5, accuracyScore = 90) => {
  const stats = getLiveProgressStats();
  stats.speakingMins += durationMins;
  stats.speakingSessions += 1;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += durationMins * 5 + 15;
  saveProgressStats(stats);
  return stats;
};

// 2. Track Live Grammar Check
export const recordGrammarCheck = (accuracyScore = 95) => {
  const stats = getLiveProgressStats();
  stats.grammarChecks += 1;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += 10;
  saveProgressStats(stats);
  return stats;
};

// 3. Track Vocabulary Words Mastered
export const recordVocabularyMastered = (count = 1) => {
  const stats = getLiveProgressStats();
  stats.wordsLearned += count;
  stats.xp += count * 5;
  saveProgressStats(stats);
  return stats;
};

// 4. Track CEFR Lesson Completion
export const recordLessonCompleted = (accuracyScore = 90) => {
  const stats = getLiveProgressStats();
  stats.lessonsCompleted += 1;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += 25;
  saveProgressStats(stats);
  return stats;
};
