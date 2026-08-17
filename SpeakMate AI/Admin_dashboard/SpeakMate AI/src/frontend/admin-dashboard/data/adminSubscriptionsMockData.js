/**
 * admin-dashboard/data/adminSubscriptionsMockData.js
 *
 * Mock data for the Super Admin Panel > Subscription & Billing page.
 * Frontend-only — mirrors what a backend API would return so the UI can be
 * swapped to real endpoints later without changing component interfaces.
 *
 * Sections:
 *   - adminSubscriptions: subscribed users and their plan details
 *   - SUBSCRIPTION_PLAN_OPTIONS, SUBSCRIPTION_STATUS_OPTIONS, BILLING_CYCLE_OPTIONS
 */

export const adminSubscriptions = [
    {
        id: "sub-3001",
        user: { name: "Aditi Verma", email: "aditi.verma@speakmate.ai" },
        plan: "Premium",
        billingCycle: "Monthly",
        status: "Active",
        amount: 499,
        currency: "₹",
        startedAt: "2026-04-12",
        renewsAt: "2026-08-12",
    },
    {
        id: "sub-3002",
        user: { name: "Rohan Mehta", email: "rohan.mehta@speakmate.ai" },
        plan: "Basic",
        billingCycle: "Yearly",
        status: "Active",
        amount: 2999,
        currency: "₹",
        startedAt: "2025-12-20",
        renewsAt: "2026-12-20",
    },
    {
        id: "sub-3003",
        user: { name: "Sara Khan", email: "sara.khan@speakmate.ai" },
        plan: "Premium",
        billingCycle: "Monthly",
        status: "Cancelled",
        amount: 499,
        currency: "₹",
        startedAt: "2026-01-08",
        renewsAt: "—",
    },
    {
        id: "sub-3004",
        user: { name: "Daniel Osei", email: "daniel.osei@speakmate.ai" },
        plan: "Premium",
        billingCycle: "Yearly",
        status: "Active",
        amount: 4999,
        currency: "₹",
        startedAt: "2026-04-22",
        renewsAt: "2027-04-22",
    },
    {
        id: "sub-3005",
        user: { name: "Aarav Patel", email: "aarav.patel@speakmate.ai" },
        plan: "Basic",
        billingCycle: "Monthly",
        status: "Past Due",
        amount: 199,
        currency: "₹",
        startedAt: "2026-05-18",
        renewsAt: "2026-07-18",
    },
    {
        id: "sub-3006",
        user: { name: "Ishita Rao", email: "ishita.rao@speakmate.ai" },
        plan: "Premium",
        billingCycle: "Monthly",
        status: "Active",
        amount: 499,
        currency: "₹",
        startedAt: "2026-06-02",
        renewsAt: "2026-08-02",
    },
];

export const SUBSCRIPTION_PLAN_OPTIONS = ["Basic", "Premium", "Pro"];
export const SUBSCRIPTION_STATUS_OPTIONS = ["Active", "Cancelled", "Past Due"];
export const BILLING_CYCLE_OPTIONS = ["Monthly", "Quarterly", "Half-Yearly", "Yearly"];

export default adminSubscriptions;
