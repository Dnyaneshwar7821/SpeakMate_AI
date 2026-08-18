import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ROUTES from "../../constants/routes";
import { getLiveProgressStats } from "../../utils/progressTracker";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveStats, setLiveStats] = useState(() => getLiveProgressStats(user));

  useEffect(() => {
    const updateStats = () => {
      setLiveStats(getLiveProgressStats(user));
    };
    updateStats();
    window.addEventListener("focus", updateStats);
    return () => window.removeEventListener("focus", updateStats);
  }, [user]);

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
    <header className="sticky top-0 left-0 w-full z-40 border-b border-[var(--border-default)] bg-[var(--bg-base)]/80 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="flex items-center gap-3 min-w-0 group"
          >
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#FF6584] opacity-50 blur-sm group-hover:opacity-100 transition-opacity" />
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-[#6C63FF] via-[#7C74FF] to-[#FF6584] text-white font-black text-base shadow-lg shadow-[#6C63FF]/30 group-hover:scale-105 transition-transform">
                SM
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-[#6C63FF] via-[#9F7AEA] to-[#FF6584] bg-clip-text text-transparent truncate">
                SpeakMate AI
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase hidden sm:block">
                Intelligent English Coach
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          {isAuthenticated && (
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-72 lg:w-96">
              <input
                type="text"
                placeholder="Search lessons, vocabulary, grammar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all shadow-inner"
              />
              <span className="absolute left-3.5 text-xs text-[var(--text-muted)]">🔍</span>
              <span className="absolute right-3 px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[10px] font-black text-[var(--text-muted)]">
                ⌘K
              </span>
            </form>
          )}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="grid h-11 w-11 place-items-center rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] transition-all shadow-sm active:scale-95"
            aria-label="Toggle theme"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.364l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

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
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-black shadow-sm backdrop-blur-sm">
                  <span>🔥</span>
                  <span>{liveStats.streak || user?.streak || 0}d Streak</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-[#6C63FF] text-xs font-black shadow-sm backdrop-blur-sm">
                  <span>⭐</span>
                  <span>{liveStats.xp || 0} XP</span>
                </div>
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white font-black text-base shadow-md shadow-[#6C63FF]/30 hover:scale-105 active:scale-95 transition-all overflow-hidden"
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

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-3 w-72 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl p-2 z-20 animate-scale-in">
                      <div className="px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] mb-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-[var(--text-primary)] truncate">{user?.firstName || user?.name || "Learner"}</p>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#6C63FF]/20 text-[#6C63FF]">
                            {user?.level || "B1 Intermediate"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] font-medium truncate">{user?.email || ""}</p>
                      </div>

                      <div className="space-y-1">
                        <Link
                          to={ROUTES.DASHBOARD}
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
                          <span>⚙️</span> App Settings
                        </Link>

                        <div className="my-1 border-t border-[var(--border-default)]" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black text-red-500 hover:bg-red-500/10 transition-all"
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
                className="hidden sm:inline-flex h-11 items-center rounded-2xl px-5 text-sm font-extrabold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-default)] transition-all"
              >
                Log In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex h-11 items-center rounded-2xl px-6 text-sm font-black bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:from-[#7C74FF] hover:to-[#9D71FB] text-white transition-all shadow-lg shadow-[#6C63FF]/30 active:scale-95"
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
