import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);
      if (res && res.user && !res.user.onboardingCompleted) {
        navigate(ROUTES.ONBOARDING, { replace: true });
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.userMessage || err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setForm({ email: demoEmail, password: demoPassword });
    setError("");
    setLoading(true);
    try {
      const res = await login({ email: demoEmail, password: demoPassword });
      if (res && res.user && !res.user.onboardingCompleted) {
        navigate(ROUTES.ONBOARDING, { replace: true });
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    } catch (err) {
      setError("Demo login failed. Please register a new account.");
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
          <button
            className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-md shadow-[#6c63ff]/25 text-center transition-all"
          >
            🔑 Log In
          </button>
          <Link
            to={ROUTES.REGISTER}
            className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            ✨ Register
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Welcome Back! 👋</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            Log in to continue your daily English speaking practice with SpeakMate AI.
          </p>
        </div>

        {/* Error Popup Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">⚠️ Login Error</p>
            <p className="font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
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

          <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
            <Link to={ROUTES.FORGOT_PASSWORD} className="font-black text-[#6c63ff] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:opacity-90 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-xl shadow-[#6c63ff]/25 transition-all"
          >
            {loading ? "Signing in..." : "Log In to Account →"}
          </button>
        </form>

        {/* Quick Demo Login Divider */}
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] text-center">
            ⚡ Quick 1-Tap Learner Demo
          </p>

          <button
            onClick={() => handleDemoLogin("student@speakmate.com", "Password123!")}
            className="w-full py-3.5 px-5 rounded-2xl bg-[var(--bg-elevated)] hover:bg-[#6c63ff]/20 border border-[var(--border-default)] text-xs sm:text-sm font-black text-[var(--text-primary)] transition-all text-center flex items-center justify-center gap-2 shadow-sm"
          >
            <span>🎓 Log In as Demo Learner (Student)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
