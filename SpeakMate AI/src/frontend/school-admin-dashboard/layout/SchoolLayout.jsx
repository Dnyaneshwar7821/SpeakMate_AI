import { Outlet } from "react-router-dom";
import Sidebar from "@school-admin/layout/Sidebar";
import SchoolNavbar from "@school-admin/layout/SchoolNavbar";

export function SchoolLayout() {
    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
            <Sidebar />
            <div className="flex min-h-screen flex-col lg:pl-64">
                <SchoolNavbar />
                <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-8">
                    <div className="mx-auto w-full max-w-[1400px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SchoolLayout;
