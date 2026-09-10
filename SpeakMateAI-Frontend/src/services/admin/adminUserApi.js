import apiClient from "./apiClient";

export const adminUserApi = {
  getAllUsers: async (page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/users", {
      params: { page, size, sortBy, sortDir }
    });
    return response.data; // Response is Page<AdminUserResponse> inside ApiResponse
  },

  searchUsers: async (keyword, page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/users/search", {
      params: { keyword, page, size, sortBy, sortDir }
    });
    return response.data;
  },

  filterUsers: async (filterParams, page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/users/filter", {
      params: { ...filterParams, page, size, sortBy, sortDir }
    });
    return response.data;
  },

  exportUsers: async () => {
    const response = await apiClient.get("/api/admin/users/export", {
      responseType: "blob"
    });
    return response;
  },

  createUser: async (userData) => {
    const response = await apiClient.post("/api/admin/users", userData);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/api/admin/users/${id}`, userData);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await apiClient.put(`/api/admin/users/${id}/activate`);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await apiClient.put(`/api/admin/users/${id}/deactivate`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/api/admin/users/${id}`);
    return response.data;
  },

  getUserLearningStatistics: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/statistics`);
    return response.data;
  },

  getUserProgress: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/progress`);
    return response.data;
  },

  getUserGrammarHistory: async (userId, page = 0, size = 10) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/grammar`, {
      params: { page, size }
    });
    return response.data;
  },

  getUserSpeakingSessions: async (userId, page = 0, size = 10) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/speaking`, {
      params: { page, size }
    });
    return response.data;
  },

  getUserVocabulary: async (userId, page = 0, size = 10) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/vocabulary`, {
      params: { page, size }
    });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/details`);
    return response.data;
  },

  getUserLanguageScores: async (userId) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/language-scores`);
    return response.data;
  },

  getUserActivity: async (userId, page = 0, size = 10) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/activities`, {
      params: { page, size }
    });
    return response.data;
  },

  getUserActivities: async (userId, page = 0, size = 10) => {
    const response = await apiClient.get(`/api/admin/users/${userId}/activities`, {
      params: { page, size }
    });
    return response.data;
  }
};
