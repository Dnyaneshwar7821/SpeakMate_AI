import apiClient from "./apiClient";

export const schoolAdminDataApi = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get("/api/v1/school/dashboard");
    return response.data; // Response is SchoolDashboardResponse
  },

  // Insights
  getInsights: async (range = "6m") => {
    const response = await apiClient.get("/api/v1/school/insights", {
      params: { range },
    });
    return response.data;
  },

  // Teachers
  getAllTeachers: async () => {
    const response = await apiClient.get("/api/v1/school/teachers");
    return response.data; // List<SchoolTeacherResponse>
  },

  getTeacherById: async (id) => {
    const response = await apiClient.get(`/api/v1/school/teachers/${id}`);
    return response.data;
  },

  createTeacher: async (teacherData) => {
    const response = await apiClient.post("/api/v1/school/teachers", teacherData);
    return response.data;
  },

  updateTeacher: async (id, teacherData) => {
    const response = await apiClient.put(`/api/v1/school/teachers/${id}`, teacherData);
    return response.data;
  },

  deleteTeacher: async (id) => {
    const response = await apiClient.delete(`/api/v1/school/teachers/${id}`);
    return response.data;
  },

  // Standards / Divisions (for the current School Admin's own school)
  getSchoolDivisions: async () => {
    const response = await apiClient.get("/api/school/standards");
    return response.data; // List<StandardDivisionResponse>
  },

  // Classes
  getAllClasses: async (schoolId) => {
    const response = await apiClient.get("/api/school/classes", {
      params: schoolId ? { schoolId } : {}
    });
    return response.data; // List<ClassRoomResponse>
  },

  createClass: async (classData) => {
    const response = await apiClient.post("/api/school/classes", classData);
    return response.data;
  },

  updateClass: async (id, classData) => {
    const response = await apiClient.put(`/api/school/classes/${id}`, classData);
    return response.data;
  },

  deleteClass: async (id) => {
    const response = await apiClient.delete(`/api/school/classes/${id}`);
    return response.data;
  },

  getStudentsInClass: async (classId) => {
    const response = await apiClient.get(`/api/school/classes/${classId}/students`);
    return response.data;
  },

  addStudentsToClass: async (classId, studentIds) => {
    const response = await apiClient.post(`/api/school/classes/${classId}/students`, { studentIds });
    return response.data;
  },

  // Students
  getAllStudents: async (params = {}) => {
    const response = await apiClient.get("/api/school/students", { params });
    return response.data; // List<StudentResponse>
  },

  getStudentById: async (id) => {
    const response = await apiClient.get(`/api/school/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await apiClient.post("/api/school/students", studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await apiClient.put(`/api/school/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await apiClient.delete(`/api/school/students/${id}`);
    return response.data;
  },

  importStudents: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/api/school/students/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    return response.data;
  },

  exportStudents: async (format = "csv") => {
    const response = await apiClient.get("/api/school/students/export", {
      params: { format },
      responseType: "blob"
    });
    return response.data;
  },

  // Results / Analytics
  getAllResults: async () => {
    const response = await apiClient.get("/api/v1/school/results");
    return response.data; // List<ResultResponse>
  },

  searchResults: async (query) => {
    const response = await apiClient.get("/api/v1/school/results/search", {
      params: { q: query }
    });
    return response.data;
  },

  getResultsByStudent: async (studentId) => {
    const response = await apiClient.get(`/api/v1/school/results/student/${studentId}`);
    return response.data;
  },

  // Profile
  getProfile: async () => {
    const response = await apiClient.get("/api/profile/get-profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put("/api/profile/update-profile", profileData);
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await apiClient.get("/api/settings/get-settings");
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await apiClient.put("/api/settings/update-settings", settingsData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.post("/api/settings/change-password", passwordData);
    return response.data;
  },

  updateTwoFactor: async (enabled) => {
    const response = await apiClient.post("/api/settings/two-factor", { enabled });
    return response.data;
  },

  downloadBackup: async () => {
    const response = await apiClient.get("/api/settings/backup", {
      responseType: 'blob'
    });
    return response.data;
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

export default schoolAdminDataApi;

