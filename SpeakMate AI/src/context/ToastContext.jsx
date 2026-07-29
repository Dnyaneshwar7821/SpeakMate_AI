import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    warning: (msg, duration) => addToast(msg, "warning", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start justify-between gap-3 backdrop-blur-xl ${
                t.type === "success"
                  ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/50"
                  : t.type === "error"
                  ? "bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/50"
                  : t.type === "warning"
                  ? "bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-950/50"
                  : "bg-indigo-950/90 border-[#6c63ff]/40 text-indigo-100 shadow-indigo-950/50"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-xl shrink-0 mt-0.5">
                  {t.type === "success" && "✅"}
                  {t.type === "error" && "⚠️"}
                  {t.type === "warning" && "💡"}
                  {t.type === "info" && "✨"}
                </span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-extrabold leading-snug break-words">{t.message}</p>
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity p-1 shrink-0"
              >
                ✕
              </button>
            </motion.div>
          ))}
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
