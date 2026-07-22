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

  const handleSubmit = async (event) => {
    event.preventDefault();
    await login(form);
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-black text-slate-950">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-600">Log in to continue your English practice.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
          <Link to={ROUTES.FORGOT_PASSWORD} className="font-semibold text-slate-500 hover:text-slate-900">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full">Log in</Button>
      </form>
    </Card>
  );
}

export default Login;
