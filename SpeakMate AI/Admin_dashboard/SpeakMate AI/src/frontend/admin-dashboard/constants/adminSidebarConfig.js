import {
    LayoutDashboard,
    Users,
    School,
    Building2,
    UserPlus,
    CreditCard,
    User,
    Settings,
    LogOut,
} from "lucide-react";
import ROUTES from "@constants/routes";

/**
 * admin-dashboard/constants/adminSidebarConfig.js
 *
 * Navigation configuration consumed by the admin Sidebar component.
 *
 * The sidebar is intentionally FLAT — no collapsible groups, no dropdowns,
 * no category headers. Every menu item is rendered individually in one
 * continuous list.
 *
 * Each item exposes:
 *   - id:    stable key
 *   - label: visible text
 *   - icon:  lucide-react icon component
 *   - path:  route to navigate to (from constants/routes)
 */

export const ADMIN_SIDEBAR_MENU = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD },
    { id: "all-users", label: "All Users", icon: Users, path: ROUTES.ADMIN_USERS },
    { id: "school-users", label: "School Users", icon: School, path: ROUTES.ADMIN_SCHOOL_USERS },
    { id: "add-school", label: "Add School", icon: Building2, path: ROUTES.ADMIN_ADD_SCHOOL },
    { id: "teachers", label: "Teachers", icon: UserPlus, path: ROUTES.ADMIN_TEACHERS },
    { id: "subscription", label: "Subscription & Billing", icon: CreditCard, path: ROUTES.ADMIN_SUBSCRIPTION },
];

export const ADMIN_SIDEBAR_FOOTER_MENU = [
    {
        id: "profile",
        label: "Profile",
        icon: User,
        path: ROUTES.ADMIN_PROFILE,
    },
    {
        id: "settings",
        label: "Settings",
        icon: Settings,
        path: ROUTES.ADMIN_SETTINGS,
    },
];

export const LOGOUT_ITEM = {
    id: "logout",
    label: "Logout",
    icon: LogOut,
};
