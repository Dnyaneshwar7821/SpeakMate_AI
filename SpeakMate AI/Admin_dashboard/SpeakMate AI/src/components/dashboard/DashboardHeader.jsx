import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Bell, RefreshCw } from "lucide-react";
import { useAuth } from "@context/AuthContext";
import Button from "@components/common/Button";

function getInitials(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function DashboardHeader({ onRefresh, loading }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-black text-white shadow-lg shadow-indigo-200">
          {getInitials(user?.name || "L")}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Dashboard</p>
          <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
            Welcome back, {user?.name || "Learner"}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{today}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lessons, activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:w-64"
            aria-label="Search dashboard"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2"
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white ring-2 ring-white">
              5
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default DashboardHeader;
