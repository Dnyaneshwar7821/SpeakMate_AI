import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, 2000);
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
            <p className="text-xs">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
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
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-sm shadow-md shadow-[#6c63ff]/20 transition-all"
            >
              Update Password
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
