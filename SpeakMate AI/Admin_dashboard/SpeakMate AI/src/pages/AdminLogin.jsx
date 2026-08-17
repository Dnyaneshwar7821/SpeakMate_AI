import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import Input from "@components/common/Input";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";

export function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const user = await login(form);
    if (user?.role === "ADMIN") {
      const from = location.state?.from?.pathname || ROUTES.ADMIN;
      navigate(from, { replace: true });
    } else {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <Card className="p-6 sm:p-8">
        <h1 className="text-2xl font-black text-slate-950">Admin sign in</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access the SpeakMateAI admin panel.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            placeholder="admin@speakmate.ai"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter admin password"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
            required
          />
          <div className="flex items-center justify-between text-sm">
            <Link
              to={ROUTES.LOGIN}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Learner login
            </Link>
            <Link
              to={ROUTES.HOME}
              className="font-semibold text-slate-500 hover:text-slate-900"
            >
              Back to site
            </Link>
          </div>
          <Button type="submit" className="w-full">
            Sign in as admin
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AdminLogin;
