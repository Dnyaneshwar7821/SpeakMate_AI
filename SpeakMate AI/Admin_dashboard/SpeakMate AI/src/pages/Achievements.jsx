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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Medal Case & Achievements</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Unlock learning milestones, build your medal case, and claim XP rewards.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center font-bold text-[var(--text-secondary)]">Loading achievements...</div>
      ) : (
        <div className="space-y-6">
          {/* Medal Case Tier Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg shrink-0">
                  <span className="text-3xl">🎖️</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold">{getTierName(maxTier)}</h2>
                  <p className="text-xs text-[#A5B4FC] mt-0.5">
                    {activeUnlockedCount === activeTotalCount && activeTotalCount > 0
                      ? `Tier ${maxTier} Completed! Tier ${maxTier + 1} Unlocked!`
                      : `Unlocked ${activeUnlockedCount} of ${activeTotalCount} medals in Tier ${maxTier}`}
                  </p>
                  <p className="text-xs font-bold text-amber-400 mt-1">
                    🏆 Total Medals Earned: {totalUnlockedCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 rounded-full"
                style={{ width: `${activeTotalCount ? (activeUnlockedCount / activeTotalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Active Medal Case */}
          <div className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
              Active Medal Case (Tier {maxTier})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTierItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
                    item.unlocked
                      ? "bg-[var(--bg-surface)] border-[#6c63ff]/30 shadow-sm"
                      : "bg-[var(--bg-elevated)] border-[var(--border-default)] opacity-75"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-2xl text-xl shrink-0 ${
                        item.unlocked
                          ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md"
                          : "bg-[var(--border-default)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {item.unlocked ? "🏆" : "🔒"}
                    </div>

                    <div>
                      <h3 className={`font-extrabold text-sm ${item.unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)] leading-snug mt-0.5">{item.description}</p>
                      {item.unlocked && item.unlockedAt && (
                        <span className="text-[10px] font-bold text-emerald-500 block mt-1">
                          Unlocked {formatDate(item.unlockedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-extrabold block ${
                        item.unlocked ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--border-default)] text-[var(--text-secondary)]"
                      }`}
                    >
                      +{item.xpReward || 50} XP
                    </span>
                    {!item.unlocked && <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mt-1 block">Locked</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Completed Medal Cases */}
          {pastTierItems.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[var(--border-default)]">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">
                Completed Medal Cases History
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastTierItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-emerald-500/30 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white text-xl shrink-0 shadow-md">
                        ✓
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{item.title}</h3>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-extrabold">
                            Tier {item.tier || 1}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-snug mt-0.5">{item.description}</p>
                        {item.unlockedAt && (
                          <span className="text-[10px] font-bold text-emerald-500 block mt-1">
                            Unlocked {formatDate(item.unlockedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-extrabold shrink-0">
                      +{item.xpReward || 50} XP
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
