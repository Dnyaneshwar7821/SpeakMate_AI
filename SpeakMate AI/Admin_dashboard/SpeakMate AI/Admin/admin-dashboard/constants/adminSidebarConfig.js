import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    GraduationCap,
    Mic,
    BookOpen,
    Languages,
    Headphones,
    MessageSquare,
    TrendingUp,
    BarChart3,
    Activity,
    FileText,
    Image,
    Settings,
    User,
    LogOut,
} from "lucide-react";
import ROUTES from "@constants/routes";

/**
 * admin-dashboard/constants/adminSidebarConfig.js
 *
 * Navigation configuration consumed by the admin Sidebar component.
 *
 * The sidebar is intentionally FLAT — no collapsible groups, no dropdowns.
 * Every menu item is rendered individually in one continuous list.
 *
 * Items may carry an optional `section` label. When consecutive items share
 * the same `section`, the Sidebar renders a single subtle label above the
 * group (purely visual — it does NOT create a dropdown).
 *
 * Each item exposes:
 *   - id:    stable key
 *   - label: visible text
 *   - icon:  lucide-react icon component
 *   - path:  route to navigate to (from constants/routes)
 *   - section (optional): visual grouping label
 */

export const ADMIN_SIDEBAR_MENU = [
    // --- Overview ---
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD, section: "Overview" },

    // --- User Management ---
    { id: "users-all", label: "All Users", icon: Users, path: ROUTES.ADMIN_DASHBOARD, section: "User Management" },
    { id: "users-roles", label: "Roles & Permissions", icon: ShieldCheck, path: ROUTES.ADMIN_DASHBOARD },

    // --- Lessons ---
    { id: "lessons-speaking", label: "Speaking", icon: Mic, path: ROUTES.SPEAKING, section: "Lessons" },
    { id: "lessons-grammar", label: "Grammar", icon: BookOpen, path: ROUTES.GRAMMAR },
    { id: "lessons-vocabulary", label: "Vocabulary", icon: Languages, path: ROUTES.VOCABULARY },
    { id: "lessons-listening", label: "Listening", icon: Headphones, path: ROUTES.LISTENING },

    // --- Engagement ---
    { id: "ai-chats", label: "AI Chats", icon: MessageSquare, path: ROUTES.AI_CHAT, section: "Engagement" },
    { id: "progress", label: "Progress", icon: TrendingUp, path: ROUTES.PROGRESS },

    // --- Analytics ---
    { id: "analytics-overview", label: "Overview", icon: BarChart3, path: ROUTES.ADMIN_DASHBOARD, section: "Analytics" },
    { id: "analytics-activity", label: "User Activity", icon: Activity, path: ROUTES.ADMIN_DASHBOARD },

    // --- Content ---
    { id: "content-lessons", label: "Manage Lessons", icon: FileText, path: ROUTES.ADMIN_DASHBOARD, section: "Content" },
    { id: "content-media", label: "Media Library", icon: Image, path: ROUTES.ADMIN_DASHBOARD },
];

export const ADMIN_SIDEBAR_FOOTER_MENU = [
    {
        id: "profile",
        label: "Profile",
        icon: User,
        path: ROUTES.PROFILE,
    },
    {
        id: "settings",
        label: "Settings",
        icon: Settings,
        path: ROUTES.SETTINGS,
    },
];

export const LOGOUT_ITEM = {
    id: "logout",
    label: "Logout",
    icon: LogOut,
};
