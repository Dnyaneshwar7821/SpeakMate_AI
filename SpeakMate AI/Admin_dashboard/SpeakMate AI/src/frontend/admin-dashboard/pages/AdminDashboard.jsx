import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Download, ArrowRight } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";

import KpiCard from "@admin/components/KpiCard";
import SectionCard from "@admin/components/SectionCard";
import UsersTable from "@admin/components/UsersTable";
import UserFormModal from "@admin/components/UserFormModal";
import DeleteUserDialog from "@admin/components/DeleteUserDialog";

import { useUserManagement } from "@admin/hooks/useUserManagement";
import { useAuth } from "@context/AuthContext";
import { dashboardKpis } from "@admin/data/adminDashboardMockData";

/**
 * admin-dashboard/pages/AdminDashboard.jsx
 *
 * Super Admin Panel > Dashboard.
 *
 * Layout:
 *   - Top row:    Total Users, School Users
 *   - Second row: Active Users, Inactive Users, New Users
 *   - User Management section (Add / Update / Delete) kept on the same page.
 */
export function AdminDashboard() {
    const { users, totalUsers, searchTerm, setSearchTerm, addUser, updateUser, deleteUser } =
        useUserManagement();
    const { user } = useAuth();

    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", user: null });
    const [deleteTarget, setDeleteTarget] = useState(null);

    const openAddModal = () => setFormModal({ isOpen: true, mode: "add", user: null });
    const openEditModal = (u) => setFormModal({ isOpen: true, mode: "edit", user: u });
    const closeFormModal = () => setFormModal((prev) => ({ ...prev, isOpen: false }));

    const handleFormSubmit = (data) => {
        if (formModal.mode === "edit" && formModal.user) {
            updateUser(formModal.user.id, data);
        } else {
            addUser(data);
        }
        closeFormModal();
    };

    const handleConfirmDelete = (u) => {
        deleteUser(u.id);
        setDeleteTarget(null);
    };

    const recentUsers = users.slice(0, 5);
    const firstName = user?.name?.split(" ")[0] || "Super Admin";

    // Split KPIs into the two required rows.
    const topRowKpis = dashboardKpis.filter((k) =>
        ["total-users", "school-users"].includes(k.id),
    );
    const secondRowKpis = dashboardKpis.filter((k) =>
        ["active-users", "inactive-users", "new-users"].includes(k.id),
    );

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* ============ Welcome / Hero ============ */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-8"
            >
                <div className="admin-grid-bg pointer-events-none absolute inset-0 opacity-60" />
                <div
                    className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
                    style={{ background: "linear-gradient(135deg,#6c63ff,#ff6584)" }}
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                            <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                            Super Admin Console
                        </span>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                            Welcome back, {firstName} 👋
                        </h1>
                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                            Here's what's happening across SpeakMate AI today. Monitor users,
                            engagement and learning progress from one place.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2.5">
                        <Button variant="secondary" className="!h-10 !px-4">
                            <Download className="mr-1.5 h-4 w-4" />
                            Export
                        </Button>
                        <Button onClick={openAddModal} className="!h-10 !px-4">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* ============ Top row: Total Users, School Users ============ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {topRowKpis.map((kpi, i) => (
                    <KpiCard key={kpi.id} kpi={kpi} index={i} />
                ))}
            </div>

            {/* ============ Second row: Active, Inactive, New Users ============ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {secondRowKpis.map((kpi, i) => (
                    <KpiCard key={kpi.id} kpi={kpi} index={i} />
                ))}
            </div>

            {/* ============ User Management (kept on the same page) ============ */}
            <SectionCard
                title="User Management"
                subtitle={`${totalUsers} total users on the platform`}
                className="xl:col-span-2"
                delay={0.05}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Input
                            placeholder="Search users…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button onClick={openAddModal} className="!h-11 shrink-0">
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add User
                        </Button>
                    </div>
                }
            >
                <UsersTable users={recentUsers} onEdit={openEditModal} onDelete={setDeleteTarget} />
                <div className="border-t border-[var(--border-subtle)] px-4 py-3 sm:px-5">
                    <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:gap-2.5">
                        View all users
                        <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </SectionCard>

            {/* ============ Modals (unchanged logic) ============ */}
            <UserFormModal
                isOpen={formModal.isOpen}
                mode={formModal.mode}
                initialData={formModal.user}
                onClose={closeFormModal}
                onSubmit={handleFormSubmit}
            />

            <DeleteUserDialog
                isOpen={Boolean(deleteTarget)}
                user={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

export default AdminDashboard;
