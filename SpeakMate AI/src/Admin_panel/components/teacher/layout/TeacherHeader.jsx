import { useNavigate } from "react-router-dom";
import Button from "@components/common/Button";
import ROUTES from "@constants/routes";
import { clearAdminAuthenticated } from "../../../services/adminSession";

export function TeacherHeader({
    teacherName = "Teacher Name",
    assignedStandard = "Assigned Standard",
    onMenuOpen,
    menuButtonRef,
    isMenuOpen = false,
}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAdminAuthenticated();
        navigate(ROUTES.TEACHER_LOGIN, { replace: true });
    };
    return (
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <button
                ref={menuButtonRef}
                type="button"
                onClick={onMenuOpen}
                className="mr-3 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:hidden"
                aria-label="Open teacher workspace menu"
                aria-expanded={isMenuOpen}
                aria-controls="teacher-mobile-sidebar"
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
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
                    {teacherName}
                </p>
                <p className="truncate text-xs font-medium text-slate-500">
                    {assignedStandard}
                </p>
            </div>

            <div className="ml-4 flex shrink-0 items-center gap-2 sm:gap-3">
                <div
                    className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700 ring-2 ring-white sm:h-10 sm:w-10"
                    aria-label={`${teacherName} profile avatar`}
                    role="img"
                >
                    TN
                </div>
                <Button
                    variant="secondary"
                    className="h-10 px-3 sm:px-4"
                    aria-label="Logout"
                    onClick={handleLogout}
                >
                    <svg
                        aria-hidden="true"
                        className="h-4 w-4 sm:mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>
        </header>
    );
}

export default TeacherHeader;
