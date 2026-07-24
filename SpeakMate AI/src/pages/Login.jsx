import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Input from "@components/common/Input";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.userMessage || err.response?.data?.message || "Invalid credentials or network issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Welcome back 👋</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Log in to continue your English practice.</p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <div className="flex items-center justify-between text-sm">
          <Link to={ROUTES.REGISTER} className="font-semibold text-indigo-600 hover:text-indigo-500">
            Create account
          </Link>
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full py-3 text-base font-semibold" disabled={loading}>
          {loading ? "Signing in..." : "Log in"}
        </Button>
      </form>
    </Card>
  );
}

export default Login;
