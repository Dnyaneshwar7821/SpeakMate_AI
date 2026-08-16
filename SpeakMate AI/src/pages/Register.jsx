import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import ROUTES from "../constants/routes";

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1: Input details, Step 2: Input OTP
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [accountType, setAccountType] = useState("INDIVIDUAL_USER");
  const [schoolName, setSchoolName] = useState(""); // 'INDIVIDUAL_USER' | 'STUDENT'
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

      // Navigate to Login page (do not auto-login)
      navigate(ROUTES.LOGIN, {
        replace: true,
        state: { infoMessage: "Account created successfully! Please log in to your account." },
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
    <div className="w-full max-w-2xl mx-auto relative z-10">
      <div className="bg-[var(--bg-surface)] p-8 sm:p-10 lg:p-12 rounded-3xl border border-[var(--border-default)] shadow-2xl space-y-8 relative animate-in fade-in duration-300">

        {/* Brand App Badge Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-3xl shadow-xl shadow-[#6c63ff]/30">
            🗣️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Create Account</h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium mt-1">
              {step === 1 ? "Start your journey to English fluency with SpeakMate AI" : `Enter the 6-digit OTP code sent to ${form.email}`}
            </p>
          </div>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <Link
            to={ROUTES.LOGIN}
            className="flex-1 py-3 rounded-xl text-sm sm:text-base font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            🔑 Log In
          </Link>
          <button
            type="button"
            className="flex-1 py-3 rounded-xl text-sm sm:text-base font-black bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-md shadow-[#6c63ff]/25 text-center transition-all"
          >
            ✨ Register
          </button>
        </div>

        {/* Info Message Banner */}
        {infoMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm font-bold text-emerald-600 dark:text-emerald-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">📧 OTP Sent Successfully!</p>
            <p className="font-semibold opacity-90">{infoMessage}</p>
          </div>
        )}

        {/* Error Message Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-sm font-bold text-rose-600 dark:text-rose-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">⚠️ Registration Error</p>
            <p className="font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 1 && (
          <form className="space-y-6" onSubmit={handleSendOtp}>
            {/* Account Type Selector Cards */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAccountType("INDIVIDUAL_USER")}
                  className={`py-3.5 px-4 rounded-2xl border text-sm sm:text-base font-black transition-all flex items-center justify-center gap-2.5 ${accountType === "INDIVIDUAL_USER"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  <span className="text-lg">👤</span>
                  <span>Individual Learner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("STUDENT")}
                  className={`py-3.5 px-4 rounded-2xl border text-sm sm:text-base font-black transition-all flex items-center justify-center gap-2.5 ${accountType === "STUDENT"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                >
                  <span className="text-lg">🎓</span>
                  <span>School Student</span>
                </button>
              </div>
            </div>

            {/* School Name Field for Students */}
            {accountType === "STUDENT" && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  School Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-base text-[var(--text-secondary)]">🏫</span>
                  <input
                    type="text"
                    placeholder="Enter your school name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-base text-[var(--text-secondary)]">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 Upper, 1 Spec"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[#6c63ff] hover:bg-[#6c63ff]/10 p-1.5 rounded-xl transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // Eye OPEN (when password is shown)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      // Eye SLASH / CLOSED (when password is hidden)
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-xl shadow-[#6c63ff]/25 transition-all flex items-center justify-center gap-2 mt-4"
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
          <form className="space-y-6 animate-in fade-in duration-200" onSubmit={handleVerifyOtpAndRegister}>
            <div className="p-5 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-center space-y-2">
              <span className="text-xs font-black uppercase text-[#6c63ff] tracking-widest block">Security Verification Code</span>
              <p className="text-sm font-black text-[var(--text-primary)]">
                Enter code sent to <span className="text-[#6c63ff] underline">{form.email}</span>
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">
                (Check your email inbox or spam folder for the 6-digit code)
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
                className="w-full px-4 py-4 rounded-2xl border-2 border-[#6c63ff] bg-[var(--bg-elevated)] text-center text-3xl font-black tracking-[0.4em] text-[#6c63ff] focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.otp.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-xl shadow-[#6c63ff]/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP & Create Account</span>
                  <span>✓</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-[var(--border-subtle)]">
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
                className="text-[#6c63ff] hover:underline"
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
