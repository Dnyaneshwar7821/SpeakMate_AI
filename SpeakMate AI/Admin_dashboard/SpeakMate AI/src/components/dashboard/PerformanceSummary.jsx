import { motion } from "framer-motion";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

function SkillBar({ label, score, color }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
        <span>{label}</span>
        <span className={color === "text-indigo-600" ? "text-indigo-600" : color}>{score}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${
            color === "text-emerald-600"
              ? "from-emerald-500 to-teal-400"
              : color === "text-amber-600"
              ? "from-amber-500 to-orange-400"
              : color === "text-sky-600"
              ? "from-sky-500 to-indigo-400"
              : "from-indigo-500 to-purple-400"
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export function PerformanceSummary({ performance, onViewDetails }) {
  if (!performance) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-950">Performance Summary</h3>
          <p className="text-xs text-slate-500 mt-0.5">Skill breakdown for this month</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewDetails} className="h-8 text-[11px] font-bold">
          View details
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
          <div className="text-center">
            <span className="block text-[9px] font-bold uppercase tracking-wider text-indigo-200">Score</span>
            <span className="text-xl font-black">{performance.overallScore}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">Overall Performance</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            {performance.trend} vs last month
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <SkillBar label="Speaking" score={performance.speakingScore} color="text-indigo-600" />
        <SkillBar label="Grammar" score={performance.grammarScore} color="text-emerald-600" />
        <SkillBar label="Vocabulary" score={performance.vocabularyScore} color="text-amber-600" />
        <SkillBar label="Listening" score={performance.listeningScore} color="text-sky-600" />
      </div>
    </Card>
  );
}

export default PerformanceSummary;
