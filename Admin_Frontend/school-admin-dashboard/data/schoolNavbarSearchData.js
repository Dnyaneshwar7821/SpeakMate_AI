import ROUTES from "@constants/routes";

export const schoolNavbarSearchItems = [
    { id: "nav-students", type: "Page", name: "Students Directory", path: ROUTES.SCHOOL_ADMIN_STUDENTS },
    { id: "nav-teachers", type: "Page", name: "Teachers Roster", path: ROUTES.SCHOOL_ADMIN_TEACHERS },
    { id: "nav-classes", type: "Page", name: "Classroom Management", path: ROUTES.SCHOOL_ADMIN_CLASSES },
    { id: "nav-results", type: "Page", name: "Results & Performance", path: ROUTES.SCHOOL_ADMIN_RESULTS },
];
