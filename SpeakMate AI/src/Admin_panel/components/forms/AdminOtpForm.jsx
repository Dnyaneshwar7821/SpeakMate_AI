import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminButton from "../common/AdminButton";
import AdminAlert from "../common/AdminAlert";
import { useAdminPasswordReset } from "../../hooks/useAdminPasswordReset";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export function AdminOtpForm({
  email,
  role,
  verifyButtonText = "Verify OTP",
  resendButtonText = "Resend OTP",
  resetPasswordRoute,
}) {
  const navigate = useNavigate();
  const { requestOtp, verifyOtp, isLoading, error, fieldErrors, clearErrors } = useAdminPasswordReset();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index) => (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    setDigits((previous) => previous.map((digit, digitIndex) => (digitIndex === index ? value : digit)));
    if (error || fieldErrors.otp) clearErrors();
    if (resendMessage) setResendMessage("");
    if (value && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index) => (event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    event.preventDefault();
    setDigits(Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? ""));
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await verifyOtp({ email, otp: digits.join(""), role });
    if (result.success) navigate(resetPasswordRoute, { state: { email } });
  };

  const handleResend = async () => {
    setResendMessage("");
    setIsResending(true);
    const result = await requestOtp({ email, role });
    setIsResending(false);
    if (result.success) {
      setDigits(Array(OTP_LENGTH).fill(""));
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setResendMessage("A new OTP has been sent to your email.");
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
      {error && <AdminAlert tone="error">{error}</AdminAlert>}
      {!error && resendMessage && <AdminAlert tone="success">{resendMessage}</AdminAlert>}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Enter the 6-digit OTP</label>
        <div className="flex items-center justify-between gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(node) => { inputRefs.current[index] = node; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={handleDigitChange(index)}
              onKeyDown={handleKeyDown(index)}
              onPaste={handlePaste}
              aria-label={`OTP digit ${index + 1}`}
              aria-invalid={Boolean(fieldErrors.otp)}
              className={`h-12 w-12 rounded-xl border bg-white text-center text-lg font-bold text-slate-900 shadow-sm outline-none transition-all duration-200 ease-out focus:shadow-md focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:shadow-none ${fieldErrors.otp ? "border-rose-300 hover:border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"}`}
            />
          ))}
        </div>
        {fieldErrors.otp && <span className="mt-2 block text-sm text-rose-600">{fieldErrors.otp}</span>}
      </div>
      <AdminButton type="submit" className="w-full" isLoading={isLoading} loadingText="Verifying...">
        {verifyButtonText}
      </AdminButton>
      <div className="text-center text-sm text-slate-600">
        {cooldown > 0 ? (
          <span>Resend OTP in 0:{String(cooldown).padStart(2, "0")}</span>
        ) : (
          <button type="button" disabled={isResending} onClick={handleResend} className="font-semibold text-indigo-600 transition hover:text-indigo-500 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-50">
            {isResending ? "Resending..." : resendButtonText}
          </button>
        )}
      </div>
    </form>
  );
}

export default AdminOtpForm;
