import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Input from "@components/common/Input";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
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
      navigate(ROUTES.LOGIN, { replace: true, state: { registered: true } });
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.userMessage || err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-2xl">
      <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create account 🚀</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Start building a daily English speaking habit.</p>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          placeholder="Your full name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          required
        />
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
          placeholder="Create a strong password"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          required
        />
        <Button type="submit" className="w-full py-3 text-base font-semibold" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{" "}
        <Link to={ROUTES.LOGIN} className="font-semibold text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </Card>
  );
}

export default Register;
