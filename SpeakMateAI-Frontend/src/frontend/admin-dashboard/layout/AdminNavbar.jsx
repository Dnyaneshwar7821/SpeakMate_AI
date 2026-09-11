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
    GraduationCap,
    Briefcase,
    Building2,
    Mic,
    ExternalLink,
    ArrowRight,
    Users as UsersIcon,
    AlertCircle,
    Volume2,
    VolumeX
} from "lucide-react";
import { useTheme } from "@/Admin_panel/context/ThemeContext";
import { useAuth } from "@/Admin_panel/context/AuthContext";
import ROUTES from "@constants/routes";
import { adminNavbarSearchItems } from "@admin/data/adminNavbarSearchData";
import { studentApi } from "@services/admin/studentApi";
import { adminUserApi } from "@services/admin/adminUserApi";
import { useNotifications } from "@hooks/useNotifications";
import { handleViewNotificationDetails, getNotificationTarget } from "@utils/notificationNavigation";
import InsigniaBadge from "@components/common/InsigniaBadge";

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

function getNotificationIcon(type = "") {
    const t = String(type || "").toUpperCase();
    if (t.includes("STUDENT") || t === "SPEAKING_ACTIVITY_COMPLETED" || t === "LESSON_COMPLETED") {
        return <GraduationCap className="h-4 w-4 text-indigo-500" />;
    }
    if (t.includes("TEACHER")) {
        return <Briefcase className="h-4 w-4 text-emerald-500" />;
    }
    if (t.includes("SCHOOL")) {
        return <Building2 className="h-4 w-4 text-amber-500" />;
    }
    if (t.includes("USER")) {
        return <UsersIcon className="h-4 w-4 text-sky-500" />;
    }
    if (t.includes("SPEAKING") || t.includes("ACTIVITY")) {
        return <Mic className="h-4 w-4 text-purple-500" />;
    }
    return <Bell className="h-4 w-4 text-[var(--color-primary)]" />;
}

