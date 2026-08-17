// Shared inline banner for the login form's error/success states — both
// used exactly the same shape (icon + message, role-differentiated), so
// this consolidates them into one component instead of two near-identical
// inline blocks. Colors match existing SpeakMate AI usage: red-50/red-600-700
// mirrors ForgotPassword.jsx's error banner; emerald-50/emerald-700 mirrors
// the "positive/complete" tone already used by WeeklyGoal.jsx.
const TONE_STYLES = {
  error: {
    role: "alert",
    wrapper: "border border-red-100 bg-red-50 text-red-700",
    icon: "text-red-500",
  },
  success: {
    role: "status",
    wrapper: "border border-emerald-100 bg-emerald-50 text-emerald-700",
    icon: "text-emerald-500",
  },
};

function AlertIcon({ tone }) {
  if (tone === "success") {
    return (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25 6-6.75M12 21a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function AdminAlert({ tone = "error", children }) {
  const config = TONE_STYLES[tone];

  return (
    <div role={config.role} className={`flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm font-medium ${config.wrapper}`}>
      <span className={config.icon}>
        <AlertIcon tone={tone} />
      </span>
      <span className="pt-0.5">{children}</span>
    </div>
  );
}

export default AdminAlert;
