// Global event bus for non-React contexts (e.g., axios, util files)
const toastListeners = new Set();

export const showGlobalToast = (message, type = "info", duration = 4000) => {
  toastListeners.forEach((listener) => listener(message, type, duration));
};

export const subscribeToastListener = (listener) => {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
};

export const toast = {
  success: (msg, duration) => showGlobalToast(msg, "success", duration),
  error: (msg, duration) => showGlobalToast(msg, "error", duration),
  warning: (msg, duration) => showGlobalToast(msg, "warning", duration),
  info: (msg, duration) => showGlobalToast(msg, "info", duration),
  xp: (msg, duration) => showGlobalToast(msg, "xp", duration),
  streak: (msg, duration) => showGlobalToast(msg, "streak", duration),
};

export default toast;
