import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    ChevronDown,
    Search,
    Sun,
    Moon,
    User,
    LogOut,
    Check,
} from "lucide-react";
import { useTheme } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";
import { teacherNotifications } from "@/Admin_panel/data/teacherNotificationsMockData";
import { teacherNavbarSearchItems } from "@/Admin_panel/data/teacherNavbarSearchData";

export function TeacherNavbar({
    teacherName = "Teacher",
    assignedStandard = "Assigned Standard",
}) {
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const searchRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const unreadCount = teacherNotifications.filter((n) => !n.read).length;

    const filteredSearchItems = teacherNavbarSearchItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    );

    const displayName = user?.name || teacherName;
    const displayEmail = user?.email || "teacher@speakmate.ai";

    return (
        <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 pl-16 pr-4 sm:gap-4 sm:px-6 sm:pl-6 lg:px-8">
                {/* Search */}
                <div ref={searchRef} className="relative hidden flex-1 min-w-0 max-w-2xl items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] md:flex">
                    <Search className="h-4 w-4 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search students, classes…"
                        value={searchQuery}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchQuery(value);
                            setSearchOpen(value.trim().length > 0);
                        }}
                        className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
                    />
                    <kbd className="hidden rounded border border-[var(--border-default)] bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] lg:inline">
                        ⌘K
                    </kbd>

                    <AnimatePresence>
                        {searchOpen && searchQuery.trim().length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)]"
                            >
                                <div className="thin-scrollbar max-h-72 overflow-y-auto">
                                    {filteredSearchItems.length === 0 && (
                                        <p className="px-4 py-3 text-xs text-[var(--text-muted)]">No results found.</p>
                                    )}
                                    {filteredSearchItems.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => {
                                                navigate(item.path);
                                                setSearchOpen(false);
                                                setSearchQuery("");
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-hover)]"
                                        >
                                            <span className="inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                                                {item.type}
                                            </span>
                                            <span className="truncate text-[var(--text-primary)]">{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right cluster: theme, notifications, profile */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => {
                                setNotifOpen((v) => !v);
                                setProfileOpen(false);
                            }}
                            aria-label="Notifications"
                            className="relative grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-2 top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[9px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.16, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)]"
                                >
                                    <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
                                        <p className="text-sm font-bold text-[var(--text-primary)]">Notifications</p>
                                        <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                                            {unreadCount} new
                                        </span>
                                    </div>
                                    <div className="thin-scrollbar max-h-80 overflow-y-auto">
                                        {teacherNotifications.length === 0 ? (
                                            <p className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
                                                No notifications yet.
                                            </p>
                                        ) : (
                                            teacherNotifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={[
                                                        "flex gap-3 border-b border-[var(--border-subtle)] px-4 py-3 transition-colors last:border-0 hover:bg-[var(--bg-hover)]",
                                                        !n.read && "bg-[var(--color-primary)]/[0.04]",
                                                    ].join(" ")}
                                                >
                                                    <span
                                                        className={[
                                                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                                            n.read ? "bg-[var(--border-strong)]" : "bg-[var(--color-primary)]",
                                                        ].join(" ")}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                                                            {n.title}
                                                        </p>
                                                        <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)]">
                                                            {n.message}
                                                        </p>
                                                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                                            {n.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {teacherNotifications.length > 0 && (
                                        <button className="flex w-full items-center justify-center gap-2 border-t border-[var(--border-default)] px-4 py-2.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--bg-hover)]">
                                            <Check className="h-3.5 w-3.5" />
                                            Mark all as read
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => {
                                setProfileOpen((v) => !v);
                                setNotifOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-[var(--bg-hover)]"
                            aria-label="Open teacher menu"
                        >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-sm font-bold text-white shadow-[var(--shadow-sm)]">
                                {displayName.charAt(0).toUpperCase()}
                            </span>
                            <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-[var(--text-primary)] sm:inline">
                                {displayName}
                            </span>
                            <ChevronDown
                                className={`hidden h-4 w-4 text-[var(--text-muted)] transition-transform duration-200 sm:inline ${profileOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {profileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.16, ease: "easeOut" }}
                                    className="absolute right-0 mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)]"
                                >
                                    <div className="flex items-center gap-3 border-b border-[var(--border-default)] px-4 py-3.5">
                                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-base font-bold text-white">
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                                                {displayName}
                                            </p>
                                            <p className="truncate text-xs text-[var(--text-secondary)]">
                                                {displayEmail}
                                            </p>
                                            <p className="truncate text-[10px] font-medium text-[var(--text-muted)]">
                                                {assignedStandard}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="py-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileOpen(false);
                                                navigate(ROUTES.TEACHER_PROFILE);
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </button>
                                    </div>

                                    <div className="border-t border-[var(--border-default)] py-1.5">
                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate(ROUTES.TEACHER_LOGIN, { replace: true });
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/10"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Log out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TeacherNavbar;
