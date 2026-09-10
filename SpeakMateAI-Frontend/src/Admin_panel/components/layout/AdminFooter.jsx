import { Link } from "react-router-dom";

export function AdminFooter() {
  return (
    <div className="mt-6 flex flex-col items-center gap-2 text-center">
      <p className="text-xs text-[var(--text-secondary)]">
        © {new Date().getFullYear()} SpeakMate AI. Admin access is restricted to authorized staff.
      </p>
      <Link to="/" className="text-xs font-semibold text-[#6C63FF] transition hover:underline">
        ← Back to SpeakMate AI
      </Link>
    </div>
  );
}

export default AdminFooter;
