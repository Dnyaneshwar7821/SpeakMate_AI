import LoadingSpinner from "./LoadingSpinner";

// Same gradient family already used by the learner Navbar's logo chip and
// LogoSection (from-indigo-600 to-violet-500) — kept on-brand rather than
// inventing a new "admin" palette.
const VARIANTS = {
  primary:
    "bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-lg shadow-[#6C63FF]/25 hover:opacity-95 hover:shadow-xl hover:shadow-[#6C63FF]/30",
  secondary: "border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]",
  ghost: "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]",
  danger: "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500 active:bg-rose-700 focus:ring-rose-100",
};

export function AdminButton({
  children,
  className = "",
  variant = "primary",
  type = "button",
  isLoading = false,
  loadingText = "Please wait…",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" tone={variant === "primary" || variant === "danger" ? "light" : "muted"} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default AdminButton;
