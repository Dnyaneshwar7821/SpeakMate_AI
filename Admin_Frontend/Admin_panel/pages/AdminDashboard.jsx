// Minimal placeholder only — exists so the login → dashboard navigation
// flow can be tested during development. Not the real Admin Dashboard.
export function AdminDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-black text-slate-950">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">Coming Soon</p>
    </div>
  );
}

export default AdminDashboard;
