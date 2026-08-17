import axios from "axios";

let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://speakmateai-backend.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("speakmate_token");
      if (token && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error setting authorization header:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    let message = "Something went wrong. Please try again.";

    if (error.code === "ECONNABORTED") {
      message = "Request timed out. Check your connection and try again.";
    } else if (!error.response) {
      message = "Network error. Make sure your Spring Boot backend is running at http://localhost:9091.";
    } else if (status === 401) {
      message = data?.message || "Your session has expired. Please log in again.";
      if (logoutCallback) {
        logoutCallback();
      }
    } else if (status === 403) {
      message = data?.message || "You do not have permission to perform this action.";
    } else if (status >= 500) {
      message = data?.message || "Server error. Please try again later.";
    } else if (typeof data === "string") {
      message = data;
    } else if (data?.message) {
      message = data.message;
    }

    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
