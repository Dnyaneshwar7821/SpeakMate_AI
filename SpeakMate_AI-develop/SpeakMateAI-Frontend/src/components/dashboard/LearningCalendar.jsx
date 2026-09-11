import { motion } from "framer-motion";
import Card from "@components/common/Card";

export function LearningCalendar({ calendarData }) {
  if (!calendarData) return null;

  const { monthName, year, streak, completedDays, totalDaysInMonth, startWeekday } = calendarData;
  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Generate blank spaces for the start of the month
  const blanks = Array(startWeekday).fill(null);
  
  // Generate days in the month
  const days = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
  
  // Combine blanks and days
  const calendarCells = [...blanks, ...days];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
              <span className="text-xl">📅</span> Learning Calendar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Track your daily consistency
            </p>
          </div>
          
          {/* Streak Indicator */}
          <div className="inline-flex items-center gap-2 rounded-2xl bg-orange-50 px-3.5 py-1.5 border border-orange-100 self-start sm:self-center">
            <span className="text-lg animate-pulse">🔥</span>
            <div>
              <span className="block text-xs font-black text-orange-700 leading-tight">
                {streak} Day Streak
              </span>
              <span className="text-[10px] font-semibold text-orange-500">
                Keep it up tomorrow!
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Grid wrapper */}
        <div className="mt-6 border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-sm font-extrabold text-slate-900">{monthName} {year}</span>
            <span className="text-xs font-bold text-indigo-600">Daily habit</span>
          </div>

          <div className="grid grid-cols-7 gap-y-2 text-center text-xs font-bold text-slate-400">
            {weekdays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}

            {calendarCells.map((cellValue, idx) => {
              if (cellValue === null) {
                return <div key={`empty-${idx}`} className="py-2" />;
              }

              const isCompleted = completedDays.includes(cellValue);
              
              return (
                <div key={`day-${cellValue}`} className="relative flex justify-center py-1">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all relative ${
                      isCompleted
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {cellValue}
                    {isCompleted && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-indigo-200" />
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default LearningCalendar;
