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
    <header className="sticky top-0 left-0 w-full z-40 border-b border-[var(--border-default)] bg-[var(--bg-base)]/90 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-10 h-20 flex items-center justify-between gap-6">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="flex items-center gap-3 min-w-0 group">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white font-black text-base shadow-lg shadow-[#6c63ff]/25 group-hover:scale-105 transition-transform">
              SM
            </span>
            <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-[#6c63ff] to-[#ff6584] bg-clip-text text-transparent truncate">
              SpeakMate AI
            </span>
          </Link>

          {/* Desktop Search Bar */}
          {isAuthenticated && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72 lg:w-96">
              <input
                type="text"
                placeholder="Search lessons, vocabulary, grammar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff] transition-all"
              />
              <span className="absolute left-3.5 text-xs text-[var(--text-secondary)]">🔍</span>
              <span className="absolute right-3 px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] text-[10px] font-extrabold text-[var(--text-secondary)]">
                ⌘K
              </span>
            </form>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="grid h-11 w-11 place-items-center rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.364l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative flex items-center gap-3 sm:gap-4">
              {/* Notifications Button */}
              <Link
                to={ROUTES.NOTIFICATIONS}
                className="grid h-11 w-11 place-items-center rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] relative transition-all"
                title="Notifications"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[var(--bg-base)]" />
              </Link>

              {/* Streak & XP Badges */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black shadow-sm">
                  <span>🔥</span>
                  <span>{liveStats.streak || user?.streak || 0}d Streak</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6c63ff]/10 border border-[#6c63ff]/20 text-[#6c63ff] text-xs font-black shadow-sm">
                  <span>⭐</span>
                  <span>{liveStats.xp || 0} XP</span>
                </div>
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#8b85ff] text-white font-black text-base shadow-md shadow-[#6c63ff]/25 hover:scale-105 transition-transform"
                  aria-label="Open user menu"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-64 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl py-3 z-20 animate-scale-in">
                      <div className="px-5 py-3 border-b border-[var(--border-default)] space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-base font-black text-[var(--text-primary)] truncate">{user?.name || "Learner"}</p>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                            {user?.level || "B1"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] font-medium truncate">{user?.email || ""}</p>
                      </div>

                      <Link
                        to={ROUTES.DASHBOARD}
                        className="block px-5 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>

                      <Link
                        to={ROUTES.ACHIEVEMENTS}
                        className="block px-5 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Achievements & Badges
                      </Link>

                      <Link
                        to={ROUTES.PROFILE}
                        className="block px-5 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>

                      <Link
                        to={ROUTES.SETTINGS}
                        className="block px-5 py-3 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        App Preferences
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-5 py-3 text-sm font-extrabold text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.LOGIN}
                className="hidden sm:inline-flex h-11 items-center rounded-2xl px-5 text-sm font-extrabold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
              >
                Log In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex h-11 items-center rounded-2xl px-6 text-sm font-black bg-[#6c63ff] hover:bg-[#7c74ff] text-white transition-all shadow-lg shadow-[#6c63ff]/25"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
