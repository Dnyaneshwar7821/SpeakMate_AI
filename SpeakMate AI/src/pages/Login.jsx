import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginType, setLoginType] = useState("STANDARD"); // "STANDARD" | "SCHOOL"
  const [schoolCode, setSchoolCode] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const infoMessage = location.state?.infoMessage || "";

  const handleSubmit = async (event) => {
    if (event) event.preventDefault();
    setError("");

    if (loginType === "SCHOOL" && !schoolCode.trim()) {
      setError("Please enter your School Code (e.g. SCH-1082).");
      return;
    }

    setLoading(true);

    try {
      if (loginType === "SCHOOL") {
        localStorage.setItem("speakmate_account_type", "STUDENT");
        localStorage.setItem("speakmate_school_code", schoolCode.trim().toUpperCase());
      }

      const res = await login({
        email: form.email.trim(),
        password: form.password,
        schoolCode: loginType === "SCHOOL" ? schoolCode.trim().toUpperCase() : undefined,
      });

      const userEmail = res?.user?.email || form.email.trim();
      const userDone = userEmail ? localStorage.getItem(`speakmate_onboarding_done_${userEmail}`) === "true" : false;
      const isCompleted = Boolean(
        res?.user?.onboardingCompleted ||
        userDone ||
        res?.user?.schoolGrade ||
        res?.user?.englishLevel
      );

      if (res && res.user && !isCompleted) {
        navigate(ROUTES.ONBOARDING, { replace: true });
      } else {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.userMessage || err.response?.data?.message || "Invalid credentials. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10">
      <div className="glass-card p-6 sm:p-10 lg:p-12 rounded-3xl border border-[var(--border-default)] shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Feature Showcase Panel (Desktop Web App Style) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 bg-gradient-to-br from-[#6C63FF]/15 via-[#8B5CF6]/10 to-[#FF6584]/15 p-8 rounded-3xl border border-[#6C63FF]/20 shadow-inner">
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6C63FF] via-[#7C74FF] to-[#FF6584] flex items-center justify-center text-3xl shadow-xl shadow-[#6C63FF]/30">
                🗣️
              </div>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-[#6C63FF]/20 text-[#6C63FF] border border-[#6C63FF]/30 uppercase tracking-wider">
                  AI-Powered Learning
                </span>
                <h2 className="text-2xl font-black text-[var(--text-primary)] leading-tight">
                  Speak Confidently, Speak Naturally.
                </h2>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  Join thousands of learners mastering spoken English with real-time AI conversation and instant feedback.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)]">
                  <span className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center text-base shadow-sm">
                    🎙️
                  </span>
                  <span>Instant voice pronunciation analysis</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)]">
                  <span className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center text-base shadow-sm">
                    ⚡
                  </span>
                  <span>100+ interactive speaking scenarios</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)]">
                  <span className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center text-base shadow-sm">
                    🏆
                  </span>
                  <span>Track streaks and fluency milestones</span>
                </div>
              </div>
            </div>

            {/* Live Streak Card */}
            <div className="p-4 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-default)] flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs font-black text-[var(--text-primary)]">Daily Fluency Streak</p>
                  <p className="text-[10px] font-bold text-emerald-500">Active & growing every day</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-black shadow-sm">
                98% Score
              </span>
            </div>
          </div>

          {/* Right Login Form Container */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <div className="flex lg:hidden w-12 h-12 mb-3 rounded-2xl bg-gradient-to-tr from-[#6C63FF] via-[#7C74FF] to-[#FF6584] items-center justify-center text-2xl shadow-lg shadow-[#6C63FF]/30">
                🗣️
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">Welcome Back</h1>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Sign in to continue your English fluency streak</p>
            </div>

            {/* Tab Segmented Control */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white shadow-md shadow-[#6C63FF]/25 text-center transition-all"
              >
                🔑 Log In
              </button>
              <Link
                to={ROUTES.REGISTER}
                className="flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-all"
              >
                ✨ Register
              </Link>
            </div>

            {/* Login Method Sub-Toggle (Standard vs School Code) */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => { setLoginType("STANDARD"); setError(""); }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  loginType === "STANDARD"
                    ? "bg-[var(--bg-surface)] text-[#6C63FF] shadow-sm border border-[var(--border-default)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>👤 Standard</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginType("SCHOOL"); setError(""); }}
                className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                  loginType === "SCHOOL"
                    ? "bg-[var(--bg-surface)] text-[#6C63FF] shadow-sm border border-[var(--border-default)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span>🏫 School Code</span>
              </button>
            </div>

            {/* Info Message Banner */}
            {infoMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 space-y-1">
                <p className="font-black">🎉 Registration Successful!</p>
                <p className="font-medium opacity-90">{infoMessage}</p>
              </div>
            )}

            {/* Error Message Banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 space-y-1">
                <p className="font-black">⚠️ Authentication Notice</p>
                <p className="font-medium opacity-90">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              {loginType === "SCHOOL" && (
                <div>
                  <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                    School Code
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">🏫</span>
                    <input
                      type="text"
                      placeholder="e.g. SCH-1082"
                      value={schoolCode}
                      onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all tracking-wider uppercase"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  {loginType === "SCHOOL" ? "Student ID or Email" : "Email Address"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">✉️</span>
                  <input
                    type={loginType === "SCHOOL" ? "text" : "email"}
                    placeholder={loginType === "SCHOOL" ? "e.g. STU-1082 or student@school.edu" : "you@example.com"}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-base text-[var(--text-muted)]">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-[var(--text-muted)] hover:text-[#6C63FF] transition-colors focus:outline-none flex items-center justify-center"
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
                <div className="flex justify-end mt-2">
                  <Link
                    to={ROUTES.FORGOT_PASSWORD}
                    className="text-xs font-bold text-[#6C63FF] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[#7C74FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] active:scale-[0.99] disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{loginType === "SCHOOL" ? "Sign In as School Student 🏫" : "Sign In to SpeakMate AI"}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
