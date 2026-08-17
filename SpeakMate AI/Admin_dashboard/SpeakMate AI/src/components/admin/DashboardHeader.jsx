import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import Button from "@components/common/Button";

function AdminDashboardHeader({ onRefresh, loading }) {
  const { user } = useAuth();
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.name || "Admin";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <span className="inline-flex rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700 ring-1 ring-inset ring-purple-700/10">
          Admin Dashboard
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 leading-[1.1] md:text-3xl">
          Welcome back, {fullName} 👋
        </h1>
        <p className="mt-2 text-sm font-medium text-gray-500">{today}</p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Monitor platform health at a glance. Manage users, review content,
          and keep the SpeakMateAI experience running smoothly.
        </p>
      </div>
      <div className="flex items-center gap-3 self-start">
        <Button
          variant="secondary"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>
    </motion.div>
  );
}

export default AdminDashboardHeader;
