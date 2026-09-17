import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/Admin_panel/context/AuthContext";
import notificationApi from "@services/admin/notificationApi";

export const SOUND_THEMES = [
  { id: "crystal", name: "Crystal Chime", icon: "💎", description: "Bright glass harmonic two-tone (Default)" },
  { id: "bell", name: "Soft Bell", icon: "🔔", description: "Warm, resonant desktop bell" },
  { id: "pop", name: "Gentle Pop", icon: "🫧", description: "Subtle, minimalist modern bubble pop" },
  { id: "digital", name: "Digital Pulse", icon: "⚡", description: "Crisp high-tech staccato double beep" },
  { id: "urgent", name: "Urgent Warning", icon: "🚨", description: "Minor-triad alert for deletions & critical notices" },
];

export const DEFAULT_NOTIFICATION_SETTINGS = {
  enabled: true,               // Global master toggle
  soundEnabled: true,          // Audio toggle
  toastsEnabled: true,         // Floating toast popups
  desktopPushEnabled: false,   // Native browser desktop push
  soundTheme: "crystal",       // "crystal" | "bell" | "pop" | "digital" | "urgent"
  soundVolume: 80,             // 0 - 100
  severitySounds: true,        // Automatically play urgent sound on DELETION / CRITICAL
  categories: {
    schools: true,
    teachers: true,
    students: true,
    activities: true,
    security: true,
  },
};

export function getNotificationCategory(type = "", message = "") {
  const t = String(type || "").toUpperCase();
  const m = String(message || "").toUpperCase();
  if (t.includes("SCHOOL") || m.includes("SCHOOL")) return "schools";
  if (t.includes("TEACHER") || m.includes("TEACHER")) return "teachers";
  if (t.includes("STUDENT") || m.includes("STUDENT")) return "students";
  if (t.includes("SPEAKING") || t.includes("LESSON") || t.includes("ASSESSMENT") || t.includes("ACTIVITY") || m.includes("SPEAKING")) return "activities";
  if (t.includes("USER") || t.includes("AUTH") || t.includes("SECURITY") || t.includes("SYSTEM") || t.includes("PASSWORD") || t.includes("ROLE")) return "security";
  return "students";
}

/**
 * Web Audio API synthesizer for clean, zero-latency notification sounds.
 * Requires 0 external audio files and works offline seamlessly.
 */
export function playSound(theme = "crystal", volume = 80) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const masterVol = Math.max(0, Math.min(1, (volume / 100) * 0.15));
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(masterVol, now);
    masterGain.connect(ctx.destination);

    switch (theme) {
      case "bell": {
        // Warm resonant bell (A5 fundamental with overtone)
        const osc1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now);
        g1.gain.setValueAtTime(1.0, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc1.connect(g1);
        g1.connect(masterGain);
        osc1.start(now);
        osc1.stop(now + 0.85);

        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1760, now);
        g2.gain.setValueAtTime(0.4, now);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc2.connect(g2);
        g2.connect(masterGain);
        osc2.start(now);
        osc2.stop(now + 0.45);
        break;
      }

      case "pop": {
        // Modern minimalist pop (pitch sweep from 300Hz to 650Hz)
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);
        g.gain.setValueAtTime(0.9, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }

      case "digital": {
        // Crisp high-tech double pulse (F6 -> A6)
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = "triangle";
        o1.frequency.setValueAtTime(1396.9, now);
        g1.gain.setValueAtTime(0.8, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        o1.connect(g1);
        g1.connect(masterGain);
        o1.start(now);
        o1.stop(now + 0.14);

        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = "triangle";
        o2.frequency.setValueAtTime(1760, now + 0.1);
        g2.gain.setValueAtTime(0.8, now + 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        o2.connect(g2);
        g2.connect(masterGain);
        o2.start(now + 0.1);
        o2.stop(now + 0.3);
        break;
      }

      case "urgent": {
        // Cautionary minor 3rd double alert (G#5 -> E5)
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = "sine";
        o1.frequency.setValueAtTime(830.6, now);
        g1.gain.setValueAtTime(0.9, now);
        g1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        o1.connect(g1);
        g1.connect(masterGain);
        o1.start(now);
        o1.stop(now + 0.2);

        const o2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        o2.type = "sine";
        o2.frequency.setValueAtTime(659.25, now + 0.15);
        g2.gain.setValueAtTime(0.85, now + 0.15);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        o2.connect(g2);
        g2.connect(masterGain);
        o2.start(now + 0.15);
        o2.stop(now + 0.5);
        break;
      }

      case "crystal":
      default: {
        // Two-tone crystal glass chime (C6 -> G6)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(1046.5, now);
        gain1.gain.setValueAtTime(0.7, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(masterGain);
        osc1.start(now);
        osc1.stop(now + 0.38);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(1567.98, now + 0.1);
        gain2.gain.setValueAtTime(0.7, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.6);
        break;
      }
    }
  } catch (e) {
    console.debug("Audio play notice:", e);
  }
}

