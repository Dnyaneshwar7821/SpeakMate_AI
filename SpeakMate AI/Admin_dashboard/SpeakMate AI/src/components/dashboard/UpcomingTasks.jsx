import { motion } from "framer-motion";
import Card from "@components/common/Card";

export function UpcomingTasks({ tasks }) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-950">Upcoming Tasks</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today</span>
      </div>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-slate-200 hover:bg-white"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${task.color} text-white shadow-sm`}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{task.title}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                {task.type}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-black text-slate-900">{task.time}</p>
              <p className="text-[10px] font-bold text-slate-500">{task.duration}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

export default UpcomingTasks;
