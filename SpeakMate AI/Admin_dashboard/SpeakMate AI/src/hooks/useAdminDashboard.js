import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@services/adminApi";

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

export function useAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersError, setUsersError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await withRetry(() => adminApi.getDashboard(), 2, 600);
      setDashboardData(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await withRetry(() => adminApi.getAllUsers(), 2, 600);
      setUsers(data);
    } catch (err) {
      setUsersError(err?.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await Promise.all([fetchDashboard(), fetchUsers()]);
  }, [fetchDashboard, fetchUsers]);

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
  }, [fetchDashboard, fetchUsers]);

  return {
    dashboardData,
    users,
    loading,
    usersLoading,
    error,
    usersError,
    refetch,
  };
}