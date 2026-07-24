import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import ROUTES from "../../constants/routes";

export function Navbar({ onOpenMobileDrawer }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate(ROUTES.HOME);
  };

  return (
    <header className="sticky top-0 left-0 w-full z-40 border-b border-[var(--border-default)] bg-[var(--bg-base)]/88 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onOpenMobileDrawer}
              className="md:hidden grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all"
              aria-label="Open Mobile Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <Link to={ROUTES.HOME} className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-sm shadow-md shadow-[#6c63ff]/20">
              SM
            </span>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#6c63ff] to-[#ff6584] bg-clip-text text-transparent truncate">
              SpeakMate AI
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 17.657l.707.707M6.343 6.364l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative flex items-center gap-2 sm:gap-3">
              <Link
                to={ROUTES.NOTIFICATIONS}
                className="grid h-10 w-10 place-items-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] relative"
                title="Notifications"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[var(--bg-base)]" />
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)]">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold text-xs text-[var(--text-primary)]">{user?.streak || 3}d streak</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#8b85ff] text-white font-bold text-sm shadow-md shadow-[#6c63ff]/20"
                  aria-label="Open user menu"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-[var(--border-default)]">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.name || "User"}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email || ""}</p>
                      </div>

                      <Link
                        to={ROUTES.DASHBOARD}
                        className="block px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>

                      <Link
                        to={ROUTES.ACHIEVEMENTS}
                        className="block px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Achievements
                      </Link>

                      <Link
                        to={ROUTES.PROFILE}
                        className="block px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile Settings
                      </Link>

                      <Link
                        to={ROUTES.SETTINGS}
                        className="block px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                        onClick={() => setDropdownOpen(false)}
                      >
                        App Settings
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.LOGIN}
                className="hidden sm:inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
              >
                Log In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold bg-[#6c63ff] hover:bg-[#8b85ff] text-white transition-all shadow-md shadow-[#6c63ff]/20"
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
