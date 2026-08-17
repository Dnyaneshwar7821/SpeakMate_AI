import api from "./api";

const optionalGet = (url, fallback) =>
  api
    .get(url)
    .then((res) => res.data)
    .catch((error) => {
      if (error.response?.status === 404 || error.response?.status === 401) {
        return fallback;
      }
      throw error;
    });

export const profileService = {
  get: () => api.get("/profile/get-profile").then((res) => res.data),
  update: (payload) => api.put("/profile/update-profile", payload).then((res) => res.data),
  updateAvatar: (avatar) => api.put("/profile/avatar", { avatar }).then((res) => res.data),
};

export const settingsService = {
  get: () => api.get("/settings/get-settings").then((res) => res.data),
  create: (payload) => api.post("/settings/create-settings", payload).then((res) => res.data),
  update: (payload) => api.put("/settings/update-settings", payload).then((res) => res.data),
};

export const onboardingService = {
  get: () => api.get("/onboarding/get-onboarding").then((res) => res.data),
  create: (payload) => api.post("/onboarding/create-onboarding", payload).then((res) => res.data),
  update: (payload) => api.put("/onboarding", payload).then((res) => res.data),
};

export const lessonService = {
  all: () => api.get("/lesson/get-all-lessons").then((res) => res.data),
  active: () => api.get("/lesson/get-active-lessons").then((res) => res.data),
  upcoming: () => optionalGet("/lesson/upcoming", []),
  byCategory: (category) =>
    api.get(`/lesson/get-lessons-by-category/${encodeURIComponent(category)}`).then((res) => res.data),
  byLevel: (level) =>
    api.get(`/lesson/get-lessons-by-level/${encodeURIComponent(level)}`).then((res) => res.data),
};

export const lessonModuleService = {
  list: (params = {}) => api.get("/lessons", { params }).then((r) => r.data),
  categories: () => api.get("/lessons/categories").then((r) => r.data),
  detail: (id) => api.get(`/lessons/${id}`).then((r) => r.data),
  recommended: () => optionalGet("/lessons/recommended", []),
  continueLearning: () => optionalGet("/lessons/continue", []),
  search: (q, category, difficulty) =>
    api.get("/lessons/search", { params: { q, category, difficulty } }).then((r) => r.data),
  recent: () => optionalGet("/lessons/recent", []),
  completed: () => optionalGet("/lessons/completed", []),
  start: (id) => api.post(`/lessons/start/${id}`).then((r) => r.data),
  updateProgress: (payload) => api.put("/lessons/progress", payload).then((r) => r.data),
  complete: (id) => api.put(`/lessons/complete/${id}`).then((r) => r.data),
};

export const vocabularyService = {
  all: () => api.get("/vocabulary/get-all-vocabulary").then((res) => res.data),
  favorites: () => api.get("/vocabulary/get-favorite-vocabulary").then((res) => res.data),
  add: (word) => api.post("/vocabulary/add-vocabulary", { word }).then((res) => res.data),
  remove: (id) => api.delete(`/vocabulary/delete-vocabulary/${id}`).then((res) => res.data),
  toggleFavorite: (id) => api.put(`/vocabulary/toggle-favorite/${id}`).then((res) => res.data),
  quiz: () => api.get("/vocabulary/quiz").then((res) => res.data),
};

export const grammarService = {
  check: (originalText) => api.post("/grammar/check-grammar", { originalText }).then((res) => res.data),
  analyze: (originalText) => api.post("/grammar/check-grammar", { originalText }).then((res) => res.data),
  history: () => api.get("/grammar/get-all-grammar").then((res) => res.data),
  remove: (id) => api.delete(`/grammar/delete-grammar/${id}`).then((res) => res.data),
};

