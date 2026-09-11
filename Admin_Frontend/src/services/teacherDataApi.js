import apiClient from "./apiClient";

export const teacherDataApi = {
  getSettings: async () => { return { success: true, data: { language: 'en', twoFactorEnabled: false, sessionTimeout: 30, notificationsEnabled: true, emailNotifications: true, systemNotifications: true, theme: 'light' } }; },
  getInvoices: async () => { return { success: true, data: { content: [] } }; },
  updateLanguage: async () => { return { success: true }; },
  updateSecurity: async () => { return { success: true }; },
  updateNotifications: async () => { return { success: true }; },
  updateAppearance: async () => { return { success: true }; },
  resetPlatform: async () => { return { success: true }; },
  deactivatePlatform: async () => { return { success: true }; },

  getDashboardStats: async () => {
    const response = await apiClient.get("/api/v1/teacher/dashboard");
    return response.data; // Response is TeacherDashboardResponse
  },

  getStudents: async (search = "", status = "", standard = "", division = "") => {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (standard && standard !== "All Standards" && standard !== "All") params.standard = standard;
    if (division && division !== "All Divisions" && division !== "All") params.division = division;
    const response = await apiClient.get("/api/v1/teacher/students", { params });
    return response.data; // TeacherStudentsListResponse
  },

  getStudentDetail: async (studentId) => {
    const response = await apiClient.get(`/api/v1/teacher/students/${studentId}`);
    return response.data; // TeacherStudentDetailResponse
  },

  getAnalytics: async (params = {}) => {
    const response = await apiClient.get("/api/v1/teacher/analytics", { params });
    return response.data; // TeacherAnalyticsResponse
  },

  getStudentAnalytics: async (studentId) => {
    const response = await apiClient.get(`/api/v1/teacher/students/${studentId}/analytics`);
    return response.data; // TeacherStudentDetailResponse
  },

  getReports: async () => {
    const response = await apiClient.get("/api/v1/teacher/reports");
    return response.data; // TeacherReportsResponse
  },

  getProfile: async () => {
    const response = await apiClient.get("/api/v1/teacher/profile");
    return response.data; // TeacherProfileResponse
  },

  updateProfile: async (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      department: data.department,
      designation: data.designation,
      qualification: data.qualification,
      experience: data.experience,
      location: data.location,
      bio: data.bio,
    };
    const response = await apiClient.put("/api/v1/teacher/profile", payload);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await apiClient.post("/api/v1/teacher/change-password", data);
    return response.data;
  },

  downloadProfile: async () => {
    const response = await apiClient.get("/api/v1/teacher/profile/download", { responseType: "blob" });
    return response;
  }
};
export default teacherDataApi;
