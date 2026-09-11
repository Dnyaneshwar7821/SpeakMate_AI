import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { notificationService } from '../services/appServices';

/**
 * NotificationContext — global unread count for the entire app.
 *
 * - Polls the backend every 60 seconds when the app is in the foreground.
 * - Re-fetches immediately whenever the app returns to foreground from background.
 * - Exposes `unreadCount` and `refreshUnread()` to any component.
 */
const NotificationContext = createContext({ unreadCount: 0, refreshUnread: () => {} });

const POLL_INTERVAL_MS = 60_000; // 1 minute

export function NotificationProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const refreshUnread = useCallback(async () => {
    try {
      const count = await notificationService.countUnread();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      // Silently ignore — user might not be logged in yet
    }
  }, []);

  // Poll every 60 seconds
  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(refreshUnread, POLL_INTERVAL_MS);
  }, [refreshUnread]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    refreshUnread();
    startPolling();

    // Re-fetch when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        refreshUnread();
        startPolling();
      } else if (nextState.match(/inactive|background/)) {
        stopPolling();
      }
      appStateRef.current = nextState;
    });

    return () => {
      stopPolling();
      subscription?.remove?.();
    };
  }, [refreshUnread, startPolling, stopPolling]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
