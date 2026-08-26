// src/utils/progressTracker.js

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

const getLocalDateStr = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysDifference = (dateStr1, dateStr2) => {
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

const STREAK_MILESTONES = [
  { days: 3, xp: 50, title: "3-Day Ember 🔥", desc: "First 3 consecutive practice days." },
  { days: 7, xp: 100, title: "7-Day Flame ⚡", desc: "One full week of continuous English mastery." },
  { days: 14, xp: 200, title: "14-Day Blaze 🌟", desc: "Two straight weeks of fluency commitment." },
  { days: 30, xp: 500, title: "30-Day Phoenix 🏆", desc: "One month habit mastery with fluent reflexes." },
  { days: 50, xp: 800, title: "50-Day Titan 💎", desc: "50 days of dedication and conversational ease." },
  { days: 100, xp: 1500, title: "100-Day Centurion 👑", desc: "Legendary 100-day mastery status." },
];

export const getLiveProgressStats = (userContext = null) => {
  const today = getLocalDateStr();
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
      xp: userContext?.xp || 150,
      streak: userContext?.streak || 1,
      longestStreak: 1,
      streakFreezes: 1, // New users start with 1 Free Freeze ❄️
      lastActiveDate: today,
      lastGoalMetDate: today,
      badgesUnlocked: 0,
      todayMins: 5,
      claimedMilestones: [],
      streakHistory: {}, // { [dateStr]: { mins: number, status: 'completed' | 'frozen' | 'missed' } }
      brokenStreakSnapshot: null, // Holds last broken streak for 48h recovery
      lastFreeFreezeClaimedDate: null,
    };
    stored.streakHistory[today] = { mins: 5, status: "completed" };
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}
  }

  // Ensure default fallback attributes
  if (stored.streakFreezes === undefined) stored.streakFreezes = 1;
  if (!stored.claimedMilestones) stored.claimedMilestones = [];
  if (!stored.streakHistory) stored.streakHistory = {};
  if (stored.streak === undefined || stored.streak === null) stored.streak = 1;
  if (!stored.longestStreak) stored.longestStreak = Math.max(1, stored.streak || 1);

  // Accurate Streak Rollover & Missed Day Management
  if (stored.lastActiveDate !== today) {
    const diffDays = getDaysDifference(stored.lastActiveDate, today);

    if (diffDays === 1) {
      // Checked in next day. Did user meet goal yesterday?
      const wasGoalMet = stored.lastGoalMetDate === stored.lastActiveDate;
      if (!wasGoalMet && stored.streak > 0) {
        if (stored.streakFreezes > 0) {
          stored.streakFreezes -= 1;
          stored.streakHistory[stored.lastActiveDate] = { mins: stored.todayMins || 0, status: "frozen" };
        } else {
          stored.brokenStreakSnapshot = { streak: stored.streak, brokenDate: stored.lastActiveDate };
          stored.streak = 0;
          stored.streakHistory[stored.lastActiveDate] = { mins: stored.todayMins || 0, status: "missed" };
        }
      }
    } else if (diffDays === 2) {
      // Missed exactly 1 full day between last active and today
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateStr(yesterday);

      if (stored.streakFreezes > 0) {
        stored.streakFreezes -= 1;
        stored.streakHistory[yesterdayStr] = { mins: 0, status: "frozen" };
      } else {
        stored.brokenStreakSnapshot = { streak: stored.streak, brokenDate: yesterdayStr };
        stored.streak = 0;
        stored.streakHistory[yesterdayStr] = { mins: 0, status: "missed" };
      }
    } else if (diffDays > 2) {
      // Missed 2 or more consecutive days
      if (stored.streak > 0) {
        stored.brokenStreakSnapshot = { streak: stored.streak, brokenDate: stored.lastActiveDate };
        stored.streak = 0;
      }
    }

    stored.todayMins = 0;
    stored.lastActiveDate = today;
    try {
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch (e) {}
  }

  const accuracy = stored.accuracyCount > 0
    ? Math.round(stored.accuracySum / stored.accuracyCount)
    : 92;

  const totalHours = (stored.speakingMins / 60).toFixed(1);

  // Calculate badges unlocked dynamically based on usage
  let badges = 0;
  if (stored.speakingSessions > 0) badges += 1;
  if (stored.wordsLearned >= 5) badges += 1;
  if (stored.grammarChecks >= 3) badges += 1;
  if (stored.lessonsCompleted >= 1) badges += 1;
  if (stored.streak >= 3) badges += 1;
  if (stored.speakingMins >= 30) badges += 1;
  stored.badgesUnlocked = badges;

  // Generate 7-day visual calendar data
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyData = [];
  const curr = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(curr.getDate() - i);
    const dStr = getLocalDateStr(d);
    const dayName = daysOfWeek[d.getDay()];
    const record = stored.streakHistory[dStr];
    const isToday = dStr === today;
    const mins = isToday ? (stored.todayMins || 0) : (record?.mins || (i === 1 ? 25 : i === 2 ? 30 : i === 3 ? 15 : 20));
    const status = record?.status || (mins >= 15 ? "completed" : isToday ? "active" : "completed");

    weeklyData.push({
      dateStr: dStr,
      day: dayName,
      studyMinutes: mins,
      status,
      isToday,
      isGoalMet: mins >= 15,
    });
  }

  return {
    ...stored,
    accuracy,
    totalHours: parseFloat(totalHours),
    weeklyData,
    milestones: STREAK_MILESTONES,
  };
};

export const saveProgressStats = (stats, userContext = null) => {
  const key = getStorageKey(userContext);
  try {
    localStorage.setItem(key, JSON.stringify(stats));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("speakmate_progress_updated", { detail: stats }));
    }
  } catch (e) {}
};

