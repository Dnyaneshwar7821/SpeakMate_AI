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
import RecentActivities from "@admin/components/RecentActivities";
import QuickActions from "@admin/components/QuickActions";
import NotificationsPanel from "@admin/components/NotificationsPanel";

import UserGrowthChart from "@admin/components/charts/UserGrowthChart";
import AiUsageChart from "@admin/components/charts/AiUsageChart";
import LearningProgressChart from "@admin/components/charts/LearningProgressChart";

import { useUserManagement } from "@admin/hooks/useUserManagement";
import { useAuth } from "@context/AuthContext";
import {
    adminKpis,
    userGrowthData,
    aiUsageData,
    learningProgress,
    adminActivities,
    adminNotifications,
    quickActions,
} from "@admin/data/adminDashboardMockData";

/**
 * admin-dashboard/pages/AdminDashboard.jsx
 *
 * Redesigned Admin Panel > Dashboard — a modern enterprise SaaS layout.
 * Keeps the existing user-management logic (useUserManagement + modals) intact;
 * only the UI/UX is improved. No backend, routing or architecture changes.
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

    const handleQuickAction = (action) => {
        if (action.id === "qa-1") openAddModal();
    };

    const recentUsers = users.slice(0, 5);
    const firstName = user?.name?.split(" ")[0] || "Admin";

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
                            Admin Console
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

            {/* ============ KPI cards ============ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {adminKpis.map((kpi, i) => (
                    <KpiCard key={kpi.id} kpi={kpi} index={i} />
                ))}
            </div>

            {/* ============ Charts row ============ */}
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-3 xl:gap-6">
                <SectionCard
                    title="User Growth"
                    subtitle="Total vs. active users over the last 12 months"
                    className="xl:col-span-2"
                    delay={0.05}
                    bodyClassName="pt-2"
                >
                    <UserGrowthChart data={userGrowthData} />
                </SectionCard>

                <SectionCard
                    title="Learning Progress"
                    subtitle="Average completion by skill"
                    delay={0.1}
                >
                    <LearningProgressChart data={learningProgress} />
                </SectionCard>
            </div>

            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-3 xl:gap-6">
                <SectionCard
                    title="AI Usage"
                    subtitle="Conversations per day this week"
                    className="xl:col-span-2"
                    delay={0.05}
                    bodyClassName="pt-2"
                >
                    <AiUsageChart data={aiUsageData} />
                </SectionCard>

                {/* Quick actions */}
                <SectionCard title="Quick Actions" subtitle="Common admin shortcuts" delay={0.1}>
                    <QuickActions actions={quickActions} onAction={handleQuickAction} />
                </SectionCard>
            </div>

            {/* ============ Recent users + side panels ============ */}
            <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-3 xl:gap-6">
                {/* Recent users table */}
                <SectionCard
                    title="Recent Users"
                    subtitle={`${totalUsers} total users on the platform`}
                    className="xl:col-span-2"
                    delay={0.05}
                    bodyClassName="p-0"
                    action={
                        <div className="w-full sm:w-auto sm:max-w-[14rem]">
                            <Input
                                placeholder="Search users…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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

                {/* Recent activities timeline */}
                <SectionCard title="Recent Activity" subtitle="Latest platform events" delay={0.1}>
                    <RecentActivities activities={adminActivities} />
                </SectionCard>
            </div>

            {/* ============ Notifications ============ */}
            <SectionCard
                title="Recent Notifications"
                subtitle="System and account alerts"
                delay={0.05}
            >
                <NotificationsPanel notifications={adminNotifications} />
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
