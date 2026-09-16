import apiClient from "./apiClient";

export const subscriptionApi = {
  // Get all subscription plans
  getAllPlans: async (page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/subscriptions", {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  // Get user subscriptions
  getUserSubscriptions: async (page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/subscriptions/users", {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  // Assign a subscription plan to a user
  assignPlanToUser: async (userId, planId, paymentMethod, amountPaid, transactionId) => {
    const response = await apiClient.post("/api/admin/subscriptions/assign", null, {
      params: {
        userId,
        planId,
        paymentMethod,
        amountPaid,
        transactionId
      }
    });
    return response.data;
  },

  // Renew an existing subscription
  renewSubscription: async (subscriptionId, paymentMethod, amountPaid, transactionId) => {
    const response = await apiClient.put(`/api/admin/subscriptions/renew/${subscriptionId}`, null, {
      params: {
        paymentMethod,
        amountPaid,
        transactionId
      }
    });
    return response.data;
  },

  // Cancel an existing subscription
  cancelSubscription: async (subscriptionId) => {
    const response = await apiClient.put(`/api/admin/subscriptions/cancel/${subscriptionId}`);
    return response.data;
  },

  // Filter subscriptions
  filterSubscriptions: async (filterParams, page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/subscriptions/filter", {
      params: { ...filterParams, page, size, sortBy, sortDir }
    });
    return response.data;
  },

  // Get subscription statistics
  getStatistics: async () => {
    const response = await apiClient.get("/api/admin/subscriptions/statistics");
    return response.data;
  },

  // Get single plan by ID
  getPlanById: async (id) => {
    const response = await apiClient.get(`/api/admin/subscriptions/${id}`);
    return response.data;
  },

  // Create custom plan
  createPlan: async (planData) => {
    const response = await apiClient.post("/api/admin/subscriptions", planData);
    return response.data;
  },

  // Update plan
  updatePlan: async (id, planData) => {
    const response = await apiClient.put(`/api/admin/subscriptions/${id}`, planData);
    return response.data;
  },

  // Activate plan
  activatePlan: async (id) => {
    const response = await apiClient.patch(`/api/admin/subscriptions/${id}/activate`);
    return response.data;
  },

  // Deactivate plan
  deactivatePlan: async (id) => {
    const response = await apiClient.patch(`/api/admin/subscriptions/${id}/deactivate`);
    return response.data;
  },

  // Delete plan (soft delete/deactivate)
  deletePlan: async (id) => {
    const response = await apiClient.delete(`/api/admin/subscriptions/${id}`);
    return response.data;
  }
};

export default subscriptionApi;