export function AdminNavbar() {
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
    const [noticeMessage, setNoticeMessage] = useState(null);

    const showNotice = (msg) => {
        setNoticeMessage(msg);
        setTimeout(() => setNoticeMessage(null), 4000);
    };
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const searchRef = useRef(null);

    // Close popovers on outside click
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
                const navMatches = adminNavbarSearchItems.filter((item) =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                );

                // 2. Dynamic API search for Students and Platform Users
                const apiMatches = [];
                
                // Search Students
                try {
                    const studentRes = await studentApi.searchStudents(query);
                    const studentList = studentRes?.data?.content || studentRes?.content || (Array.isArray(studentRes?.data) ? studentRes.data : []);
                    if (Array.isArray(studentList)) {
                        studentList.forEach((s) => {
                            apiMatches.push({
                                id: `student-${s.id}`,
                                type: "Student",
                                name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email || "Student",
                                subText: s.email || s.schoolName || "",
                                path: ROUTES.ADMIN_SCHOOL_USERS || "/admin/school-users",
                            });
                        });
                    }
                } catch (err) {
                    console.warn("Navbar student search notice:", err);
                }

                // Search Platform Users
                try {
                    const userRes = await adminUserApi.searchUsers(query);
                    const userList = userRes?.data?.content || userRes?.content || (Array.isArray(userRes?.data) ? userRes.data : []);
                    if (Array.isArray(userList)) {
                        userList.forEach((u) => {
                            apiMatches.push({
                                id: `user-${u.id}`,
                                type: "User",
                                name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "User",
                                subText: u.email || "",
                                path: ROUTES.ADMIN_USERS || "/admin/users",
                            });
                        });
                    }
                } catch (err) {
                    console.warn("Navbar user search notice:", err);
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
                        placeholder="Search students, users, teachers…"
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
                                    className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)]"
                                >
                                    <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3 bg-[var(--bg-surface)]">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-[var(--text-primary)]">Notifications</p>
                                            <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                                                {unreadCount} unread
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
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
                                                >
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="thin-scrollbar max-h-96 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                                        {notificationsList.length === 0 ? (
                                            <div className="px-4 py-10 text-center">
                                                <Bell className="mx-auto h-8 w-8 text-[var(--text-muted)] opacity-50 mb-2" />
                                                <p className="text-xs font-semibold text-[var(--text-primary)]">No notifications yet</p>
                                                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">We'll alert you when new platform activities occur.</p>
                                            </div>
                                        ) : (
                                            notificationsList.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={async () => {
                                                        if (!n.isRead) await markAsRead(n.id);
                                                        setNotifOpen(false);
                                                        navigate(ROUTES.ADMIN_NOTIFICATIONS || "/admin/notifications", {
                                                            state: { highlightedNotificationId: n.id },
                                                        });
                                                    }}
                                                    className={[
                                                        "flex gap-3 p-3.5 transition-colors hover:bg-[var(--bg-hover)] cursor-pointer",
                                                        !n.isRead && "bg-[var(--color-primary)]/[0.04]",
                                                    ].join(" ")}
                                                >
                                                    <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)]">
                                                        {getNotificationIcon(n.type)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1.5">
                                                            <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">
                                                                {n.title}
                                                            </p>
                                                            {!n.isRead && (
                                                                <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20" />
                                                            )}
                                                        </div>
                                                        <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)] line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                        <div className="mt-2 flex items-center justify-between gap-2">
                                                            <span className="text-[10px] font-medium text-[var(--text-muted)]">
                                                                {n.time}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary)]/10 px-2 py-0.5 text-[11px] font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20">
                                                                View in tab
                                                                <ExternalLink className="h-3 w-3" />
                                                            </span>
                                                        </div>
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
                                                navigate(ROUTES.ADMIN_NOTIFICATIONS || "/admin/notifications");
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

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => {
                                setProfileOpen((v) => !v);
                                setNotifOpen(false);
                            }}
                            className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition-colors hover:bg-[var(--bg-hover)]"
                            aria-label="Open super admin menu"
                        >
                            <InsigniaBadge
                                name={user?.name || "Super Admin"}
                                role="SUPER_ADMIN"
                                email={user?.email || "admin@speakmate.ai"}
                                size="sm"
                            />
                            <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-[var(--text-primary)] sm:inline">
                                {user?.name || "Super Admin"}
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
                                            name={user?.name || "Super Admin"}
                                            role="SUPER_ADMIN"
                                            email={user?.email || "admin@speakmate.ai"}
                                            size="md"
                                        />
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                                                {user?.name || "Super Admin"}
                                            </p>
                                            <p className="truncate text-xs text-[var(--text-secondary)]">
                                                {user?.email || "admin@speakmate.ai"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="py-1.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileOpen(false);
                                                navigate(ROUTES.ADMIN_PROFILE);
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                        >
                                            <User className="h-4 w-4" />
                                            Profile
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileOpen(false);
                                                navigate(ROUTES.ADMIN_SETTINGS);
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                        >
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </button>
                                    </div>

                                    <div className="border-t border-[var(--border-default)] py-1.5">
                                        <button
                                            onClick={() => {
                                                setProfileOpen(false);
                                                logout();
                                                navigate(ROUTES.ADMIN_LOGIN, { replace: true });
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
                            {getNotificationIcon(activeToast.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[var(--text-primary)]">{activeToast.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)] line-clamp-2">{activeToast.message}</p>
                            <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">{activeToast.time}</span>
                                {getNotificationTarget(activeToast)?.hasTarget ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            handleViewNotificationDetails(activeToast, navigate, markAsRead, showNotice);
                                            dismissToast();
                                        }}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[var(--color-primary)] hover:underline"
                                    >
                                        View Details
                                        <ExternalLink className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            showNotice("Details are not available for this notification.");
                                        }}
                                        className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                    >
                                        Details unavailable
                                    </button>
                                )}
                            </div>
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

            {/* In-app Notice Message Toast */}
            <AnimatePresence>
                {noticeMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-600 dark:text-amber-400 shadow-xl backdrop-blur-md"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{noticeMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

export default AdminNavbar;
