import { motion } from "framer-motion";
import Card from "@components/common/Card";

export function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) return null;

  // Helper to color code activity types
  const getTypeColor = (type) => {
    switch (type) {
      case "AI Chat Coach":
        return "bg-indigo-500 ring-indigo-100";
      case "Speaking Practice":
        return "bg-sky-500 ring-sky-100";
      case "Grammar Review":
        return "bg-emerald-500 ring-emerald-100";
      case "Vocabulary":
        return "bg-amber-500 ring-amber-100";
      default:
        return "bg-slate-500 ring-slate-100";
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 90) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/10";
    } else if (score >= 75) {
      return "bg-indigo-50 text-indigo-700 ring-indigo-600/10";
    } else {
      return "bg-slate-50 text-slate-700 ring-slate-600/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
          <span className="text-xl">📈</span> Recent Activity
        </h3>

        <div className="mt-6 flow-root">
          <ul className="-mb-8">
            {activities.map((activity, idx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {/* Timeline connecting line */}
                  {idx !== activities.length - 1 ? (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                  ) : null}
                  
                  <div className="relative flex space-x-3 items-start">
                    {/* Timeline Node Dot */}
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ${getTypeColor(activity.type)}`}>
                        {activity.type === "AI Chat Coach" && (
                          <span className="text-[10px] text-white">🤖</span>
                        )}
                        {activity.type === "Speaking Practice" && (
                          <span className="text-[10px] text-white">🗣️</span>
                        )}
                        {activity.type === "Grammar Review" && (
                          <span className="text-[10px] text-white">✍️</span>
                        )}
                        {activity.type === "Vocabulary" && (
                          <span className="text-[10px] text-white">📚</span>
                        )}
                      </span>
                    </div>

                    {/* Timeline Text Content */}
                    <div className="flex-1 min-w-0 pt-0.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {activity.type} • <span className="font-medium text-slate-400">{activity.timestamp}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {/* Score Indicator */}
                        {activity.score && (
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset ${getScoreBadge(activity.score)}`}>
                            {activity.score}% score
                          </span>
                        )}
                        
                        {/* XP Gained Indicator */}
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-extrabold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          +{activity.xpEarned} XP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
}

export default RecentActivity;
