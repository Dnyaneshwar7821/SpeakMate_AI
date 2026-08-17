import { Link, Outlet } from "react-router-dom";
import ROUTES from "../../constants/routes";
import { useTheme } from "../../context/ThemeContext";

export function AuthLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-300 relative overflow-hidden flex flex-col justify-between p-4 sm:p-6">
      {/* Background Ambient Glow Spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#6c63ff]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#ff6584]/15 rounded-full blur-[120px] pointer-events-none animate-pulse delay-1000" />

      {/* Header Bar */}
      <header className="mx-auto w-full max-w-5xl flex items-center justify-between py-3 relative z-20">
        <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-base font-black text-white shadow-lg shadow-[#6c63ff]/30 group-hover:scale-105 transition-all">
            SM
          </span>
          <span className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            SpeakMate <span className="text-[#6c63ff]">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[#6c63ff]/50 transition-all shadow-md flex items-center justify-center text-base"
            title="Toggle Light / Dark Mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <Link
            to={ROUTES.HOME}
            className="px-4 py-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all shadow-md"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Main Auth Content */}
      <main className="flex-1 flex items-center justify-center py-6 relative z-10">
        <Outlet />
      </main>

      {/* Footer copyright */}
      <footer className="py-2 text-center text-xs font-bold text-[var(--text-secondary)] relative z-20 opacity-75">
        © {new Date().getFullYear()} SpeakMate AI. All rights reserved.
      </footer>
    </div>
  );
}

export default AuthLayout;
