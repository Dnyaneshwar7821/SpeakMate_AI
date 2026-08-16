import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../constants/routes";

const MAIN_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.SPEAKING,
    label: "Speaking Practice",
    badge: "Live AI",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    path: ROUTES.AI_CHAT,
    label: "AI Chat Coach",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    path: ROUTES.PROGRESS,
    label: "Progress & Analytics",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const MODULE_ITEMS = [
  {
    path: ROUTES.LESSONS,
    label: "CEFR Lessons",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    path: ROUTES.GRAMMAR,
    label: "Grammar Coach",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.VOCABULARY,
    label: "Vocabulary Builder",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
  },
  {
    path: ROUTES.ACHIEVEMENTS,
    label: "Achievements",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4m6 17v-5m0 0a5 5 0 005-5V7a2 2 0 00-2-2H6a2 2 0 00-2 2v5a5 5 0 005 5v5m6 0H9" />
      </svg>
    ),
  },
];

const ACCOUNT_ITEMS = [
  {
    path: ROUTES.PROFILE,
    label: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    path: ROUTES.SETTINGS,
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
  },
];

export function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 lg:w-72 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-surface)]/70 backdrop-blur-xl h-[calc(100vh-80px)] sticky top-20 flex flex-col justify-between p-4 overflow-y-auto z-30 transition-all duration-300">
      <div className="space-y-6">
        {/* SECTION 1: MAIN WORKSPACE */}
        <div className="space-y-1">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Workspace
          </p>
          {MAIN_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:translate-x-1"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-wider animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* SECTION 2: LEARNING MODULES */}
        <div className="space-y-1 pt-3 border-t border-[var(--border-subtle)]">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Learning Modules
          </p>
          {MODULE_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:translate-x-1"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* SECTION 3: ACCOUNT & SETTINGS */}
        <div className="space-y-1 pt-3 border-t border-[var(--border-subtle)]">
          <p className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Account & Settings
          </p>
          {ACCOUNT_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:translate-x-1"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* USER BOTTOM PROFILE CARD */}
      <div className="pt-3 border-t border-[var(--border-subtle)]">
        <div className="p-3 rounded-2xl bg-[var(--bg-elevated)]/60 border border-[var(--border-default)] flex items-center gap-3 backdrop-blur-md hover:border-indigo-500/30 transition-all">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 text-white font-extrabold text-xs shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-xs text-[var(--text-primary)] truncate">{user?.name || "Learner"}</p>
            <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 truncate">
              {localStorage.getItem("speakmate_account_type") === "STUDENT" && (user?.schoolGrade || localStorage.getItem("speakmate_school_grade"))
                ? `Standard: ${user?.schoolGrade || localStorage.getItem("speakmate_school_grade")}`
                : `Level: ${user?.englishLevel || "Intermediate"}`}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
