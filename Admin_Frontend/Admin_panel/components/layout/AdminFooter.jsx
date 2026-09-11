import { Link } from "react-router-dom";

export function AdminFooter() {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      <p className="text-xs text-slate-500">
        © {new Date().getFullYear()} SpeakMate AI. Admin access is restricted to authorized staff.
      </p>
      <Link to="/" className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500">
        ← Back to SpeakMate AI
      </Link>
    </div>
  );
}

export default AdminFooter;
