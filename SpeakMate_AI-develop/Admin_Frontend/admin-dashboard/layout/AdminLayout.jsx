import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@admin/layout/Sidebar";
import AdminNavbar from "@admin/layout/AdminNavbar";
import RouteProgressBar from "@admin/components/RouteProgressBar";

/**
 * admin-dashboard/layout/AdminLayout.jsx
 *
 * Shell for the Super Admin Panel: fixed Sidebar + sticky AdminNavbar + content.
 * Independent of the learner AppLayout so the super admin experience is self-contained.
 */
export function AdminLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
            {/* Top loading bar during tab switches and route changes */}
            <RouteProgressBar />

            <Sidebar />

            <div className="flex min-h-screen flex-col lg:pl-64">
                <AdminNavbar />

                <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-8">
                    <div className="mx-auto w-full max-w-[1400px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.18, ease: "easeOut" }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
