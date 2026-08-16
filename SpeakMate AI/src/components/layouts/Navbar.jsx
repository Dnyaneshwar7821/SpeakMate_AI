import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ROUTES from "../../constants/routes";
import { getLiveProgressStats } from "../../utils/progressTracker";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveStats, setLiveStats] = useState(() => getLiveProgressStats());

  useEffect(() => {
    const updateStats = () => {
      setLiveStats(getLiveProgressStats());
    };
    updateStats();
    window.addEventListener("focus", updateStats);
    return () => window.removeEventListener("focus", updateStats);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(ROUTES.HOME);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`${ROUTES.LESSONS}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 left-0 w-full z-40 border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo & Search */}
        <div className="flex items-center gap-6">
          <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex items-center gap-3 min-w-0 group">
            <div className="relative flex items-center justify-center h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <span>S</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[var(--bg-base)] animate-pulse" />
            </div>
            <span className="font-black text-xl sm:text-2xl tracking-tight gradient-brand-text truncate">
              SpeakMate AI
            </span>
          </Link>

          {/* Desktop Search Bar */}
          {isAuthenticated && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-64 lg:w-96">
              <input
                type="text"
                placeholder="Search lessons, topics, vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]/70 backdrop-blur-md text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              <span className="absolute left-3.5 text-xs text-[var(--text-secondary)]">🔍</span>
              <span className="absolute right-3 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[10px] font-extrabold text-[var(--text-muted)]">
                ⌘K
              </span>
            </form>
          )}
        </div>

        {/* Right Section: Badges, Theme, Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-4">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-3">
              {/* Streak Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black shadow-sm hover:scale-105 transition-transform cursor-pointer" title="Daily Speaking Streak">
                <span className="animate-bounce">🔥</span>
                <span>{liveStats.streak || user?.streak || 0}d Streak</span>
              </div>

              {/* XP Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-xs font-black shadow-sm hover:scale-105 transition-transform cursor-pointer" title="Earned XP Points">
                <span>⭐</span>
                <span>{liveStats.xp || 0} XP</span>
              </div>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]/80 text-[var(--text-secondary)] hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-[var(--bg-elevated)] transition-all duration-200"
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.364l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative flex items-center gap-2 sm:gap-3">
              {/* Notifications */}
              <Link
                to={ROUTES.NOTIFICATIONS}
                className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]/80 text-[var(--text-secondary)] hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-[var(--bg-elevated)] relative transition-all duration-200"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[var(--bg-base)] animate-ping" />
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-[var(--bg-base)]" />
              </Link>

              {/* Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-sm shadow-md shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
                  aria-label="Open user menu"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl py-2 z-20 animate-scale-in overflow-hidden backdrop-blur-2xl">
                      <div className="px-5 py-3 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-[var(--text-primary)] truncate">{user?.name || "Learner"}</p>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 dark:text-indigo-300">
                            {user?.level || "B1 Intermediate"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email || ""}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to={ROUTES.DASHBOARD}
                          className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-indigo-500 hover:bg-[var(--bg-elevated)] transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>⚡</span> Dashboard
                        </Link>

                        <Link
                          to={ROUTES.ACHIEVEMENTS}
                          className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-indigo-500 hover:bg-[var(--bg-elevated)] transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>🏆</span> Achievements & Badges
                        </Link>

                        <Link
                          to={ROUTES.PROFILE}
                          className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-indigo-500 hover:bg-[var(--bg-elevated)] transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>👤</span> Profile Settings
                        </Link>

                        <Link
                          to={ROUTES.SETTINGS}
                          className="flex items-center gap-3 px-5 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-indigo-500 hover:bg-[var(--bg-elevated)] transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <span>⚙️</span> App Preferences
                        </Link>
                      </div>

                      <div className="border-t border-[var(--border-default)] pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-5 py-2.5 text-xs font-extrabold text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <span>🚪</span> Sign Out
                        </button>
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
                className="hidden sm:inline-flex h-11 items-center rounded-2xl px-5 text-xs font-extrabold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
              >
                Log In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex h-11 items-center rounded-2xl px-6 text-xs font-black bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
