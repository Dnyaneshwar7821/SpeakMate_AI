import { Outlet } from "react-router-dom";

export function SchoolAdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default SchoolAdminLayout;
