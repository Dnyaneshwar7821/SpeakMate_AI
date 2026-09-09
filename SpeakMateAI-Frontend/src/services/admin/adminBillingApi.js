import apiClient from "./apiClient";

export const adminBillingApi = {
  // Get billing statistics
  getStatistics: async () => {
    const response = await apiClient.get("/api/admin/billing/statistics");
    return response.data;
  },

  // Get invoices
  getInvoices: async (page = 0, size = 10, sortBy = "id", sortDir = "DESC") => {
    const response = await apiClient.get("/api/admin/billing/invoices", {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  }
};

export default adminBillingApi;
