export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}) {
  const variants = {
    primary:
      "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:bg-indigo-700 dark:shadow-indigo-950/40",
    secondary:
      "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
    ghost:
      "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100",
    danger:
      "bg-rose-600 text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 active:bg-rose-700 focus:ring-rose-200 dark:bg-rose-600 dark:hover:bg-rose-500",
  };

  return (
    <button
      type={type}
      className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
