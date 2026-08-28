import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  RefreshCw,
  Send,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { authService } from "../services/authService";
import ROUTES from "../constants/routes";

export function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  // OTP state: 'IDLE' | 'SENDING' | 'SENT' | 'VERIFIED'
  const [otpState, setOtpState] = useState("IDLE");
  const [otpError, setOtpError] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Password criteria computation
  const passwordChecks = useMemo(() => {
    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length;
  }, [passwordChecks]);

  const passwordStrengthLabel = useMemo(() => {
    if (!password) return { label: "None", color: "bg-slate-200 dark:bg-slate-700", text: "text-slate-400" };
    if (passwordScore <= 2) return { label: "Weak", color: "bg-rose-500", text: "text-rose-500" };
    if (passwordScore <= 4) return { label: "Medium", color: "bg-amber-500", text: "text-amber-500" };
    return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500" };
  }, [password, passwordScore]);

  const validateEmailOnly = () => {
    if (!email.trim()) return "Please enter an email address first.";
    if (!/\S+@\S+\.\S+/.test(email.trim())) return "Please enter a valid email address.";
    return null;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const emailErr = validateEmailOnly();
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setError("");
    setOtpError("");
    setOtpState("SENDING");

    try {
      const emailLower = email.trim().toLowerCase();
      await authService.sendRegistrationOtp({ email: emailLower });
      setOtpState("SENT");
    } catch (err) {
      setOtpState("IDLE");
      const serverMsg =
        err.response?.data?.message ||
        err.userMessage ||
        "Failed to send OTP verification code. Please check your email.";
      setError(serverMsg);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const emailErr = validateEmailOnly();
    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (!otp.trim() || otp.trim().length < 6) {
      setOtpError("Please enter the 6-digit OTP code sent to your email.");
      return;
    }

    setVerifyingOtp(true);
    setOtpError("");
    setError("");

    try {
      const emailLower = email.trim().toLowerCase();
      await authService.verifyRegistrationOtp({
        email: emailLower,
        otp: otp.trim(),
      });
      setOtpState("VERIFIED");
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.userMessage ||
        "Invalid OTP verification code. Please check your email and try again.";
      setOtpError(serverMsg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const validateFullForm = () => {
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!email.trim()) return "Email address is required.";
    if (!/\S+@\S+\.\S+/.test(email.trim())) return "Please enter a valid email address.";
    if (otpState !== "VERIFIED") {
      if (otpState === "IDLE") return 'Please click "Send OTP" next to your email and verify your code.';
      if (!otp.trim()) return "Please enter the 6-digit OTP code sent to your email.";
      if (otp.trim().length < 6) return "OTP code must be 6 digits.";
      return 'Please click "Verify OTP" to verify your code before continuing.';
    }
    if (!password) return "Password is required.";
    if (passwordScore < 5) {
      return "Password needs at least 8 characters, uppercase, lowercase, number, and special character.";
    }
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    const emailLower = email.trim().toLowerCase();

    // Auto-verify OTP if user typed 6 digits but didn't click "Verify OTP" separately
    if (otpState !== "VERIFIED" && otp.trim().length === 6) {
      setLoading(true);
      setError("");
      setOtpError("");
      try {
        await authService.verifyRegistrationOtp({
          email: emailLower,
          otp: otp.trim(),
        });
        setOtpState("VERIFIED");
      } catch (err) {
        setLoading(false);
        const serverMsg =
          err.response?.data?.message ||
          err.userMessage ||
          "Invalid OTP verification code. Please check your email.";
        setOtpError(serverMsg);
        return;
      }
    }

    const validationError = validateFullForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    setError("");
    setLoading(true);

    try {
      localStorage.setItem("speakmate_account_type", "INDIVIDUAL_USER");
      await authService.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: emailLower,
        password,
        confirmPassword,
        otp: otp.trim(),
        accountType: "INDIVIDUAL_USER",
      });
      setOtpState("VERIFIED");
      setRegistered(true);
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.userMessage ||
        "Registration failed. Please verify your details and try again.";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto relative z-10 py-6">
      <div className="glass-card p-6 sm:p-10 rounded-3xl border border-[var(--border-default)] shadow-2xl space-y-6 relative bg-[var(--bg-card)]">

        {/* ── Success State Screen ── */}
        {registered ? (
          <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={44} className="animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Account Created!</h2>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto font-medium">
                Your email <strong className="text-[var(--text-primary)]">{email}</strong> has been verified and your account was created successfully.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(ROUTES.LOGIN)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#8B5CF6] hover:from-[#5B52E0] hover:to-[#7A4BE5] text-white text-sm font-black shadow-xl shadow-[#6C63FF]/30 transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Login</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          /* ── Registration Form View ── */
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#6C63FF] via-[#7C74FF] to-[#FF6584] flex items-center justify-center text-2xl shadow-lg shadow-[#6C63FF]/30">
                🗣️
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Create Account</h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                Start your journey to fluent English today
              </p>
            </div>

            {/* School Student Direct Login Notice */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between text-xs text-[var(--text-primary)] gap-2">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="text-[#6C63FF] shrink-0" size={20} />
                <span className="font-semibold text-xs leading-snug">
                  <strong>School Student?</strong> Your school created your account.
                </span>
              </div>
              <Link
                to={ROUTES.LOGIN}
                className="px-3 py-1.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B52E0] text-white text-[11px] font-black shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                Log In ➔
              </Link>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <p className="font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleRegister}>
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); if (error) setError(""); }}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => { setLastName(e.target.value); if (error) setError(""); }}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                </div>
              </div>

              {/* Email Address with Integrated Send OTP Action */}
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-base text-[var(--text-muted)] pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="jane.doe@example.com"
                    value={email}
                    disabled={otpState === "VERIFIED"}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                      if (otpState !== "IDLE") {
                        setOtpState("IDLE");
                        setOtp("");
                        setOtpError("");
                      }
                    }}
                    required
                    className="w-full pl-11 pr-28 sm:pr-32 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all disabled:opacity-75 disabled:bg-emerald-500/5"
                  />

                  {/* Inline OTP Button Status */}
                  <div className="absolute right-2">
                    {otpState === "SENDING" ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : otpState === "SENT" ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw size={12} />
                        <span>Resend OTP</span>
                      </button>
                    ) : otpState === "VERIFIED" ? (
                      <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-1">
                        <CheckCircle2 size={14} />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Send size={12} />
                        <span>Send OTP</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline OTP Section (Unfolds when OTP is sent) */}
              {otpState === "SENT" && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={16} />
                      <span>Enter 6-digit code sent to <strong>{email}</strong></span>
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.trim());
                        if (otpError) setOtpError("");
                        if (error) setError("");
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-500/40 bg-[var(--bg-elevated)] text-center text-lg font-black tracking-widest text-[#6C63FF] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.trim().length < 6}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {verifyingOtp ? <RefreshCw size={14} className="animate-spin" /> : "Verify OTP"}
                    </button>
                  </div>

                  {otpError && (
                    <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{otpError}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Verified Confirmation Banner */}
              {otpState === "VERIFIED" && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                  <CheckCircle2 size={18} />
                  <span>Email verified ✓ ({email})</span>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)] pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create strong password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-2 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[var(--text-secondary)]">Password Strength:</span>
                      <span className={passwordStrengthLabel.text}>{passwordStrengthLabel.label}</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full ${passwordStrengthLabel.color} transition-all duration-300`}
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
                      />
                    </div>
                    {/* Criteria check tags */}
                    <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] font-semibold text-[var(--text-secondary)]">
                      <span className={passwordChecks.length ? "text-emerald-500 font-bold" : "opacity-60"}>
                        {passwordChecks.length ? "✓" : "○"} 8+ Characters
                      </span>
                      <span className={passwordChecks.upper ? "text-emerald-500 font-bold" : "opacity-60"}>
                        {passwordChecks.upper ? "✓" : "○"} 1 Uppercase (A-Z)
                      </span>
                      <span className={passwordChecks.lower ? "text-emerald-500 font-bold" : "opacity-60"}>
                        {passwordChecks.lower ? "✓" : "○"} 1 Lowercase (a-z)
                      </span>
                      <span className={passwordChecks.number && passwordChecks.special ? "text-emerald-500 font-bold" : "opacity-60"}>
                        {passwordChecks.number && passwordChecks.special ? "✓" : "○"} Number & Special
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)] pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
                    required
                    className="w-full pl-11 pr-12 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              {/* Create Account Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#8B5CF6] hover:from-[#5B52E0] hover:to-[#7A4BE5] text-white text-sm font-black shadow-xl shadow-[#6C63FF]/30 transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-[var(--border-default)] space-y-2">
              <p className="text-xs text-[var(--text-muted)] font-medium">
                Already have an account?{" "}
                <Link to={ROUTES.LOGIN} className="font-extrabold text-[#6C63FF] hover:underline">
                  Sign in
                </Link>
              </p>
              <p className="text-[11px] text-[var(--text-muted)] font-medium opacity-80">
                By creating an account you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
