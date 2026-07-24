import { useState } from "react";

const BADGES = [
  { id: "1", title: "First Word", desc: "Completed your 1st speaking practice session", icon: "🎙️", unlocked: true, date: "Unlocked 2 days ago" },
  { id: "2", title: "Streak Master", desc: "Maintained a 3-day daily learning streak", icon: "🔥", unlocked: true, date: "Unlocked yesterday" },
  { id: "3", title: "Vocabulary Virtuoso", desc: "Mastered 50 new vocabulary flashcards", icon: "📚", unlocked: true, date: "Unlocked today" },
  { id: "4", title: "Grammar Guru", desc: "Scored 100% on 5 grammar quizzes", icon: "✍️", unlocked: false, date: "Progress: 3/5" },
  { id: "5", title: "Fluency Champion", desc: "Achieved an overall fluency score above 90%", icon: "🏆", unlocked: false, date: "Progress: 88/90%" },
  { id: "6", title: "Century Club", desc: "Earned a total of 1,000 XP learning points", icon: "💎", unlocked: false, date: "Progress: 450/1000 XP" },
];

export function Achievements() {
  const [claimedRewards, setClaimedRewards] = useState({});

  const handleClaim = (id) => {
    setClaimedRewards((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Achievements & Badges</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Earn badges and XP rewards as you build your daily English speaking habit.
        </p>
      </div>

      {/* Overview Stats Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#8b85ff] to-[#ff6584] text-white shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Total Badges</p>
          <p className="text-3xl font-extrabold mt-1">3 / 6 Unlocked</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Lifetime XP</p>
          <p className="text-3xl font-extrabold mt-1">450 XP</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Streak Multiplier</p>
          <p className="text-3xl font-extrabold mt-1">1.5x XP Boost</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BADGES.map((b) => (
          <div
            key={b.id}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
              b.unlocked
                ? "bg-[var(--bg-surface)] border-[#6c63ff]/30 shadow-md"
                : "bg-[var(--bg-surface)] border-[var(--border-default)] opacity-70"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`text-4xl p-3 rounded-2xl ${b.unlocked ? "bg-[#6c63ff]/10" : "bg-[var(--border-subtle)]"}`}>
                  {b.icon}
                </span>
                <span
                  className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                    b.unlocked ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--border-subtle)] text-[var(--text-secondary)]"
                  }`}
                >
                  {b.unlocked ? "Unlocked ✓" : "Locked 🔒"}
                </span>
              </div>

              <h3 className="font-extrabold text-base text-[var(--text-primary)]">{b.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{b.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-secondary)]">{b.date}</span>
              {b.unlocked && (
                <button
                  onClick={() => handleClaim(b.id)}
                  disabled={claimedRewards[b.id]}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    claimedRewards[b.id]
                      ? "bg-emerald-500/20 text-emerald-500"
                      : "bg-[#6c63ff] hover:bg-[#8b85ff] text-white shadow-md"
                  }`}
                >
                  {claimedRewards[b.id] ? "Claimed ✓" : "Claim +50 XP"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Achievements;
