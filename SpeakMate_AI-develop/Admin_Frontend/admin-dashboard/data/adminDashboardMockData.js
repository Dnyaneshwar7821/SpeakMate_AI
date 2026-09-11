/**
 * admin-dashboard/data/adminDashboardMockData.js
 *
 * Mock data for the Super Admin Panel > Dashboard.
 * Frontend-only — mirrors what a backend API would return so the UI can be
 * swapped to real endpoints later without changing component interfaces.
 *
 * Exports:
 *   - dashboardKpis:     5 KPI cards (Total Users, School Users, Active Users,
 *                        Inactive Users, New Users)
 *   - adminNotifications: navbar notification feed
 */

export const dashboardKpis = [
    {
        id: "total-users",
        label: "Total Users",
        value: 12480,
        change: 12.5,
        trend: "up",
        icon: "users",
        accent: "#6c63ff",
        sparkline: [8, 9, 9, 10, 11, 11, 12, 12, 12, 12.4],
    },
    {
        id: "school-users",
        label: "School Users",
        value: 4260,
        change: 18.3,
        trend: "up",
        icon: "school",
        accent: "#22c55e",
        sparkline: [2, 2.4, 2.8, 3, 3.2, 3.5, 3.8, 4, 4.1, 4.26],
    },
    {
        id: "active-users",
        label: "Active Users",
        value: 8640,
        change: 8.2,
        trend: "up",
        icon: "activity",
        accent: "#10b981",
        sparkline: [5, 6, 6, 7, 7, 8, 8, 8.2, 8.4, 8.6],
    },
    {
        id: "inactive-users",
        label: "Inactive Users",
        value: 3840,
        change: -2.1,
        trend: "down",
        icon: "user-x",
        accent: "#f59e0b",
        sparkline: [4.2, 4.1, 4, 3.95, 3.9, 3.9, 3.88, 3.86, 3.85, 3.84],
    },
    {
        id: "new-users",
        label: "New Users",
        value: 342,
        change: 23.1,
        trend: "up",
        icon: "user-plus",
        accent: "#ec4899",
        sparkline: [2, 2.4, 2.6, 2.8, 3, 3.1, 3.2, 3.3, 3.4, 3.4],
    },
];

export const adminNotifications = [
    { id: "n-1", title: "New user signup", message: "Priya Sharma just joined SpeakMate AI.", time: "2m ago", read: false },
    { id: "n-2", title: "Server response slow", message: "AI chat latency spiked to 1.2s on /ai-chat.", time: "26m ago", read: false },
    { id: "n-3", title: "Weekly report ready", message: "Your platform analytics summary is available.", time: "1h ago", read: false },
    { id: "n-4", title: "Lesson approved", message: "“Conditionals” lesson was approved by super admin.", time: "3h ago", read: true },
    { id: "n-5", title: "Backup completed", message: "Nightly database backup finished successfully.", time: "9h ago", read: true },
];

export default { dashboardKpis, adminNotifications };
