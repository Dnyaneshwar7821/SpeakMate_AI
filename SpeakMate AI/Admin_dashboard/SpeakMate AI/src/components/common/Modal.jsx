import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * components/common/Modal.jsx
 *
 * Lightweight, accessible modal dialog built with the same visual
 * language as the rest of the app (framer-motion + Tailwind CSS variables).
 *
 * API:
 *   <Modal isOpen onClose title description maxWidth>
 *     {children}
 *   </Modal>
 *
 * Used by the Admin Panel (UserFormModal, DeleteUserDialog) but kept
 * generic so any future screen can reuse it.
 */
export function Modal({ isOpen, onClose, title, description, maxWidth = "max-w-lg", children }) {
    // Close on Escape + lock body scroll while open
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose?.();
        };

        document.addEventListener("keydown", handleKeyDown);
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = overflow;
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={onClose}
                            aria-hidden="true"
                        />

                        {/* Dialog */}
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-label={title}
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={`relative w-full ${maxWidth} rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl`}
                        >
                            {title && (
                                <h2 className="text-lg font-black text-[var(--text-primary)]">{title}</h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                            )}

                            <div className={title || description ? "mt-4" : ""}>{children}</div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default Modal;
