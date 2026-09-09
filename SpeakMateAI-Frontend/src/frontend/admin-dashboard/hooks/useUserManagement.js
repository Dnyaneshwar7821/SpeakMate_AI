import { useMemo, useState, useEffect, useCallback } from "react";
import { adminUserApi } from "@services/admin/adminUserApi";
import { normalizeIndianMobile } from "@utils/phoneValidator";

const getErrorMessage = (err, defaultMsg) => {
  if (err?.response?.data) {
    if (typeof err.response.data === "object") {
      return err.response.data.message || err.response.data.error || JSON.stringify(err.response.data);
    } else if (typeof err.response.data === "string") {
      return err.response.data;
    }
  }
  return err?.message || defaultMsg;
};

const mapBackendUser = (u) => ({
  id: u.id,
  name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Unknown",
  email: u.email,
  phone: u.phone || "",
  role: u.role === "STUDENT" ? "Student" : (u.role === "USER" ? "Learner" : (u.role === "TEACHER" ? "Teacher" : (u.role === "SCHOOL_ADMIN" ? "School Admin" : (u.role === "SUPER_ADMIN" ? "Super Admin" : u.role)))),
  status: u.active ? "active" : "inactive",
  joinedAt: u.createdAt ? u.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
  userType: u.role === "STUDENT" ? "school" : "general",
  standard: u.standard || null,
  raw: u
});

let userManagementCache = {
  users: null,
  totalPages: 0,
  totalElements: 0,
};

