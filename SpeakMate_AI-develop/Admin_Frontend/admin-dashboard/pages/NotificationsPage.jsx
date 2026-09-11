import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bell,
  Check,
  Filter,
  GraduationCap,
  Briefcase,
  Building2,
  Users as UsersIcon,
  Mic,
  ExternalLink,
  RefreshCw,
  Clock,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Inbox,
  Search,
  X,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckSquare,
  Square,
  Sparkles,
  Radio,
  ChevronDown
} from "lucide-react";
import Button from "@components/common/Button";
import SectionCard from "@admin/components/SectionCard";
import { useNotifications } from "@hooks/useNotifications";
import { useAuth } from "@context/AuthContext";
import { handleViewNotificationDetails, getNotificationTarget } from "../../src/utils/notificationNavigation";

function getNotificationIcon(type = "") {
  const t = String(type || "").toUpperCase();
  if (t.includes("STUDENT") || t === "SPEAKING_ACTIVITY_COMPLETED" || t === "LESSON_COMPLETED") {
    return <GraduationCap className="h-5 w-5 text-indigo-500" />;
  }
  if (t.includes("TEACHER")) {
    return <Briefcase className="h-5 w-5 text-emerald-500" />;
  }
  if (t.includes("SCHOOL")) {
    return <Building2 className="h-5 w-5 text-amber-500" />;
  }
  if (t.includes("USER")) {
    return <UsersIcon className="h-5 w-5 text-sky-500" />;
  }
  if (t.includes("SPEAKING") || t.includes("ACTIVITY")) {
    return <Mic className="h-5 w-5 text-purple-500" />;
  }
  if (t.includes("SECURITY") || t.includes("AUTH") || t.includes("ROLE")) {
    return <ShieldCheck className="h-5 w-5 text-rose-500" />;
  }
  return <Bell className="h-5 w-5 text-[var(--color-primary)]" />;
}

function getNotificationSeverity(n) {
  const t = String(n?.type || "").toUpperCase();
  const m = String(n?.message || "").toLowerCase();
  
  if (
    t.includes("DELETE") ||
    t.includes("FAIL") ||
    t.includes("ERROR") ||
    t.includes("CRITICAL") ||
    t.includes("SECURITY") ||
    m.includes("deleted") ||
    m.includes("failed") ||
    m.includes("critical")
  ) {
    return {
      label: "Critical",
      bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      dot: "bg-rose-500",
      icon: AlertTriangle
    };
  }

  if (
    t.includes("UPDATE") ||
    t.includes("MODIFY") ||
    t.includes("RESET") ||
    t.includes("PASSWORD") ||
    m.includes("updated") ||
    m.includes("modified") ||
    m.includes("pending")
  ) {
    return {
      label: "Update",
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      dot: "bg-amber-500",
      icon: null
    };
  }

  return {
    label: "Notice",
    bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dot: "bg-sky-500",
    icon: null
  };
}

