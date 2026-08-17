import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FileBarChart2,
  Settings2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Card from "@components/common/Card";
import ROUTES from "@constants/routes";

const quickActions = [
  {
    title: "Add User",
    text: "Create a new learner or admin account.",
    route: ROUTES.ADMIN_USERS,
    icon: Users,
    accent: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    title: "Create Lesson",
    text: "Add new content to the learning catalog.",
    route: ROUTES.ADMIN_LESSONS,
    icon: BookOpen,
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    title: "Generate Report",
    text: "Export platform usage and engagement data.",
    route: ROUTES.ADMIN_ANALYTICS,
    icon: FileBarChart2,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Settings",
    text: "Configure roles, flags, and admin behavior.",
    route: ROUTES.ADMIN_SETTINGS,
    icon: Settings2,
    accent: "text-slate-700",
    bg: "bg-slate-100",
  },
];

function QuickActionCard({ action, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={action.route}>
        <Card className="group h-full p-6 transition-all duration-300 hover:border-purple-200 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bg} ${action.accent}`}
              >
                <action.icon size={20} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-950">
                  {action.title}
                </h3>
                <p className="mt-1 text-sm leading-5 text-gray-500">
                  {action.text}
                </p>
              </div>
            </div>
            <ArrowRight
              size={16}
              className="text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-indigo-600"
            />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function QuickActions() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {quickActions.map((action, index) => (
        <QuickActionCard key={action.title} action={action} index={index} />
      ))}
    </div>
  );
}
