import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = "max-w-lg",
  className = "",
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] flex flex-col rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-md)] my-auto overflow-hidden z-10 ${className}`}
      >
        {(title || onClose) && (
          <div className="px-6 pt-5 pb-4 border-b border-[var(--border-subtle)] flex-shrink-0 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {title && <h3 className="text-lg font-bold text-[var(--text-primary)] truncate">{title}</h3>}
              {description && (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div className="p-5 sm:p-6 overflow-y-auto min-h-0 flex-1 thin-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;

