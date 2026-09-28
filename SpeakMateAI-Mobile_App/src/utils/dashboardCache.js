// In-memory cache to make dashboard and profile page transitions instant across tabs
let cachedDashboardData = null;
let cachedUserId = null;

export const DashboardCache = {
  get: (userId) => {
    if (userId && cachedUserId && cachedUserId !== userId) {
      return null;
    }
    return cachedDashboardData;
  },
  set: (data, userId) => {
    cachedDashboardData = data;
    if (userId) cachedUserId = userId;
  },
  updateProfileAvatar: (avatar) => {
    if (cachedDashboardData && cachedDashboardData.profile) {
      cachedDashboardData.profile.avatar = avatar;
    }
  },
  clear: () => {
    cachedDashboardData = null;
    cachedUserId = null;
  },
};

export default DashboardCache;
