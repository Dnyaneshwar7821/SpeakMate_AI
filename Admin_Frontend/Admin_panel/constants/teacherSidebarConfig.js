import {
    LayoutDashboard,
    Users,
    BarChart3,
    FileText,
    Bell,
    User,
    Settings,
    LogOut,
} from "lucide-react";
import ROUTES from "@constants/routes";

export const TEACHER_SIDEBAR_MENU = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: ROUTES.TEACHER_DASHBOARD },
    { id: "students", label: "Students", icon: Users, path: ROUTES.TEACHER_STUDENTS },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: ROUTES.TEACHER_ANALYTICS },
    { id: "reports", label: "Reports", icon: FileText, path: ROUTES.TEACHER_REPORTS },
    { id: "notifications", label: "Notifications", icon: Bell, path: ROUTES.TEACHER_NOTIFICATIONS },
];

export const TEACHER_SIDEBAR_FOOTER_MENU = [
    { id: "profile", label: "Profile", icon: User, path: ROUTES.TEACHER_PROFILE },
    { id: "settings", label: "Settings", icon: Settings, path: ROUTES.TEACHER_SETTINGS },
];

export const LOGOUT_ITEM = {
    id: "logout",
    label: "Logout",
    icon: LogOut,
};
