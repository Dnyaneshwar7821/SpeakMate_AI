import apiClient from "./apiClient";

export const teacherAuthApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/api/auth/teacher/login", { email, password });
    return response.data; // Response is AuthResponse
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post("/api/users/forgot-password", { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await apiClient.post("/api/users/verify-otp", { email, otp });
    return response.data; // Response is VerifyOtpResponse
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post("/api/users/reset-password", { token, newPassword });
    return response.data;
  },

  resetPasswordWithTemporary: async (email, temporaryPassword, newPassword, role = "TEACHER") => {
    const response = await apiClient.post("/api/auth/reset-password-with-temporary", {
      email,
      temporaryPassword,
      newPassword,
      role,
    });
    return response.data;
  }
};
export default teacherAuthApi;
