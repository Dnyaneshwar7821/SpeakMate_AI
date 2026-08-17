import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import ROUTES from "@constants/routes";

import TeacherNavbar from "./TeacherNavbar";
import TeacherSidebar from "./TeacherSidebar";

const teacherScrollPositions = new Map();
const focusableSelector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

function getBreadcrumbs(pathname) {
    if (pathname.startsWith(`${ROUTES.TEACHER_STUDENTS}/`)) {
        return [
            { label: "Dashboard", path: ROUTES.TEACHER_DASHBOARD },
            { label: "Students", path: ROUTES.TEACHER_STUDENTS },
            { label: "Student Details" },
        ];
    }

    const page = [
        [ROUTES.TEACHER_STUDENTS, "Students"],
        [ROUTES.TEACHER_ANALYTICS, "Analytics"],
        [ROUTES.TEACHER_REPORTS, "Reports"],
        [ROUTES.TEACHER_PROFILE, "Profile"],
    ].find(([path]) => path === pathname);

    return page
        ? [
            { label: "Dashboard", path: ROUTES.TEACHER_DASHBOARD },
            { label: page[1] },
        ]
        : [{ label: "Dashboard" }];
}

function TeacherBreadcrumbs({ pathname }) {
    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <nav aria-label="Breadcrumb" className="mb-5 overflow-x-auto sm:mb-6">
            <ol className="flex min-w-max items-center gap-2 text-sm font-semibold text-[var(--text-muted)]">
                {breadcrumbs.map((item, index) => {
                    const isCurrent = index === breadcrumbs.length - 1;

                    return (
                        <li key={item.label} className="flex items-center gap-2">
                            {index > 0 && (
                                <span aria-hidden="true" className="text-[var(--border-default)]">/</span>
                            )}
                            {isCurrent ? (
                                <span aria-current="page" className="text-[var(--text-primary)]">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    to={item.path}
                                    className="rounded-sm transition-colors hover:text-[var(--color-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export function TeacherDashboardLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const prefersReducedMotion = useReducedMotion();
    const menuButtonRef = useRef(null);
    const sidebarDialogRef = useRef(null);
    const closeButtonRef = useRef(null);

    const closeSidebar = useCallback(() => {
        setIsSidebarOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    }, []);

    useLayoutEffect(() => {
        const pathname = location.pathname;
        const isStudentDetails = pathname.startsWith(`${ROUTES.TEACHER_STUDENTS}/`);
        const savedPosition = isStudentDetails ? 0 : teacherScrollPositions.get(pathname) ?? 0;

        window.scrollTo({ top: savedPosition, left: 0, behavior: "auto" });

        return () => {
            teacherScrollPositions.set(pathname, window.scrollY);
        };
    }, [location.pathname]);

    useEffect(() => {
        if (!isSidebarOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                closeSidebar();
                return;
            }

            if (event.key !== "Tab") return;

            const focusableElements = Array.from(
                sidebarDialogRef.current?.querySelectorAll(focusableSelector) ?? [],
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements.at(-1);

            if (!firstElement || !lastElement) {
                event.preventDefault();
                return;
            }

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [closeSidebar, isSidebarOpen]);

    return (
        <MotionConfig reducedMotion="user">
            <div className="flex min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
                <TeacherSidebar
                    className="fixed inset-y-0 left-0 z-30 hidden lg:flex"
                    labelId="teacher-desktop-sidebar-title"
                />

                <AnimatePresence>
                    {isSidebarOpen && (
                        <div className="fixed inset-0 z-50 lg:hidden">
                            <motion.div
                                aria-hidden="true"
                                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
                                onClick={closeSidebar}
                            />
                            <motion.div
                                ref={sidebarDialogRef}
                                id="teacher-mobile-sidebar"
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="teacher-mobile-sidebar-title"
                                className="relative h-full w-72 max-w-[calc(100vw-3rem)] shadow-2xl shadow-slate-950/20"
                                initial={{ x: prefersReducedMotion ? 0 : "-100%", opacity: prefersReducedMotion ? 0 : 1 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: prefersReducedMotion ? 0 : "-100%", opacity: prefersReducedMotion ? 0 : 1 }}
                                transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: "easeOut" }}
                            >
                                <TeacherSidebar
                                    onNavigate={closeSidebar}
                                    labelId="teacher-mobile-sidebar-title"
                                />
                                <button
                                    ref={closeButtonRef}
                                    type="button"
                                    onClick={closeSidebar}
                                    className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
                                    aria-label="Close teacher workspace menu"
                                >
                                    <svg
                                        aria-hidden="true"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    >
                                        <path d="m6 6 12 12M18 6 6 18" />
                                    </svg>
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
                    <TeacherNavbar />
                    <main className="flex-1">
                        <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                            <TeacherBreadcrumbs pathname={location.pathname} />
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </MotionConfig>
    );
}

export default TeacherDashboardLayout;
