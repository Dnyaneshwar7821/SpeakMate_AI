import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ROUTES from "../../constants/routes";

const MENU_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "Dashboard" },
  { path: ROUTES.SPEAKING, label: "Speaking Practice" },
  { path: ROUTES.AI_CHAT, label: "AI Chat Coach" },
  { path: ROUTES.LESSONS, label: "Interactive Lessons" },
  { path: ROUTES.GRAMMAR, label: "Grammar Coach" },
  { path: ROUTES.VOCABULARY, label: "Vocabulary Builder" },
  { path: ROUTES.LISTENING, label: "Listening Practice" },
  { path: ROUTES.ACHIEVEMENTS, label: "Achievements & Badges" },
  { path: ROUTES.PROGRESS, label: "My Progress" },
  { path: ROUTES.NOTIFICATIONS, label: "Notifications" },
  { path: ROUTES.PROFILE, label: "Profile Settings" },
  { path: ROUTES.SETTINGS, label: "App Settings" },
  { path: ROUTES.HELP, label: "Help & Support" },
  { path: ROUTES.ABOUT, label: "About SpeakMate" },
];

export function MobileDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-xs bg-[var(--bg-surface)] text-[var(--text-primary)] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{user?.name || "SpeakMate User"}</p>
              <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email || "Level: Intermediate"}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--border-subtle)] text-[var(--text-secondary)]"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#6c63ff] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--border-subtle)] hover:text-[var(--text-primary)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-[var(--border-default)]">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MobileDrawer;
