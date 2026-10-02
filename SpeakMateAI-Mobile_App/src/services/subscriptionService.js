import api, { getAuthToken } from "../api/api";
import * as SecureStore from "expo-secure-store";
import { STORAGE_KEYS } from "../utils/storageKeys";

export const subscriptionService = {
  getMySubscription: async () => {
    try {
      let token = getAuthToken();
      if (!token) {
        token = await SecureStore.getItemAsync(STORAGE_KEYS.token).catch(() => null);
      }
      if (!token || token === "null" || token === "undefined") {
        return {
          isPro: false,
          planType: "FREE",
          status: "INACTIVE",
        };
      }

      const response = await api.get("/api/subscription/my-subscription");
      return response.data;
    } catch (err) {
      if (err.response?.status !== 401) {
        console.warn("[SubscriptionService] getMySubscription:", err.message);
      }
      return {
        isPro: false,
        planType: "FREE",
        status: "INACTIVE",
      };
    }
  },

  getPlans: async () => {
    try {
      const response = await api.get("/api/subscription/plans");
      return response.data;
    } catch {
      return [
        {
          id: "MONTHLY_PRO",
          planType: "MONTHLY",
          name: "Monthly Pro",
          price: 1,
          currency: "INR",
          billingCycle: "month",
          description: "Full unlimited access to AI Conversation & Speaking Coach",
        },
        {
          id: "YEARLY_PRO",
          planType: "YEARLY",
          name: "Annual Pro VIP",
          price: 1199,
          currency: "INR",
          billingCycle: "year",
          description: "Best Value: Save 33% with full year access & certificate",
        },
      ];
    }
  },

  createOrder: async (planType) => {
    const response = await api.post("/api/subscription/create-order", { planType });
    return response.data;
  },

  verifyPayment: async (payload) => {
    const response = await api.post("/api/subscription/verify-payment", payload);
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post("/api/subscription/cancel");
    return response.data;
  },
};

export default subscriptionService;
