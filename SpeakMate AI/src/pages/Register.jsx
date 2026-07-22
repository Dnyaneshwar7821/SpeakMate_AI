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
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    await register(form);
    navigate(ROUTES.DASHBOARD, { replace: true });
  };

  return (
    <Card className="mx-auto max-w-md p-6 sm:p-8">
      <h1 className="text-2xl font-black text-slate-950">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Start building a daily English speaking habit.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <Input label="Name" placeholder="Your name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Input label="Password" type="password" placeholder="Create a password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        <Input label="Confirm password" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} error={error} required />
        <Button type="submit" className="w-full">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to={ROUTES.LOGIN} className="font-semibold text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </Card>
  );
}

export default Register;
