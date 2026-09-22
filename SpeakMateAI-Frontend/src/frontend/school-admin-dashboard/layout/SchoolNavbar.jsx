import { useEffect, useRef, useState, useMemo } from "react";
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
    GraduationCap,
    Briefcase,
} from "lucide-react";
import { useTheme } from "@/Admin_panel/context/ThemeContext";
import { useAuth } from "@/Admin_panel/context/AuthContext";
import ROUTES from "@constants/routes";
import { useNotifications } from "@hooks/useNotifications";
import InsigniaBadge from "@components/common/InsigniaBadge";
import { schoolAdminDataApi } from "@services/admin/schoolAdminDataApi";
import { syncInsigniaFromBackend } from "@utils/insigniaHelper";

// In-memory cache for instant search responses across route navigations
let cachedSchoolStudents = null;
let cachedSchoolTeachers = null;
let isPreloadingRoster = false;

// Helper to determine match details, scoring, and highlighted ranges for prefix matching
function getMatchDetails(name, query, extraFields = {}) {
    if (!name || !query) return null;
    const cleanName = name.trim();
    const cleanQuery = query.trim();
    if (!cleanQuery) return null;

    const lowerName = cleanName.toLowerCase();
    const lowerQuery = cleanQuery.toLowerCase();
    const queryTokens = lowerQuery.split(/\s+/).filter(Boolean);

    // Single-word prefix query (e.g. "s", "si", "sid", "siddhi")
    if (queryTokens.length === 1) {
        const q = queryTokens[0];

        // 1. Direct name prefix: e.g. "Siddhi Narke" starts with "si" -> HIGHEST MATCH
        if (lowerName.startsWith(q)) {
            return {
                score: 100,
                matchType: "prefix",
                highlightRanges: [{ start: 0, length: q.length }],
            };
        }

        // 2. Word prefix: check each individual word in the name (e.g. "Narke", "Sharma")
        const words = cleanName.split(/\s+/);
        let currentOffset = 0;
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const lowerWord = word.toLowerCase();
            const wordStart = lowerName.indexOf(lowerWord, currentOffset);
            currentOffset = wordStart + word.length;

            if (lowerWord.startsWith(q)) {
                return {
                    score: i === 0 ? 90 : 75,
                    matchType: "word-prefix",
                    highlightRanges: [{ start: wordStart, length: q.length }],
                };
            }
        }

        // 3. Fallback: roll number prefix
        if (extraFields.rollNo && String(extraFields.rollNo).toLowerCase().startsWith(q)) {
            return { score: 50, matchType: "rollNo", highlightRanges: [] };
        }

        // 4. Fallback: email prefix
        if (extraFields.email && extraFields.email.toLowerCase().startsWith(q)) {
            return { score: 40, matchType: "email", highlightRanges: [] };
        }

        // Does not match the required prefix: strictly exclude!
        return null;
    }

    // Multi-token query (e.g. "siddhi n" or "si na")
    const words = cleanName.split(/\s+/);
    let wordIdx = 0;
    const highlightRanges = [];
    let currentSearchPos = 0;

    for (const qToken of queryTokens) {
        let matched = false;
        while (wordIdx < words.length) {
            const word = words[wordIdx];
            const lowerWord = word.toLowerCase();
            const wordPos = lowerName.indexOf(lowerWord, currentSearchPos);
            currentSearchPos = wordPos + word.length;

            if (lowerWord.startsWith(qToken)) {
                matched = true;
                highlightRanges.push({ start: wordPos, length: qToken.length });
                wordIdx++;
                break;
            }
            wordIdx++;
        }
        if (!matched) return null;
    }

    return {
        score: 85,
        matchType: "multi-word",
        highlightRanges,
    };
}

