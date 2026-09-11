import { Link } from "react-router-dom";
import Button from "@components/common/Button";
import ROUTES from "@constants/routes";

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">404</p>
        <h1 className="mt-3 text-4xl font-black text-slate-950">Page not found</h1>
        <p className="mt-3 max-w-md text-slate-600">The page you are looking for does not exist in this Phase 1 frontend.</p>
        <Link to={ROUTES.HOME} className="mt-8 inline-flex">
          <Button>Back to home</Button>
        </Link>
      </div>
    </main>
  );
}

export default NotFound;
