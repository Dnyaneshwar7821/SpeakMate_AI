import { useState } from "react";

// Eye/eye-off icon paths match src/components/common/Input.jsx exactly,
// so the show/hide affordance looks identical across learner and admin.
export function PasswordInput({ id, label, error, className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`h-11 w-full rounded-xl border bg-white py-2 pl-3 pr-11 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 ease-out placeholder:text-slate-400 focus:shadow-md focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none ${
            error
              ? "border-rose-300 hover:border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
          } ${className}`}
          {...props}
        />

        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={props.disabled}
          onClick={() => setVisible((value) => !value)}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 ease-out hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-500"
        >
          {visible ? (
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
      </div>

      {error && (
        <span id={describedBy} className="mt-2 block text-sm text-rose-600">
          {error}
        </span>
      )}
    </div>
  );
}

export default PasswordInput;
