/**
 * data/dashboardMockData.js
 *
 * Mock data for the SpeakMate AI Dashboard.
 * This structure mirrors what a backend API would return,
 * allowing for simple integration later by swapping imports with API/React Query calls.
 */

export const dashboardMockData = {
  // 1. Continue Learning Card data
  continueLearning: {
    title: "AI Coach - Job Interview Prep",
    type: "AI Chat Coach",
    progress: 65, // in percentage
    lastPlayed: "2 hours ago",
    description: "Learn to answer tough behavioral questions using the STAR method.",
  },

  // 2. XP Points Card data
  xpStats: {
    totalXp: 1250,
    todayXp: 45,
    level: 4,
    levelName: "Intermediate Speaker",
    currentXpInLevel: 150,
    xpToNextLevel: 200, // XP needed to go from level 4 to 5
    percentage: 75, // (150/200) * 100
  },

  // 3. Recent Activity (last 5 activities)
  recentActivities: [
    {
      id: "act-1",
      title: "Job Interview Prep",
      type: "AI Chat Coach",
      score: 88, // out of 100
      timestamp: "2 hours ago",
      xpEarned: 15,
    },
    {
      id: "act-2",
      title: "Pronunciation: Vowel Clarity",
      type: "Speaking Practice",
      score: 92,
      timestamp: "Yesterday",
      xpEarned: 10,
    },
    {
      id: "act-3",
      title: "Tense Agreement Quiz",
      type: "Grammar Review",
      score: 78,
      timestamp: "2 days ago",
      xpEarned: 10,
    },
    {
      id: "act-4",
      title: "Meeting Intro Drill",
      type: "Speaking Practice",
      score: 85,
      timestamp: "3 days ago",
      xpEarned: 10,
    },
    {
      id: "act-5",
      title: "Active Vocabulary Builder",
      type: "Vocabulary",
      score: 100,
      timestamp: "4 days ago",
      xpEarned: 15,
    },
  ],

  // 4. Weekly Goal
  weeklyGoal: {
    weeklyTarget: 200, // XP Target
    currentXp: 150,
    completionPercentage: 75,
    daysRemaining: 2,
  },

  // 5. Learning Calendar (Current Month View & Streak)
  calendarData: {
    monthName: "July",
    year: 2026,
    streak: 7,
    // Days in current month that the user practiced
    completedDays: [1, 2, 3, 5, 6, 7, 8],
    totalDaysInMonth: 31,
    startWeekday: 3, // Wednesday (0 = Sun, 1 = Mon, ..., 3 = Wed)
  },

  // 6. Achievement Badges
  badges: [
    {
      id: "badge-1",
      title: "7-Day Streak",
      description: "Practiced 7 days in a row.",
      icon: "🔥",
      earned: true,
      earnedDate: "2026-07-04",
    },
    {
      id: "badge-2",
      title: "Fluency Starter",
      description: "Completed first AI Coach session.",
      icon: "🗣️",
      earned: true,
      earnedDate: "2026-06-20",
    },
    {
      id: "badge-3",
      title: "Grammar Guru",
      description: "Achieved 100% on a grammar review.",
      icon: "✍️",
      earned: true,
      earnedDate: "2026-06-25",
    },
    {
      id: "badge-4",
      title: "Vocabulary Master",
      description: "Learn 500 total vocabulary words.",
      icon: "📚",
      earned: false,
      progress: 342,
      target: 500,
    },
    {
      id: "badge-5",
      title: "Speech Marathoner",
      description: "Practice speaking for 5 hours.",
      icon: "⏱️",
      earned: false,
      progress: 4.5,
      target: 5,
    },
    {
      id: "badge-6",
      title: "Fluent Speaker",
      description: "Achieve Level 5 proficiency.",
      icon: "👑",
      earned: false,
      progress: 4,
      target: 5,
    },
  ],

  // 7. Statistics Cards
  statistics: [
    {
      id: "stat-speaking",
      label: "Speaking Sessions",
      value: "12",
      change: "+3 this week",
      trend: "up",
      color: "from-indigo-500 to-blue-600",
    },
    {
      id: "stat-grammar",
      label: "Grammar Accuracy",
      value: "88%",
      change: "+2.4% vs last week",
      trend: "up",
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "stat-vocab",
      label: "Vocabulary Learned",
      value: "142 words",
      change: "+18 words today",
      trend: "up",
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "stat-time",
      label: "Total Practice Time",
      value: "4.5 hrs",
      change: "+45 mins today",
      trend: "up",
      color: "from-rose-500 to-pink-600",
    },
  ],

  // 8. Daily Motivation Card
  motivation: {
    quote: "Learning another language is not only learning different words for the same things, but learning another way to think about things.",
    author: "Flora Lewis",
    challenge: "Complete a 5-minute Speaking Drill on Tense Agreement today.",
    reminder: "Practice before 10:00 PM to keep your 7-day streak active!",
  },

  // 9. Charts
  chartData: {
    monthlyActivity: [
      { name: "Jan", speaking: 4, grammar: 2, vocab: 3, listening: 2 },
      { name: "Feb", speaking: 5, grammar: 3, vocab: 4, listening: 3 },
      { name: "Mar", speaking: 6, grammar: 4, vocab: 5, listening: 4 },
      { name: "Apr", speaking: 5, grammar: 5, vocab: 6, listening: 5 },
      { name: "May", speaking: 8, grammar: 6, vocab: 7, listening: 6 },
      { name: "Jun", speaking: 9, grammar: 7, vocab: 8, listening: 7 },
      { name: "Jul", speaking: 10, grammar: 8, vocab: 9, listening: 8 },
    ],
    skillDistribution: [
      { name: "Speaking", value: 35, fill: "#4f46e5" },
      { name: "Grammar", value: 20, fill: "#059669" },
      { name: "Vocabulary", value: 25, fill: "#d97706" },
      { name: "Listening", value: 20, fill: "#0891b2" },
    ],
  },

  // 10. Recent Transactions
  transactions: [
    {
      id: "txn-1",
      title: "Premium Subscription",
      description: "Monthly Pro Plan renewal",
      amount: "-$12.99",
      date: "Today",
      status: "completed",
      icon: "✨",
    },
    {
      id: "txn-2",
      title: "XP Bonus",
      description: "7-day streak reward",
      amount: "+50 XP",
      date: "Yesterday",
      status: "completed",
      icon: "🎁",
    },
    {
      id: "txn-3",
      title: "Grammar Pack",
      description: "Advanced tenses unlock",
      amount: "-$4.99",
      date: "3 days ago",
      status: "completed",
      icon: "📚",
    },
    {
      id: "txn-4",
      title: "Speaking Session",
      description: "Pronunciation feedback",
      amount: "+15 XP",
      date: "4 days ago",
      status: "completed",
      icon: "🎙️",
    },
  ],

  // 11. Upcoming Tasks / Events
  upcomingTasks: [
    {
      id: "task-1",
      title: "Speaking Drill",
      time: "10:00 AM",
      duration: "15 min",
      type: "Speaking Practice",
      color: "bg-sky-500",
    },
    {
      id: "task-2",
      title: "Grammar Quiz",
      time: "02:00 PM",
      duration: "20 min",
      type: "Grammar Review",
      color: "bg-emerald-500",
    },
    {
      id: "task-3",
      title: "AI Chat Session",
      time: "05:30 PM",
      duration: "30 min",
      type: "AI Chat Coach",
      color: "bg-indigo-500",
    },
  ],

  // 12. Performance Summary
  performanceSummary: {
    overallScore: 87,
    speakingScore: 92,
    grammarScore: 85,
    vocabularyScore: 78,
    listeningScore: 88,
    trend: "+4.2%",
  },

  // 13. Latest Notifications
  notifications: [
    {
      id: "notif-1",
      title: "New module available",
      message: "Business English module is now live.",
      time: "2 hours ago",
      read: false,
      type: "info",
    },
    {
      id: "notif-2",
      title: "Streak milestone",
      message: "You've maintained your streak for 7 days!",
      time: "5 hours ago",
      read: false,
      type: "success",
    },
    {
      id: "notif-3",
      title: "Practice reminder",
      message: "15 minutes left to keep your streak alive.",
      time: "8 hours ago",
      read: true,
      type: "warning",
    },
    {
      id: "notif-4",
      title: "Weekly report ready",
      message: "Your weekly progress report is available.",
      time: "1 day ago",
      read: true,
      type: "info",
    },
  ],
};
