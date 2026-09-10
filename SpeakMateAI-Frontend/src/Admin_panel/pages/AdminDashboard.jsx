// Minimal placeholder only — exists so the login → dashboard navigation
// flow can be tested during development. Not the real Admin Dashboard.
export function AdminDashboard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 px-4 text-center transition-colors duration-200">
      <h1 className="text-2xl font-black text-slate-950 dark:text-white">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Coming Soon</p>
    </div>
  );
}

export default AdminDashboard;
