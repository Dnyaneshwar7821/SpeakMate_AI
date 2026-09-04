import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ROUTES from "../../constants/routes";
import { getLiveProgressStats } from "../../utils/progressTracker";
import { StreakModal } from "../dashboard/StreakModal";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [liveStats, setLiveStats] = useState(() => getLiveProgressStats(user));

  // Searchable Quick Pages & Modules
  const SEARCHABLE_PAGES = useMemo(
    () => [
      { id: "p-speaking", title: "AI Speaking Practice", subtitle: "Real-time voice conversation & pronunciation", route: ROUTES.SPEAKING, icon: "🎙️", category: "Features" },
      { id: "p-lessons", title: "CEFR Lessons Explorer", subtitle: "Structured grammar, vocabulary & phonics", route: ROUTES.LESSONS, icon: "📚", category: "Features" },
      { id: "p-grammar", title: "Grammar Masterclass", subtitle: "Tenses, conditionals, active/passive voice", route: ROUTES.GRAMMAR, icon: "📝", category: "Topics" },
      { id: "p-vocab", title: "Vocabulary Builder", subtitle: "Top 500 words, idioms & phrasal verbs", route: ROUTES.VOCABULARY, icon: "📖", category: "Topics" },
      { id: "p-achieve", title: "Achievements & Badges", subtitle: "View fluency milestones and earned trophies", route: ROUTES.ACHIEVEMENTS, icon: "🏆", category: "Progress" },
      { id: "p-progress", title: "Fluency Analytics & Stats", subtitle: "Track daily streaks, XP & vocabulary mastery", route: ROUTES.PROGRESS, icon: "📊", category: "Progress" },
      { id: "p-profile", title: "Profile & Avatar Voice", subtitle: "Customize accent, speed & AI avatar", route: ROUTES.PROFILE, icon: "👤", category: "Account" },
      { id: "p-settings", title: "Settings & AI Persona", subtitle: "Adjust difficulty, speech feedback & theme", route: ROUTES.SETTINGS, icon: "⚙️", category: "Account" },
    ],
    []
  );

  // Searchable Lessons
  const SEARCHABLE_LESSONS = useMemo(
    () => [
      { id: "l-1", title: "Present Tenses Mastery", category: "Grammar", level: "Beginner", route: "/lessons/1", icon: "✨" },
      { id: "l-2", title: "Professional Email & Business Writing", category: "Business", level: "Intermediate", route: "/lessons/2", icon: "💼" },
      { id: "l-3", title: "Job Interview Speaking Drills", category: "Business", level: "Advanced", route: "/lessons/3", icon: "🎯" },
      { id: "l-4", title: "Essential Everyday Vocabulary (Top 500 Words)", category: "Vocabulary", level: "Beginner", route: "/lessons/4", icon: "📖" },
      { id: "l-5", title: "Idioms & Phrasal Verbs for Natural Speech", category: "Speaking", level: "Intermediate", route: "/lessons/5", icon: "🗣️" },
      { id: "l-6", title: "Past & Present Perfect Tense Drills", category: "Grammar", level: "Intermediate", route: "/lessons/6", icon: "⏳" },
      { id: "l-7", title: "10th Board Oral Exam & Public Speaking Prep", category: "Academic", level: "Advanced", route: "/lessons/7", icon: "🎓" },
      { id: "l-8", title: "Social Small Talk & Networking Confidence", category: "Speaking", level: "Beginner", route: "/lessons/8", icon: "☕" },
      { id: "l-9", title: "Conditionals: Real & Unreal 'If' Scenarios", category: "Grammar", level: "Intermediate", route: "/lessons/9", icon: "🧩" },
      { id: "l-10", title: "English Vowel Minimal Pairs & Accent Clarity", category: "Phonics", level: "Beginner", route: "/lessons/10", icon: "🔊" },
      { id: "l-11", title: "Overcoming Hesitation & Eliminating Fillers", category: "Speaking", level: "Intermediate", route: "/lessons/11", icon: "⚡" },
      { id: "l-12", title: "Executive Presentation & Pitch Strategy", category: "Business", level: "Advanced", route: "/lessons/12", icon: "📈" },
      { id: "l-13", title: "Word Stress & Sentence Intonation Rhythm", category: "Phonics", level: "Intermediate", route: "/lessons/13", icon: "🎵" },
      { id: "l-14", title: "Active vs Passive Voice in Formal Contexts", category: "Grammar", level: "Advanced", route: "/lessons/14", icon: "🏛️" },
      { id: "l-15", title: "Debate, Negotiation & Persuasive Rhetoric", category: "Speaking", level: "Advanced", route: "/lessons/15", icon: "🤝" },
      { id: "l-16", title: "Academic Essay Rhetoric & Spoken Summaries", category: "Academic", level: "Advanced", route: "/lessons/16", icon: "📜" },
    ],
    []
  );

  // Filtered dropdown results
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return {
        pages: SEARCHABLE_PAGES.slice(0, 4),
        lessons: SEARCHABLE_LESSONS.slice(0, 4),
        totalCount: 8,
      };
    }

    const matchedPages = SEARCHABLE_PAGES.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );

    const matchedLessons = SEARCHABLE_LESSONS.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.level.toLowerCase().includes(q)
    );

    return {
      pages: matchedPages,
      lessons: matchedLessons,
      totalCount: matchedPages.length + matchedLessons.length,
    };
  }, [searchQuery, SEARCHABLE_PAGES, SEARCHABLE_LESSONS]);

  // Flattened list for arrow-key navigation
  const allResultItems = useMemo(() => {
    return [...filteredResults.pages, ...filteredResults.lessons];
  }, [filteredResults]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Sync navbar search with URL when on lessons page
  useEffect(() => {
    if (location.pathname === ROUTES.LESSONS) {
      const params = new URLSearchParams(location.search);
      const q = params.get("search") || "";
      setSearchQuery(q);
    }
  }, [location.pathname, location.search]);

  // Global ⌘K / Ctrl+K shortcut listener to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setSearchOpen(true);
      } else if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Keyboard navigation within the dropdown
  const handleInputKeyDown = (e) => {
    if (!searchOpen) {
      if (e.key === "ArrowDown") {
        setSearchOpen(true);
        return;
      }
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResultItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResultItems.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < allResultItems.length) {
        e.preventDefault();
        const selected = allResultItems[selectedIndex];
        handleSelectResult(selected.route);
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSelectResult = (route) => {
    setSearchOpen(false);
    navigate(route);
  };

  useEffect(() => {
    const updateStats = () => {
      setLiveStats(getLiveProgressStats(user));
    };
    updateStats();
    window.addEventListener("focus", updateStats);
    window.addEventListener("speakmate_progress_updated", updateStats);
    window.addEventListener("speakmate_settings_updated", updateStats);
    return () => {
      window.removeEventListener("focus", updateStats);
      window.removeEventListener("speakmate_progress_updated", updateStats);
      window.removeEventListener("speakmate_settings_updated", updateStats);
    };
  }, [user]);

  const isStudent =
    user?.accountType === "STUDENT" ||
    Boolean(user?.schoolGrade) ||
    Boolean(user?.schoolId) ||
    localStorage.getItem("speakmate_account_type") === "STUDENT";

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(ROUTES.HOME);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearchOpen(false);
    const query = searchQuery.trim();
    if (!query) {
      navigate(ROUTES.LESSONS);
    } else {
      navigate(`${ROUTES.LESSONS}?search=${encodeURIComponent(query)}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedIndex(-1);
    if (location.pathname === ROUTES.LESSONS) {
      navigate(ROUTES.LESSONS);
    }
    searchInputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 left-0 w-full z-40 border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to={isAuthenticated ? (isStudent ? ROUTES.STUDENT_DASHBOARD : ROUTES.DASHBOARD) : ROUTES.HOME}
            className="flex items-center gap-3 min-w-0 group"
          >
            <img
              src="/assets/speakmate_logo.png"
              alt="SpeakMate AI"
              className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-[1.02] drop-shadow-md"
            />
          </Link>

          {/* Desktop Search Bar & Dropdown Container */}
          {isAuthenticated && (
            <div ref={searchContainerRef} className="hidden md:block relative w-72 lg:w-96">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center group">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search lessons, vocabulary, grammar..."
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={handleInputKeyDown}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                    setSelectedIndex(-1);
                  }}
                  className="w-full pl-10 pr-16 py-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute left-3.5 text-xs text-[var(--text-muted)] hover:text-[#6C63FF] transition-colors cursor-pointer"
                  title="Search"
                >
                  🔍
                </button>

                <div className="absolute right-3 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-black flex items-center justify-center transition-all cursor-pointer"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[10px] font-black text-[var(--text-muted)] group-focus-within:border-[#6C63FF] group-focus-within:text-[#6C63FF] transition-colors">
                      ⌘K
                    </span>
                  )}
                </div>
              </form>

              {/* ── Instant Live Search Dropdown ── */}
              {searchOpen && (
                <div className="absolute left-0 top-full mt-2 w-[420px] lg:w-[480px] max-h-[460px] overflow-y-auto rounded-3xl bg-[var(--bg-surface)]/95 backdrop-blur-2xl border border-[var(--border-default)] shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {filteredResults.totalCount === 0 ? (
                    <div className="p-6 text-center space-y-2">
                      <p className="text-2xl">🔎</p>
                      <p className="text-sm font-black text-[var(--text-primary)]">No matching results found</p>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">
                        Try searching for grammar, present tenses, interview, vocabulary, or speaking drills.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      
                      {/* Section 1: Features & Pages */}
                      {filteredResults.pages.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                            <span>{searchQuery ? "Features & Tools" : "Quick Shortcuts"}</span>
                            <span>{filteredResults.pages.length}</span>
                          </div>
                          <div className="space-y-1">
                            {filteredResults.pages.map((item, idx) => {
                              const isSelected = selectedIndex === idx;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => handleSelectResult(item.route)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                                    isSelected
                                      ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30"
                                      : "hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] group-hover:scale-105 border border-[var(--border-default)] flex items-center justify-center text-base shrink-0">
                                      {item.icon}
                                    </span>
                                    <div className="min-w-0">
                                      <p className={`text-xs font-black truncate ${isSelected ? "text-white" : "text-[var(--text-primary)]"}`}>
                                        {item.title}
                                      </p>
                                      <p className={`text-[10px] font-medium truncate ${isSelected ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                                        {item.subtitle}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                                    isSelected ? "bg-white/20 text-white" : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)]"
                                  }`}>
                                    {item.category}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Section 2: Lessons & Topics */}
                      {filteredResults.lessons.length > 0 && (
                        <div>
                          <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                            <span>Lessons & Topics</span>
                            <span>{filteredResults.lessons.length}</span>
                          </div>
                          <div className="space-y-1">
                            {filteredResults.lessons.map((lesson, idx) => {
                              const actualIdx = filteredResults.pages.length + idx;
                              const isSelected = selectedIndex === actualIdx;
                              return (
                                <button
                                  key={lesson.id}
                                  type="button"
                                  onClick={() => handleSelectResult(lesson.route)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left transition-all cursor-pointer group ${
                                    isSelected
                                      ? "bg-[#6C63FF] text-white shadow-md shadow-[#6C63FF]/30"
                                      : "hover:bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] group-hover:scale-105 border border-[var(--border-default)] flex items-center justify-center text-base shrink-0">
                                      {lesson.icon}
                                    </span>
                                    <div className="min-w-0">
                                      <p className={`text-xs font-black truncate ${isSelected ? "text-white" : "text-[var(--text-primary)]"}`}>
                                        {lesson.title}
                                      </p>
                                      <p className={`text-[10px] font-medium ${isSelected ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                                        {lesson.category} • {lesson.level}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                                    isSelected ? "bg-white/20 text-white" : "bg-[#6C63FF]/10 text-[#6C63FF]"
                                  }`}>
                                    Open ▶
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Dropdown Footer: Full Search Action */}
                      {searchQuery.trim() && (
                        <div className="pt-2 border-t border-[var(--border-default)]">
                          <button
                            type="button"
                            onClick={handleSearchSubmit}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6C63FF]/10 via-[#8B5CF6]/10 to-[#FF6584]/10 hover:from-[#6C63FF]/20 hover:to-[#8B5CF6]/20 border border-[#6C63FF]/25 text-xs font-black text-[#6C63FF] transition-all cursor-pointer"
                          >
                            <span>Search all lessons for "{searchQuery.trim()}"</span>
                            <span>Press Enter ↵</span>
                          </button>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {isAuthenticated ? (
            <div className="relative flex items-center gap-2.5 sm:gap-4">
              {/* Notifications Button */}
              <Link
                to={ROUTES.NOTIFICATIONS}
                className={`grid h-11 w-11 place-items-center rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] relative transition-all shadow-sm active:scale-95 ${
                  location.pathname === ROUTES.NOTIFICATIONS ? "border-[#6C63FF] text-[#6C63FF]" : ""
                }`}
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--bg-base)] animate-pulse" />
              </Link>

              {/* Streak & XP Badges */}
              <div className="hidden lg:flex items-center gap-2.5">
                <button
                  onClick={() => setStreakModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-black shadow-sm backdrop-blur-sm hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer"
                  title="View Streak Calendar & Milestones"
                >
                  <span>🔥</span>
                  <span>{Number(liveStats.streak ?? user?.streak ?? 0)}d Streak</span>
                  {liveStats.streakFreezes > 0 && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                      ❄️{liveStats.streakFreezes}
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-[#6C63FF] text-xs font-black shadow-sm backdrop-blur-sm">
                  <span>⭐</span>
                  <span>{liveStats.xp || 0} XP</span>
                </div>
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white font-black text-base shadow-md shadow-[#6C63FF]/30 hover:scale-105 active:scale-95 transition-all overflow-hidden cursor-pointer"
                  aria-label="Open user menu"
                >
                  {user?.avatar && (user.avatar.startsWith("data:image/") || user.avatar.startsWith("http") || user.avatar.startsWith("/")) ? (
                    <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : user?.avatar ? (
                    <span className="text-xl">{user.avatar}</span>
                  ) : (
                    user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.name ? user.name.charAt(0).toUpperCase() : "U"
                  )}
                </button>
                {!isStudent && (user?.isPro || user?.pro) && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-amber-950 shadow-md pointer-events-none">
                    👑
                  </span>
                )}

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-72 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-2 z-20 animate-scale-in">
                      <div className="px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] mb-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <p className="text-sm font-black text-[var(--text-primary)] truncate">{user?.firstName || user?.name || "Learner"}</p>
                            {!isStudent && (user?.isPro || user?.pro) && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">PRO</span>
                            )}
                          </div>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#6C63FF]">
                            {user?.englishLevel || user?.level || "Beginner"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-medium truncate">{user?.email || ""}</p>
                      </div>

                      <div className="space-y-1">
                        <Link
                          to={isStudent ? ROUTES.STUDENT_DASHBOARD : ROUTES.DASHBOARD}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>📊</span> Dashboard
                        </Link>

                        <Link
                          to={ROUTES.SPEAKING}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>🎙️</span> Speaking Practice
                        </Link>

                        <Link
                          to={ROUTES.ACHIEVEMENTS}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>🏆</span> Achievements & Badges
                        </Link>

                        <Link
                          to={ROUTES.PROFILE}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>👤</span> Profile & Voice
                        </Link>

                        <Link
                          to={ROUTES.SETTINGS}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>⚙️</span> Settings & Persona
                        </Link>

                        {!isStudent && (
                          <Link
                            to={ROUTES.PRICING}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-all"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <span>⭐</span> {(user?.isPro || user?.pro) ? "Manage Pro Plan" : "Upgrade to Pro"}
                          </Link>
                        )}

                        <div className="pt-1 mt-1 border-t border-[var(--border-default)]">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          >
                            <span>🚪</span> Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
              >
                Log In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs sm:text-sm font-black shadow-md shadow-[#6C63FF]/25 hover:shadow-lg hover:shadow-[#6C63FF]/35 active:scale-95 transition-all"
              >
                Get Started Free
              </Link>
            </div>
          )}
        </div>
      </div>

      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
        stats={liveStats}
        onRefresh={() => setLiveStats(getLiveProgressStats(user))}
      />
    </header>
  );
}

export default Navbar;
