/**
 * school-admin-dashboard/data/schoolNavbarSearchData.js
 *
 * Mock search data for the School Admin navbar.
 */

import { schoolStudents } from "./schoolMockData";
import { adminTeachers } from "@admin/data/adminTeachersMockData";
import ROUTES from "@constants/routes";

export const schoolNavbarSearchItems = [
    ...schoolStudents.map((s) => ({
        id: `student-${s.id}`,
        type: "Student",
        name: s.name,
        path: ROUTES.SCHOOL_ADMIN_STUDENTS,
    })),
    ...adminTeachers.map((t) => ({
        id: `teacher-${t.id}`,
        type: "Teacher",
        name: t.name,
        path: ROUTES.SCHOOL_ADMIN_DASHBOARD,
    })),
];