// Check and increment streak when daily target is satisfied
const checkAndUpdateDailyGoal = (stats, userContext = null) => {
  const today = getLocalDateStr();
  const rawGoal = localStorage.getItem("speakmate_daily_goal") || "15";
  const dailyGoalMins = parseInt(userContext?.dailyGoalMins || rawGoal, 10) || 15;

  stats.todayMins = stats.todayMins || 0;
  if (!stats.streakHistory) stats.streakHistory = {};
  stats.streakHistory[today] = { mins: stats.todayMins, status: stats.todayMins >= dailyGoalMins ? "completed" : "active" };

  if (stats.todayMins >= dailyGoalMins && stats.lastGoalMetDate !== today) {
    stats.lastGoalMetDate = today;
    stats.streak = (stats.streak || 0) + 1;
    stats.longestStreak = Math.max(stats.longestStreak || 1, stats.streak);
  }
};

// 1. Record Speaking Practice (+25 to +40 XP)
export const recordSpeakingSession = (durationMins = 5, accuracyScore = 90, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.speakingMins += durationMins;
  stats.todayMins = (stats.todayMins || 0) + durationMins;
  stats.speakingSessions += 1;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  
  const baseReward = 20;
  const timeBonus = Math.min(10, Math.max(0, durationMins * 3));
  const scoreBonus = accuracyScore >= 90 ? 10 : (accuracyScore >= 80 ? 5 : 0);
  stats.xp += Math.min(40, Math.max(25, baseReward + timeBonus + scoreBonus));
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 2. Record Grammar Practice (+8 XP)
export const recordGrammarCheck = (accuracyScore = 95, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.grammarChecks += 1;
  stats.todayMins = (stats.todayMins || 0) + 1;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += 8;
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 3. Record Vocabulary Mastered (+10 XP)
export const recordVocabularyMastered = (count = 1, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.wordsLearned += count;
  stats.todayMins = (stats.todayMins || 0) + count;
  stats.xp += count * 10;
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 4. Record Word Added (+5 XP)
export const recordWordAdded = (count = 1, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.wordsLearned += count;
  stats.todayMins = (stats.todayMins || 0) + 1;
  stats.xp += count * 5;

  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 5. Record AI Chat Message (+5 XP)
export const recordChatMessage = (count = 1, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.todayMins = (stats.todayMins || 0) + 1;
  stats.xp += count * 5;

  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 6. Record Lesson Completion (+35 XP)
export const recordLessonCompleted = (accuracyScore = 90, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  stats.lessonsCompleted += 1;
  stats.todayMins = (stats.todayMins || 0) + 5;
  stats.accuracySum += accuracyScore;
  stats.accuracyCount += 1;
  stats.xp += 35;
  
  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 7. Record Quiz Completed (+35 to +50 XP)
export const recordQuizCompleted = (quizType = "grammar", score = 8, total = 8, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  const baseXP = score * 5;
  const perfectBonus = score === total && total > 0 ? 10 : 0;
  const totalAwarded = baseXP + perfectBonus;

  if (quizType === "grammar") {
    stats.grammarChecks += score;
  } else {
    stats.wordsLearned += score;
  }
  stats.todayMins = (stats.todayMins || 0) + 3;
  stats.xp += totalAwarded;

  checkAndUpdateDailyGoal(stats, userContext);
  saveProgressStats(stats, userContext);
  return stats;
};

// 8. Buy Streak Freeze using XP (100 XP per Freeze)
export const buyStreakFreeze = (costXP = 100, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  if (stats.xp >= costXP) {
    stats.xp -= costXP;
    stats.streakFreezes = (stats.streakFreezes || 0) + 1;
    saveProgressStats(stats, userContext);
    return { success: true, stats, message: "Streak Freeze ❄️ added to your reserve!" };
  }
  return { success: false, stats, message: `Insufficient XP. You need ${costXP} XP to buy a Streak Freeze.` };
};

// 9. Repair Broken Streak with XP (150 XP to recover lost streak within 48 hours)
export const repairBrokenStreak = (costXP = 150, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  if (!stats.brokenStreakSnapshot || !stats.brokenStreakSnapshot.streak) {
    return { success: false, stats, message: "No broken streak eligible for recovery." };
  }

  if (stats.xp < costXP) {
    return { success: false, stats, message: `Insufficient XP. You need ${costXP} XP to repair your streak.` };
  }

  stats.xp -= costXP;
  stats.streak = stats.brokenStreakSnapshot.streak + 1;
  stats.longestStreak = Math.max(stats.longestStreak || 1, stats.streak);
  stats.brokenStreakSnapshot = null;
  saveProgressStats(stats, userContext);
  return { success: true, stats, message: `Streak Repaired! Restored to ${stats.streak}-Day Streak 🔥` };
};

// 10. Claim Milestone XP Reward
export const claimStreakMilestoneReward = (days = 3, userContext = null) => {
  const stats = getLiveProgressStats(userContext);
  const milestone = STREAK_MILESTONES.find((m) => m.days === days);
  if (!milestone) return { success: false, message: "Milestone not found." };

  if (stats.claimedMilestones && stats.claimedMilestones.includes(days)) {
    return { success: false, message: "Reward already claimed." };
  }

  if (stats.streak < days && (stats.longestStreak || 0) < days) {
    return { success: false, message: `Reach a ${days}-day streak to claim this milestone!` };
  }

  stats.xp += milestone.xp;
  if (!stats.claimedMilestones) stats.claimedMilestones = [];
  stats.claimedMilestones.push(days);
  saveProgressStats(stats, userContext);
  return { success: true, stats, message: `🎉 Claimed +${milestone.xp} Bonus XP for ${milestone.title}!` };
};
