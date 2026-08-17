import { motion } from "framer-motion";
import Card from "@components/common/Card";

export function AchievementBadges({ badges }) {
  if (!badges) return null;

  // Filter earned and locked badges
  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  // Find the locked badge closest to completion as the "next badge" progress
  const nextBadge = lockedBadges.reduce((prev, curr) => {
    if (!prev) return curr;
    const prevRatio = prev.progress / prev.target;
    const currRatio = curr.progress / curr.target;
    return currRatio > prevRatio ? curr : prev;
  }, null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-black text-slate-950 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-xl">🏅</span> Achievements
          </span>
          <div className="flex items-center gap-1.5">
            {badges.some((b) => b.tier) && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Tier {Math.max(...badges.map((b) => b.tier || 1))}
              </span>
            )}
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {earnedBadges.length}/{badges.length}
            </span>
          </div>
        </h3>
        
        {/* Next badge unlock progress */}
        {nextBadge && (
          <div className="mt-5 rounded-2xl bg-indigo-50/50 p-4 border border-indigo-100/50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span className="text-indigo-900 flex items-center gap-1.5">
                <span>🎯 Next Unlock:</span> 
                <span className="font-semibold text-slate-800">{nextBadge.title}</span>
              </span>
              <span className="text-indigo-600">
                {nextBadge.progress} / {nextBadge.target}
              </span>
            </div>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(nextBadge.progress / nextBadge.target) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Badges</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                whileHover={{ scale: 1.05 }}
                className={`group flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                  badge.earned
                    ? "bg-white border-indigo-100 hover:border-indigo-300 shadow-sm"
                    : "bg-slate-50/50 border-slate-200/50 opacity-60"
                }`}
              >
                {/* Badge Icon circle */}
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl mb-2 transition-transform group-hover:rotate-12 ${
                  badge.earned ? "bg-indigo-50" : "bg-slate-100 grayscale"
                }`}>
                  {badge.icon}
                </div>
                
                <h4 className="text-xs font-bold text-slate-900 leading-tight truncate w-full">
                  {badge.title}
                </h4>
                
                <p className="text-[9px] text-slate-400 mt-1 font-medium leading-none">
                  {badge.earned ? "Earned" : `${Math.round((badge.progress / badge.target) * 100)}%`}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default AchievementBadges;
