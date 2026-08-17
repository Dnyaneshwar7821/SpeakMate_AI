import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  School,
  Bot,
  CreditCard,
  FileBarChart,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@context/AuthContext";
import { useTheme } from "@context/ThemeContext";

import ROUTES from "@constants/routes";

const navItems = [
  { label: "Dashboard", href: ROUTES.ADMIN, icon: LayoutDashboard },
  { label: "Schools", href: "/admin/schools", icon: School },
  { label: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
  { label: "Lessons", href: ROUTES.ADMIN_LESSONS, icon: BookOpen },
  { label: "AI Configuration", href: "/admin/ai-configuration", icon: Bot },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Reports", href: ROUTES.ADMIN_ANALYTICS, icon: FileBarChart },
  { label: "Settings", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "Admin";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const pageTitle = navItems.find((item) => location.pathname === item.href || (item.href !== ROUTES.ADMIN && location.pathname.startsWith(item.href)))?.label || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col transform border-r border-gray-200 bg-white shadow-lg transition-transform duration-200 ease-out dark:border-slate-700 dark:bg-slate-900 dark:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto lg:flex-shrink-0 lg:shadow-sm`}
      >
        <div className="flex h-[72px] flex-shrink-0 items-center gap-3 border-b border-gray-200 px-5 dark:border-slate-700">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-bold text-white shadow-md shadow-purple-500/20">
            S
          </div>
          <span className="text-base font-bold tracking-tight text-slate-950 dark:text-white">SpeakMateAI</span>
          <span className="ml-auto rounded-full bg-purple-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            Admin
          </span>
          <button
            className="lg:hidden ml-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/30 ${isActive
                  ? "border-purple-100 bg-purple-50 text-purple-700 shadow-sm dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300 dark:shadow-none"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white dark:hover:shadow-none"
                }`
              }
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 border-t border-gray-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              {initials || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
                {fullName}
              </p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] flex-shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-none sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-white">{pageTitle}</h1>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <div className="relative hidden w-40 sm:block md:w-52 lg:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm font-medium text-slate-900 shadow-sm placeholder:font-normal placeholder:text-slate-400 transition hover:border-gray-300 hover:bg-white focus:border-purple-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:shadow-none"
                aria-label="Search admin"
              />
            </div>

            <button type="button" onClick={toggleTheme} className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 focus-visible:ring-2 focus-visible:ring-purple-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:shadow-none dark:hover:bg-slate-700" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              type="button"
              className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 focus-visible:ring-2 focus-visible:ring-purple-500/30 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:shadow-none"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={1.5} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                3
              </span>
            </button>

            <button type="button" className="flex h-10 flex-shrink-0 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-2 pr-4 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500/30 dark:border-slate-600 dark:bg-slate-800 dark:shadow-none dark:hover:bg-slate-700" aria-label="Open admin profile menu">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-xs font-bold text-white">
                {initials || "A"}
              </div>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block text-sm font-semibold text-slate-900 dark:text-white">{fullName}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{user?.email}</span>
              </span>
              <ChevronDown size={14} className="hidden flex-shrink-0 text-slate-400 sm:block" />
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
