import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/Admin_panel/context/AuthContext";
import notificationApi from "@services/admin/notificationApi";

export function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const isMuted = localStorage.getItem("speakmate_notif_muted") === "true";
    if (isMuted) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Two-tone crystal glass chime (C6 -> G6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1046.5, now);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.38);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1567.98, now + 0.1);
    gain2.gain.setValueAtTime(0.06, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.debug("Audio chime notice:", e);
  }
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
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem("speakmate_notif_muted") === "true";
    } catch {
      return false;
    }
  });

  const eventSourceRef = useRef(null);
  const ringTimerRef = useRef(null);
  const pulseTimerRef = useRef(null);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("speakmate_notif_muted", String(next));
      } catch {}
      return next;
    });
  }, []);

  const triggerNewActivityAlert = useCallback(() => {
    setIsRinging(true);
    setHasNewActivity(true);
    playNotificationChime();

    if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
    ringTimerRef.current = setTimeout(() => setIsRinging(false), 1400);

    if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    pulseTimerRef.current = setTimeout(() => setHasNewActivity(false), 4500);
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      console.log("[useNotifications] Fetching notifications from REST API...");
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
      console.log(`[useNotifications] Loaded ${formatted.length} notifications (${unread} unread)`);
    } catch (err) {
      console.warn("[useNotifications] Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (id) => {
    try {
      console.log(`[useNotifications] Marking notification ${id} as read...`);
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
      console.log("[useNotifications] Marking all notifications as read...");
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
    console.log(`[useNotifications] Connecting to SSE stream securely...`);
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("[useNotifications] Real-time SSE stream connected successfully.");
    };

    eventSource.addEventListener("NOTIFICATION", (event) => {
      try {
        const n = JSON.parse(event.data);
        console.log("[useNotifications] REAL-TIME NOTIFICATION EVENT RECEIVED:", n);
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

        // Trigger bell swing, radar pulse & audio chime
        triggerNewActivityAlert();

        // Trigger visible real-time Toast popup immediately
        setActiveToast({
          id: newNotif.id,
          title: newNotif.title,
          message: newNotif.message,
          time: newNotif.time,
          type: newNotif.type,
          entityId: newNotif.entityId,
          entityType: newNotif.entityType,
        });

        // Broadcast data update event so dashboards, student lists and teacher lists refresh automatically
        window.dispatchEvent(new CustomEvent("school_data_updated", { detail: newNotif }));

        setTimeout(() => {
          setActiveToast((curr) => (curr?.id === newNotif.id ? null : curr));
        }, 6000);
      } catch (err) {
        console.error("[useNotifications] Failed to process incoming SSE event:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn("[useNotifications] SSE stream connection state changed or disconnected.");
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
  }, [user, fetchNotifications, triggerNewActivityAlert]);

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
    activeToast,
    dismissToast,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}

export default useNotifications;
