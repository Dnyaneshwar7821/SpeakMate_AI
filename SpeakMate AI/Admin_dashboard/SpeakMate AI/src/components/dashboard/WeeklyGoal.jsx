import { motion } from "framer-motion";
import Card from "@components/common/Card";

export function WeeklyGoal({ goal }) {
  if (!goal) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-md transition-shadow">
        {/* Background Visual Deco */}
        <div className="absolute top-0 right-0 -mt-2 -mr-2 h-20 w-20 rounded-full bg-emerald-500/5 blur-lg pointer-events-none" />

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
            <span className="text-xl">🎯</span> Weekly Goal
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {goal.daysRemaining} days left
          </span>
        </div>

        <div className="mt-5 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-black text-slate-950">{goal.currentXp}</span>
            <span className="text-sm font-semibold text-slate-400"> / {goal.weeklyTarget} XP</span>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
            {goal.completionPercentage}% Done
          </span>
        </div>

        {/* Custom Progress Bar */}
        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              initial={{ width: 0 }}
              animate={{ width: `${goal.completionPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          You are on track! Complete {goal.weeklyTarget - goal.currentXp} more XP to hit your weekly learning goal.
        </p>
      </Card>
    </motion.div>
  );
}

export default WeeklyGoal;
