/**
 * constants/app.js
 *
 * App-wide configuration constants.
 * Read from environment variables where applicable (Vite exposes them via import.meta.env).
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || "SpeakMate AI";
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "1.0.0";
export const APP_ENV = import.meta.env.VITE_APP_ENV || "development";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Feature flags
export const FEATURES = {
  AI: import.meta.env.VITE_ENABLE_AI_FEATURES === "true",
  VOICE: import.meta.env.VITE_ENABLE_VOICE_FEATURES !== "false",
  PREMIUM: import.meta.env.VITE_ENABLE_PREMIUM === "true",
};

// Local storage keys (prevents typos)
export const STORAGE_KEYS = {
  AUTH_TOKEN: "speakmate_auth_token",
  USER: "speakmate_user",
  THEME: "speakmate_theme",
  STREAK: "speakmate_streak",
  PROGRESS: "speakmate_progress",
  ONBOARDING_DONE: "speakmate_onboarding_done",
};

// Learning levels
export const LEARNING_LEVELS = {
  BEGINNER: "beginner",
  ELEMENTARY: "elementary",
  INTERMEDIATE: "intermediate",
  UPPER_INTERMEDIATE: "upper_intermediate",
  ADVANCED: "advanced",
};

// Practice modes
export const PRACTICE_MODES = {
  AI_CHAT: "ai_chat",
  SPEAKING: "speaking",
  GRAMMAR: "grammar",
  VOCABULARY: "vocabulary",
  LISTENING: "listening",
};

// Score thresholds
export const SCORE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 60,
  NEEDS_WORK: 0,
};

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 250,
  SLOW: 400,
  PAGE_TRANSITION: 300,
};

// Daily goals
export const DAILY_GOALS = {
  XP_TARGET: 50,
  SESSION_MINUTES: 15,
  VOCABULARY_WORDS: 5,
};
