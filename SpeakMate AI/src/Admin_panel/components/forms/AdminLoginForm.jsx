import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { login, isLoading, error, fieldErrors, clearErrors } = useAdminAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    if (error || fieldErrors[field]) clearErrors();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await login({ ...form, role, rememberMe });
    if (result.success) navigate(dashboardRoute, { replace: true });
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
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
          onClick={() => navigate(forgotPasswordRoute)}
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
