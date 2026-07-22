import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import ROUTES from "@constants/routes";
import Button from "./Button";

const PRACTICE_ITEMS = [
  { path: ROUTES.AI_CHAT, label: "AI Chat", description: "Practice conversations" },
  { path: ROUTES.SPEAKING, label: "Speaking Practice", description: "Fluency drills" },
  { path: ROUTES.GRAMMAR, label: "Grammar Practice", description: "Strengthen accuracy" },
  { path: ROUTES.VOCABULARY, label: "Vocabulary Practice", description: "Grow your words" },
  { path: ROUTES.LISTENING, label: "Listening Practice", description: "Improve comprehension" },
];

const PROFILE_ITEMS = [
  { path: ROUTES.PROFILE, label: "My Profile", icon: "👤" },
  { path: ROUTES.SETTINGS, label: "Settings", icon: "⚙️" },
];

function getInitials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const practiceRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (practiceRef.current && !practiceRef.current.contains(event.target)) {
        setIsPracticeOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsPracticeOpen(false);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const baseNavClass = ({ isActive }) =>
    `rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  const menuButtonClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={ROUTES.HOME} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-black text-white shadow-lg shadow-indigo-200">
            SM
          </span>
          <span className="text-lg font-black tracking-tight text-slate-950">SpeakMateAI</span>
        </Link>

        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-2">
              <NavLink to={ROUTES.DASHBOARD} className={baseNavClass}>
                Dashboard
              </NavLink>

              <div className="relative" ref={practiceRef}>
                <button
                  type="button"
                  onClick={() => setIsPracticeOpen((value) => !value)}
                  aria-expanded={isPracticeOpen}
                  aria-haspopup="menu"
                  className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                    isPracticeOpen
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <span>Practice</span>
                  <motion.svg
                    animate={{ rotate: isPracticeOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5.5 7.5 4.5 4.5 4.5-4.5" />
                  </motion.svg>
                </button>

                <AnimatePresence>
                  {isPracticeOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 mt-2 w-72 rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-200/70 backdrop-blur"
                    >
                      <div className="mb-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Learning Paths
                      </div>
                      {PRACTICE_ITEMS.map((item) => (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={() => setIsPracticeOpen(false)}
                          className={({ isActive }) =>
                            `flex items-start justify-between rounded-2xl px-3 py-3 text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                            }`
                          }
                        >
                          <span>
                            <span className="block font-semibold">{item.label}</span>
                            <span className="mt-1 block text-xs text-slate-500">{item.description}</span>
                          </span>
                          <span className="ml-3 text-lg text-slate-400">↗</span>
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink to={ROUTES.PROGRESS} className={baseNavClass}>
                Progress
              </NavLink>

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-bold text-white">
                    {getInitials(user?.name || "User")}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-sm font-semibold text-slate-800">{user?.name || "Learner"}</span>
                    <span className="block text-xs text-slate-500">{user?.email || "learner@speakmate.ai"}</span>
                  </span>
                  <motion.span
                    animate={{ rotate: isProfileOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-base text-slate-500"
                  >
                    ⌄
                  </motion.span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-72 rounded-3xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-200/70 backdrop-blur"
                    >
                      <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-bold text-white">
                          {getInitials(user?.name || "User")}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{user?.name || "Learner"}</p>
                          <p className="text-xs text-slate-500">{user?.email || "learner@speakmate.ai"}</p>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1">
                        {PROFILE_ITEMS.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsProfileOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 ${
                                isActive
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                              }`
                            }
                          >
                            <span className="text-base">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                          </NavLink>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                        }}
                        className="mt-2 flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-100"
                      >
                        <span className="text-base">↪</span>
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((value) => !value)}
                className="rounded-2xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
                aria-label="Toggle navigation menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink
              to={ROUTES.LOGIN}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Log in
            </NavLink>
            <Link to={ROUTES.REGISTER}>
              <Button>Get started</Button>
            </Link>
          </div>
        )}
      </nav>

      <AnimatePresence>
        {isAuthenticated && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-200 bg-white/95 lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
              <NavLink to={ROUTES.DASHBOARD} className={menuButtonClass}>
                Dashboard
              </NavLink>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Practice
                </div>
                {PRACTICE_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-700 hover:bg-white hover:text-slate-950"
                      }`
                    }
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className="mt-0.5 text-xs text-slate-500">{item.description}</span>
                  </NavLink>
                ))}
              </div>
              <NavLink to={ROUTES.PROGRESS} className={menuButtonClass}>
                Progress
              </NavLink>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
                {PROFILE_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-700 hover:bg-white hover:text-slate-950"
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 transition-all duration-200 hover:bg-rose-100"
              >
                <span>↪</span>
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
