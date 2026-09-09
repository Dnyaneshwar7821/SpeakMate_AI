import apiClient from "./apiClient";

export const schoolApi = {
  getSchools: async () => {
    const response = await apiClient.get("/api/admin/schools");
    return response.data; // List<SchoolResponse> directly
  },

  getSchoolById: async (id) => {
    const response = await apiClient.get(`/api/admin/schools/${id}`);
    return response.data; // SchoolResponse
  },

  createSchool: async (schoolData) => {
    const response = await apiClient.post("/api/admin/schools", schoolData);
    return response.data; // SchoolResponse
  },

  updateSchool: async (id, schoolData) => {
    const response = await apiClient.put(`/api/admin/schools/${id}`, schoolData);
    return response.data;
  },

  activateSchool: async (id) => {
    const response = await apiClient.put(`/api/admin/schools/${id}/activate`);
    return response.data;
  },

  deactivateSchool: async (id) => {
    const response = await apiClient.put(`/api/admin/schools/${id}/deactivate`);
    return response.data;
  },

  deleteSchool: async (id) => {
    const response = await apiClient.delete(`/api/admin/schools/${id}`);
    return response.data;
  },

  getSchoolStandards: async (schoolId) => {
    const response = await apiClient.get(`/api/school/standards/${schoolId}`);
    return response.data;
  },

  configureSchoolStandards: async (schoolId, config) => {
    const response = await apiClient.put(`/api/school/standards/${schoolId}/configure`, config);
    return response.data;
  },

  getAssignedTeacher: async (schoolId, standard, division) => {
    const response = await apiClient.get(`/api/v1/school/teachers/assigned`, {
      params: { schoolId, standard, division }
    });
    return response.data; // SchoolTeacherResponse
  },

  sendAdminVerificationOtp: async (email) => {
    const response = await apiClient.post("/api/admin/schools/admin-verification-otp/send", { email });
    return response.data;
  },

  verifyAdminVerificationOtp: async (email, otp) => {
    const response = await apiClient.post("/api/admin/schools/admin-verification-otp/verify", { email, otp });
    return response.data;
  },

  sendSchoolAdminInvitation: async (email, verificationToken, extra = {}) => {
    const response = await apiClient.post("/api/admin/schools/send-invitation", {
      email,
      verificationToken,
      ...extra
    });
    return response.data;
  }
};

export default schoolApi;
