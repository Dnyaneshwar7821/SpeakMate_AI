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
        "Invalid OTP verification code. Please check your email or use 123456."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-2xl space-y-6 relative animate-in fade-in duration-300">
        
        {/* Brand App Badge Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-2xl shadow-xl shadow-[#6c63ff]/30">
            🗣️
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Create Account</h1>
            <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
              {step === 1 ? "Start your journey to English fluency with SpeakMate AI" : `Enter the 6-digit OTP code sent to ${form.email}`}
            </p>
          </div>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <Link
            to={ROUTES.LOGIN}
            className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            🔑 Log In
          </Link>
          <button
            type="button"
            className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-md shadow-[#6c63ff]/25 text-center transition-all"
          >
            ✨ Register
          </button>
        </div>

        {/* Info Message Banner */}
        {infoMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">📧 OTP Sent Successfully!</p>
            <p className="font-semibold opacity-90">{infoMessage}</p>
          </div>
        )}

        {/* Error Message Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-600 dark:text-rose-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">⚠️ Registration Error</p>
            <p className="font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* STEP 1: FORM */}
        {step === 1 && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            {/* Account Type Selector Cards */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAccountType("INDIVIDUAL_USER")}
                  className={`py-3 px-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    accountType === "INDIVIDUAL_USER"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>👤</span>
                  <span>Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("STUDENT")}
                  className={`py-3 px-3 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    accountType === "STUDENT"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>🎓</span>
                  <span>School Student</span>
                </button>
              </div>
            </div>

            {/* School Name Field for Students */}
            {accountType === "STUDENT" && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">
                  School Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm text-[var(--text-secondary)]">🏫</span>
                  <input
                    type="text"
                    placeholder="Enter your school name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
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
                  className="w-full px-3.5 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm text-[var(--text-secondary)]">✉️</span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs sm:text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 Upper, 1 Spec"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full pl-3.5 pr-9 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[#6c63ff] transition-colors text-sm"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3.5 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-lg shadow-[#6c63ff]/25 transition-all flex items-center justify-center gap-2 mt-2"
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
          <form className="space-y-5 animate-in fade-in duration-200" onSubmit={handleVerifyOtpAndRegister}>
            <div className="p-4 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-center space-y-1.5">
              <span className="text-[10px] font-black uppercase text-[#6c63ff] tracking-widest block">Security Verification Code</span>
              <p className="text-xs font-black text-[var(--text-primary)]">
                Enter code sent to <span className="text-[#6c63ff] underline">{form.email}</span>
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                (Master code: <strong>123456</strong>)
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
                className="w-full px-4 py-3.5 rounded-2xl border-2 border-[#6c63ff] bg-[var(--bg-elevated)] text-center text-2xl font-black tracking-[0.4em] text-[#6c63ff] focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.otp.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-95 active:scale-[0.99] disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-lg shadow-[#6c63ff]/25 transition-all flex items-center justify-center gap-2"
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
