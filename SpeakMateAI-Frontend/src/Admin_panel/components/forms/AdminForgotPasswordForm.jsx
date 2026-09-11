import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AdminInput from "../common/AdminInput";
import AdminButton from "../common/AdminButton";
import AdminAlert from "../common/AdminAlert";
import PasswordInput from "./PasswordInput";
import { useAdminPasswordReset } from "../../hooks/useAdminPasswordReset";
import ROUTES from "@constants/routes";

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function getFallbackLoginRoute(role) {
  if (role === "SCHOOL_ADMIN") return ROUTES.SCHOOL_ADMIN_LOGIN;
  if (role === "TEACHER") return ROUTES.TEACHER_LOGIN;
  return ROUTES.ADMIN_LOGIN;
}

export function AdminForgotPasswordForm({
  role = "SCHOOL_ADMIN",
  emailPlaceholder,
  submitButtonText = "Set Permanent Password",
  loginRoute,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { resetWithTemporaryPassword, isLoading, error, fieldErrors, clearErrors } = useAdminPasswordReset();

  const isFirstTime = searchParams.get("firstTime") === "true" || Boolean(location.state?.firstTime);
  const initialEmail = location.state?.email || searchParams.get("email") || "";
  const initialTempPassword = location.state?.tempPassword || "";

  const [form, setForm] = useState({
    email: initialEmail,
    temporaryPassword: initialTempPassword,
    newPassword: "",
    confirmPassword: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const effectiveEmail = location.state?.email || searchParams.get("email");
    if (effectiveEmail) {
      setForm((prev) => ({ ...prev, email: effectiveEmail }));
    }
    if (location.state?.tempPassword) {
      setForm((prev) => ({ ...prev, temporaryPassword: location.state.tempPassword }));
    }
  }, [searchParams, location.state]);

  const targetLoginRoute = loginRoute || getFallbackLoginRoute(role);

  useEffect(() => {
    if (!isSuccess) return undefined;
    const timer = window.setTimeout(() => {
      navigate(
        `${targetLoginRoute}${form.email ? `?email=${encodeURIComponent(form.email)}` : ""}`,
        { replace: true, state: { email: form.email, resetSuccess: true } }
      );
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [isSuccess, targetLoginRoute, navigate, form.email]);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (error || fieldErrors[field]) clearErrors();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await resetWithTemporaryPassword({
      email: form.email,
      temporaryPassword: form.temporaryPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
      role,
    });

    if (result.success) {
      if (form.email) {
        try {
          localStorage.setItem(`pwd_set_${form.email.toLowerCase().trim()}`, "true");
        } catch (_) {}
      }
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="mt-6 space-y-4">
        <AdminAlert tone="success">
          Your permanent password has been set successfully! Redirecting you to the login page...
        </AdminAlert>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      {isFirstTime ? (
        <AdminAlert tone="info">
          First-Time Setup: Your account was configured with a temporary password. Please enter your temporary password and choose your new permanent password below.
        </AdminAlert>
      ) : (
        <AdminAlert tone="info">
          Enter the temporary password you received along with your new permanent password.
        </AdminAlert>
      )}

      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminInput
        id={`${role.toLowerCase()}-forgot-email`}
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
        id={`${role.toLowerCase()}-temp-password`}
        name="temporaryPassword"
        label="Temporary Password"
        autoComplete="current-password"
        placeholder="Enter your temporary password"
        value={form.temporaryPassword}
        onChange={handleChange("temporaryPassword")}
        error={fieldErrors.temporaryPassword}
        disabled={isLoading}
        required
      />

      <PasswordInput
        id={`${role.toLowerCase()}-new-password`}
        name="newPassword"
        label="New Permanent Password"
        autoComplete="new-password"
        placeholder="At least 8 characters (upper, lower, number)"
        value={form.newPassword}
        onChange={handleChange("newPassword")}
        error={fieldErrors.newPassword}
        disabled={isLoading}
        required
      />

      <PasswordInput
        id={`${role.toLowerCase()}-confirm-password`}
        name="confirmPassword"
        label="Confirm New Password"
        autoComplete="new-password"
        placeholder="Re-enter your new permanent password"
        value={form.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={fieldErrors.confirmPassword}
        disabled={isLoading}
        required
      />

      <AdminButton
        type="submit"
        className="w-full mt-2"
        isLoading={isLoading}
        loadingText="Saving Password..."
      >
        {submitButtonText}
      </AdminButton>
    </form>
  );
}

export default AdminForgotPasswordForm;
