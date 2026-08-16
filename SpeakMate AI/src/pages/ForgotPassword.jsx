import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Input from "@components/common/Input";
import { authService } from "../services/authService";
import ROUTES from "../constants/routes";

export function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await authService.forgotPassword({ email });
      const msg = typeof response === "string" ? response : (response?.message || `6-digit OTP sent to ${email}`);
      setMessage(msg);
      setStep(2);
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || "Failed to send OTP. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setResending(true);
    try {
      const response = await authService.forgotPassword({ email });
      const msg = typeof response === "string" ? response : (response?.message || `A new 6-digit OTP code was sent to ${email}`);
      setMessage(msg);
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || "Failed to resend OTP code.");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyAndReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const verifyRes = await authService.verifyOtp({ email: email.trim(), otp: otp.trim() });
      const token = verifyRes?.token || verifyRes?.data?.token;

      if (!token) {
        throw new Error("Failed to obtain verification token. Please request a new OTP code.");
      }

      const resetRes = await authService.resetPassword({ token, newPassword });
      const msg = typeof resetRes === "string" ? resetRes : (resetRes?.message || "Password reset successfully!");
      setMessage(msg);
      setStep(3);
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || err.message || "Invalid OTP code or failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/10 text-2xl font-extrabold text-indigo-600">
          🔑
        </div>
        <h1 className="text-2xl font-black text-slate-950">
          {step === 1 ? "Forgot your password?" : step === 2 ? "Enter OTP & New Password" : "Password Reset Complete"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {step === 1
            ? "Enter your registered email address to receive a 6-digit OTP verification code."
            : step === 2
            ? `Enter the 6-digit OTP sent to ${email} and choose a new password.`
            : "Your password has been successfully updated. You can now log in with your new password."}
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700 border border-indigo-100">
          {message}
        </div>
      )}

      {step === 1 && (
        <form className="mt-6 space-y-5" onSubmit={handleSendOtp}>
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending OTP Code..." : "Send OTP Code"}
          </Button>

          <div className="pt-2 text-center">
            <Link to={ROUTES.LOGIN} className="text-xs font-bold text-indigo-600 hover:underline">
              ← Return to Login
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <form className="mt-6 space-y-5" onSubmit={handleVerifyAndReset}>
          <Input
            label="6-Digit OTP Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password (min. 8 chars)"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifying & Updating..." : "Verify OTP & Reset Password"}
          </Button>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              className="font-semibold text-slate-500 hover:text-indigo-600 transition"
              onClick={() => {
                setStep(1);
                setError("");
                setMessage("");
              }}
              disabled={loading}
            >
              ← Change email
            </button>
            <button
              type="button"
              className="font-semibold text-indigo-600 hover:underline disabled:opacity-50"
              onClick={handleResendOtp}
              disabled={loading || resending}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="mt-6 text-center space-y-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
            ✓
          </div>
          <p className="text-sm font-medium text-slate-700">
            Your account password has been reset successfully.
          </p>
          <Link to={ROUTES.LOGIN} className="inline-block w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20">
              Log In Now
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default ForgotPassword;
