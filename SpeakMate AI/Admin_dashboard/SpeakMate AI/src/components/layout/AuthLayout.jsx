import { Link, Outlet } from "react-router-dom";
import ROUTES from "@constants/routes";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto mb-8 flex max-w-md items-center justify-between">
        <Link to={ROUTES.HOME} className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-sm font-black text-white">
            SM
          </span>
          <span className="text-lg font-extrabold">SpeakMate AI</span>
        </Link>
        <Link to={ROUTES.HOME} className="text-sm font-semibold text-slate-500 hover:text-slate-900">
          Home
        </Link>
      </div>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
