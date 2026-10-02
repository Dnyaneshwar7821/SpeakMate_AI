import { useState } from "react";
import { Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { sanitizeMobileInput, getMobileInputStatus } from "@utils/phoneValidator";

/**
 * PhoneInput.jsx
 *
 * Standard Indian Mobile Phone Number Input Component.
 * - Strictly accepts digits 0-9 (no letters, spaces, or special characters).
 * - Maximum 10 digits hard limit (cannot exceed 10 digits).
 * - Immediate on-screen validation if starting digit is not 6, 7, 8, or 9.
 * - Real-time visual feedback:
 *     - Live counter (X/10 digits)
 *     - Limit indicator: "10-digit limit reached (cannot exceed 10 digits)"
 *     - Attempts to type past 10 digits trigger prominent on-screen feedback.
 */
export function PhoneInput({
  label = "Phone Number",
  value = "",
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  placeholder = "e.g. 9876543210",
  id,
  className = "",
  showLimitNotice = true,
  icon = true,
  ...props
}) {
  const [limitWarning, setLimitWarning] = useState(false);

  const rawString = String(value || "");
  const digits = rawString.replace(/\D/g, "").slice(0, 10);
  const count = digits.length;
  const isAtLimit = count === 10;
  const hasInvalidStart = count > 0 && !/^[6-9]/.test(digits);

  const handleKeyDown = (e) => {
    // Allow navigational keys, backspace, delete, copy/paste shortcuts
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }

    // If trying to type a digit when already at 10 digits
    if (/^\d$/.test(e.key) && count >= 10) {
      // Check if user has highlighted text to replace
      const selection = window.getSelection()?.toString() || "";
      if (!selection) {
        e.preventDefault();
        setLimitWarning(true);
        setTimeout(() => setLimitWarning(false), 3000);
        return;
      }
    }

    // Block non-digit keys entirely (no letters, symbols, spaces)
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const rawVal = e?.target ? e.target.value : e;
    const sanitized = sanitizeMobileInput(rawVal, 10);

    // If user attempted to enter more than 10 digits
    if (String(rawVal).replace(/\D/g, "").length > 10) {
      setLimitWarning(true);
      setTimeout(() => setLimitWarning(false), 3000);
    }

    if (onChange) {
      if (e?.target) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: sanitized, name: e.target.name },
        };
        onChange(syntheticEvent);
      } else {
        onChange(sanitized);
      }
    }
  };

  // Determine active error to display
  let activeError = error;
  if (!activeError && hasInvalidStart) {
    activeError = "Mobile number must start with 6, 7, 8, or 9";
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        )}

        {showLimitNotice && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md transition-all flex items-center gap-1 ${
              isAtLimit
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold"
                : count > 0
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : "text-[var(--text-muted)] text-[11px]"
            }`}
          >
            {isAtLimit && <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
            {count}/10 digits
          </span>
        )}
      </div>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <Phone className="h-4 w-4" />
          </span>
        )}

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          pattern="[0-9]*"
          maxLength={10}
          value={digits}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(activeError)}
          className={`h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-950/50 ${
            icon ? "!pl-9" : ""
          } ${
            activeError
              ? "!border-rose-500 focus:!ring-rose-500/20"
              : limitWarning || isAtLimit
              ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
              : ""
          } ${className}`}
          {...props}
        />
      </div>

      {/* On-screen visual validation & limit indicator */}
      {activeError ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-rose-500 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {activeError}
        </span>
      ) : limitWarning ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          10-digit limit reached — cannot exceed 10 digits
        </span>
      ) : isAtLimit ? (
        <span className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
          10-digit limit reached (valid 10-digit mobile number)
        </span>
      ) : count > 0 && !hasInvalidStart ? (
        <span className="mt-1.5 block text-xs font-medium text-blue-600 dark:text-blue-400 animate-fadeIn">
          {count}/10 digits entered ({10 - count} more digits needed)
        </span>
      ) : helperText ? (
        <span className="mt-1.5 block text-xs text-[var(--text-muted)]">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export default PhoneInput;
