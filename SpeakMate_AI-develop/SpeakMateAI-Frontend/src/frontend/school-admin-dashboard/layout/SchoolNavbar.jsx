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
    Settings,
    LogOut,
    Check,
    X,
    ArrowRight,
    Volume2,
    VolumeX,
} from "lucide-react";
import { useTheme } from "@/Admin_panel/context/ThemeContext";
import { useAuth } from "@/Admin_panel/context/AuthContext";
import ROUTES from "@constants/routes";
import { schoolNavbarSearchItems } from "@school-admin/data/schoolNavbarSearchData";
import { studentApi } from "@services/admin/studentApi";
import { useNotifications } from "@hooks/useNotifications";
import InsigniaBadge from "@components/common/InsigniaBadge";

export function SchoolNavbar() {
    const { isDark, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const {
        notifications: notificationsList,
        unreadCount,
        formattedUnreadCount,
        isConnected,
        isRinging,
        hasNewActivity,
        isMuted,
        toggleMute,
        markAsRead,
        markAllAsRead,
        activeToast,
        dismissToast,
    } = useNotifications();

    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

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

    // Dynamic Live Search against APIs and Navigation Items
    useEffect(() => {
        const query = searchQuery.trim();
        if (!query) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        let isMounted = true;
        setIsSearching(true);

        const timer = setTimeout(async () => {
            try {
                // 1. Static navigation matches
                const navMatches = schoolNavbarSearchItems.filter((item) =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                );

                // 2. Dynamic API search for Students
                let apiMatches = [];
                try {
                    const res = await studentApi.searchStudents(query);
                    const list = res?.data?.content || res?.content || (Array.isArray(res?.data) ? res.data : []);
                    if (Array.isArray(list)) {
                        apiMatches = list.map((s) => ({
                            id: `student-${s.id}`,
                            type: "Student",
                            name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email || "Student",
                            subText: s.email || s.schoolName || "",
                            path: ROUTES.SCHOOL_STUDENTS || "/school-admin/students",
                        }));
                    }
                } catch (err) {
                    console.warn("School Navbar dynamic student search notice:", err);
                }

                if (isMounted) {
                    setSearchResults([...apiMatches, ...navMatches]);
                    setIsSearching(false);
                }
            } catch (err) {
                if (isMounted) setIsSearching(false);
            }
        }, 250);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [searchQuery]);

    return (
        <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 pl-16 pr-4 sm:gap-4 sm:px-6 sm:pl-6 lg:px-8">
                {/* Search - expands within available left space */}
                <div ref={searchRef} className="relative hidden flex-1 min-w-0 max-w-2xl items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] md:flex">
                    <Search className="h-4 w-4 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search students, teachers…"
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
                                    {isSearching && (
                                        <p className="px-4 py-3 text-xs text-[var(--text-muted)]">Searching…</p>
                                    )}
                                    {!isSearching && searchResults.length === 0 && (
                                        <p className="px-4 py-3 text-xs text-[var(--text-muted)]">No results found.</p>
                                    )}
                                    {!isSearching && searchResults.map((item) => (
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
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="truncate text-[var(--text-primary)] font-medium">{item.name}</span>
                                                {item.subText && (
                                                    <span className="truncate text-[11px] text-[var(--text-muted)]">{item.subText}</span>
                                                )}
                                            </div>
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
                            <motion.div
                                animate={isRinging ? { rotate: [0, -18, 18, -12, 12, -6, 6, 0] } : { rotate: 0 }}
                                transition={{ duration: 0.85, ease: "easeInOut" }}
                            >
                                <Bell className="h-5 w-5" />
                            </motion.div>

                            {/* Radar pulsating halo on new activity */}
                            {hasNewActivity && (
                                <span className="absolute right-1.5 top-1.5 h-4 w-4 rounded-full bg-[var(--color-accent)] opacity-75 animate-ping pointer-events-none" />
                            )}

                            {unreadCount > 0 && (
                                <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--color-accent)] px-1 text-[9px] font-bold text-white shadow-xs">
                                    {formattedUnreadCount}
                                </span>
                            )}

                            {/* Micro Live SSE status indicator dot */}
                            <span
                                className={`absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-[var(--bg-surface)] ${
                                    isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
                                }`}
                                title={isConnected ? "Real-time Live Stream Active" : "Reconnecting to live stream..."}
                            />
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
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[var(--text-primary)]">Notifications</p>
                                            <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                                                {unreadCount} new
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMute();
                                                }}
                                                className="grid h-7 w-7 place-items-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                                title={isMuted ? "Unmute notification sound" : "Mute notification sound"}
                                            >
                                                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-500" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-500" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="thin-scrollbar max-h-80 overflow-y-auto">
                                        {notificationsList.length === 0 ? (
                                            <p className="p-4 text-center text-xs text-[var(--text-muted)]">No notifications</p>
                                        ) : (
                                            notificationsList.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={async () => {
                                                        if (!n.isRead) await markAsRead(n.id);
                                                        setNotifOpen(false);
                                                        navigate(ROUTES.SCHOOL_ADMIN_NOTIFICATIONS, {
                                                            state: { highlightedNotificationId: n.id },
                                                        });
                                                    }}
                                                    className={[
                                                        "flex gap-3 border-b border-[var(--border-subtle)] px-4 py-3 transition-colors last:border-0 hover:bg-[var(--bg-hover)] cursor-pointer",
                                                        !n.isRead && "bg-[var(--color-primary)]/[0.04]",
                                                    ].join(" ")}
                                                >
                                                    <span
                                                        className={[
                                                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                                            n.isRead ? "bg-[var(--border-strong)]" : "bg-[var(--color-primary)]",
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
                                    <div className="flex items-center justify-between border-t border-[var(--border-default)] bg-[var(--bg-subtle)]/50 px-4 py-2.5">
                                        <button
                                            onClick={markAllAsRead}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--color-primary)]"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                            Mark all as read
                                        </button>
                                        <button
                                            onClick={() => {
                                                setNotifOpen(false);
                                                navigate(ROUTES.SCHOOL_ADMIN_NOTIFICATIONS);
                                            }}
                                            className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:underline"
                                        >
                                            View All Notifications
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
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
                            aria-label="Open school admin menu"
                        >
                            <InsigniaBadge
                                name={user?.name || "School Admin"}
                                role="SCHOOL_ADMIN"
                                email={user?.email || "school.admin@speakmate.ai"}
                                size="sm"
                            />
                            <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-[var(--text-primary)] sm:inline">
                                {user?.name || "School Admin"}
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
                                        <InsigniaBadge
                                            name={user?.name || "School Admin"}
                                            role="SCHOOL_ADMIN"
                                            email={user?.email || "school.admin@speakmate.ai"}
                                            size="md"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                                                {user?.name || "School Admin"}
                                            </p>
                                            <p className="truncate text-xs text-[var(--text-secondary)]">
                                                {user?.email || "school.admin@speakmate.ai"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="py-1.5">
                                        <a
                                            href={ROUTES.SCHOOL_ADMIN_PROFILE}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </a>
                                        <a
                                            href={ROUTES.SCHOOL_ADMIN_SETTINGS}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </a>
                                    </div>

                                    <div className="border-t border-[var(--border-default)] py-1.5">
                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate(ROUTES.SCHOOL_ADMIN_LOGIN, { replace: true });
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

            {/* Real-time Toast Notification Popup */}
            <AnimatePresence>
                {activeToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="fixed top-20 right-6 z-50 flex max-w-sm gap-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-xl)] backdrop-blur-xl"
                    >
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Bell className="h-5 w-5 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)]">{activeToast.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">{activeToast.message}</p>
                            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{activeToast.time}</p>
                        </div>
                        <button
                            type="button"
                            onClick={dismissToast}
                            className="h-6 w-6 grid place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

export default SchoolNavbar;
