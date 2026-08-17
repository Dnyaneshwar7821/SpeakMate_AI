/**
 * admin-dashboard/data/adminNavbarSearchData.js
 *
 * Mock search data for the Super Admin navbar.
 * Combines users and teachers for global search.
 */

import { adminUsersMockData } from "./adminUsersMockData";
import { adminTeachers } from "./adminTeachersMockData";
import ROUTES from "@constants/routes";

export const adminNavbarSearchItems = [
    ...adminUsersMockData.map((u) => ({
        id: `user-${u.id}`,
        type: "User",
        name: u.name,
        path: ROUTES.ADMIN_DASHBOARD,
    })),
    ...adminTeachers.map((t) => ({
        id: `teacher-${t.id}`,
        type: "Teacher",
        name: t.name,
        path: ROUTES.ADMIN_TEACHERS,
    })),
];
