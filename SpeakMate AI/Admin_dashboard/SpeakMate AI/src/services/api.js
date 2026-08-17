import axios from "axios";

let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "/api" : "http://localhost:8080/api"),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

function classifyError(err) {
  if (!err) return "An unexpected error occurred.";
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
    return "Request timed out. The server took too long to respond.";
  }
  if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
    return "Network error. Please check your connection and try again.";
  }
  if (err.response?.status === 401) {
    return "Session expired. Please sign in again.";
  }
  if (err.response?.status >= 500) {
    return "Server error. Our team has been notified.";
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  return err.message || "Failed to load data.";
}

export function getApiErrorMessage(err) {
  return classifyError(err);
}

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
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
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
  me: async () => {
    const stored = localStorage.getItem("speakmate_user");
    return stored ? JSON.parse(stored) : null;
  },
  completeOnboarding: async (data) => {
    const stored = localStorage.getItem("speakmate_user");
    const user = stored ? JSON.parse(stored) : {};
    const updated = { ...user, ...data, onboardingCompleted: true };
    localStorage.setItem("speakmate_user", JSON.stringify(updated));
    return updated;
  },
};

export default api;
