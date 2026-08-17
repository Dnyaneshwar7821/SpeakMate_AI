import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@services/adminApi";
import userProgressMock from "@data/userProgressMockData";

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(fn, retries = 2, backoffMs = 800) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await delay(backoffMs);
    return withRetry(fn, retries - 1, backoffMs * 2);
  }
}

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserProgress, setSelectedUserProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await withRetry(() => adminApi.getAllUsers(), 2, 600);
      setUsers(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (payload) => {
    await adminApi.createUser(payload);
    await fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (id, payload) => {
    await adminApi.updateUser(id, payload);
    await fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id) => {
    await adminApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (selectedUser?.id === id) {
      setSelectedUser(null);
      setSelectedUserProgress(null);
    }
  }, [selectedUser]);

  const fetchUserProgress = useCallback(async (user) => {
    setSelectedUser(user);
    setProgressLoading(true);
    setSelectedUserProgress(null);
    try {
      const data = await adminApi.getUserProgress(user.id);
      setSelectedUserProgress(data);
    } catch {
      setSelectedUserProgress(userProgressMock[user.id] || null);
    } finally {
      setProgressLoading(false);
    }
  }, []);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
    setSelectedUserProgress(null);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    selectedUser,
    selectedUserProgress,
    progressLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    fetchUserProgress,
    clearSelectedUser,
    refetch: fetchUsers,
  };
}
