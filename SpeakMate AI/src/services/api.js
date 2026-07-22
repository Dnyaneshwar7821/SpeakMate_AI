import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  login: async (credentials) => {
    return Promise.resolve({
      data: {
        user: {
          name: "Demo Learner",
          email: credentials.email,
        },
        token: "mock-token",
      },
    });
  },

  register: async (payload) => {
    return Promise.resolve({
      data: {
        user: {
          name: payload.name,
          email: payload.email,
        },
        token: "mock-token",
      },
    });
  },

  forgotPassword: async (email) => {
    return Promise.resolve({
      data: {
        message: `OTP code sent to ${email}.`,
      },
    });
  },

  verifyOtp: async (email, otp) => {
    return Promise.resolve({
      data: {
        token: "mock-reset-token",
        message: "OTP verified successfully.",
      },
    });
  },

  resetPassword: async (token, newPassword) => {
    return Promise.resolve({
      data: {
        message: "Password reset successfully.",
      },
    });
  },
};

export default api;
