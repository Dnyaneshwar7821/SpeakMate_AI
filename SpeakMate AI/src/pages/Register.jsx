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
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in duration-300">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6c63ff] to-[#ff6584]" />

        {/* Tab Switcher: Login / Register */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <Link
            to={ROUTES.LOGIN}
            className="flex-1 py-2.5 rounded-xl text-xs font-extrabold text-[var(--text-secondary)] hover:text-white text-center transition-all"
          >
            🔑 Log In
          </Link>
          <button
            className="flex-1 py-2.5 rounded-xl text-xs font-extrabold bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20 transition-all"
          >
            ✨ Register
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-black text-white">Create Account 🚀</h1>
          <p className="text-xs text-[var(--text-secondary)]">Start your journey to English fluency with SpeakMate AI.</p>
        </div>

        {/* Error Popup Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs font-bold text-red-400 space-y-1 animate-in fade-in duration-200">
            <p className="font-extrabold">⚠️ Registration Error</p>
            <p className="text-[11px] font-semibold opacity-90">{error}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Dnyaneshwar Algule"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-white focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-white focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password (min 6 chars)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-4 pr-12 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-white focus:outline-none focus:border-[#6c63ff] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-xs font-bold text-[var(--text-secondary)] hover:text-white"
              >
                {showPassword ? "🙈 Hide" : "👁️ Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-white focus:outline-none focus:border-[#6c63ff] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] hover:from-[#7c74ff] hover:to-[#ff7593] disabled:opacity-50 text-white font-extrabold text-xs shadow-xl shadow-[#6c63ff]/25 transition-all"
          >
            {loading ? "Creating Account..." : "Create Account & Start Setup →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
