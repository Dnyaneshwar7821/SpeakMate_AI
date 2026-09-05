import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/storageKeys';
import { BASE_URL } from '../constants/config';

let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const api = axios.create({
  baseURL: BASE_URL || 'https://speakmate-ai-28z5.onrender.com',
  timeout: 120000, // 120s to allow Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.token);
      if (token && token !== 'null' && token !== 'undefined') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error fetching token for request:', error?.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    // Background endpoints that fail gracefully without error logs
    const isBackgroundEndpoint = config?.url && (
      config.url.includes('/register-expo-url') ||
      config.url.includes('/count-unread') ||
      config.url.includes('/push-token') ||
      config.url.includes('/api/v1/')
    );

    // Retry once on network timeout or connection error (e.g. Render free tier cold start)
    const isNetworkError = !error.response || error.code === 'ECONNABORTED' || error.message === 'Network Error';
    if (config && isNetworkError && !config._retry) {
      config._retry = true;
      if (!isBackgroundEndpoint) {
        console.warn(`[Axios] Retrying request (${config.url})...`);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return api(config);
    }

    if (status === 401) {
      try {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      } catch (_) {}
      if (logoutCallback) {
        logoutCallback();
      }
    } else if (!isBackgroundEndpoint && status !== 404) {
      const errorMsg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response?.data : JSON.stringify(error.response?.data));
      console.warn(`[Axios Error] ${config?.method?.toUpperCase()} ${config?.url} (${status || error.code || 'ERR_NETWORK'}): ${errorMsg || ''}`);
    }

    return Promise.reject(error);
  }
);

export default api;
