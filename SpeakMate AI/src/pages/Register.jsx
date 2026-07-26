import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await register({
        fullName: form.name,
        email: form.email,
        password: form.password,
      });
      navigate(ROUTES.ONBOARDING, { replace: true });
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.userMessage || err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-lg w-full glass-card p-8 sm:p-10 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden animate-in fade-in duration-300">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6c63ff] to-[#ff6584]" />

        {/* Tab Switcher: Login / Register */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <Link
            to={ROUTES.LOGIN}
            className="flex-1 py-3 rounded-xl text-sm font-extrabold text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            🔑 Log In
          </Link>
          <button
            className="flex-1 py-3 rounded-xl text-sm font-extrabold bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 transition-all text-center"
          >
            ✨ Register
          </button>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Create Account 🚀</h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium">
            Start your journey to English fluency with SpeakMate AI.
          </p>
        </div>

        {/* Error Popup Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-extrabold">⚠️ Registration Error</p>
            <p className="font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-2">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Dnyaneshwar Algule"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-2">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min 6 chars)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-[var(--text-secondary)] hover:text-[#6c63ff] transition-colors p-0.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.98-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-2">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:from-[#7c74ff] hover:to-[#ff7593] disabled:opacity-50 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#6c63ff]/25 transition-all"
          >
            {loading ? "Creating Account..." : "Create Account & Start Setup →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
