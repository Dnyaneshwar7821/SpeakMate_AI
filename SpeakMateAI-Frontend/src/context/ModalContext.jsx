import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState(null); // { type, title, message, confirmText, cancelText, resolve }

  const showConfirm = useCallback(({ title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    return new Promise((resolve) => {
      setModalState({
        mode: "confirm",
        title,
        message,
        confirmText,
        cancelText,
        type,
        resolve: (val) => {
          setModalState(null);
          resolve(val);
        },
      });
    });
  }, []);

  const showAlert = useCallback(({ title, message, buttonText = "OK", type = "info" }) => {
    return new Promise((resolve) => {
      setModalState({
        mode: "alert",
        title,
        message,
        buttonText,
        type,
        resolve: () => {
          setModalState(null);
          resolve(true);
        },
      });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ showConfirm, showAlert }}>
      {children}

      {/* Glassmorphic Modal Dialog Overlay */}
      <AnimatePresence>
        {modalState && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => modalState.resolve(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl space-y-5 text-[var(--text-primary)] z-10"
            >
              {/* Header Icon & Title */}
              <div className="flex items-start gap-4">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl shadow-inner ${
                    modalState.type === "danger"
                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-500"
                      : modalState.type === "warning"
                      ? "bg-amber-500/15 border border-amber-500/30 text-amber-500"
                      : "bg-[#6c63ff]/15 border border-[#6c63ff]/30 text-[#6c63ff]"
                  }`}
                >
                  {modalState.type === "danger" ? "🚨" : modalState.type === "warning" ? "⚠️" : "💬"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">{modalState.title}</h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1 leading-relaxed">
                    {modalState.message}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
                {modalState.mode === "confirm" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => modalState.resolve(false)}
                      className="px-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                    >
                      {modalState.cancelText}
                    </button>

                    <button
                      type="button"
                      onClick={() => modalState.resolve(true)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg transition-all ${
                        modalState.type === "danger"
                          ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
                          : modalState.type === "warning"
                          ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30"
                          : "bg-[#6c63ff] hover:bg-[#8b85ff] shadow-[#6c63ff]/30"
                      }`}
                    >
                      {modalState.confirmText}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => modalState.resolve(true)}
                    className="px-6 py-2.5 rounded-xl bg-[#6c63ff] text-white text-xs font-black shadow-lg shadow-[#6c63ff]/30 hover:bg-[#8b85ff] transition-all"
                  >
                    {modalState.buttonText}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