export function useUserManagement() {
  const [users, setUsers] = useState(() => userManagementCache.users || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(() => !userManagementCache.users);
  const [error, setError] = useState("");

  // Pagination states
  const [page, setPage] = useState(0); // 0-based for backend
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(() => userManagementCache.totalPages || 0);
  const [totalElements, setTotalElements] = useState(() => userManagementCache.totalElements || 0);

  // Filters state
  const [filters, setFilters] = useState({
    status: null, // null, true (Active), false (Inactive)
    englishLevel: "",
    nativeLanguage: "",
    purpose: ""
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0); // Reset page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadUsers = useCallback(async () => {
    const isDefaultQuery = !debouncedSearch.trim() && page === 0 &&
      filters.status === null && !filters.englishLevel && !filters.nativeLanguage && !filters.purpose;

    setUsers((curr) => {
      if (!curr || curr.length === 0) {
        setIsLoading(true);
      }
      return curr;
    });
    setError("");
    try {
      let res;
      if (debouncedSearch.trim()) {
        res = await adminUserApi.searchUsers(debouncedSearch.trim(), page, size);
      } else {
        const hasActiveFilter =
          filters.status !== null ||
          filters.englishLevel ||
          filters.nativeLanguage ||
          filters.purpose;

        if (hasActiveFilter) {
          const filterParams = {};
          if (filters.status !== null) filterParams.status = filters.status;
          if (filters.englishLevel) filterParams.englishLevel = filters.englishLevel;
          if (filters.nativeLanguage) filterParams.nativeLanguage = filters.nativeLanguage;
          if (filters.purpose) filterParams.purpose = filters.purpose;
          res = await adminUserApi.filterUsers(filterParams, page, size);
        } else {
          res = await adminUserApi.getAllUsers(page, size);
        }
      }

      const pageData = res?.data;
      const content = pageData?.content || [];
      const mapped = content.map(mapBackendUser);
      setUsers(mapped);
      setTotalPages(pageData?.totalPages || 0);
      setTotalElements(pageData?.totalElements || 0);

      if (isDefaultQuery) {
        userManagementCache.users = mapped;
        userManagementCache.totalPages = pageData?.totalPages || 0;
        userManagementCache.totalElements = pageData?.totalElements || 0;
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers((curr) => {
        if (!curr || curr.length === 0) {
          setError("Failed to load users from server.");
        }
        return curr;
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, size, filters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const addUser = async (data) => {
    const [firstName = "", ...lastNameParts] = (data.name || "").split(" ");
    const lastName = lastNameParts.join(" ") || "User";
    const payload = {
      firstName,
      lastName,
      email: data.email,
      password: data.password,
      phone: data.phone ? normalizeIndianMobile(data.phone) : "",
      englishLevel: data.englishLevel || "Beginner",
      nativeLanguage: data.nativeLanguage || "English",
      learningGoal: data.learningGoal || "Improve English speaking skills",
      dailyGoalMinutes: data.dailyGoalMinutes ? Number(data.dailyGoalMinutes) : 15,
      active: data.status === "active",
      schoolName: data.schoolName || "",
      standard: data.standard ? String(data.standard) : "",
      rollNumber: data.rollNo || "",
      userType: data.userType || "general"
    };
    try {
      const res = await adminUserApi.createUser(payload);
      await loadUsers();
      return res;
    } catch (err) {
      console.error("Failed to add user:", err);
      throw err;
    }
  };

  const updateUser = async (id, data) => {
    const existingUser = users.find((u) => u.id === id);
    const raw = existingUser?.raw || {};

    const [firstName = "", ...lastNameParts] = (data.name || "").split(" ");
    const lastName = lastNameParts.join(" ") || "User";
    const payload = {
      firstName,
      lastName,
      email: data.email,
      phone: data.phone ? normalizeIndianMobile(data.phone) : (raw.phone ? normalizeIndianMobile(raw.phone) : ""),
      englishLevel: raw.englishLevel || "Beginner",
      nativeLanguage: raw.nativeLanguage || "English",
      learningGoal: raw.learningGoal || "Improve English speaking skills",
      dailyGoalMinutes: raw.dailyGoalMinutes || 15,
      avatar: raw.avatar || "",
      preferredVoice: raw.preferredVoice || "",
      preferredAccent: raw.preferredAccent || "",
      ageGroup: raw.ageGroup || "",
      active: data.status === "active",
      schoolName: data.schoolName || "",
      standard: data.standard ? String(data.standard) : "",
      rollNumber: data.rollNo || "",
      userType: data.userType || "general"
    };
    try {
      console.log("API base URL:", import.meta.env.VITE_API_BASE_URL || "http://localhost:9091");
      console.log("Update user ID:", id);
      console.log("Update payload:", payload);
      await adminUserApi.updateUser(id, payload);
      await loadUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(getErrorMessage(err, "Failed to update user."));
      throw err;
    }
  };

  const activateUser = async (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "active" } : u))
    );
    try {
      await adminUserApi.activateUser(id);
      window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "user", action: "activate", id } }));
    } catch (err) {
      console.error("Failed to activate user:", err);
      await loadUsers();
      throw err;
    }
  };

  const deactivateUser = async (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: "inactive" } : u))
    );
    try {
      await adminUserApi.deactivateUser(id);
      window.dispatchEvent(new CustomEvent("school_data_updated", { detail: { type: "user", action: "deactivate", id } }));
    } catch (err) {
      console.error("Failed to deactivate user:", err);
      await loadUsers();
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      await adminUserApi.deleteUser(id);
    } catch (err) {
      console.warn("API delete user warning:", err);
    } finally {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      await loadUsers();
    }
  };

  const exportUsers = async () => {
    try {
      const response = await adminUserApi.exportUsers();
      if (response && response.data) {
        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const contentDisposition = response.headers ? response.headers["content-disposition"] : null;
        let filename = "users_export.csv";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1];
          }
        }
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn("API export failed, using local user data export:", err);
    }

    if (users && users.length > 0) {
      const headers = ["ID", "Name", "Email", "Role", "Status", "Joined At", "Standard"];
      const csvLines = [headers.join(",")];
      for (const u of users) {
        const line = [
          u.id || "",
          `"${(u.name || "").replace(/"/g, '""')}"`,
          `"${(u.email || "").replace(/"/g, '""')}"`,
          `"${(u.role || "").replace(/"/g, '""')}"`,
          `"${(u.status || "").replace(/"/g, '""')}"`,
          `"${(u.joinedAt || "").replace(/"/g, '""')}"`,
          `"${(u.standard || "").replace(/"/g, '""')}"`
        ];
        csvLines.push(line.join(","));
      }
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } else {
      alert("No user data available to export.");
    }
  };

  return {
    users,
    totalUsers: totalElements,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    filters,
    setFilters,
    addUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    exportUsers,
    isLoading,
    error,
    refresh: loadUsers
  };
}

export default useUserManagement;
