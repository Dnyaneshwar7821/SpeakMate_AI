import apiClient from "./apiClient";

export const teacherNotificationApi = {
  getNotifications: async () => {
    const response = await apiClient.get("/api/v1/teacher/notifications");
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get("/api/v1/teacher/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.put(`/api/v1/teacher/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.put("/api/v1/teacher/notifications/read-all");
    return response.data;
  }
};

export default teacherNotificationApi;
