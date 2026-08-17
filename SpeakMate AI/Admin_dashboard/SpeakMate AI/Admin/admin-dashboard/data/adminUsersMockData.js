/**
 * admin-dashboard/data/adminUsersMockData.js
 *
 * Mock data for the Admin Panel > Dashboard (user management).
 * This structure mirrors what a backend API would return,
 * allowing simple integration later by swapping this import with a real API call.
 */

export const adminUsersMockData = [
    {
        id: "usr-1001",
        name: "Aditi Verma",
        email: "aditi.verma@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2025-11-02",
    },
    {
        id: "usr-1002",
        name: "Rohan Mehta",
        email: "rohan.mehta@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2025-12-14",
    },
    {
        id: "usr-1003",
        name: "Sara Khan",
        email: "sara.khan@speakmate.ai",
        role: "Moderator",
        status: "active",
        joinedAt: "2026-01-08",
    },
    {
        id: "usr-1004",
        name: "Liam Fernandes",
        email: "liam.fernandes@speakmate.ai",
        role: "Learner",
        status: "inactive",
        joinedAt: "2026-02-19",
    },
    {
        id: "usr-1005",
        name: "Neha Kulkarni",
        email: "neha.kulkarni@speakmate.ai",
        role: "Admin",
        status: "active",
        joinedAt: "2026-03-05",
    },
    {
        id: "usr-1006",
        name: "Daniel Osei",
        email: "daniel.osei@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2026-04-22",
    },
    {
        id: "usr-1007",
        name: "Priya Sharma",
        email: "priya.sharma@speakmate.ai",
        role: "Learner",
        status: "inactive",
        joinedAt: "2026-05-11",
    },
];

export const USER_ROLE_OPTIONS = ["Learner", "Moderator", "Admin"];
export const USER_STATUS_OPTIONS = ["active", "inactive"];

export default adminUsersMockData;
