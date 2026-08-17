// Same border/surface language as the learner Card (border-slate-200,
// bg-white) but a touch more premium — rounded-3xl, a refined hairline
// border, and a soft indigo-tinted shadow (matching the brand-tinted-shadow
// technique already used by AdminButton/Navbar) instead of a generic gray one.
export function AdminCard({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-200/70 bg-white shadow-xl shadow-indigo-950/5 ${className}`}>
      {children}
    </div>
  );
}

export default AdminCard;
