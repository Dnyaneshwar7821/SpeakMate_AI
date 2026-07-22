import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../utils/storageKeys';

let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 60000,
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
      console.error('Error fetching token for request:', error);
    }
    return config;
  },
  (error) => {
    console.error('[Axios Request Error]', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status !== 401 && status !== 404) {
      console.error('[Axios Response Error] Detailed logs:');
      console.error('  error.message:', error.message);
      console.error('  error.code:', error.code);
      console.error('  error.response (Status):', status);
      console.error('  error.response (Data):', data);
      console.error('  error.request:', error.request ? JSON.stringify(error.request).substring(0, 1000) : 'None');
      console.error('  error.config (URL):', error.config?.url);
      console.error('  error.config (method):', error.config?.method);
      console.error('  error.config (headers):', error.config?.headers);
    }
    let message = 'Something went wrong. Please try again.';

    if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Check your connection and try again.';
    } else if (!error.response) {
      message = 'Network error. Make sure the backend is running and reachable.';
    } else if (status === 401) {
      message = data?.message || 'Your session has expired. Please log in again.';
      if (logoutCallback) {
        logoutCallback();
      }
    } else if (status === 403) {
      message = data?.message || 'You do not have permission to perform this action.';
    } else if (status >= 500) {
      message = data?.message || 'Server error. Please try again later.';
    } else if (typeof data === 'string') {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data && typeof data === 'object') {
      message = Object.values(data).join('\n');
    }

    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
