import { motion } from "framer-motion";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

export function DailyMotivation({ motivation, onAcceptChallenge }) {
  if (!motivation) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-md transition-shadow">
        {/* Background Visual Element */}
        <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-indigo-50 pointer-events-none" />

        <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
          <span className="text-xl">✨</span> Daily Inspiration
        </h3>

        {/* Motivational Quote */}
        <div className="mt-5 relative">
          <span className="absolute -left-2 -top-4 text-6xl text-indigo-100 font-serif leading-none select-none pointer-events-none">
            “
          </span>
          <blockquote className="relative pl-4">
            <p className="text-sm italic text-slate-600 leading-relaxed font-medium">
              {motivation.quote}
            </p>
            <footer className="mt-2 text-xs font-bold text-slate-400">
              — {motivation.author}
            </footer>
          </blockquote>
        </div>

        {/* Daily Challenge Callout */}
        <div className="mt-6 rounded-2xl bg-amber-50/50 p-4 border border-amber-100/50">
          <div className="flex items-center gap-2">
            <span className="text-base text-amber-500">🎯</span>
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
              Today's Challenge
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-700 leading-normal">
            {motivation.challenge}
          </p>
          <div className="mt-4">
            <Button
              variant="secondary"
              className="w-full h-9 rounded-xl text-xs font-bold border-amber-200 bg-white hover:bg-amber-50/30 text-amber-800"
              onClick={onAcceptChallenge}
            >
              Start Challenge
            </Button>
          </div>
        </div>

        {/* Practice Reminder */}
        <div className="mt-4 flex items-center gap-2 px-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <p className="text-[10px] font-bold text-slate-500">
            {motivation.reminder}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

export default DailyMotivation;
