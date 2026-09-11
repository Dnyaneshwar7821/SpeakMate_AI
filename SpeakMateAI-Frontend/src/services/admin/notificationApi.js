import apiClient from "./apiClient";

export const notificationApi = {
  getAllNotifications: async () => {
    const response = await apiClient.get("/api/notification/get-all-notifications");
    return response.data;
  },

  getUnreadNotifications: async () => {
    const response = await apiClient.get("/api/notification/get-unread-notifications");
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get("/api/notification/count-unread");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await apiClient.put(`/api/notification/mark-as-read/${id}`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put("/api/notification/mark-all-read");
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/api/notification/delete-notification/${id}`);
    return response.data;
  },

  clearAll: async () => {
    const response = await apiClient.delete("/api/notification/clear-all");
    return response.data;
  }
};

export default notificationApi;
