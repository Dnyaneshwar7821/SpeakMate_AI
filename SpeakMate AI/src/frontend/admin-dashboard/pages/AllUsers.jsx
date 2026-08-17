import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";

import SectionCard from "@admin/components/SectionCard";
import UsersTable from "@admin/components/UsersTable";
import UserFormModal from "@admin/components/UserFormModal";
import DeleteUserDialog from "@admin/components/DeleteUserDialog";
import UserProgressModal from "@admin/components/UserProgressModal";

import { useUserManagement } from "@admin/hooks/useUserManagement";

/**
 * admin-dashboard/pages/AllUsers.jsx
 *
 * Super Admin Panel > All Users — full list of registered platform users.
 * Reuses the existing UsersTable + UserFormModal + DeleteUserDialog so the
 * super admin can Add / Update / Delete users with the same UX as the dashboard.
 */
export function AllUsers() {
    const { users, totalUsers, searchTerm, setSearchTerm, addUser, updateUser, deleteUser } =
        useUserManagement();

    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", user: null });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

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
                            {totalUsers} registered users on the platform
                        </p>
                    </div>
                </div>
                <Button onClick={openAddModal} className="!h-11 shrink-0">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add User
                </Button>
            </motion.div>

            {/* Users table */}
            <SectionCard
                title="Registered Users"
                subtitle="Search, edit or remove any user"
                delay={0.05}
                bodyClassName="p-0"
                action={
                    <div className="w-full sm:w-auto sm:max-w-[16rem]">
                        <Input
                            placeholder="Search users…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                }
            >
                <UsersTable users={users} onEdit={openEditModal} onDelete={setDeleteTarget} onUserClick={setSelectedUser} />
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
                onClose={() => setDeleteTarget(null)}
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
