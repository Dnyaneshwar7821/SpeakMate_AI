const SKILLS = [
  { name: "Speaking Fluency", score: 88, color: "bg-[#6c63ff]" },
  { name: "Grammar Accuracy", score: 92, color: "bg-emerald-500" },
  { name: "Vocabulary Range", score: 85, color: "bg-amber-500" },
  { name: "Pronunciation Clarity", score: 94, color: "bg-[#ff6584]" },
  { name: "Listening Comprehension", score: 90, color: "bg-indigo-500" },
];

const WEEKLY_ACTIVITY = [
  { day: "Mon", mins: 25 },
  { day: "Tue", mins: 15 },
  { day: "Wed", mins: 30 },
  { day: "Thu", mins: 20 },
  { day: "Fri", mins: 45 },
  { day: "Sat", mins: 10 },
  { day: "Sun", mins: 35 },
];

export function Progress() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">My Learning Progress & Analytics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Detailed metrics, skill breakdowns, and weekly practice activity tracking.
        </p>
      </div>

      {/* Top Banner Stats */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#8b85ff] to-[#ff6584] text-white shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-center sm:text-left">
        <div>
          <p className="text-xs font-bold uppercase opacity-80">CEFR Level</p>
          <p className="text-3xl font-extrabold mt-1">B1 Intermediate</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Fluency Score</p>
          <p className="text-3xl font-extrabold mt-1">88%</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Total Practice Time</p>
          <p className="text-3xl font-extrabold mt-1">12.5 hrs</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Words Learned</p>
          <p className="text-3xl font-extrabold mt-1">142 Words</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Skill Breakdown Bars */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-6">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Skill Competency Breakdown</h2>

          <div className="space-y-4">
            {SKILLS.map((s) => (
              <div key={s.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-primary)]">{s.name}</span>
                  <span className="text-[var(--text-secondary)]">{s.score}%</span>
                </div>
                <div className="w-full bg-[var(--border-subtle)] h-3 rounded-full overflow-hidden">
                  <div
                    className={`${s.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Weekly Activity Chart */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Weekly Activity</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Minutes practiced per day</p>
          </div>

          <div className="flex items-end justify-between gap-2 h-40 pt-4 border-b border-[var(--border-subtle)] pb-2">
            {WEEKLY_ACTIVITY.map((w) => (
              <div key={w.day} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] font-bold text-[var(--text-secondary)]">{w.mins}m</span>
                <div
                  className="w-full bg-[#6c63ff] rounded-t-lg transition-all"
                  style={{ height: `${(w.mins / 45) * 100}%` }}
                />
                <span className="text-[10px] font-bold text-[var(--text-primary)]">{w.day}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center">
            🔥 Great consistency! 180 mins practiced this week.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;
