import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Bell,
    ChevronDown,
    Search,
    Sun,
    Moon,
    User,
    Settings,
    LogOut,
    Check,
} from "lucide-react";
import { useTheme } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";
import { adminNotifications } from "@admin/data/adminDashboardMockData";

/**
 * admin-dashboard/layout/AdminNavbar.jsx
 *
 * Modern enterprise top navigation:
 *  - Page title + breadcrumb-style subtitle
 *  - Global search (decorative)
 *  - Theme switch
 *  - Notification dropdown with unread badge
 *  - Profile dropdown with avatar, name, email and quick links
 */

function IconButton({ children, onClick, label, className = "" }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={[
                "grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                className,
            ].join(" ")}
        >
            {children}
        </button>
    );
}

export function AdminNavbar({ title = "Dashboard", subtitle }) {
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();

    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Close popovers on outside click
    useEffect(() => {
        function handleClick(e) {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const unreadCount = adminNotifications.filter((n) => !n.read).length;

    return (
        <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 pl-16 pr-4 sm:gap-4 sm:px-6 sm:pl-6 lg:px-8">
                {/* Title block */}
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                        <span>Admin</span>
                        <span className="text-[var(--border-strong)]">/</span>
                        <span className="text-[var(--text-secondary)]">{title}</span>
                    </div>
                    <h1 className="truncate text-[17px] font-bold tracking-tight text-[var(--text-primary)]">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="hidden truncate text-xs text-[var(--text-secondary)] sm:block">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Right cluster */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Search (decorative) */}
                    <div className="hidden items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] md:flex">
                        <Search className="h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search…"
                            className="w-32 bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] lg:w-44"
                        />
                        <kbd className="hidden rounded border border-[var(--border-default)] bg-[var(--bg-subtle)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] lg:inline">
                            ⌘K
                        </kbd>
                    </div>

                    {/* Theme switch */}
                    <IconButton onClick={toggleTheme} label="Toggle theme">
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </IconButton>

                    {/* Notifications */}
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
                                        {adminNotifications.map((n) => (
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
                                        ))}
                                    </div>
                                    <button className="flex w-full items-center justify-center gap-2 border-t border-[var(--border-default)] px-4 py-2.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--bg-hover)]">
                                        <Check className="h-3.5 w-3.5" />
                                        Mark all as read
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => {
                                setProfileOpen((v) => !v);
                                setNotifOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-[var(--bg-hover)]"
                            aria-label="Open admin menu"
                        >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-sm font-bold text-white shadow-[var(--shadow-sm)]">
                                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                            </span>
                            <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-[var(--text-primary)] sm:inline">
                                {user?.name || "Admin"}
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
                                            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                                                {user?.name || "Admin"}
                                            </p>
                                            <p className="truncate text-xs text-[var(--text-secondary)]">
                                                {user?.email || "admin@speakmate.ai"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="py-1.5">
                                        <a
                                            href={ROUTES.PROFILE}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </a>
                                        <a
                                            href={ROUTES.SETTINGS}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </a>
                                    </div>

                                    <div className="border-t border-[var(--border-default)] py-1.5">
                                        <button
                                            onClick={logout}
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

export default AdminNavbar;