export function playNotificationChime() {
  playSound("crystal", 80);
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeToast, setActiveToast] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  const [hasNewActivity, setHasNewActivity] = useState(false);

  // Settings State with LocalStorage Persistence
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("speakmate_notification_settings");
      if (saved) {
        return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  const isMuted = !settings.enabled || !settings.soundEnabled;

  const eventSourceRef = useRef(null);
  const ringTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);

  // Update & persist settings
  const updateSettings = useCallback((newPartial) => {
    setSettings((prev) => {
      const next = typeof newPartial === "function" ? newPartial(prev) : { ...prev, ...newPartial };
      try {
        localStorage.setItem("speakmate_notification_settings", JSON.stringify(next));
        localStorage.setItem("speakmate_notif_muted", String(!next.enabled || !next.soundEnabled));
      } catch {}
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    updateSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, [updateSettings]);

  const testSound = useCallback((themeToTest, volumeToTest) => {
    const theme = themeToTest || settings.soundTheme || "crystal";
    const vol = volumeToTest !== undefined ? volumeToTest : (settings.soundVolume ?? 80);
    playSound(theme, vol);
  }, [settings.soundTheme, settings.soundVolume]);

  const triggerNewActivityAlert = useCallback((customTheme = null) => {
    setIsRinging(true);
    setHasNewActivity(true);
    playSound(customTheme || settings.soundTheme, settings.soundVolume);

    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    ringTimerRef.current = setTimeout(() => setIsRinging(false), 1400);

    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => setHasNewActivity(false), 4500);
  }, [settings.soundTheme, settings.soundVolume]);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await notificationApi.getAllNotifications();
      const list = Array.isArray(data) ? data : (data?.data || []);
      
      const formatted = list.map((n) => ({
        id: n.id,
        title: n.title || "Notification",
        message: n.message || "",
        isRead: Boolean(n.isRead),
        time: n.createdAt
          ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Just now",
        createdAt: n.createdAt,
        type: n.notificationType || "SYSTEM_EVENT",
        entityId: n.entityId != null ? n.entityId : null,
        entityType: n.entityType || null,
        raw: n,
      }));

      setNotifications(formatted);
      const unread = formatted.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.warn("[useNotifications] Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("[useNotifications] Failed to mark notification as read:", err);
    }
  }, []);

  const markMultipleAsRead = useCallback(async (ids = []) => {
    if (!Array.isArray(ids) || ids.length === 0) return;
    try {
      await Promise.allSettled(ids.map((id) => notificationApi.markAsRead(id)));
      setNotifications((prev) =>
        prev.map((n) => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - ids.length));
    } catch (err) {
      console.error("[useNotifications] Failed to mark multiple notifications as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("[useNotifications] Failed to mark all notifications as read:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    if (!user || !user.email) return;

    const getSessionToken = () => {
      try {
        const sessionStr = localStorage.getItem("speakmate_admin_session");
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          return session.token;
        }
      } catch (e) {}
      return null;
    };
    
    const token = getSessionToken();
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:9091";
    const streamUrl = `${baseUrl}/api/notification/stream?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener("NOTIFICATION", (event) => {
      try {
        const n = JSON.parse(event.data);
        if (!n || !n.id) return;

        const newNotif = {
          id: n.id,
          title: n.title || "Notification",
          message: n.message || "",
          isRead: Boolean(n.isRead),
          time: n.createdAt
            ? new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Just now",
          createdAt: n.createdAt,
          type: n.notificationType || "SYSTEM_EVENT",
          entityId: n.entityId != null ? n.entityId : null,
          entityType: n.entityType || null,
          raw: n,
        };

        setNotifications((prev) => {
          if (prev.some((item) => item.id === newNotif.id)) {
            return prev;
          }
          return [newNotif, ...prev];
        });

        if (!newNotif.isRead) {
          setUnreadCount((prev) => prev + 1);
        }

        // Notification Settings checks
        const category = getNotificationCategory(newNotif.type, newNotif.message);
        const isCategoryAllowed = settings.categories?.[category] !== false;
        const isGlobalEnabled = settings.enabled !== false;
        const isDeleteOrCritical = String(newNotif.type).toUpperCase().includes("DELETE") || 
                                   String(newNotif.message).toLowerCase().includes("deleted") || 
                                   String(newNotif.type).toUpperCase().includes("FAIL");

        // 1. Audio Alert
        if (isGlobalEnabled && settings.soundEnabled && isCategoryAllowed) {
          const themeToPlay = (settings.severitySounds && isDeleteOrCritical) ? "urgent" : (settings.soundTheme || "crystal");
          playSound(themeToPlay, settings.soundVolume ?? 80);

          setIsRinging(true);
          setHasNewActivity(true);
          if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
          ringTimerRef.current = setTimeout(() => setIsRinging(false), 1400);
          if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
          pulseTimerRef.current = setTimeout(() => setHasNewActivity(false), 4500);
        }

        // 2. In-App Toast Popup
        if (isGlobalEnabled && settings.toastsEnabled && isCategoryAllowed) {
          setActiveToast({
            id: newNotif.id,
            title: newNotif.title,
            message: newNotif.message,
            time: newNotif.time,
            type: newNotif.type,
            entityId: newNotif.entityId,
            entityType: newNotif.entityType,
          });

          setTimeout(() => {
            setActiveToast((curr) => (curr?.id === newNotif.id ? null : curr));
          }, 6000);
        }

        // 3. Desktop Browser Push Notification
        if (isGlobalEnabled && settings.desktopPushEnabled && isCategoryAllowed && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(newNotif.title, {
              body: newNotif.message,
              icon: "/favicon.ico",
            });
          } catch (e) {
            console.debug("Browser push error:", e);
          }
        }

        // Broadcast data update event for instant table refresh
        window.dispatchEvent(new CustomEvent("school_data_updated", { detail: newNotif }));
      } catch (err) {
        console.error("[useNotifications] Failed to process incoming SSE event:", err);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, [user, fetchNotifications, settings]);

  return {
    notifications,
    unreadCount,
    formattedUnreadCount: unreadCount > 99 ? "99+" : String(unreadCount),
    isLoading,
    isConnected,
    isRinging,
    hasNewActivity,
    isMuted,
    toggleMute,
    settings,
    updateSettings,
    testSound,
    activeToast,
    dismissToast,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}

export default useNotifications;
