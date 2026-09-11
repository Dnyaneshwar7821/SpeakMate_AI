import apiClient from "./apiClient";

export const adminSettingsApi = {
  getSettings: async () => {
    const response = await apiClient.get("/api/admin/settings");
    return response.data; // ApiResponse<AdminSettingsResponse>
  },

  updateAppearance: async (themeData) => {
    const response = await apiClient.put("/api/admin/settings/appearance", themeData);
    return response.data; // ApiResponse<AdminSettingsResponse>
  },

  updateLanguage: async (languageData) => {
    const response = await apiClient.put("/api/admin/settings/language", languageData);
    return response.data; // ApiResponse<AdminSettingsResponse>
  },

  updateNotifications: async (notificationsData) => {
    const response = await apiClient.put("/api/admin/settings/notifications", notificationsData);
    return response.data; // ApiResponse<AdminSettingsResponse>
  },

  updateSecurity: async (securityData) => {
    const response = await apiClient.put("/api/admin/settings/security", securityData);
    return response.data; // ApiResponse<AdminSettingsResponse>
  },

  resetPlatform: async () => {
    const response = await apiClient.delete("/api/settings/reset");
    return response.data;
  },

  deactivatePlatform: async () => {
    const response = await apiClient.post("/api/settings/deactivate");
    return response.data;
  }
};

export default adminSettingsApi;