export const aiService = {
  chat: (prompt) => api.post("/ai/chat", { prompt }).then((res) => res.data),
  grammar: (prompt) => api.post("/ai/grammar", { prompt }).then((res) => res.data),
  vocabulary: (prompt) => api.post("/ai/vocabulary", { prompt }).then((res) => res.data),
  improveSentence: (prompt) => api.post("/ai/improve-sentence", { prompt }).then((res) => res.data),
  speakingFeedback: (prompt) => api.post("/ai/speaking-feedback", { prompt }).then((res) => res.data),
  lessonQuiz: (prompt) => api.post("/ai/lesson-quiz", { prompt }).then((res) => res.data),
  lessonTutor: (prompt) => api.post("/ai/lesson-tutor", { prompt }).then((res) => res.data),
};

export const chatService = {
  history: () => api.get("/chat/history").then((res) => res.data),
  detail: (id) => api.get(`/chat/session/${id}`).then((res) => res.data),
  start: (mode) => api.post("/chat/start", { mode }).then((res) => res.data),
  send: (sessionId, message, voiceEnabled, level) =>
    api.post("/chat/message", { sessionId, message, voiceEnabled, level }).then((res) => res.data),
  deleteSession: (id) => api.delete(`/chat/session/${id}`).then((res) => res.data),
  rename: (id, title) => api.put(`/chat/session/${id}/rename`, { title }).then((res) => res.data),
  toggleBookmark: (messageId) => api.post(`/chat/bookmark/${messageId}`).then((res) => res.data),
  bookmarks: () => api.get("/chat/bookmarks").then((res) => res.data),
  getHints: (id) => api.get(`/chat/hint/${id}`).then((res) => res.data),
};

export const speechService = {
  speechToText: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post("/speech/speech-to-text", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
  pronunciation: (text) => api.post("/speech/pronunciation", { text }).then((res) => res.data),
};

export const speakingService = {
  create: (payload) => api.post("/speaking/create", payload).then((res) => res.data),
  all: () => api.get("/speaking/get-all-sessions").then((res) => res.data),
  start: (payload) => api.post("/speaking/start", payload).then((res) => res.data),
  sendMessage: (payload) => api.post("/speaking/message", payload).then((res) => res.data),
  end: (id) => api.post(`/speaking/end/${id}`).then((res) => res.data),
  history: () => api.get("/speaking/history").then((res) => res.data),
  detail: (id) => api.get(`/speaking/session/${id}`).then((res) => res.data),
  remove: (id) => api.delete(`/speaking/${id}`).then((res) => res.data),
  getHints: (id) => api.get(`/speaking/hint/${id}`).then((res) => res.data),
};

export const progressService = {
  get: () => api.get("/progress/get-progress").then((res) => res.data),
  create: (payload) => api.post("/progress/create-progress", payload).then((res) => res.data),
  update: (payload) => api.put("/progress/update-progress", payload).then((res) => res.data),
};

export const achievementService = {
  all: () => api.get("/achievement/get-all-achievements").then((res) => res.data),
  unlocked: () => api.get("/achievement/get-unlocked-achievements").then((res) => res.data),
};

export const notificationService = {
  all: () => api.get("/notification/get-all-notifications").then((res) => res.data),
  unread: () => api.get("/notification/get-unread-notifications").then((res) => res.data),
  countUnread: () => api.get("/notification/count-unread").then((res) => res.data),
  markAsRead: (id) => api.put(`/notification/mark-as-read/${id}`).then((res) => res.data),
  markAllRead: () => api.put("/notification/mark-all-read").then((res) => res.data),
  delete: (id) => api.delete(`/notification/delete-notification/${id}`).then((res) => res.data),
  clearAll: () => api.delete("/notification/clear-all").then((res) => res.data),
  create: (title, message) =>
    api.post("/notification/create-notification", { title, message, isRead: false }).then((res) => res.data),
};

export const dashboardService = {
  summary: () => optionalGet("/dashboard/summary", null),
  recentActivity: () => optionalGet("/activity/recent", []),
  weeklyProgress: () => optionalGet("/dashboard/weekly-progress", []),
  dailyGoal: () => optionalGet("/dashboard/daily-goal", null),
  statistics: () => optionalGet("/dashboard/statistics", null),
  quote: () => optionalGet("/dashboard/quote", null),
};
