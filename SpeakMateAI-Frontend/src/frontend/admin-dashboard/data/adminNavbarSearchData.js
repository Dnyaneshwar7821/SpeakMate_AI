import ROUTES from "@constants/routes";

export const adminNavbarSearchItems = [
    { id: "nav-users", type: "Page", name: "Users Directory", path: ROUTES.ADMIN_USERS || "/admin/users" },
    { id: "nav-teachers", type: "Page", name: "Teachers Directory", path: ROUTES.ADMIN_TEACHERS || "/admin/teachers" },
    { id: "nav-subscriptions", type: "Page", name: "Subscriptions & Billing", path: ROUTES.ADMIN_SUBSCRIPTIONS || "/admin/subscriptions" },
    { id: "nav-settings", type: "Page", name: "System Settings", path: ROUTES.ADMIN_SETTINGS || "/admin/settings" },
];
