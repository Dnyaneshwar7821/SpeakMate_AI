import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X, GraduationCap, School, ShieldCheck } from "lucide-react";
import ROUTES from "../../constants/routes";

export function AdminLoginModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const panels = [
    {
      title: "Teacher",
      subtitle: "Classroom oversight, student assignments & evaluations",
      route: ROUTES.TEACHER_LOGIN,
      icon: GraduationCap,
      badge: "Educator Portal",
      accent: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
      hoverRing: "hover:border-blue-500/40 hover:shadow-blue-500/5",
    },
    {
      title: "School Admin",
      subtitle: "Institutional dashboards, teachers, student rosters & results",
      route: ROUTES.SCHOOL_ADMIN_LOGIN,
      icon: School,
      badge: "Institution Portal",
      accent: "from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
      hoverRing: "hover:border-purple-500/40 hover:shadow-purple-500/5",
    },
    {
      title: "Super Admin",
      subtitle: "Super admin system metrics, full platform controls & billing",
      route: ROUTES.ADMIN_LOGIN,
      icon: ShieldCheck,
      badge: "Platform Portal",
      accent: "from-rose-500/10 to-amber-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
      hoverRing: "hover:border-rose-500/40 hover:shadow-rose-500/5",
    },
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto flex min-h-full items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-modal-title"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg my-auto rounded-3xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-2xl shadow-indigo-950/30 z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 mb-2">
            <span>🛡️</span>
            <span>Administrative Access</span>
          </div>
          <h2
            id="admin-login-modal-title"
            className="text-2xl font-black text-[var(--text-primary)] tracking-tight"
          >
            Login as Admin
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)] font-medium">
            Select your panel
          </p>
        </div>

        {/* Three Separate Clickable Cards */}
        <div className="space-y-3">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <Link
                key={panel.title}
                to={panel.route}
                onClick={onClose}
                className={`group flex items-center justify-between p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 hover:bg-[var(--bg-elevated)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${panel.hoverRing}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br border shadow-sm ${panel.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[var(--text-primary)] group-hover:text-[#6C63FF] transition-colors">
                        {panel.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)]">
                        {panel.badge}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--text-secondary)] truncate">
                      {panel.subtitle}
                    </p>
                  </div>
                </div>

                <span className="ml-3 shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all group-hover:scale-105 flex items-center gap-1 bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6]">
                  <span>Sign In</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            );
          })}
        </div>

        {/* Modal Footer Note */}
        <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>Are you a learner or student?</span>
          <Link
            to={ROUTES.LOGIN}
            onClick={onClose}
            className="font-bold text-[#6C63FF] hover:underline"
          >
            Learner Login →
          </Link>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}

export default AdminLoginModal;
