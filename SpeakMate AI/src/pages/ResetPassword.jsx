import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ROUTES from "../constants/routes";
import { authService } from "../services/authService";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please enter your reset token or request a new password reset OTP.");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token: token.trim(), newPassword: password });
      setSubmitted(true);
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 2500);
    } catch (err) {
      setError(err.userMessage || err.response?.data?.message || "Failed to reset password. Token may be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="grid h-12 w-12 mx-auto place-items-center rounded-2xl bg-[#6c63ff]/10 text-[#6c63ff] font-extrabold text-xl mb-3">
            🔐
          </div>
          <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Reset Password</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Enter your new secure password below.</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-center space-y-2">
            <p className="font-bold text-sm">✓ Password reset successfully!</p>
            <p className="text-xs">Redirecting to login page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            {!tokenFromUrl && (
              <div>
                <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Reset Token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your reset token here"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min. 8 chars)"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-sm shadow-md shadow-[#6c63ff]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Updating Password..." : "Update Password"}
            </button>

            <div className="text-center mt-4">
              <Link to={ROUTES.LOGIN} className="text-xs font-bold text-[#6c63ff] hover:underline">
                Return to Log In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
