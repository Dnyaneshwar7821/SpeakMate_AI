/**
 * admin-dashboard/data/adminDashboardMockData.js
 *
 * Mock data for the redesigned Admin Panel > Dashboard.
 * Frontend-only — mirrors what a backend API would return so the UI can be
 * swapped to real endpoints later without changing component interfaces.
 *
 * Sections:
 *   - adminKpis:        6 KPI cards (value, change %, trend sparkline)
 *   - userGrowthData:   monthly user growth (line chart)
 *   - aiUsageData:      weekly AI conversations (bar chart)
 *   - learningProgress: per-skill completion (progress chart)
 *   - adminActivities:  recent activity timeline
 *   - adminNotifications: navbar notification feed
 *   - quickActions:     dashboard quick-action shortcuts
 */

export const adminKpis = [
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
        id: "active-users",
        label: "Active Users",
        value: 8640,
        change: 8.2,
        trend: "up",
        icon: "activity",
        accent: "#22c55e",
        sparkline: [5, 6, 6, 7, 7, 8, 8, 8.2, 8.4, 8.6],
    },
    {
        id: "new-users",
        label: "New Users",
        value: 342,
        change: 23.1,
        trend: "up",
        icon: "user-plus",
        accent: "#f59e0b",
        sparkline: [2, 2.4, 2.6, 2.8, 3, 3.1, 3.2, 3.3, 3.4, 3.4],
    },
    {
        id: "ai-conversations",
        label: "AI Conversations",
        value: 18920,
        change: 15.7,
        trend: "up",
        icon: "message",
        accent: "#8b5cf6",
        sparkline: [10, 11, 12, 13, 14, 15, 16, 17, 18, 18.9],
    },
    {
        id: "speaking-sessions",
        label: "Speaking Sessions",
        value: 5630,
        change: -3.4,
        trend: "down",
        icon: "mic",
        accent: "#ec4899",
        sparkline: [6.2, 6.1, 6, 5.9, 5.8, 5.8, 5.7, 5.7, 5.6, 5.6],
    },
    {
        id: "revenue",
        label: "Revenue",
        value: 48230,
        change: 9.8,
        trend: "up",
        icon: "dollar",
        accent: "#10b981",
        prefix: "$",
        sparkline: [3.8, 4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8],
    },
];

export const userGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: [
        { name: "Total Users", color: "#6c63ff", values: [4200, 4800, 5400, 6100, 6900, 7600, 8400, 9200, 10100, 11000, 11800, 12480] },
        { name: "Active Users", color: "#22c55e", values: [2800, 3200, 3600, 4100, 4700, 5200, 5800, 6400, 7100, 7800, 8300, 8640] },
    ],
};

export const aiUsageData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [2400, 3100, 2800, 3600, 4200, 3800, 2900],
};

export const learningProgress = [
    { label: "Speaking", value: 78, color: "#6c63ff" },
    { label: "Grammar", value: 64, color: "#8b5cf6" },
    { label: "Vocabulary", value: 71, color: "#ec4899" },
    { label: "Listening", value: 58, color: "#f59e0b" },
];

export const adminActivities = [
    {
        id: "act-1",
        type: "user",
        title: "New user registered",
        message: "Priya Sharma created an account",
        time: "2m ago",
        color: "#22c55e",
    },
    {
        id: "act-2",
        type: "ai",
        title: "AI conversation completed",
        message: "Aditi Verma finished a 12-min chat session",
        time: "18m ago",
        color: "#8b5cf6",
    },
    {
        id: "act-3",
        type: "speaking",
        title: "Speaking session graded",
        message: "Rohan Mehta scored 88% on pronunciation",
        time: "1h ago",
        color: "#ec4899",
    },
    {
        id: "act-4",
        type: "content",
        title: "Lesson published",
        message: "New Grammar lesson “Conditionals” went live",
        time: "3h ago",
        color: "#f59e0b",
    },
    {
        id: "act-5",
        type: "user",
        title: "User role updated",
        message: "Sara Khan promoted to Moderator",
        time: "5h ago",
        color: "#6c63ff",
    },
    {
        id: "act-6",
        type: "payment",
        title: "Premium subscription",
        message: "Daniel Osei upgraded to Premium",
        time: "8h ago",
        color: "#10b981",
    },
];

export const adminNotifications = [
    { id: "n-1", title: "New user signup", message: "Priya Sharma just joined SpeakMate AI.", time: "2m ago", read: false },
    { id: "n-2", title: "Server response slow", message: "AI chat latency spiked to 1.2s on /ai-chat.", time: "26m ago", read: false },
    { id: "n-3", title: "Weekly report ready", message: "Your platform analytics summary is available.", time: "1h ago", read: false },
    { id: "n-4", title: "Lesson approved", message: "“Conditionals” lesson was approved by admin.", time: "3h ago", read: true },
    { id: "n-5", title: "Backup completed", message: "Nightly database backup finished successfully.", time: "9h ago", read: true },
];

export const quickActions = [
    { id: "qa-1", label: "Add User", icon: "user-plus", accent: "#6c63ff" },
    { id: "qa-2", label: "New Lesson", icon: "book", accent: "#8b5cf6" },
    { id: "qa-3", label: "Send Announcement", icon: "megaphone", accent: "#f59e0b" },
    { id: "qa-4", label: "Export Report", icon: "download", accent: "#10b981" },
];

export default {
    adminKpis,
    userGrowthData,
    aiUsageData,
    learningProgress,
    adminActivities,
    adminNotifications,
    quickActions,
};
