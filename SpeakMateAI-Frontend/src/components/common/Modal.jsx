import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  maxWidth = "max-w-lg",
  children,
}) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} max-h-[94vh] flex flex-col rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-7 shadow-2xl z-10`}
      >
        {(title || description) && (
          <div className="mb-4 shrink-0 flex items-start justify-between gap-4">
            <div>
              {title && <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{title}</h3>}
              {description && (
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition dark:hover:bg-slate-800 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        <div ref={contentRef} className="overflow-y-auto pr-2 thin-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
