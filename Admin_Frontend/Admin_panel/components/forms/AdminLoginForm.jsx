import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AdminInput from "../common/AdminInput";
import AdminButton from "../common/AdminButton";
import AdminAlert from "../common/AdminAlert";
import PasswordInput from "./PasswordInput";
import { useAdminAuth } from "../../hooks/useAdminAuth";

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

export function AdminLoginForm({
  role,
  emailPlaceholder,
  buttonText,
  forgotPasswordRoute,
  dashboardRoute,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login, isLoading, error, fieldErrors, clearErrors } = useAdminAuth();

  const initialEmail = location.state?.email || searchParams.get("email") || "";
  const [form, setForm] = useState({
    email: initialEmail,
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const isFirstTime = searchParams.get("firstTime") === "true";
    const emailParam = searchParams.get("email") || location.state?.email || "";
    const isPwdAlreadySet =
      Boolean(emailParam) &&
      (localStorage.getItem(`pwd_set_${emailParam.toLowerCase().trim()}`) === "true" || Boolean(location.state?.resetSuccess));

    if (isFirstTime && !isPwdAlreadySet && forgotPasswordRoute) {
      navigate(`${forgotPasswordRoute}?email=${encodeURIComponent(emailParam || "")}&firstTime=true`, {
        replace: true,
        state: { email: emailParam || "", firstTime: true },
      });
      return;
    }

    if (isFirstTime && isPwdAlreadySet) {
      navigate(`${location.pathname}?email=${encodeURIComponent(emailParam || "")}`, { replace: true });
      return;
    }

    const effectiveEmail = location.state?.email || searchParams.get("email");
    if (effectiveEmail) {
      setForm((prev) => ({ ...prev, email: effectiveEmail }));
    }
  }, [searchParams, location.state, forgotPasswordRoute, navigate, location.pathname]);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (error || fieldErrors[field]) clearErrors();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login({ ...form, role, rememberMe });
    if (result?.needsPasswordReset) {
      navigate(`${forgotPasswordRoute}?email=${encodeURIComponent(result.email || form.email)}&firstTime=true`, {
        replace: true,
        state: { email: result.email || form.email, firstTime: true, tempPassword: form.password },
      });
      return;
    }
    if (result.success) navigate(dashboardRoute, { replace: true });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      {location.state?.resetSuccess && (
        <AdminAlert tone="success">
          Your permanent password has been set successfully! Please log in with your new password.
        </AdminAlert>
      )}
      {error && <AdminAlert tone="error">{error}</AdminAlert>}
      <AdminInput
        id={`${role.toLowerCase()}-email`}
        name="email"
        label="Email address"
        type="email"
        autoComplete="username"
        placeholder={emailPlaceholder}
        value={form.email}
        onChange={handleChange("email")}
        icon={<MailIcon />}
        error={fieldErrors.email}
        disabled={isLoading}
        required
      />
      <PasswordInput
        id={`${role.toLowerCase()}-password`}
        name="password"
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={form.password}
        onChange={handleChange("password")}
        error={fieldErrors.password}
        disabled={isLoading}
        required
      />
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={`${role.toLowerCase()}-remember-me`} className="flex items-center gap-2 text-slate-600">
          <input
            id={`${role.toLowerCase()}-remember-me`}
            type="checkbox"
            checked={rememberMe}
            disabled={isLoading}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 transition focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
          Remember me
        </label>
        <button
          type="button"
          disabled={isLoading}
          onClick={() =>
            navigate(
              form.email
                ? `${forgotPasswordRoute}?email=${encodeURIComponent(form.email)}`
                : forgotPasswordRoute,
              { state: { email: form.email } }
            )
          }
          className="font-semibold text-indigo-600 transition hover:text-indigo-500 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Forgot password?
        </button>
      </div>
      <AdminButton type="submit" className="w-full" isLoading={isLoading} loadingText="Signing In...">
        {buttonText}
      </AdminButton>
    </form>
  );
}

export default AdminLoginForm;
