import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  Zap,
  Flame,
  X,
} from "lucide-react";

const ToastContext = createContext(null);

// Global event bus for non-React contexts (e.g., axios, util files)
const toastListeners = new Set();

export const showGlobalToast = (message, type = "info", duration = 4000) => {
  toastListeners.forEach((listener) => listener(message, type, duration));
};

export const toast = {
  success: (msg, duration) => showGlobalToast(msg, "success", duration),
  error: (msg, duration) => showGlobalToast(msg, "error", duration),
  warning: (msg, duration) => showGlobalToast(msg, "warning", duration),
  info: (msg, duration) => showGlobalToast(msg, "info", duration),
  xp: (msg, duration) => showGlobalToast(msg, "xp", duration),
  streak: (msg, duration) => showGlobalToast(msg, "streak", duration),
};

const TOAST_VARIANTS = {
  success: {
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 via-emerald-600/10 to-teal-500/10",
    border: "border-emerald-500/40 dark:border-emerald-400/40",
    bg: "bg-white/95 dark:bg-[#062c20]/95",
    text: "text-emerald-950 dark:text-emerald-100",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    progress: "bg-emerald-500",
    label: "Success",
  },
  error: {
    icon: AlertCircle,
    gradient: "from-rose-500/20 via-red-600/10 to-pink-500/10",
    border: "border-rose-500/40 dark:border-rose-400/40",
    bg: "bg-white/95 dark:bg-[#320a16]/95",
    text: "text-rose-950 dark:text-rose-100",
    iconColor: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
    progress: "bg-rose-500",
    label: "Attention",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-amber-500/20 via-orange-600/10 to-yellow-500/10",
    border: "border-amber-500/40 dark:border-amber-400/40",
    bg: "bg-white/95 dark:bg-[#331c04]/95",
    text: "text-amber-950 dark:text-amber-100",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    progress: "bg-amber-500",
    label: "Notice",
  },
  info: {
    icon: Sparkles,
    gradient: "from-indigo-500/20 via-violet-600/10 to-blue-500/10",
    border: "border-indigo-500/40 dark:border-indigo-400/40",
    bg: "bg-white/95 dark:bg-[#121236]/95",
    text: "text-indigo-950 dark:text-indigo-100",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300",
    progress: "bg-indigo-500",
    label: "SpeakMate AI",
  },
  xp: {
    icon: Zap,
    gradient: "from-yellow-500/25 via-amber-500/15 to-orange-500/10",
    border: "border-yellow-500/50 dark:border-yellow-400/50",
    bg: "bg-white/95 dark:bg-[#2e1d03]/95",
    text: "text-yellow-950 dark:text-yellow-100",
    iconColor: "text-yellow-500 dark:text-yellow-400",
    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300",
    progress: "bg-yellow-500",
    label: "XP Earned",
  },
  streak: {
    icon: Flame,
    gradient: "from-orange-500/25 via-red-500/15 to-amber-500/10",
    border: "border-orange-500/50 dark:border-orange-400/50",
    bg: "bg-white/95 dark:bg-[#341207]/95",
    text: "text-orange-950 dark:text-orange-100",
    iconColor: "text-orange-500 dark:text-orange-400",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300",
    progress: "bg-orange-500",
    label: "Streak",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => {
      // Keep maximum 4 toasts at a time
      const next = [...prev, { id, message, type, duration, createdAt: Date.now() }];
      return next.slice(-4);
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  useEffect(() => {
    toastListeners.add(addToast);
    return () => {
      toastListeners.delete(addToast);
    };
  }, [addToast]);

  const toastMethods = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
    xp: (msg, duration) => addToast(msg, "xp", duration),
    streak: (msg, duration) => addToast(msg, "streak", duration),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      {/* Toast Notification Container with Top-Right Floating Dock */}
      <div
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-[390px] w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        role="region"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const variant = TOAST_VARIANTS[t.type] || TOAST_VARIANTS.info;
            const Icon = variant.icon;

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -24, scale: 0.9, rotate: -1 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.88, x: 50, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${variant.border} ${variant.bg} shadow-2xl backdrop-blur-2xl transition-all group`}
              >
                {/* Background ambient glow gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${variant.gradient} opacity-70 pointer-events-none`}
                />

                <div className="relative p-4 flex items-start gap-3.5 z-10">
                  {/* Icon with glowing pill */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${variant.bg} border ${variant.border}`}
                  >
                    <Icon className={`w-5 h-5 ${variant.iconColor}`} />
                  </div>

                  {/* Message & Badge */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full ${variant.badge}`}
                      >
                        {variant.label}
                      </span>
                    </div>
                    <p
                      className={`text-xs sm:text-sm font-semibold leading-snug break-words ${variant.text}`}
                    >
                      {t.message}
                    </p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => removeToast(t.id)}
                    className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Duration Progress countdown line */}
                {t.duration > 0 && (
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: t.duration / 1000, ease: "linear" }}
                    className={`h-0.5 ${variant.progress} opacity-60 absolute bottom-0 left-0`}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
