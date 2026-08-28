import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail, KeyRound, ShieldCheck, CheckCircle2, RefreshCw, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { authService } from "../services/authService";
import ROUTES from "../constants/routes";

export function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: EMAIL, 2: OTP, 3: NEW_PASSWORD, 4: SUCCESS
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Password rules validation (matching mobile app policy)
  const passwordRules = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "At least one uppercase letter (A-Z)", test: (p) => /[A-Z]/.test(p) },
    { label: "At least one lowercase letter (a-z)", test: (p) => /[a-z]/.test(p) },
    { label: "At least one number (0-9)", test: (p) => /\d/.test(p) },
    { label: "At least one special character (!@#$%...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
  ];

  const passedRulesCount = passwordRules.filter((r) => r.test(newPassword)).length;
  const strengthPercentage = Math.round((passedRulesCount / passwordRules.length) * 100);

  const getStrengthColor = () => {
    if (passedRulesCount <= 2) return "bg-rose-500";
    if (passedRulesCount <= 4) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthLabel = () => {
    if (!newPassword) return "";
    if (passedRulesCount <= 2) return "Weak";
    if (passedRulesCount <= 4) return "Medium";
    return "Strong";
  };

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await authService.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      const successMsg = typeof response === "string" ? response : (response?.message || `A 6-digit OTP code has been sent to ${email.trim().toLowerCase()}`);
      setMessage(successMsg);
      setResendCooldown(30);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Failed to send password reset OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError("");
    setResending(true);
    try {
      const response = await authService.forgotPassword({
        email: email.trim().toLowerCase(),
      });
      const successMsg = typeof response === "string" ? response : (response?.message || `A fresh 6-digit OTP has been sent to ${email.trim().toLowerCase()}`);
      setMessage(successMsg);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!otp.trim() || otp.trim().length < 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const verifyRes = await authService.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      const token = verifyRes?.token || verifyRes?.data?.token;
      if (token) {
        setResetToken(token);
        setMessage("OTP verified successfully! Please enter your new password.");
        setStep(3);
      } else {
        setError("Invalid response received from server.");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Invalid or expired OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!resetToken) {
      setError("Session token missing. Please verify your OTP code again.");
      setStep(2);
      return;
    }
    if (passedRulesCount < 5) {
      setError("Please ensure your password meets all security requirements.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter your confirm password.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);
    try {
      const resetRes = await authService.resetPassword({
        token: resetToken,
        newPassword,
      });
      const successMsg = typeof resetRes === "string" ? resetRes : (resetRes?.message || "Password reset successfully!");
      setMessage(successMsg);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || "Unable to reset password. The link or OTP may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10 py-6">
      <div className="glass-card p-8 sm:p-10 rounded-3xl border border-[var(--border-default)] shadow-2xl space-y-6 text-center sm:text-left">
        
        {/* Step Indicator / Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#6C63FF]/15 border border-[#6C63FF]/30 text-[#6C63FF] grid place-items-center text-2xl shadow-md">
            {step === 1 && <Mail className="w-7 h-7" />}
            {step === 2 && <KeyRound className="w-7 h-7" />}
            {step === 3 && <ShieldCheck className="w-7 h-7" />}
            {step === 4 && <CheckCircle2 className="w-7 h-7 text-emerald-500" />}
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Verify OTP Code"}
            {step === 3 && "Create New Password"}
            {step === 4 && "Password Updated!"}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            {step === 1 && "Enter your registered email address to receive a 6-digit verification code."}
            {step === 2 && `Enter the 6-digit OTP code sent to ${email}`}
            {step === 3 && "Please choose a strong and secure new password for your account."}
            {step === 4 && "Your password has been successfully updated. You can now log in with your new credentials."}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 animate-fade-in">
            {error}
          </div>
        )}
        {message && step !== 4 && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 animate-fade-in">
            {message}
          </div>
        )}

        {/* STEP 1: EMAIL INPUT */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Sending Code..." : (
                <>
                  Send Verification Code <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link to={ROUTES.LOGIN} className="text-xs font-bold text-[#6C63FF] hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2 text-center">
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (error) setError("");
                }}
                required
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#6C63FF] bg-[var(--bg-elevated)] text-center text-3xl font-black tracking-[0.35em] text-[#6C63FF] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/20 transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] px-1">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || resending}
                className="text-[#6C63FF] hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Verifying OTP..." : (
                <>
                  Verify OTP Code <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              className="w-full text-center text-xs font-bold text-[var(--text-secondary)] hover:text-[#6C63FF] transition-colors cursor-pointer flex items-center justify-center gap-1"
              onClick={() => {
                setStep(1);
                setOtp("");
                setError("");
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change email address
            </button>
          </form>
        )}

        {/* STEP 3: CREATE & CONFIRM NEW PASSWORD */}
        {step === 3 && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            {/* New Password */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  autoFocus
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-[var(--text-muted)] hover:text-[#6C63FF] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-2 p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-left">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-[var(--text-secondary)]">Password Strength:</span>
                  <span className={`font-black ${passedRulesCount === 5 ? "text-emerald-500" : passedRulesCount >= 3 ? "text-amber-500" : "text-rose-500"}`}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${strengthPercentage}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-1 pt-1 text-[11px]">
                  {passwordRules.map((rule, idx) => {
                    const isValid = rule.test(newPassword);
                    return (
                      <div key={idx} className={`flex items-center gap-1.5 font-bold ${isValid ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                        <span>{isValid ? "✓" : "○"}</span>
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  required
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-[var(--text-muted)] hover:text-[#6C63FF] transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || passedRulesCount < 5 || !confirmPassword}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Resetting Password..." : "Reset Password ✓"}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="space-y-5 text-center pt-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
              🎉 Your password has been successfully updated! You can now log in with your new credentials.
            </div>

            <Link
              to={ROUTES.LOGIN}
              className="inline-block w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 hover:scale-[1.02] active:scale-95 transition-all"
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
