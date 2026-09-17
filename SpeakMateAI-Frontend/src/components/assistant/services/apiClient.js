import axios from "axios";

const getSessionToken = () => {
  try {
    // 1. Check admin session (Super Admin, School Admin, Teacher)
    const sessionStr = localStorage.getItem("speakmate_admin_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session && session.token) {
        return session.token;
      }
    }
    // 2. Check regular user / student token
    const token = localStorage.getItem("speakmate_token");
    if (token && token !== "null" && token !== "undefined") {
      return token;
    }
  } catch (e) {
    console.error("Error reading session token", e);
  }
  return null;
};

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:9091";
  }
  return "https://speakmate-ai-28z5.onrender.com";
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 65000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
