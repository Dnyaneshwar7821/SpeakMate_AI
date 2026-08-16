import { useMemo, useState } from "react";

export function Input({ label, error, className = "", type, ...props }) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const inputType = useMemo(() => {
    if (!isPassword) return type;
    return showPassword ? "text" : "password";
  }, [isPassword, showPassword, type]);

  return (
    <label className="block w-full">
      {label && (
        <span className="mb-2 block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
          {label}
        </span>
      )}

      <div className="relative w-full">
        <input
          type={inputType}
          className={`h-12 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 text-sm sm:text-base font-bold text-[var(--text-primary)] outline-none transition-all placeholder:text-[var(--text-secondary)]/60 focus:border-[#6c63ff] focus:ring-4 focus:ring-[#6c63ff]/15 ${
            isPassword ? "pr-12" : ""
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[#6c63ff] hover:bg-[#6c63ff]/10 focus:outline-none transition-colors"
          >
            {showPassword ? (
              // Eye OPEN (when password is shown)
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
              // Eye SLASH / CLOSED (when password is hidden)
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
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && <span className="mt-2 block text-xs font-bold text-rose-500">{error}</span>}
    </label>
  );
}

export default Input;

