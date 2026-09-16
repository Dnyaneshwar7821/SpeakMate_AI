import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AdminInput from "../common/AdminInput";
import AdminButton from "../common/AdminButton";
import AdminAlert from "../common/AdminAlert";
import PasswordInput from "./PasswordInput";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { adminAuthService } from "../../services/adminAuthService";

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
  const [isVerifyingFirstTime, setIsVerifyingFirstTime] = useState(
    searchParams.get("firstTime") === "true" && !location.state?.resetSuccess
  );

  useEffect(() => {
    let isMounted = true;
    const isFirstTime = searchParams.get("firstTime") === "true";
    const emailParam = searchParams.get("email") || location.state?.email || "";

    // If user just reset password in this flow, keep them on the login page with success banner
    if (location.state?.resetSuccess) {
      if (emailParam) {
        setForm((prev) => ({ ...prev, email: emailParam }));
      }
      setIsVerifyingFirstTime(false);
      return;
    }

    if (!isFirstTime) {
      if (emailParam) {
        setForm((prev) => ({ ...prev, email: emailParam }));
      }
      setIsVerifyingFirstTime(false);
      return;
    }

    // Verify account setup status directly from the server database
    const verifySetupStatus = async () => {
      let needsSetup = true;
      if (emailParam) {
        try {
          const status = await adminAuthService.checkFirstTimeStatus(emailParam);
          if (typeof status === "boolean") {
            needsSetup = status;
          } else {
            const localPwdSet = localStorage.getItem(`pwd_set_${emailParam.toLowerCase().trim()}`) === "true";
            needsSetup = !localPwdSet;
          }
        } catch (_) {
          const localPwdSet = localStorage.getItem(`pwd_set_${emailParam.toLowerCase().trim()}`) === "true";
          needsSetup = !localPwdSet;
        }
      }

      if (!isMounted) return;

      if (needsSetup && forgotPasswordRoute) {
        // Needs temporary password setup
        navigate(
          `${forgotPasswordRoute}?email=${encodeURIComponent(emailParam || "")}&firstTime=true`,
          {
            replace: true,
            state: { email: emailParam || "", firstTime: true },
          }
        );
      } else {
        // Password already updated! Strip firstTime=true and allow direct sign-in with new password
        navigate(`${location.pathname}?email=${encodeURIComponent(emailParam || "")}`, { replace: true });
        if (emailParam) {
          setForm((prev) => ({ ...prev, email: emailParam }));
        }
        setIsVerifyingFirstTime(false);
      }
    };

    verifySetupStatus();

    return () => {
      isMounted = false;
    };
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

  if (isVerifyingFirstTime) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6C63FF] border-t-transparent" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">
          Verifying school admin access...
        </p>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      {location.state?.resetSuccess && (
        <AdminAlert tone="success">
          Your permanent password has been set successfully! Please log in with your new password.
        </AdminAlert>
      )}
      {location.state?.alreadySetup && (
        <AdminAlert tone="info">
          Your permanent password has already been configured. Please sign in below.
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
      <div className="flex items-center justify-between text-xs">
        <label htmlFor={`${role.toLowerCase()}-remember-me`} className="flex items-center gap-2 text-[var(--text-secondary)] font-medium cursor-pointer">
          <input
            id={`${role.toLowerCase()}-remember-me`}
            type="checkbox"
            checked={rememberMe}
            disabled={isLoading}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 rounded border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[#6C63FF] transition focus:ring-2 focus:ring-[#6C63FF]/20 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="font-bold text-[#6C63FF] transition hover:underline focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
