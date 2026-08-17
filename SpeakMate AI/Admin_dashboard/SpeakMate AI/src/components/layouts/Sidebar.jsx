import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../constants/routes";

const MAIN_ITEMS = [
  {
    path: ROUTES.DASHBOARD,
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
    path: ROUTES.LISTENING,
    label: "Listening Drills",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
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
    label: "Profile Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    path: ROUTES.SETTINGS,
    label: "Preferences",
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
    <aside className="w-64 lg:w-72 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-surface)] h-[calc(100vh-80px)] sticky top-20 flex flex-col justify-between p-4 overflow-y-auto z-30">
      <div className="space-y-6">
        {/* SECTION 1: MAIN WORKSPACE */}
        <div className="space-y-1.5">
          <p className="px-3 text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Main Workspace
          </p>
          {MAIN_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#6c63ff] to-[#8b85ff] text-white shadow-md shadow-[#6c63ff]/25"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* SECTION 2: LEARNING MODULES */}
        <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
          <p className="px-3 text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Learning Modules
          </p>
          {MODULE_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#6c63ff] to-[#8b85ff] text-white shadow-md shadow-[#6c63ff]/25"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* SECTION 3: ACCOUNT & SETTINGS */}
        <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
          <p className="px-3 text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Account & Preference
          </p>
          {ACCOUNT_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-[#6c63ff] to-[#8b85ff] text-white shadow-md shadow-[#6c63ff]/25"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* USER BOTTOM CARD */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <div className="p-3 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-xs text-[var(--text-primary)] truncate">{user?.name || "Learner"}</p>
            <p className="text-[10px] font-bold text-[#6c63ff] truncate">
              Standard: {localStorage.getItem("speakmate_school_grade") || user?.schoolGrade || user?.level || "1st Std"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
