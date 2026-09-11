import apiClient from "./apiClient";

export const adminProfileApi = {
  getProfile: async () => {
    const response = await apiClient.get("/api/admin/profile");
    return response.data; // ApiResponse<AdminProfileResponse>
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put("/api/admin/profile", profileData);
    return response.data; // ApiResponse<AdminProfileResponse>
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put("/api/admin/profile/change-password", passwordData);
    return response.data; // ApiResponse<Void>
  }
};

export default adminProfileApi;
