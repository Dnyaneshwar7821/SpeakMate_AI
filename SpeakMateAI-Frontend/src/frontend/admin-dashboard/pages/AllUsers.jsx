import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, ChevronDown, Download } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";

import SectionCard from "@admin/components/SectionCard";
import UsersTable from "@admin/components/UsersTable";
import UserFormModal from "@admin/components/UserFormModal";
import DeleteUserDialog from "@admin/components/DeleteUserDialog";
import UserProgressModal from "@admin/components/UserProgressModal";
import { adminUserApi } from "@services/admin/adminUserApi";

import { useUserManagement } from "@admin/hooks/useUserManagement";

/**
 * admin-dashboard/pages/AllUsers.jsx
 *
 * Super Admin Panel > All Users — full list of registered platform users.
 * Reuses the existing UsersTable + UserFormModal + DeleteUserDialog so the
 * super admin can Add / Update / Delete users with the same UX as the dashboard.
 */
export function AllUsers() {
    const {
        users,
        totalUsers,
        searchTerm,
        setSearchTerm,
        page,
        setPage,
        size,
        totalPages,
        filters,
        setFilters,
        addUser,
        updateUser,
        deleteUser,
        activateUser,
        deactivateUser,
        exportUsers,
        isLoading,
    } = useUserManagement();

    const handleToggleStatus = async (user) => {
        try {
            if (user.status === "active") {
                await deactivateUser(user.id);
            } else {
                await activateUser(user.id);
            }
        } catch (err) {
            console.error("Failed to toggle user status:", err);
            alert("Failed to toggle user status.");
        }
    };

    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", user: null });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Auto-open user progress modal if navigated from notification
    useEffect(() => {
        const queryUserId = searchParams.get("userId") || searchParams.get("id");
        const targetUserId = location.state?.viewUserId || (queryUserId ? Number(queryUserId) : null);
        if (targetUserId) {
            adminUserApi.getUserById(targetUserId)
                .then((res) => {
                    const userData = res?.data || res;
                    if (userData) {
                        setSelectedUser(userData);
                    }
                })
                .catch((err) => {
                    console.warn("Could not load target user details:", err);
                });
        }
    }, [location.state?.viewUserId, searchParams]);

    // Respect ?status=active or ?status=inactive from KPI card navigation
    useEffect(() => {
        const statusParam = searchParams.get("status");
        if (statusParam === "active") {
            setFilters((prev) => ({ ...prev, status: true }));
            setPage(0);
        } else if (statusParam === "inactive") {
            setFilters((prev) => ({ ...prev, status: false }));
            setPage(0);
        }
    }, [searchParams, setFilters, setPage]);

    const openAddModal = () => setFormModal({ isOpen: true, mode: "add", user: null });
    const openEditModal = (u) => setFormModal({ isOpen: true, mode: "edit", user: u });
    const closeFormModal = () => setFormModal((prev) => ({ ...prev, isOpen: false }));

    const handleFormSubmit = async (data) => {
        try {
            if (formModal.mode === "edit" && formModal.user) {
                await updateUser(formModal.user.id, data);
                alert(`User "${data.name}" updated successfully.`);
            } else {
                const res = await addUser(data);
                const emailSent = res?.data?.emailSent !== false && res?.emailSent !== false;
                if (emailSent) {
                    alert("General User created successfully and login credentials have been sent to the user's email address.");
                } else {
                    alert("General User created successfully, but the credential email could not be sent.");
                }
            }
            closeFormModal();
        } catch (err) {
            console.error("Form submission failed:", err);
            alert(err?.response?.data?.message || err.message || "Failed to save user.");
        }
    };

    const handleConfirmDelete = async (u) => {
        setIsDeleting(true);
        try {
            await deleteUser(u.id);
        } catch (err) {
            console.error("Delete user failed:", err);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Users className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            All Users
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {isLoading && (!users || users.length === 0) ? "Loading users..." : `${totalUsers} registered users on the platform`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={exportUsers} className="!h-11 shrink-0">
                        <Download className="mr-1.5 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={openAddModal} className="!h-11 shrink-0">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add User
                    </Button>
                </div>
            </motion.div>

            {/* Users table */}
            <SectionCard
                title="Registered Users"
                subtitle="Search, edit or remove any user"
                delay={0.05}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={filters.status === null ? "all" : (filters.status ? "active" : "inactive")}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFilters(prev => ({
                                        ...prev,
                                        status: val === "all" ? null : (val === "active")
                                    }));
                                    setPage(0);
                                }}
                                className="h-11 w-full min-w-[9rem] appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] pl-3 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 sm:w-auto"
                                aria-label="Filter by status"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                        </div>

                        {/* English Level Filter Dropdown */}
                        <div className="relative">
                            <select
                                value={filters.englishLevel}
                                onChange={(e) => {
                                    setFilters(prev => ({ ...prev, englishLevel: e.target.value }));
                                    setPage(0);
                                }}
                                className="h-11 w-full min-w-[10rem] appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] pl-3 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 sm:w-auto"
                                aria-label="Filter by English level"
                            >
                                <option value="">All English Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full sm:w-auto sm:min-w-[14rem]">
                            <Input
                                placeholder="Search users…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                }
            >
                <UsersTable
                    users={users}
                    isLoading={isLoading}
                    onEdit={openEditModal}
                    onDelete={setDeleteTarget}
                    onToggleStatus={handleToggleStatus}
                    onUserClick={setSelectedUser}
                />

                {/* Pagination Footer */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-4 py-4 sm:flex-row sm:px-5">
                    <p className="text-xs text-[var(--text-secondary)]">
                        Showing <span className="font-semibold text-[var(--text-primary)]">{totalUsers === 0 ? 0 : page * size + 1}</span> to{" "}
                        <span className="font-semibold text-[var(--text-primary)]">
                            {Math.min(totalUsers, (page + 1) * size)}
                        </span>{" "}
                        of <span className="font-semibold text-[var(--text-primary)]">{totalUsers}</span> entries
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="!h-9 !px-3 text-xs"
                        >
                            Previous
                        </Button>
                        <span className="text-xs font-medium text-[var(--text-primary)] px-2">
                            Page {page + 1} of {Math.max(1, totalPages)}
                        </span>
                        <Button
                            variant="secondary"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="!h-9 !px-3 text-xs"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </SectionCard>

            {/* Modals */}
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
                isDeleting={isDeleting}
                onClose={() => !isDeleting && setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />

            <UserProgressModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </div>
    );
}

export default AllUsers;
