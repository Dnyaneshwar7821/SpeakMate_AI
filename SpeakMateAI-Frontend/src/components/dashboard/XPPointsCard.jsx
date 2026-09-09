import { motion } from "framer-motion";
import Card from "@components/common/Card";

export function XPPointsCard({ xpStats }) {
  if (!xpStats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-md transition-shadow">
        {/* Background visual details */}
        <div className="absolute right-0 bottom-0 -mb-6 -mr-6 h-28 w-28 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
          <span className="text-xl">🏆</span> Experience & Level
        </h3>

        <div className="mt-5 flex items-center gap-5">
          {/* Level Circle Badge */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <div className="text-center">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-200">LVL</span>
              <span className="text-2xl font-black">{xpStats.level}</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-base font-bold text-slate-900 leading-tight">
              {xpStats.levelName}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Earn more XP to level up your English skills.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
          <div className="text-center">
            <span className="block text-xs font-semibold text-slate-500">Today's XP</span>
            <span className="mt-1 block text-lg font-black text-indigo-600">+{xpStats.todayXp} XP</span>
          </div>
          <div className="text-center border-l border-slate-200">
            <span className="block text-xs font-semibold text-slate-500">Total XP</span>
            <span className="mt-1 block text-lg font-black text-slate-950">{xpStats.totalXp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Next Level Progress</span>
            <span>{xpStats.currentXpInLevel} / {xpStats.xpToNextLevel} XP</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpStats.percentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-[10px] text-right font-medium text-slate-400">
            {xpStats.xpToNextLevel - xpStats.currentXpInLevel} XP remaining to Level {xpStats.level + 1}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

export default XPPointsCard;
