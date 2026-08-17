import { Outlet } from "react-router-dom";
import Sidebar from "@admin/layout/Sidebar";
import AdminNavbar from "@admin/layout/AdminNavbar";

/**
 * admin-dashboard/layout/AdminLayout.jsx
 *
 * Shell for the Super Admin Panel: fixed Sidebar + sticky AdminNavbar + content.
 * Independent of the learner AppLayout so the super admin experience is self-contained.
 */
export function AdminLayout() {
    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
            <Sidebar />

            <div className="flex min-h-screen flex-col lg:pl-64">
                <AdminNavbar />

                <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-8">
                    <div className="mx-auto w-full max-w-[1400px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
