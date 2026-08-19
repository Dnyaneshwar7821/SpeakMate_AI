import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
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

  const [accountType, setAccountType] = useState("INDIVIDUAL_USER");
  const [schoolName, setSchoolName] = useState("");
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
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;':",./<>?~`]/.test(form.password);

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
      localStorage.setItem("speakmate_account_type", accountType);
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
      localStorage.setItem("speakmate_account_type", accountType);
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp: form.otp.trim(),
        accountType,
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
            {/* Account Type Selector Cards */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                Signing up as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("INDIVIDUAL_USER")}
                  className={`py-3 px-3 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                    accountType === "INDIVIDUAL_USER"
                      ? "border-[#6C63FF] bg-[#6C63FF]/15 text-[#6C63FF] ring-2 ring-[#6C63FF]/30 shadow-sm"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>👤 Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("STUDENT")}
                  className={`py-3 px-3 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                    accountType === "STUDENT"
                      ? "border-[#6C63FF] bg-[#6C63FF]/15 text-[#6C63FF] ring-2 ring-[#6C63FF]/30 shadow-sm"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>🎓 School Student</span>
                </button>
              </div>
            </div>

            {/* School Name Field for Students */}
            {accountType === "STUDENT" && (
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  School Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">🏫</span>
                  <input
                    type="text"
                    placeholder="Enter your school name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                </div>
              </div>
            )}

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
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 Upp, 1 Spec"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[#6C63FF] transition-colors focus:outline-none flex items-center justify-center"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[#6C63FF] transition-colors focus:outline-none flex items-center justify-center"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Sending Verification OTP...</span>
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {step === 2 && (
          <form className="space-y-5" onSubmit={handleVerifyOtpAndRegister}>
            <div className="p-5 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-center space-y-1.5">
              <span className="text-xs font-black uppercase text-[#6C63FF] tracking-widest block">Security Verification</span>
              <p className="text-sm font-black text-[var(--text-primary)]">
                Enter code sent to <span className="text-[#6C63FF] underline">{form.email}</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                (Please check your email inbox or spam folder for the code)
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                placeholder="1 2 3 4 5 6"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                required
                className="w-full px-4 py-4 rounded-2xl border-2 border-[#6C63FF] bg-[var(--bg-elevated)] text-center text-3xl font-black tracking-[0.4em] text-[#6C63FF] focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.otp.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP & Create Account</span>
                  <span>✓</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ← Edit Details
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="text-[#6C63FF] hover:underline"
              >
                Resend OTP ↻
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default Register;
