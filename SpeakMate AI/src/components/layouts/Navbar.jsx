import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useTheme } from "@context/ThemeContext";
import ROUTES from "@constants/routes";

export function Navbar() {
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
    <header className="sticky top-0 left-0 w-full z-100 border-b border-[var(--border-default)] bg-[var(--bg-base)]/88 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-3 min-w-0">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm font-extrabold text-[var(--color-primary-light)]">
            SM
          </span>
          <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#6c63ff] to-[#ff6584] bg-clip-text text-transparent truncate">
            SpeakMate AI
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
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
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{user.streak || 0}d streak</span>
                </div>

                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="grid h-10 w-10 place-items-center rounded-lg bg-[#6c63ff] text-white font-bold text-sm shadow-[var(--shadow-sm)]"
                  aria-label="Open user menu"
                >
                  {user.name ? user.name.charAt(0) : "U"}
                </button>
              </div>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-lg)] py-1 z-20">
                    <div className="px-4 py-3 border-b border-[var(--border-default)]">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                    </div>

                    <Link
                      to={ROUTES.DASHBOARD}
                      className="block px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <Link
                      to={ROUTES.PROFILE}
                      className="block px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={ROUTES.LOGIN}
                className="hidden sm:inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all"
              >
                Log In
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold bg-[#6c63ff] hover:bg-[#8b85ff] text-white transition-all shadow-[var(--shadow-sm)]"
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
