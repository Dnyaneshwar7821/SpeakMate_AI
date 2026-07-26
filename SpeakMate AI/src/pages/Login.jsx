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
      await login(form);
      navigate(ROUTES.DASHBOARD, { replace: true });
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
      await login({ email: demoEmail, password: demoPassword });
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError("Demo login failed. Please register a new account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in duration-300">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6c63ff] to-[#ff6584]" />

        {/* Tab Switcher: Login / Register */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <button
            className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 transition-all"
          >
            🔑 Log In
          </button>
          <Link
            to={ROUTES.REGISTER}
            className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            ✨ Register
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-black text-[var(--text-primary)]">Welcome Back! 👋</h1>
          <p className="text-xs text-[var(--text-secondary)] font-medium">Log in to continue your daily English speaking practice.</p>
        </div>

        {/* Error Popup Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-600 dark:text-red-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-extrabold">⚠️ Login Error</p>
            <p className="text-[11px] font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[var(--text-secondary)] hover:text-[#6c63ff] transition-colors p-0.5"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.98-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link to={ROUTES.FORGOT_PASSWORD} className="font-bold text-[#6c63ff] hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:from-[#7c74ff] hover:to-[#ff7593] disabled:opacity-50 text-white font-extrabold text-xs shadow-xl shadow-[#6c63ff]/25 transition-all"
          >
            {loading ? "Signing in..." : "Log In to Account →"}
          </button>
        </form>

        {/* Quick Demo Login Divider */}
        <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)] text-center">
            ⚡ Quick 1-Tap Demo Logins
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin("student@speakmate.com", "Password123!")}
              className="py-2.5 px-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#6c63ff]/20 border border-[var(--border-default)] text-[11px] font-extrabold text-[var(--text-primary)] transition-all text-center"
            >
              🎓 Student Demo
            </button>
            <button
              onClick={() => handleDemoLogin("admin@speakmate.com", "Admin123!")}
              className="py-2.5 px-3 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#ff6584]/20 border border-[var(--border-default)] text-[11px] font-extrabold text-[var(--text-primary)] transition-all text-center"
            >
              👑 Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
