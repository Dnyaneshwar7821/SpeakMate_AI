import apiClient from "./apiClient";

export const studentApi = {
  getStudents: async (page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/school-users", {
      params: { page, size, sortBy, sortDir }
    });
    return response.data; // Page<AdminSchoolUserResponse> inside ApiResponse
  },

  getStudentById: async (id) => {
    const response = await apiClient.get(`/api/admin/school-users/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    try {
      const response = await apiClient.post("/api/admin/school-users", studentData);
      return response.data;
    } catch (error) {
      console.error("Student creation failed");
      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);
      throw error;
    }
  },

  updateStudent: async (id, studentData) => {
    try {
      const response = await apiClient.put(`/api/admin/school-users/${id}`, studentData);
      return response.data;
    } catch (error) {
      console.error("Student update failed");
      console.error("Status:", error.response?.status);
      console.error("Backend response:", error.response?.data);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    const response = await apiClient.delete(`/api/admin/school-users/${id}`);
    return response.data;
  },

  activateStudent: async (id) => {
    const response = await apiClient.put(`/api/admin/school-users/${id}/activate`);
    return response.data;
  },

  deactivateStudent: async (id) => {
    const response = await apiClient.put(`/api/admin/school-users/${id}/deactivate`);
    return response.data;
  },

  searchStudents: async (keyword, page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/school-users/search", {
      params: { keyword, page, size, sortBy, sortDir }
    });
    return response.data;
  },

  filterStudents: async (filterParams, page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/school-users/filter", {
      params: { ...filterParams, page, size, sortBy, sortDir }
    });
    return response.data;
  },

  getSchools: async () => {
    const response = await apiClient.get("/api/admin/schools");
    return response.data; // List<SchoolResponse> directly
  }
};

export default studentApi;
