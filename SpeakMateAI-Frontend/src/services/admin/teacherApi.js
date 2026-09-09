import apiClient from "./apiClient";

export const teacherApi = {
  getTeachers: async () => {
    const response = await apiClient.get("/api/v1/school/teachers");
    return response.data; // List<SchoolTeacherResponse>
  },

  getTeacherById: async (id) => {
    const response = await apiClient.get(`/api/v1/school/teachers/${id}`);
    return response.data; // SchoolTeacherResponse
  },

  createTeacher: async (teacherData) => {
    const response = await apiClient.post("/api/v1/school/teachers", teacherData);
    return response.data; // SchoolTeacherResponse
  },

  updateTeacher: async (id, teacherData) => {
    const response = await apiClient.put(`/api/v1/school/teachers/${id}`, teacherData);
    return response.data; // SchoolTeacherResponse
  },

  activateTeacher: async (id) => {
    const response = await apiClient.put(`/api/v1/school/teachers/${id}/activate`);
    return response.data; // SchoolTeacherResponse
  },

  deactivateTeacher: async (id) => {
    const response = await apiClient.put(`/api/v1/school/teachers/${id}/deactivate`);
    return response.data; // SchoolTeacherResponse
  },

  deleteTeacher: async (id) => {
    const response = await apiClient.delete(`/api/v1/school/teachers/${id}`);
    return response.data;
  }
};

export default teacherApi;
