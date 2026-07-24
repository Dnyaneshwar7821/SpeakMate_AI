import api from "./api";

export const authService = {
  login: async (payload) => {
    const response = await api.post("/api/users/login", payload);
    return response.data;
  },

  register: async (payload) => {
    const response = await api.post("/api/users/register", payload);
    return response.data;
  },

  sendRegistrationOtp: async (payload) => {
    const response = await api.post("/api/users/send-registration-otp", payload);
    return response.data;
  },

  me: async () => {
    const response = await api.get("/api/users/me", { timeout: 10000 });
    return response.data;
  },

  forgotPassword: async (payload) => {
    const response = await api.post("/api/users/forgot-password", payload);
    return response.data;
  },

  verifyOtp: async (payload) => {
    const response = await api.post("/api/users/verify-otp", payload);
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await api.post("/api/users/reset-password", payload);
    return response.data;
  },

  sendDeleteAccountOtp: async (payload) => {
    const response = await api.post("/api/users/send-delete-account-otp", payload);
    return response.data;
  },

  deleteAccount: async (payload) => {
    const response = await api.post("/api/users/delete-account", payload);
    return response.data;
  },
};

export default authService;
