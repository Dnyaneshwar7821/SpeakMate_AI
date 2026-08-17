import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminButton from "../common/AdminButton";
import AdminAlert from "../common/AdminAlert";
import PasswordInput from "./PasswordInput";
import { useAdminPasswordReset } from "../../hooks/useAdminPasswordReset";

const SUCCESS_REDIRECT_DELAY_MS = 2000;

export function AdminResetPasswordForm({
  email,
  role,
  buttonText = "Reset Password",
  loginRoute,
}) {
  const navigate = useNavigate();
  const { resetPassword, isLoading, error, fieldErrors, clearErrors } = useAdminPasswordReset();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!isSuccess) return undefined;
    const timer = window.setTimeout(() => navigate(loginRoute, { replace: true }), SUCCESS_REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isSuccess, loginRoute, navigate]);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (error || fieldErrors[field]) clearErrors();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await resetPassword({ email, ...form, role });
    if (result.success) setIsSuccess(true);
  };

  if (isSuccess) {
    return <div className="mt-6"><AdminAlert tone="success">Password reset successfully. Redirecting you to the login page…</AdminAlert></div>;
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      {error && <AdminAlert tone="error">{error}</AdminAlert>}
      <PasswordInput
        id={`${role.toLowerCase()}-reset-password`}
        name="password"
        label="New Password"
        autoComplete="new-password"
        placeholder="Enter your new password"
        value={form.password}
        onChange={handleChange("password")}
        error={fieldErrors.password}
        disabled={isLoading}
        required
      />
      <PasswordInput
        id={`${role.toLowerCase()}-reset-confirm-password`}
        name="confirmPassword"
        label="Confirm Password"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        value={form.confirmPassword}
        onChange={handleChange("confirmPassword")}
        error={fieldErrors.confirmPassword}
        disabled={isLoading}
        required
      />
      <AdminButton type="submit" className="w-full" isLoading={isLoading} loadingText="Resetting Password...">
        {buttonText}
      </AdminButton>
    </form>
  );
}

export default AdminResetPasswordForm;
