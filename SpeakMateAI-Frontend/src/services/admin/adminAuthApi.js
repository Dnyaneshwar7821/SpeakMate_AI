import apiClient from "./apiClient";

export const adminAuthApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/api/auth/admin/login", { email, password });
    return response.data; // Response is ResponseEntity<ApiResponse<AdminLoginResponse>>
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post("/api/auth/admin/forgot-password", { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await apiClient.post("/api/auth/admin/verify-otp", { email, otp });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post("/api/auth/admin/reset-password", { token, newPassword });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.put("/api/auth/admin/change-password", { oldPassword, newPassword });
    return response.data;
  },

  resetPasswordWithTemporary: async (email, temporaryPassword, newPassword, role = "SUPER_ADMIN") => {
    const response = await apiClient.post("/api/auth/reset-password-with-temporary", {
      email,
      temporaryPassword,
      newPassword,
      role,
    });
    return response.data;
  }
};

