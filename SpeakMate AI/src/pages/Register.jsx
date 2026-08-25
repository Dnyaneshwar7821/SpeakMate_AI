import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "../services/authService";
import ROUTES from "../constants/routes";

export function Register() {
  const navigate = useNavigate();

  // Step 1: Input details, Step 2: Input OTP
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your First Name and Last Name.");
      return;
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      setError("Please enter a valid Email Address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Password complexity check
    const hasUpper = /[A-Z]/.test(form.password);
    const hasLower = /[a-z]/.test(form.password);
    const hasDigit = /[0-9]/.test(form.password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{}|;':",./<>?~`]/.test(form.password);

    if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
      setError("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem("speakmate_account_type", "INDIVIDUAL_USER");
      await authService.sendRegistrationOtp({ email: form.email.trim() });
      setInfoMessage(`A 6-digit verification code has been sent to ${form.email.trim()}.`);
      setStep(2);
    } catch (err) {
      console.error("Send Registration OTP Error:", err);
      setError(
        err.userMessage ||
        err.response?.data?.message ||
        "Failed to send OTP verification code. Email may already be registered."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!form.otp.trim()) {
      setError("Please enter the 6-digit OTP verification code.");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem("speakmate_account_type", "INDIVIDUAL_USER");
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp: form.otp.trim(),
        accountType: "INDIVIDUAL_USER",
      };

      await authService.register(payload);

      // Navigate to Login page
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { infoMessage: "Account created successfully! Please log in to start practicing." },
      });
    } catch (err) {
      console.error("Registration failed:", err);
      setError(
        err.userMessage ||
        err.response?.data?.message ||
        "Invalid OTP verification code. Please check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto relative z-10">
      <div className="glass-card p-8 sm:p-10 lg:p-12 rounded-3xl border border-[var(--border-default)] shadow-2xl space-y-7 relative">

        {/* Brand App Badge Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#6C63FF] via-[#7C74FF] to-[#FF6584] flex items-center justify-center text-3xl shadow-xl shadow-[#6C63FF]/30">
            🗣️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Create Free Account</h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              {step === 1 ? "Start your journey to fluent English with SpeakMate AI" : `Enter the 6-digit OTP code sent to ${form.email}`}
            </p>
          </div>
        </div>

        {/* School Student Direct Login Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between text-xs text-[var(--text-primary)]">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🎓</span>
            <span className="font-semibold text-xs">
              <strong>School Student?</strong> Your school created your account.
            </span>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="px-3 py-1.5 rounded-xl bg-[#6C63FF] hover:bg-[#5B52E0] text-white text-[11px] font-black shadow-sm transition-all active:scale-95"
          >
            Log In Here ➔
          </Link>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <Link
            to={ROUTES.LOGIN}
            className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            🔑 Log In
          </Link>
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md shadow-[#6C63FF]/25 text-center transition-all"
          >
            ✨ Register
          </button>
        </div>

        {/* Info Message Banner */}
        {infoMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 space-y-1">
            <p className="font-black">📧 OTP Code Sent</p>
            <p className="font-medium opacity-90">{infoMessage}</p>
          </div>
        )}

        {/* Error Message Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 space-y-1">
            <p className="font-black">⚠️ Registration Notice</p>
            <p className="font-medium opacity-90">{error}</p>
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">✉️</span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character.
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">🛡️</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="w-full pl-12 pr-12 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#8B5CF6] hover:from-[#5B52E0] hover:to-[#7A4BE5] text-white text-sm font-black shadow-xl shadow-[#6C63FF]/30 transition-all transform hover:scale-[1.01] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Sending Verification Code..." : "Continue with Email Verification →"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form className="space-y-6" onSubmit={handleVerifyOtpAndRegister}>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] text-xs font-black">
                <span>🔒 Security Verification</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                Please check your email inbox or spam folder for the code.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                placeholder="2 5 1 7 3 5"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value.trim() })}
                required
                className="w-full px-4 py-4 rounded-2xl border-2 border-[#6C63FF] bg-[var(--bg-elevated)] text-center text-3xl font-black tracking-[0.4em] text-[#6C63FF] focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/20 transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || form.otp.length < 6}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-sm font-black shadow-xl shadow-[#6C63FF]/30 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Verify OTP & Create Account ✓"}
            </button>

            <div className="flex items-center justify-between text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                ← Edit Details
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-[#6C63FF] hover:underline cursor-pointer"
              >
                Resend OTP ↻
              </button>
            </div>
          </form>
        )}

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-[var(--border-default)]">
          <p className="text-xs text-[var(--text-muted)] font-medium">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="font-extrabold text-[#6C63FF] hover:underline">
              Log in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;
