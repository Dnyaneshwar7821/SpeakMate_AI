import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import AdminInput from "../common/AdminInput";
import AdminButton from "../common/AdminButton";
import AdminAlert from "../common/AdminAlert";
import { useAdminPasswordReset } from "../../hooks/useAdminPasswordReset";

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export function AdminRequestOtpForm({
  role = "SCHOOL_ADMIN",
  emailPlaceholder = "admin@speakmate.ai",
  otpRoute,
  submitButtonText = "Send Verification Code",
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { requestOtp, isLoading, error, fieldErrors, clearErrors } = useAdminPasswordReset();

  const initialEmail = location.state?.email || searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);

  useEffect(() => {
    const effectiveEmail = location.state?.email || searchParams.get("email");
    if (effectiveEmail) {
      setEmail(effectiveEmail);
    }
  }, [searchParams, location.state]);

  const handleChange = (event) => {
    setEmail(event.target.value);
    if (error || fieldErrors.email) clearErrors();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanEmail = email.trim();
    const result = await requestOtp({ email: cleanEmail, role });

    if (result.success && otpRoute) {
      navigate(`${otpRoute}?email=${encodeURIComponent(cleanEmail)}`, {
        state: { email: cleanEmail },
      });
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      <AdminAlert tone="info">
        Enter your registered email address and we will send a 6-digit OTP verification code.
      </AdminAlert>

      {error && <AdminAlert tone="error">{error}</AdminAlert>}

      <AdminInput
        id={`${role.toLowerCase()}-forgot-email`}
        name="email"
        label="Email address"
        type="email"
        autoComplete="username"
        placeholder={emailPlaceholder}
        value={email}
        onChange={handleChange}
        icon={<MailIcon />}
        error={fieldErrors.email}
        disabled={isLoading}
        autoFocus
        required
      />

      <AdminButton
        type="submit"
        className="w-full mt-2"
        isLoading={isLoading}
        loadingText="Sending OTP Code..."
      >
        {submitButtonText}
      </AdminButton>
    </form>
  );
}

export default AdminRequestOtpForm;