// Highlighted text component
function HighlightedName({ text, ranges }) {
    if (!ranges || ranges.length === 0) return <span>{text}</span>;

    const sorted = [...ranges].sort((a, b) => a.start - b.start);
    const elements = [];
    let lastIndex = 0;

    sorted.forEach((range, idx) => {
        if (range.start > lastIndex) {
            elements.push(<span key={`text-${idx}`}>{text.substring(lastIndex, range.start)}</span>);
        }
        elements.push(
            <span
                key={`highlight-${idx}`}
                className="font-bold text-[var(--color-primary)] underline decoration-[var(--color-primary)]/40 underline-offset-2"
            >
                {text.substring(range.start, range.start + range.length)}
            </span>
        );
        lastIndex = range.start + range.length;
    });

    if (lastIndex < text.length) {
        elements.push(<span key="text-end">{text.substring(lastIndex)}</span>);
    }

    return <span>{elements}</span>;
}

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
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [studentsRoster, setStudentsRoster] = useState(() => cachedSchoolStudents || []);
    const [teachersRoster, setTeachersRoster] = useState(() => cachedSchoolTeachers || []);

    const profileRef = useRef(null);
    const notifRef = useRef(null);
    const searchRef = useRef(null);
    const searchInputRef = useRef(null);

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

    // Cross-session and cross-tab insignia/profile sync for School Admin
    useEffect(() => {
        let isMounted = true;
        const syncProfile = async () => {
            try {
                const data = await schoolAdminDataApi.getProfile();
                if (data && isMounted) {
                    const email = data.email || user?.email || "school.admin@speakmate.ai";
                    const name = `${data.firstName || ""} ${data.lastName || ""}`.trim() || user?.name || "School Admin";
                    if (data.avatar) {
                        syncInsigniaFromBackend("SCHOOL_ADMIN", email, data.avatar, name);
                    }
                }
            } catch {
                // background sync fallback
            }
        };

        syncProfile();
        window.addEventListener("focus", syncProfile);
        window.addEventListener("admin-session-updated", syncProfile);
        return () => {
            isMounted = false;
            window.removeEventListener("focus", syncProfile);
            window.removeEventListener("admin-session-updated", syncProfile);
        };
    }, [user?.email, user?.name]);

    // Load & cache students and teachers for this school
    const loadSchoolRoster = async (force = false) => {
        if ((cachedSchoolStudents && cachedSchoolTeachers && !force) || isPreloadingRoster) {
            return;
        }
        isPreloadingRoster = true;
        try {
            const [studentsRes, teachersRes] = await Promise.allSettled([
                schoolAdminDataApi.getAllStudents(),
                schoolAdminDataApi.getAllTeachers(),
            ]);

            if (studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value)) {
                const mappedStudents = studentsRes.value.map((s) => ({
                    id: `student-${s.id || s.studentId}`,
                    rawId: s.id || s.studentId,
                    type: "Student",
                    name: `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.email || "Student",
                    firstName: s.firstName || "",
                    lastName: s.lastName || "",
                    email: s.email || "",
                    standard: s.standard != null ? String(s.standard) : "",
                    division: s.division != null ? String(s.division) : "",
                    rollNo: s.rollNumber || (s.studentId ? `RN-${s.studentId}` : (s.id ? `RN-${s.id}` : "")),
                    path: ROUTES.SCHOOL_ADMIN_STUDENTS || "/school-admin/students",
                }));
                cachedSchoolStudents = mappedStudents;
                setStudentsRoster(mappedStudents);
            }

            if (teachersRes.status === "fulfilled" && Array.isArray(teachersRes.value)) {
                const mappedTeachers = teachersRes.value.map((t) => ({
                    id: `teacher-${t.id}`,
                    rawId: t.id,
                    type: "Teacher",
                    name: `${t.firstName || ""} ${t.lastName || ""}`.trim() || t.email || "Teacher",
                    firstName: t.firstName || "",
                    lastName: t.lastName || "",
                    email: t.email || "",
                    department: t.department || "Teaching Staff",
                    phone: t.phone || "",
                    path: ROUTES.SCHOOL_ADMIN_TEACHERS || "/school-admin/teachers",
                }));
                cachedSchoolTeachers = mappedTeachers;
                setTeachersRoster(mappedTeachers);
            }
        } catch (err) {
            console.warn("Failed to load school roster in SchoolNavbar:", err);
        } finally {
            isPreloadingRoster = false;
        }
    };

    useEffect(() => {
        loadSchoolRoster();

        const handleRefresh = () => loadSchoolRoster(true);
        window.addEventListener("school_data_updated", handleRefresh);
        window.addEventListener("teacher_profile_updated", handleRefresh);
        return () => {
            window.removeEventListener("school_data_updated", handleRefresh);
            window.removeEventListener("teacher_profile_updated", handleRefresh);
        };
    }, []);

    // Global keyboard shortcut: Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                searchInputRef.current?.focus();
                if (searchQuery.trim().length > 0) {
                    setSearchOpen(true);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [searchQuery]);

    // Compute live search results instantaneously across students & teachers with prefix matching
    const searchResults = useMemo(() => {
        const q = searchQuery.trim();
        if (!q) return [];

        const combined = [...studentsRoster, ...teachersRoster];
        const matches = [];

        for (const item of combined) {
            const match = getMatchDetails(item.name, q, {
                rollNo: item.rollNo,
                email: item.email,
            });
            if (match) {
                matches.push({
                    ...item,
                    score: match.score,
                    highlightRanges: match.highlightRanges,
                });
            }
        }

        // Sort by match score descending, then by name alphabetically
        matches.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.name.localeCompare(b.name);
        });

        return matches.slice(0, 15);
    }, [searchQuery, studentsRoster, teachersRoster]);

    // Reset keyboard selection on query change
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    const handleSelectResult = (item) => {
        setSearchOpen(false);
        setSearchQuery("");
        if (item.type === "Student") {
            navigate(ROUTES.SCHOOL_ADMIN_STUDENTS || "/school-admin/students", {
                state: { searchTerm: item.name, selectedStudentId: item.rawId },
            });
        } else if (item.type === "Teacher") {
            navigate(ROUTES.SCHOOL_ADMIN_TEACHERS || "/school-admin/teachers", {
                state: { searchTerm: item.name, selectedTeacherId: item.rawId },
            });
        }
    };

    const handleInputKeyDown = (e) => {
        if (!searchOpen || searchResults.length === 0) {
            if (e.key === "Escape") {
                setSearchOpen(false);
            }
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const selectedItem = searchResults[selectedIndex] || searchResults[0];
            if (selectedItem) {
                handleSelectResult(selectedItem);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            setSearchOpen(false);
            searchInputRef.current?.blur();
        }
    };

    return (
        <header className="sticky top-0 z-40 h-16 w-full border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 pl-16 pr-4 sm:gap-4 sm:px-6 sm:pl-6 lg:px-8">
                {/* Search - expands within available left space */}
                <div
                    ref={searchRef}
                    className="relative hidden flex-1 min-w-0 max-w-2xl items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--border-strong)] focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[var(--color-primary)]/20 md:flex"
                >
                    <Search className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search students, teachers…"
                        value={searchQuery}
                        onFocus={() => {
                            if (studentsRoster.length === 0 && teachersRoster.length === 0) {
                                loadSchoolRoster();
                            }
                            if (searchQuery.trim().length > 0) {
                                setSearchOpen(true);
                            }
                        }}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearchQuery(value);
                            setSearchOpen(value.trim().length > 0);
                        }}
                        onKeyDown={handleInputKeyDown}
                        className="w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] text-sm"
                    />

                    {searchQuery.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery("");
                                setSearchOpen(false);
                                searchInputRef.current?.focus();
                            }}
                            className="grid h-5 w-5 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition"
                            title="Clear search"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}

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
                                className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-xl)] backdrop-blur-xl"
                            >
                                <div className="thin-scrollbar max-h-80 overflow-y-auto p-1.5 space-y-1">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-center">
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">No matching people found</p>
                                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                                No students or teachers match prefix &ldquo;<span className="font-semibold text-[var(--text-primary)]">{searchQuery}</span>&rdquo;
                                            </p>
                                        </div>
                                    ) : (
                                        searchResults.map((item, idx) => {
                                            const isSelected = selectedIndex === idx;
                                            const isStudent = item.type === "Student";
                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onMouseEnter={() => setSelectedIndex(idx)}
                                                    onClick={() => handleSelectResult(item)}
                                                    className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                                                        isSelected
                                                            ? "bg-[var(--color-primary)]/10 text-[var(--text-primary)]"
                                                            : "hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                                                    }`}
                                                >
                                                    {/* Avatar / Icon */}
                                                    <div
                                                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                                                            isStudent
                                                                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                                                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                        }`}
                                                    >
                                                        {isStudent ? (
                                                            <GraduationCap className="h-4 w-4" />
                                                        ) : (
                                                            <Briefcase className="h-4 w-4" />
                                                        )}
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                                                <HighlightedName text={item.name} ranges={item.highlightRanges} />
                                                            </span>
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                    isStudent
                                                                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                                                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                                }`}
                                                            >
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)] truncate">
                                                            {isStudent ? (
                                                                <span>
                                                                    {item.standard ? `Class ${item.standard}${item.division ? `-${item.division}` : ""}` : "Student"}
                                                                    {item.rollNo ? ` • Roll: ${item.rollNo}` : ""}
                                                                    {item.email ? ` • ${item.email}` : ""}
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    {item.department || "Teacher"}
                                                                    {item.email ? ` • ${item.email}` : ""}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <ArrowRight
                                                        className={`h-4 w-4 shrink-0 transition-opacity ${
                                                            isSelected ? "opacity-100 text-[var(--color-primary)]" : "opacity-0"
                                                        }`}
                                                    />
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="flex items-center justify-between border-t border-[var(--border-default)] bg-[var(--bg-subtle)]/60 px-3 py-1.5 text-[11px] text-[var(--text-muted)]">
                                        <span>Use <kbd className="font-mono font-semibold">↑</kbd> <kbd className="font-mono font-semibold">↓</kbd> to navigate, <kbd className="font-mono font-semibold">Enter</kbd> to select</span>
                                        <span>{searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'}</span>
                                    </div>
                                )}
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
