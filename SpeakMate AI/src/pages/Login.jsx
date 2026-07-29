import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const infoMessage = location.state?.infoMessage || "";

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

  return (
    <div className="w-full max-w-xl mx-auto relative z-10">
      <div className="bg-[var(--bg-surface)] p-8 sm:p-10 lg:p-12 rounded-3xl border border-[var(--border-default)] shadow-2xl space-y-8 relative animate-in fade-in duration-300">
        
        {/* Brand App Badge Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-3xl shadow-xl shadow-[#6c63ff]/30">
            🗣️
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">SpeakMate AI</h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium mt-1">Your Personal AI English Language Tutor</p>
          </div>
        </div>

        {/* Tab Segmented Control */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <button
            type="button"
            className="flex-1 py-3 rounded-xl text-sm sm:text-base font-black bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-md shadow-[#6c63ff]/25 text-center transition-all"
          >
            🔑 Log In
          </button>
          <Link
            to={ROUTES.REGISTER}
            className="flex-1 py-3 rounded-xl text-sm sm:text-base font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
          >
            ✨ Register
          </Link>
        </div>

        {/* Info Message Banner */}
        {infoMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm font-bold text-emerald-600 dark:text-emerald-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">🎉 Registration Successful!</p>
            <p className="font-semibold opacity-90">{infoMessage}</p>
          </div>
        )}

        {/* Error Message Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-sm font-bold text-rose-600 dark:text-rose-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-black">⚠️ Login Error</p>
            <p className="font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
              Email Address
            </label>
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
                Password
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs sm:text-sm font-black text-[#6c63ff] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-base text-[var(--text-secondary)]">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[var(--text-secondary)] hover:text-[#6c63ff] transition-colors text-base"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Log In to Account</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;
