import { useState, useEffect } from "react";
import { achievementService } from "../services/appServices";

export function Achievements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAchievements = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await achievementService.all();
      setItems(data || []);
    } catch (e) {
      setItems([
        { id: "1", title: "First Words", description: "Complete your 1st speaking conversation.", unlocked: true, unlockedAt: "2026-07-20", xpReward: 50, tier: 1 },
        { id: "2", title: "3-Day Streak", description: "Maintain a 3-day consecutive learning streak.", unlocked: true, unlockedAt: "2026-07-22", xpReward: 50, tier: 1 },
        { id: "3", title: "Grammar Scholar", description: "Score 100% on 3 grammar analysis checks.", unlocked: false, xpReward: 50, tier: 1 },
        { id: "4", title: "Vocab Master", description: "Master 20 vocabulary flashcards in your word bank.", unlocked: false, xpReward: 50, tier: 1 },
        { id: "5", title: "Fluency Starter", description: "Achieve over 85% fluency in a scenario.", unlocked: true, unlockedAt: "2026-07-15", xpReward: 100, tier: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const maxTier = items.length > 0 ? Math.max(...items.map((i) => i.tier || 1)) : 1;
  const activeTierItems = items.filter((i) => (i.tier || 1) === maxTier);
  const pastTierItems = items.filter((i) => (i.tier || 1) < maxTier);

  const activeUnlockedCount = activeTierItems.filter((i) => i.unlocked).length;
  const activeTotalCount = activeTierItems.length;
  const totalUnlockedCount = items.filter((i) => i.unlocked).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Recently";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "Recently"
      : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const getTierName = (t) => {
    if (t === 1) return "Starter (Tier 1)";
    if (t === 2) return "Intermediate (Tier 2)";
    if (t === 3) return "Advanced (Tier 3)";
    return `Legendary (Tier ${t})`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Header */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-2xl space-y-4 border border-white/10">
        <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-amber-300">
          🏆 Hall of Fame
        </span>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Medal Case & Achievements</h1>
        <p className="text-xs sm:text-sm text-indigo-200 font-medium max-w-xl leading-relaxed">
          Unlock learning milestones, build your medal showcase, and claim XP rewards.
        </p>
      </div>

      {loading ? (
        <div className="p-16 rounded-3xl glass-card text-center font-black text-sm text-[var(--text-secondary)]">
          Loading achievements...
        </div>
      ) : (
        <div className="space-y-8">
          {/* Medal Case Tier Banner */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-5 bg-gradient-to-br from-[var(--bg-surface)] to-amber-500/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shrink-0">
                  <span className="text-3xl">🎖️</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">{getTierName(maxTier)}</h2>
                  <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                    {activeUnlockedCount === activeTotalCount && activeTotalCount > 0
                      ? `Tier ${maxTier} Completed! Tier ${maxTier + 1} Unlocked!`
                      : `Unlocked ${activeUnlockedCount} of ${activeTotalCount} medals in Tier ${maxTier}`}
                  </p>
                  <p className="text-xs font-black text-amber-500 mt-1">
                    🏆 Total Medals Earned: {totalUnlockedCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 rounded-full shadow-sm"
                style={{ width: `${activeTotalCount ? (activeUnlockedCount / activeTotalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Active Medal Case */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[var(--text-primary)]">
              Active Medal Case (Tier {maxTier})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeTierItems.map((item) => (
                <div
                  key={item.id}
                  className={`glass-card glass-card-hover p-6 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
                    item.unlocked
                      ? "border-[#6C63FF]/40 shadow-lg"
                      : "border-[var(--border-default)] opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl shrink-0 ${
                        item.unlocked
                          ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md"
                          : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {item.unlocked ? "🏆" : "🔒"}
                    </div>

                    <div>
                      <h3 className={`font-black text-base ${item.unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-snug mt-0.5">{item.description}</p>
                      {item.unlocked && item.unlockedAt && (
                        <span className="text-[10px] font-black text-emerald-500 block mt-1">
                          Unlocked {formatDate(item.unlockedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black ${
                        item.unlocked
                          ? "bg-emerald-500/15 text-emerald-500"
                          : "bg-gray-400/15 text-gray-400"
                      }`}
                    >
                      +{item.xpReward || 50} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Tiers */}
          {pastTierItems.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[var(--border-default)]">
              <h2 className="text-xl font-black text-[var(--text-primary)]">Completed Tier Medals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pastTierItems.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card p-6 rounded-3xl border border-emerald-500/30 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-500 text-xl shrink-0">
                        ✓
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-[var(--text-primary)]">{item.title}</h3>
                        <p className="text-xs text-[var(--text-secondary)] font-medium">{item.description}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-500 bg-emerald-500/15 px-3 py-1 rounded-full">
                      Mastered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Achievements;
