import { useMemo, useState } from "react";

export function Input({ label, error, className = "", type, ...props }) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const inputType = useMemo(() => {
    if (!isPassword) return type;
    return showPassword ? "text" : "password";
  }, [isPassword, showPassword, type]);

  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">{label}</span>}

      <div className="relative">
        <input
          type={inputType}
          className={`h-11 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none transition placeholder-[var(--text-secondary)] focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 ${
            isPassword ? "pr-11" : ""
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm transition hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/20"
          >
            {showPassword ? (
              // Eye open
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              // Eye closed
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42" />
                <path d="M9.88 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a18.43 18.43 0 0 1-3.12 4.16" />
                <path d="M6.1 6.1C3.2 8.1 2 12 2 12s3.5 7 10 7c1.21 0 2.33-.22 3.34-.6" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && <span className="mt-2 block text-sm text-rose-500">{error}</span>}
    </label>
  );
}

export default Input;
