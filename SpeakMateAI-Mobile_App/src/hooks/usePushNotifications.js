import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import api from '../api/api';

/**
 * usePushNotifications — Phase 3 hook.
 *
 * ⚠️  SDK 53+ COMPATIBILITY NOTE:
 * expo-notifications remote (push) functionality was REMOVED from Expo Go in SDK 53.
 * It now requires a Development Build or Production Build (eas build).
 *
 * This hook safely detects whether push APIs are available at runtime and silently
 * skips registration when running inside Expo Go. The app continues to work normally;
 * push notifications will activate automatically once the app is built with EAS.
 *
 * Local (in-app) notifications still work — only the remote push token registration
 * is skipped in Expo Go.
 */

// Lazily import expo-notifications to prevent crash when the native module is absent
let Notifications = null;
let notificationsAvailable = false;

try {
  // This will succeed in a Development/Production build
  Notifications = require('expo-notifications');

  // SDK 53+ removed addPushTokenListener from Expo Go — detect this at runtime
  // by checking if the native module supports remote notifications
  if (Notifications && typeof Notifications.getExpoPushTokenAsync === 'function') {
    notificationsAvailable = true;
  }
} catch (_) {
  // expo-notifications native module not linked — safe to ignore
  notificationsAvailable = false;
}

// Only set the notification handler if the module is available
if (notificationsAvailable && Notifications) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (_) {}
}

export function usePushNotifications() {
  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    if (!notificationsAvailable || !Notifications) {
      // Running in Expo Go on SDK 53+ — push not supported, skip silently
      return;
    }

    registerForPushNotificationsAsync()
      .then((token) => {
        if (token) {
          api.put('/api/user/push-token', { token }).catch(() => {});
        }
      })
      .catch(() => {});

    // Listen for incoming foreground notifications
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (_notification) => {
          // Optionally trigger refreshUnread() here
        }
      );

      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (_response) => {
          // Navigate to Notifications screen on tap
        }
      );
    } catch (_) {}

    return () => {
      try { notificationListener.current?.remove?.(); } catch (_) {}
      try { responseListener.current?.remove?.(); } catch (_) {}
    };
  }, []);
}

async function registerForPushNotificationsAsync() {
  if (!Notifications || !notificationsAvailable) return null;

  if (!Device.isDevice) {
    // Push tokens don't work in simulators/emulators
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    // Android requires a notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('speakmate-default', {
        name: 'SpeakMate Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
      });
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData?.data ?? null;
  } catch (error) {
    // Gracefully handle "runtime not ready" and other SDK 53 Expo Go errors
    if (__DEV__) {
      console.log('[PushNotifications] Skipped in Expo Go:', error?.message);
    }
    return null;
  }
}
