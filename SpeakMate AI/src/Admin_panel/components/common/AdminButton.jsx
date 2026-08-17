import LoadingSpinner from "./LoadingSpinner";

// Same gradient family already used by the learner Navbar's logo chip and
// LogoSection (from-indigo-600 to-violet-500) — kept on-brand rather than
// inventing a new "admin" palette.
const VARIANTS = {
  primary:
    "bg-gradient-to-r from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-400 hover:shadow-xl hover:shadow-indigo-600/30",
  secondary: "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
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
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" tone={variant === "primary" ? "light" : "muted"} />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default AdminButton;
