import { motion } from "framer-motion";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

export function ContinueLearningCard({ activity, onContinue }) {
  if (!activity) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-md transition-shadow">
        {/* Background Accent Gradients */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
        
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                {activity.type}
              </span>
              <span className="text-xs font-medium text-slate-500">
                Last practiced {activity.lastPlayed}
              </span>
            </div>
            
            <h3 className="mt-3 text-xl font-black text-slate-950">
              {activity.title}
            </h3>
            
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              {activity.description}
            </p>
            
            {/* Progress Area */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Course Progress</span>
                <span className="text-indigo-600">{activity.progress}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${activity.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center sm:self-end lg:self-center">
            <Button
              onClick={onContinue}
              className="w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              <span>Continue session</span>
              <svg
                className="h-4 w-4 transform transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default ContinueLearningCard;
