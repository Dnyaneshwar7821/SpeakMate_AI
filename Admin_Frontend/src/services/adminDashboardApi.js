import apiClient from "./apiClient";

export const adminDashboardApi = {
  getDashboardStats: async () => {
    const response = await apiClient.get("/api/admin/dashboard");
    const data = response?.data || {};

    // If backend provides schoolUsers, newUsers, and inactiveUsers, return directly
    const hasSchoolUsers = data.schoolUsers !== undefined && data.schoolUsers !== null;
    const hasNewUsers = data.newUsers !== undefined && data.newUsers !== null;
    const hasInactiveUsers = data.inactiveUsers !== undefined && data.inactiveUsers !== null;

    if (hasSchoolUsers && hasNewUsers && hasInactiveUsers && data.totalSchools !== undefined) {
      return data;
    }

    const augmented = { ...data };

    if (!hasInactiveUsers && data.totalUsers !== undefined && data.activeUsers !== undefined) {
      augmented.inactiveUsers = Math.max(0, Number(data.totalUsers || 0) - Number(data.activeUsers || 0));
    }

    // Fallback: Fetch school user count if missing
    if (!hasSchoolUsers) {
      try {
        const schoolStatsRes = await apiClient.get("/api/admin/school-users/statistics");
        const schoolStats = schoolStatsRes?.data?.data || schoolStatsRes?.data || {};
        augmented.schoolUsers = schoolStats.totalUsers ?? 0;
      } catch (err) {
        console.warn("Could not fetch fallback school user statistics:", err);
      }
    }

    // Fallback: Fetch total schools count if missing
    if (augmented.totalSchools === undefined || augmented.totalSchools === null) {
      try {
        const schoolsRes = await apiClient.get("/api/admin/schools");
        const schoolsList = Array.isArray(schoolsRes?.data) ? schoolsRes.data : (schoolsRes?.data?.data || []);
        augmented.totalSchools = schoolsList.length;
      } catch (err) {
        console.warn("Could not fetch fallback schools count:", err);
      }
    }

    // Fallback: Fetch new users (this month registrations) if missing
    if (!hasNewUsers) {
      try {
        const userStatsRes = await apiClient.get("/api/admin/users/statistics");
        const userStats = userStatsRes?.data?.data || userStatsRes?.data || {};
        augmented.newUsers = userStats.thisMonthRegistrations ?? userStats.thisWeekRegistrations ?? 0;
        augmented.thisMonthRegistrations = userStats.thisMonthRegistrations;
      } catch (err) {
        console.warn("Could not fetch fallback user statistics:", err);
      }
    }

    return augmented;
  },

  getDetailedDashboardStats: async () => {
    const [dashboardRes, schoolsRes, schoolStatsRes, teachersRes] = await Promise.allSettled([
      apiClient.get("/api/admin/dashboard"),
      apiClient.get("/api/admin/schools"),
      apiClient.get("/api/admin/school-users/statistics"),
      apiClient.get("/api/v1/school/teachers"),
    ]);

    // 1. Dashboard data (Platform Users)
    const dData = dashboardRes.status === "fulfilled" ? (dashboardRes.value?.data || {}) : {};
    const totalUsers = Number(dData.totalUsers ?? 0);
    const activeUsers = Number(dData.activeUsers ?? 0);
    const inactiveUsers = dData.inactiveUsers !== undefined 
      ? Number(dData.inactiveUsers) 
      : Math.max(0, totalUsers - activeUsers);
    const newUsers = Number(dData.newUsers ?? dData.thisMonthRegistrations ?? 0);

    // 2. Schools
    let totalSchools = Number(dData.totalSchools ?? 0);
    let activeSchools = 0;
    let inactiveSchools = 0;
    if (schoolsRes.status === "fulfilled" && schoolsRes.value?.data) {
      const list = Array.isArray(schoolsRes.value.data) 
        ? schoolsRes.value.data 
        : (schoolsRes.value.data?.data || []);
      totalSchools = list.length;
      activeSchools = list.filter((s) => s.active !== false).length;
      inactiveSchools = list.filter((s) => s.active === false).length;
    } else {
      activeSchools = totalSchools;
    }

    // 3. School Users (Students)
    let schoolUsers = Number(dData.schoolUsers ?? 0);
    let activeSchoolUsers = 0;
    let inactiveSchoolUsers = 0;
    if (schoolStatsRes.status === "fulfilled" && schoolStatsRes.value?.data) {
      const sStats = schoolStatsRes.value.data?.data || schoolStatsRes.value.data || {};
      schoolUsers = Number(sStats.totalUsers ?? schoolUsers);
      activeSchoolUsers = Number(sStats.activeUsers ?? 0);
      inactiveSchoolUsers = Number(sStats.inactiveUsers ?? Math.max(0, schoolUsers - activeSchoolUsers));
    } else {
      activeSchoolUsers = schoolUsers;
    }

    // 4. Faculty Teachers
    let totalTeachers = 0;
    let activeTeachers = 0;
    let inactiveTeachers = 0;
    if (teachersRes.status === "fulfilled" && teachersRes.value?.data) {
      const tList = Array.isArray(teachersRes.value.data) ? teachersRes.value.data : [];
      totalTeachers = tList.length;
      activeTeachers = tList.filter((t) => t.active !== false).length;
      inactiveTeachers = tList.filter((t) => t.active === false).length;
    }

    return {
      schools: {
        total: totalSchools,
        active: activeSchools,
        inactive: inactiveSchools,
      },
      schoolUsers: {
        total: schoolUsers,
        active: activeSchoolUsers,
        inactive: inactiveSchoolUsers,
      },
      teachers: {
        total: totalTeachers,
        active: activeTeachers,
        inactive: inactiveTeachers,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        newThisMonth: newUsers,
      },
      totalSchools,
      schoolUsers,
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
    };
  }
};

export default adminDashboardApi;
