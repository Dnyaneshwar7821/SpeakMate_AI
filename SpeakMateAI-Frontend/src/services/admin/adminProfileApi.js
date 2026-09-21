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
  },

  updateAvatar: async (avatar) => {
    const response = await apiClient.put("/api/admin/profile/avatar", { avatar, profileImage: avatar });
    return response.data; // ApiResponse<AdminProfileResponse>
  }
};

export default adminProfileApi;
