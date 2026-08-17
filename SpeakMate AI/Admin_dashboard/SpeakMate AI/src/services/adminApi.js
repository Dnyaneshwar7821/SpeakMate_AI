import api from "@services/api";

export const adminApi = {
  getDashboard: async () => {
    const { data } = await api.get("/admin/dashboard");
    return data;
  },

  getAllUsers: async (params = {}) => {
    const { data } = await api.get("/admin/users", { params });
    return data;
  },

  getUserById: async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },

  activateUser: async (id) => {
    const { data } = await api.put(`/admin/users/activate/${id}`);
    return data;
  },

  deactivateUser: async (id) => {
    const { data } = await api.put(`/admin/users/deactivate/${id}`);
    return data;
  },

  getUsersStats: async () => {
    const { data } = await api.get("/admin/users/stats");
    return data;
  },

  createUser: async (payload) => {
    const { data } = await api.post("/admin/users", payload);
    return data;
  },

  updateUser: async (id, payload) => {
    const { data } = await api.put(`/admin/users/${id}`, payload);
    return data;
  },

  deleteUser: async (id) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
  },

  getUserProgress: async (id) => {
    const { data } = await api.get(`/admin/users/${id}/progress`);
    return data;
  },
};

export default adminApi;