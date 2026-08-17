export const speakingPracticeMockData = {
  badge: "Phase 1 • Mock practice",
  title: "Speaking Practice",
  subtitle: "Build fluency with focused speaking drills and realistic conversation prompts.",
  highlights: [
    { label: "Today’s streak", value: "7 days" },
    { label: "Focus", value: "Interview confidence" },
    { label: "Goal", value: "15 min" },
  ],
  drills: [
    {
      title: "Tell me about yourself",
      duration: "5 min",
      difficulty: "Beginner",
      description: "Practice a clear and calm self-introduction with a natural pace.",
    },
    {
      title: "Workplace conversation",
      duration: "8 min",
      difficulty: "Intermediate",
      description: "Answer common workplace questions with stronger structure and confidence.",
    },
    {
      title: "Travel situation",
      duration: "6 min",
      difficulty: "Intermediate",
      description: "Practice asking for help, directions, and basic travel phrases.",
    },
  ],
  tips: ["Slow down and breathe", "Add one detail to each answer", "Record yourself and review"],
};

export const grammarPracticeMockData = {
  badge: "Phase 1 • Mock practice",
  title: "Grammar Practice",
  subtitle: "Review sentence structure, verb tense, and common grammar patterns in short exercises.",
  challenges: [
    {
      title: "Present Perfect",
      level: "A2",
      prompt: "Complete the sentence: I ___ my homework already.",
      answer: "have finished",
    },
    {
      title: "Past Simple",
      level: "A2",
      prompt: "Choose the correct form: She ___ to school yesterday.",
      answer: "went",
    },
    {
      title: "Conditionals",
      level: "B1",
      prompt: "If I ___ more time, I would practice every day.",
      answer: "had",
    },
  ],
  focusAreas: ["Verb tense", "Sentence flow", "Articles and prepositions"],
};

export const vocabularyMockData = {
  badge: "Phase 1 • Mock practice",
  title: "Vocabulary",
  subtitle: "Learn practical words and phrases with clear examples and short review sessions.",
  words: [
    { term: "Confident", meaning: "feeling sure and calm", example: "She sounds confident during the meeting." },
    { term: "Perspective", meaning: "a way of thinking about something", example: "His perspective helped the team." },
    { term: "Reliable", meaning: "dependable and trustworthy", example: "He is a reliable teammate." },
  ],
  goals: ["Use 5 new words in daily speaking", "Review vocabulary every evening", "Track stronger word recall"],
};

export const listeningPracticeMockData = {
  badge: "Phase 1 • Mock practice",
  title: "Listening Practice",
  subtitle: "Improve listening through short clips, transcripts, and focused comprehension drills.",
  lessons: [
    {
      title: "Daily routine",
      duration: "4 min",
      level: "A2",
      excerpt: "A speaker gives a simple overview of their morning routine.",
    },
    {
      title: "Office conversation",
      duration: "6 min",
      level: "B1",
      excerpt: "Two coworkers discuss a project deadline and next steps.",
    },
    {
      title: "Travel announcement",
      duration: "3 min",
      level: "A2",
      excerpt: "A short announcement about boarding and gate changes.",
    },
  ],
  tips: ["Listen once for the main idea", "Listen twice for details", "Repeat key words aloud"],
};

export const progressMockData = {
  badge: "Phase 1 • Mock analytics",
  title: "Progress",
  subtitle: "Review your practice streaks, goals, and recent improvements in one place.",
  metrics: [
    { label: "Weekly XP", value: "1,240", detail: "+120 from last week" },
    { label: "Current streak", value: "7 days", detail: "Keep going today" },
    { label: "Accuracy", value: "88%", detail: "Up 4% this week" },
  ],
  milestones: [
    { title: "Completed 3 speaking drills", date: "Today" },
    { title: "Improved grammar consistency", date: "Yesterday" },
    { title: "Added 12 new vocabulary words", date: "2 days ago" },
  ],
};

export const profileMockData = {
  badge: "Phase 1 • Mock profile",
  title: "Profile",
  subtitle: "View your learning profile, preferences, and practice goals.",
  details: [
    { label: "Name", value: "Dnyaneshwar" },
    { label: "Level", value: "Intermediate" },
    { label: "Preferred focus", value: "Business English" },
    { label: "Daily goal", value: "20 minutes" },
  ],
  preferences: ["Daily reminders", "Short lessons", "Focus on speaking"],
};

export const settingsMockData = {
  badge: "Phase 1 • Mock settings",
  title: "Settings",
  subtitle: "Customize how SpeakMate AI presents practice sessions and reminders.",
  options: [
    { label: "Daily reminder", value: "Enabled" },
    { label: "Theme", value: "Light" },
    { label: "Voice feedback", value: "On" },
    { label: "Session length", value: "15 min" },
  ],
};

export const fluentAIMockData = {
  badge: "AI Fluency Coach",
  title: "FluentAI",
  subtitle: "Practice natural conversations, refine grammar, expand vocabulary, and get real-time speaking feedback from your AI coach.",
  tools: [
    {
      id: "chat",
      title: "Conversation Practice",
      description: "Talk with the AI coach on everyday topics and improve fluency.",
      icon: "MessageSquare",
      prompt: "Let us practice ordering food at a restaurant.",
    },
    {
      id: "grammar",
      title: "Grammar Polish",
      description: "Paste a sentence and get corrected grammar with explanations.",
      icon: "FileText",
      prompt: "She don't like coffee.",
    },
    {
      id: "vocabulary",
      title: "Vocabulary Builder",
      description: "Ask for better words, synonyms, and example sentences.",
      icon: "BookOpen",
      prompt: "Give me 5 advanced words for business meetings.",
    },
    {
      id: "sentence",
      title: "Sentence Improver",
      description: "Turn simple or awkward sentences into polished English.",
      icon: "Sparkles",
      prompt: "I go to market yesterday and buy apple.",
    },
    {
      id: "speaking",
      title: "Speaking Feedback",
      description: "Submit a short speech and receive pronunciation and fluency scores.",
      icon: "Mic",
      prompt: "Record or paste your speech for instant feedback.",
    },
    {
      id: "quiz",
      title: "AI Quiz",
      description: "Test your knowledge with adaptive quizzes generated by AI.",
      icon: "HelpCircle",
      prompt: "Generate a quiz on past tense verbs.",
    },
  ],
  recentSessions: [
    { title: "Interview practice", time: "Today", score: "88%" },
    { title: "Grammar polish: conditionals", time: "Yesterday", score: "92%" },
    { title: "Vocabulary: travel phrases", time: "2 days ago", score: "85%" },
  ],
};