function getTimeBucket(n) {
  const dateVal = n?.createdAt ? new Date(n.createdAt) : null;
  if (!dateVal || isNaN(dateVal.getTime())) {
    return "Today";
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
  const diffDays = Math.round((today - itemDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) return "Earlier This Week";
  return "Older";
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    formattedUnreadCount,
    isLoading,
    isConnected,
    isMuted,
    toggleMute,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotifications();

  // Role detection
  const userRole = (user?.role || "SUPER_ADMIN").toUpperCase();
  const isSuperAdmin = userRole.includes("SUPER_ADMIN") || (!userRole.includes("SCHOOL") && !userRole.includes("TEACHER"));
  const isSchoolAdmin = userRole.includes("SCHOOL");
  const isTeacher = userRole.includes("TEACHER");

  // Filtering and Search State
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [noticeMessage, setNoticeMessage] = useState(null);
  const [highlightedId, setHighlightedId] = useState(location.state?.highlightedNotificationId || null);

  useEffect(() => {
    if (location.state?.highlightedNotificationId) {
      setHighlightedId(location.state.highlightedNotificationId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`notif-item-${location.state.highlightedNotificationId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [location.state?.highlightedNotificationId, notifications]);

  const showNotice = (msg) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Extract unique schools (for Super Admin multi-school filter)
  const uniqueSchools = useMemo(() => {
    if (!isSuperAdmin) return [];
    const set = new Set();
    notifications.forEach((n) => {
      if (n.schoolName) set.add(n.schoolName);
      if (n.school) set.add(n.school);
      const match = n.message?.match(/school:\s*["']?([^"',.\n]+)/i);
      if (match && match[1]) set.add(match[1].trim());
    });
    return Array.from(set).filter(Boolean);
  }, [notifications, isSuperAdmin]);

  // Tab definitions based on current role
  const roleTabs = useMemo(() => {
    if (isSuperAdmin) {
      return [
        { id: "all", label: "All Activity", icon: Bell },
        { id: "unread", label: "Unread", icon: Check },
        { id: "students", label: "Students", icon: GraduationCap },
        { id: "teachers", label: "Teachers", icon: Briefcase },
        { id: "schools", label: "Schools", icon: Building2 },
        { id: "users", label: "Platform Users", icon: UsersIcon },
        { id: "security", label: "Security & System", icon: ShieldCheck }
      ];
    }
    if (isSchoolAdmin) {
      return [
        { id: "all", label: "All School Activity", icon: Bell },
        { id: "unread", label: "Unread", icon: Check },
        { id: "students", label: "Enrolled Students", icon: GraduationCap },
        { id: "teachers", label: "Faculty & Staff", icon: Briefcase },
        { id: "school", label: "School Operations", icon: Building2 }
      ];
    }
    // Teacher Admin
    return [
      { id: "all", label: "My Activity", icon: Bell },
      { id: "unread", label: "Unread", icon: Check },
      { id: "students", label: "My Students", icon: GraduationCap },
      { id: "practice", label: "Speaking & Practice", icon: Mic },
      { id: "assessments", label: "Assessments & Progress", icon: Sparkles }
    ];
  }, [isSuperAdmin, isSchoolAdmin, isTeacher]);

  // Scoped notifications based on role, tab, search query, and school filter
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // 1. Unread check
      if (activeTab === "unread" && n.isRead) {
        return false;
      }

      // 2. Category Tab check
      const t = String(n.type || "").toUpperCase();
      const m = String(n.message || "").toLowerCase();
      const title = String(n.title || "").toLowerCase();

      if (activeTab === "students") {
        const isStudentRelated = t.includes("STUDENT") || t.includes("SPEAKING") || t.includes("LESSON") || m.includes("student");
        if (!isStudentRelated) return false;
      } else if (activeTab === "teachers") {
        const isTeacherRelated = t.includes("TEACHER") || m.includes("teacher") || m.includes("assigned");
        if (!isTeacherRelated) return false;
      } else if (activeTab === "schools" || activeTab === "school") {
        const isSchoolRelated = t.includes("SCHOOL") || m.includes("school");
        if (!isSchoolRelated) return false;
      } else if (activeTab === "users") {
        const isUserRelated = t.includes("USER") || m.includes("user") || m.includes("profile");
        if (!isUserRelated) return false;
      } else if (activeTab === "security") {
        const isSec = t.includes("SECURITY") || t.includes("AUTH") || t.includes("ROLE") || t.includes("PASSWORD") || m.includes("password");
        if (!isSec) return false;
      } else if (activeTab === "practice") {
        const isPractice = t.includes("SPEAKING") || t.includes("ACTIVITY") || m.includes("speaking") || m.includes("practice");
        if (!isPractice) return false;
      } else if (activeTab === "assessments") {
        const isAssess = t.includes("ASSESSMENT") || t.includes("LESSON") || t.includes("COMPLETED") || m.includes("completed");
        if (!isAssess) return false;
      }

      // 3. Super Admin School Filter
      if (isSuperAdmin && selectedSchool !== "all") {
        const hasSchool = (n.schoolName && n.schoolName.toLowerCase() === selectedSchool.toLowerCase()) ||
          (n.school && n.school.toLowerCase() === selectedSchool.toLowerCase()) ||
          (m.includes(selectedSchool.toLowerCase()));
        if (!hasSchool) return false;
      }

      // 4. Instant Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = title.includes(q);
        const matchesMsg = m.includes(q);
        const matchesType = t.toLowerCase().includes(q);
        const matchesTime = String(n.time || "").toLowerCase().includes(q);
        const matchesRecipient = String(n.recipientEmail || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesType && !matchesTime && !matchesRecipient) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, activeTab, isSuperAdmin, selectedSchool, searchQuery]);

  // Group filtered notifications by Time Bucket
  const groupedNotifications = useMemo(() => {
    const buckets = {
      Today: [],
      Yesterday: [],
      "Earlier This Week": [],
      Older: []
    };

    filteredNotifications.forEach((n) => {
      const bucket = getTimeBucket(n);
      if (buckets[bucket]) {
        buckets[bucket].push(n);
      } else {
        buckets.Older.push(n);
      }
    });

    return buckets;
  }, [filteredNotifications]);

  // Multi-select handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedIds.length === 0) return;
    try {
      await markMultipleAsRead(selectedIds);
      showNotice(`Marked ${selectedIds.length} notification${selectedIds.length > 1 ? "s" : ""} as read.`);
      setSelectedIds([]);
    } catch (e) {
      showNotice("Failed to update notifications. Please try again.");
    }
  };

  const handleActionClick = (n) => {
    handleViewNotificationDetails(n, navigate, markAsRead, showNotice, user?.role);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="flex items-center gap-3.5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-xs">
            <Bell className="h-6 w-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--color-accent)] px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                  {formattedUnreadCount} unread
                </span>
              )}
              {/* Role Scope Pill */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-subtle)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                {isSuperAdmin && "🛡️ Platform Scope"}
                {isSchoolAdmin && `🏫 ${user?.schoolName || "School"} Scope`}
                {isTeacher && "🧑‍🏫 Assigned Classes & Students"}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {isSuperAdmin && "Complete real-time platform activity log, system alerts, and institution updates across all schools."}
              {isSchoolAdmin && `Activity feed strictly scoped to ${user?.schoolName || "your school"}, enrolled students, and staff members.`}
              {isTeacher && "Live updates for assigned students, practice sessions, speaking attempts, and lesson completions."}
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live SSE Status Pill */}
          <div
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium ${
              isConnected
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
            title={isConnected ? "Real-time SSE event stream is active" : "Attempting to reconnect live stream"}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isConnected ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
            </span>
            <span>{isConnected ? "Live Stream Active" : "Reconnecting..."}</span>
          </div>

          {/* Web Audio Chime Mute/Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition shadow-xs ${
              isMuted
                ? "border-slate-300 dark:border-slate-700 bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                : "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            }`}
            title={isMuted ? "Click to unmute live sound chime" : "Click to mute live sound chime"}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isMuted ? "Chime Muted" : "Chime Active"}</span>
          </button>

          <Button
            variant="secondary"
            onClick={refreshNotifications}
            className="!h-9 text-xs font-medium"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={markAllAsRead}
              className="!h-9 text-xs font-medium"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Mark All Read
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter Toolbar & Search Bar */}
      <div className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {roleTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  {tab.id === "all" && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-[var(--border-default)] text-[var(--text-muted)]"}`}>
                      {notifications.length}
                    </span>
                  )}
                  {tab.id === "unread" && unreadCount > 0 && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-[var(--color-accent)] text-white"}`}>
                      {formattedUnreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Super Admin School Dropdown Filter */}
          {isSuperAdmin && uniqueSchools.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-muted)]">School:</span>
              <div className="relative">
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  aria-label="Filter by School"
                  className="h-9 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] px-3 pr-8 text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--color-primary)] focus:outline-none"
                >
                  <option value="all">All Schools ({uniqueSchools.length})</option>
                  {uniqueSchools.map((sch) => (
                    <option key={sch} value={sch}>
                      {sch}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>
          )}
        </div>

        {/* Live Search & Multi-Select Row */}
        <div className="flex flex-col gap-3 pt-2 border-t border-[var(--border-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by title, student, teacher, or keyword..."
              className="h-9 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] pl-9 pr-8 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] transition focus:border-[var(--color-primary)] focus:bg-[var(--bg-surface)] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {filteredNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                {selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0 ? (
                  <CheckSquare className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                ) : (
                  <Square className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                )}
                <span>
                  {selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0
                    ? "Deselect All"
                    : "Select All"}
                </span>
              </button>
            )}

            <span className="text-xs text-[var(--text-muted)]">
              Showing <span className="font-semibold text-[var(--text-primary)]">{filteredNotifications.length}</span> items
            </span>
          </div>
        </div>
      </div>

      {/* Floating Multi-Select Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="sticky top-20 z-40 flex items-center justify-between rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--bg-surface)] p-3 px-5 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold text-xs">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {selectedIds.length} notification{selectedIds.length > 1 ? "s" : ""} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={handleBulkMarkAsRead}
                className="!h-8 !px-3 text-xs font-semibold"
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Mark Selected as Read
              </Button>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-xl border border-[var(--border-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Notification Content with Time Buckets */}
      <SectionCard
        title="Activity Stream"
        subtitle={`Chronological log grouped by date • ${filteredNotifications.length} matching events`}
        delay={0.05}
        bodyClassName="p-0"
      >
        {isLoading && notifications.length === 0 ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-4 rounded-xl border border-[var(--border-subtle)] p-4"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded bg-slate-200 dark:bg-slate-700/50" />
                  <div className="h-3 w-80 rounded bg-slate-100 dark:bg-slate-800/50" />
                </div>
                <div className="h-8 w-24 rounded bg-slate-200 dark:bg-slate-700/50" />
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--bg-subtle)] text-[var(--text-muted)]">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {searchQuery
                ? `No notifications matching "${searchQuery}"`
                : activeTab === "unread"
                ? "No unread notifications"
                : "No notifications found"}
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              {searchQuery
                ? "Try adjusting your search query or selecting another category filter."
                : activeTab === "unread"
                ? "You're all caught up! Check back later for platform alerts."
                : "No notifications have been recorded yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {Object.entries(groupedNotifications).map(([bucketName, items]) => {
              if (!items || items.length === 0) return null;

              return (
                <div key={bucketName} className="space-y-0">
                  {/* Bucket Header Banner */}
                  <div className="sticky top-0 z-20 flex items-center justify-between border-y border-[var(--border-subtle)] bg-[var(--bg-subtle)]/90 px-5 py-2.5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        {bucketName}
                      </span>
                      <span className="rounded-full bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)] shadow-xs border border-[var(--border-default)]">
                        {items.length}
                      </span>
                    </div>
                  </div>

                  {/* Notification Items */}
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {items.map((n) => {
                      const target = getNotificationTarget(n, user?.role);
                      const isHighlighted = highlightedId != null && String(n.id) === String(highlightedId);
                      const isSelected = selectedIds.includes(n.id);
                      const severity = getNotificationSeverity(n);
                      const SeverityIcon = severity.icon;
                      const formattedDate = n.createdAt
                        ? new Date(n.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : "Recent";

                      return (
                        <div
                          key={n.id}
                          id={`notif-item-${n.id}`}
                          className={`flex flex-col gap-4 p-4.5 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${
                            isSelected
                              ? "bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]"
                              : isHighlighted
                              ? "bg-[var(--color-primary)]/15 ring-2 ring-[var(--color-primary)] ring-inset shadow-[var(--shadow-sm)]"
                              : !n.isRead
                              ? "bg-[var(--color-primary)]/[0.03]"
                              : "hover:bg-[var(--bg-hover)]"
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Row Checkbox */}
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(n.id)}
                              className="mt-2.5 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition"
                              title={isSelected ? "Deselect" : "Select"}
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-[var(--color-primary)]" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>

                            {/* Category Icon */}
                            <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] shadow-xs">
                              {getNotificationIcon(n.type)}
                            </div>

                            {/* Details Column */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                  {n.title}
                                </h3>

                                {/* Priority Badge */}
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${severity.bg}`}>
                                  {SeverityIcon && <SeverityIcon className="h-3 w-3" />}
                                  <span>{severity.label}</span>
                                </span>

                                {isHighlighted && (
                                  <span className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs animate-pulse">
                                    Selected
                                  </span>
                                )}

                                {!n.isRead && (
                                  <span className="inline-flex items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--color-primary)]">
                                    Unread
                                  </span>
                                )}

                                <span className="inline-flex items-center rounded-md bg-[var(--bg-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                  {n.type || "SYSTEM"}
                                </span>

                                {n.schoolName && (
                                  <span className="inline-flex items-center rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                                    🏫 {n.schoolName}
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                                {n.message}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)]">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {n.time}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formattedDate}
                                </span>
                                {n.recipientEmail && (
                                  <>
                                    <span>•</span>
                                    <span>To: {n.recipientEmail}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row Actions */}
                          <div className="flex shrink-0 items-center gap-2 sm:self-center pl-10 sm:pl-0">
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => markAsRead(n.id)}
                                className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                title="Mark as read"
                              >
                                Mark read
                              </button>
                            )}

                            {target?.hasTarget ? (
                              <Button
                                type="button"
                                onClick={() => handleActionClick(n)}
                                className="!h-8 !px-3 text-xs font-semibold"
                              >
                                <span>View Details</span>
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => showNotice("Details are not available for this notification.")}
                                className="rounded-lg bg-[var(--bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                title="Target details unavailable"
                              >
                                Details unavailable
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Floating Notice Message */}
      <AnimatePresence>
        {noticeMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-xl backdrop-blur-md"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{noticeMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationsPage;
