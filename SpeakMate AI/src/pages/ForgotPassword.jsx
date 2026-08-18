import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";
import ROUTES from "../constants/routes";

export function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Reset, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.data?.message || `6-digit OTP code sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send password reset OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const verifyRes = await authService.verifyOtp(email, otp);
      const token = verifyRes.data.token;
      setResetToken(token);

      const resetRes = await authService.resetPassword(token, newPassword);
      setMessage(resetRes.data?.message || "Password reset successfully!");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code or failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-[var(--border-default)] shadow-2xl space-y-6 text-center sm:text-left">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 text-[#6C63FF] grid place-items-center text-2xl shadow-md">
            🔐
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {step === 1 ? "Forgot Password?" : step === 2 ? "Verify OTP Code" : "Password Updated"}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            {step === 1
              ? "Enter your registered email address to receive a 6-digit verification code."
              : step === 2
              ? `Enter the 6-digit OTP sent to ${email} and choose a new password.`
              : "Your password has been successfully updated. You can now log in."}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {message}
          </div>
        )}

        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Sending OTP..." : "Send Verification OTP →"}
            </button>

            <div className="text-center pt-2">
              <Link to={ROUTES.LOGIN} className="text-xs font-bold text-[#6C63FF] hover:underline">
                ← Back to Log In
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleVerifyAndReset}>
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#6C63FF] bg-[var(--bg-elevated)] text-center text-2xl font-black tracking-[0.3em] text-[#6C63FF] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 active:scale-95 transition-all"
            >
              {loading ? "Resetting Password..." : "Verify OTP & Reset Password ✓"}
            </button>

            <button
              type="button"
              className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:text-[#6C63FF]"
              onClick={() => setStep(1)}
            >
              ← Change email address
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center pt-2">
            <Link
              to={ROUTES.LOGIN}
              className="inline-block w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 hover:scale-105 transition-transform"
            >
              Go to Log In →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
