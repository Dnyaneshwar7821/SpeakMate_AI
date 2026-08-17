/**
 * admin-dashboard/data/adminUsersMockData.js
 *
 * Mock data for the Super Admin Panel > Dashboard (user management).
 * This structure mirrors what a backend API would return,
 * allowing simple integration later by swapping this import with a real API call.
 *
 * Fields:
 *   - id, name, email, role, status, joinedAt
 *   - userType: "general" | "school"   (distinguishes platform users from school users)
 *   - standard: 1..10                   (only meaningful when userType === "school")
 */

export const adminUsersMockData = [
    {
        id: "usr-1001",
        name: "Aditi Verma",
        email: "aditi.verma@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2025-11-02",
        userType: "general",
        standard: null,
    },
    {
        id: "usr-1002",
        name: "Rohan Mehta",
        email: "rohan.mehta@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2025-12-14",
        userType: "school",
        standard: 5,
    },
    {
        id: "usr-1003",
        name: "Sara Khan",
        email: "sara.khan@speakmate.ai",
        role: "Moderator",
        status: "active",
        joinedAt: "2026-01-08",
        userType: "general",
        standard: null,
    },
    {
        id: "usr-1004",
        name: "Liam Fernandes",
        email: "liam.fernandes@speakmate.ai",
        role: "Learner",
        status: "inactive",
        joinedAt: "2026-02-19",
        userType: "school",
        standard: 3,
    },
    {
        id: "usr-1005",
        name: "Neha Kulkarni",
        email: "neha.kulkarni@speakmate.ai",
        role: "Super Admin",
        status: "active",
        joinedAt: "2026-03-05",
        userType: "general",
        standard: null,
    },
    {
        id: "usr-1006",
        name: "Daniel Osei",
        email: "daniel.osei@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2026-04-22",
        userType: "school",
        standard: 8,
    },
    {
        id: "usr-1007",
        name: "Priya Sharma",
        email: "priya.sharma@speakmate.ai",
        role: "Learner",
        status: "inactive",
        joinedAt: "2026-05-11",
        userType: "school",
        standard: 1,
    },
    {
        id: "usr-1008",
        name: "Aarav Patel",
        email: "aarav.patel@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2026-05-18",
        userType: "school",
        standard: 10,
    },
    {
        id: "usr-1009",
        name: "Ishita Rao",
        email: "ishita.rao@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2026-06-02",
        userType: "school",
        standard: 7,
    },
    {
        id: "usr-1010",
        name: "Kabir Singh",
        email: "kabir.singh@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2026-06-15",
        userType: "general",
        standard: null,
    },
    {
        id: "usr-1011",
        name: "Meera Nair",
        email: "meera.nair@speakmate.ai",
        role: "Learner",
        status: "inactive",
        joinedAt: "2026-06-28",
        userType: "school",
        standard: 2,
    },
    {
        id: "usr-1012",
        name: "Yash Gupta",
        email: "yash.gupta@speakmate.ai",
        role: "Learner",
        status: "active",
        joinedAt: "2026-07-03",
        userType: "school",
        standard: 9,
    },
];

export const USER_ROLE_OPTIONS = ["Learner"];
export const USER_STATUS_OPTIONS = ["active", "inactive"];
export const USER_TYPE_OPTIONS = ["general", "school"];
export const STANDARD_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default adminUsersMockData;
