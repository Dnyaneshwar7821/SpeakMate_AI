export function AdminInput({ id, label, error, icon, className = "", type = "text", ...props }) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`admin-auth-input h-11 w-full rounded-xl border bg-white text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 ease-out placeholder:text-slate-400 focus:shadow-md focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none ${error
              ? "border-rose-300 hover:border-rose-400 focus:border-rose-500 focus:ring-rose-100"
              : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
            } ${icon ? "pl-10 pr-3" : "px-3"} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <span id={describedBy} className="mt-2 block text-sm text-rose-600">
          {error}
        </span>
      )}
    </div>
  );
}

export default AdminInput;
