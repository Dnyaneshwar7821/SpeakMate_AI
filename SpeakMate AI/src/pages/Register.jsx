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

  const [accountType, setAccountType] = useState("INDIVIDUAL_USER"); // 'INDIVIDUAL_USER' | 'STUDENT'
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
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-lg w-full glass-card p-8 sm:p-10 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden animate-in fade-in duration-300">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6c63ff] via-[#8b85ff] to-[#ff6584]" />

        {/* Tab Switcher: Login / Register */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <Link
            to={ROUTES.LOGIN}
            className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            🔑 Log In
          </Link>
          <button
            className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-md shadow-[#6c63ff]/25 text-center transition-all"
          >
            ✨ Register (OTP Verified)
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Create Account 🚀</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            {step === 1
              ? "Start your journey to English fluency with SpeakMate AI."
              : `Verify email ${form.email} to complete setup.`}
          </p>
        </div>

        {/* Info Banner */}
        {infoMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">📧 OTP Sent Successfully!</p>
            <p className="font-semibold opacity-90">{infoMessage}</p>
          </div>
        )}

        {/* Error Popup Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">⚠️ Registration Error</p>
            <p className="font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* STEP 1 FORM: NAME, EMAIL & PASSWORD */}
        {step === 1 && (
          <form className="space-y-5" onSubmit={handleSendOtp}>
            {/* Account Type Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)]">
                I am signing up as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("INDIVIDUAL_USER")}
                  className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                    accountType === "INDIVIDUAL_USER"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] ring-2 ring-[#6c63ff]/30 shadow-sm"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>👤</span>
                  <span>Individual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType("STUDENT")}
                  className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
                    accountType === "STUDENT"
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] ring-2 ring-[#6c63ff]/30 shadow-sm"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>🎓</span>
                  <span>School Student</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">First Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nikita"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Algule"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (1 Upper, 1 Lower, 1 Num, 1 Spec)"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-[#6c63ff] transition-colors p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:opacity-90 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-xl shadow-[#6c63ff]/25 transition-all"
            >
              {loading ? "Sending Verification OTP..." : "Send OTP Verification Code →"}
            </button>
          </form>
        )}

        {/* STEP 2 FORM: 6-DIGIT OTP VERIFICATION */}
        {step === 2 && (
          <form className="space-y-6 animate-in fade-in duration-200" onSubmit={handleVerifyOtpAndRegister}>
            <div className="p-4 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-[#6c63ff] tracking-wider block">Email Verification Code</span>
              <p className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                Enter the 6-digit OTP code sent to <strong>{form.email}</strong>
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                (Check inbox/spam folder or use test master code <strong>123456</strong>)
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2 text-center">
                6-Digit Verification Code (OTP)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 123456"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                required
                className="w-full px-4 py-4 rounded-2xl border-2 border-[#6c63ff] bg-[var(--bg-elevated)] text-center text-2xl font-black tracking-widest text-[#6c63ff] focus:outline-none shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.otp.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-xl shadow-[#6c63ff]/25 transition-all"
            >
              {loading ? "Verifying & Registering..." : "Verify OTP & Create Account →"}
            </button>

            <div className="flex items-center justify-between text-xs font-bold pt-2">
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
                Resend OTP Code ↻
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
