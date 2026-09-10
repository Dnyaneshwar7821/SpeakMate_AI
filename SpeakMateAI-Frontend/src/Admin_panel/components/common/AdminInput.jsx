import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function AdminInput({ id, label, error, icon, className = "", type = "text", ...props }) {
  const describedBy = error ? `${id}-error` : undefined;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`admin-auth-input h-11 w-full rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] shadow-sm outline-none transition-all duration-200 ease-out placeholder:text-[var(--text-muted)] focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 disabled:cursor-not-allowed disabled:opacity-60 ${error
              ? "!border-rose-500 focus:!ring-rose-500/20"
              : "hover:border-[#6C63FF]/40"
            } ${icon ? "pl-10" : "pl-3.5"} ${isPassword ? "pr-10" : "pr-3.5"} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {error && (
        <span id={describedBy} className="mt-1.5 block text-xs font-semibold text-rose-500">
          {error}
        </span>
      )}
    </div>
  );
}

export default AdminInput;
