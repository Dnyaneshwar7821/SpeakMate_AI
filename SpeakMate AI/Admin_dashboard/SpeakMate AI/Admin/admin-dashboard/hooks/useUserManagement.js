/**
 * admin-dashboard/hooks/useUserManagement.js
 *
 * Local, in-memory CRUD state for the Admin Panel's user management screen.
 * Backed by mock data for now — swap the initial state with an API/React Query
 * call later without changing the consuming components' interface.
 *
 * Usage:
 *   const { users, totalUsers, searchTerm, setSearchTerm, addUser, updateUser, deleteUser } = useUserManagement();
 */

import { useMemo, useState } from "react";
import { adminUsersMockData } from "@admin/data/adminUsersMockData";

export function useUserManagement(initialUsers = adminUsersMockData) {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return users;
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
        );
    }, [users, searchTerm]);

    const addUser = (data) => {
        const newUser = {
            id: `usr-${Date.now()}`,
            joinedAt: new Date().toISOString().slice(0, 10),
            ...data,
        };
        setUsers((prev) => [newUser, ...prev]);
    };

    const updateUser = (id, data) => {
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, ...data } : user)));
    };

    const deleteUser = (id) => {
        setUsers((prev) => prev.filter((user) => user.id !== id));
    };

    return {
        users: filteredUsers,
        totalUsers: users.length,
        searchTerm,
        setSearchTerm,
        addUser,
        updateUser,
        deleteUser,
    };
}

export default useUserManagement;
