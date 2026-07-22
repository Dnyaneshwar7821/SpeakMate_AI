import { NavLink } from "react-router-dom";
import ROUTES from "@constants/routes";

const MENU_ITEMS = [
  { path: ROUTES.DASHBOARD, label: "Dashboard", icon: "DB" },
  { path: ROUTES.AI_CHAT, label: "AI Chat Coach", icon: "AI" },
  { path: ROUTES.SPEAKING, label: "Speaking Practice", icon: "SP" },
  { path: ROUTES.GRAMMAR, label: "Grammar Coach", icon: "GR" },
  { path: ROUTES.VOCABULARY, label: "Vocabulary Builder", icon: "VB" },
  { path: ROUTES.LISTENING, label: "Listening Practice", icon: "LP" },
  { path: ROUTES.PROGRESS, label: "My Progress", icon: "MP" },
  { path: ROUTES.PROFILE, label: "Profile", icon: "PR" },
  { path: ROUTES.SETTINGS, label: "Settings", icon: "ST" },
];

export function Sidebar() {
  return (
    <aside className="w-68 border-r border-[var(--border-default)] bg-[var(--bg-surface)] min-h-[calc(100vh-64px)] hidden md:block py-5 px-4">
      <nav className="space-y-1.5">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-[#6c63ff] text-white shadow-md shadow-[#6c63ff]/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
              }`
            }
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[var(--bg-elevated)] text-[10px] font-extrabold">
              {item.icon}
            </span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
