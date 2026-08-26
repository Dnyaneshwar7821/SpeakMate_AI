import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import {
  getLiveProgressStats,
  buyStreakFreeze,
  repairBrokenStreak,
  claimStreakMilestoneReward,
} from "../../utils/progressTracker";

export function StreakModal({ isOpen, onClose, userContext }) {
  const { isDark } = useTheme();
  const toast = useToast();
  const stats = getLiveProgressStats(userContext);

  if (!isOpen) return null;

  const weeklyData = stats.weeklyData || [];
  const milestones = stats.milestones || [];
  const claimedMilestones = stats.claimedMilestones || [];
  const streak = stats.streak || 0;
  const streakFreezes = stats.streakFreezes || 0;
  const canRepair = Boolean(stats.brokenStreakSnapshot?.streak);

  const handleBuyFreeze = () => {
    const res = buyStreakFreeze(100, userContext);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleRepairStreak = () => {
    const res = repairBrokenStreak(150, userContext);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleClaimMilestone = (days) => {
    const res = claimStreakMilestoneReward(days, userContext);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden space-y-6 p-6 sm:p-8 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto ${
          isDark ? "bg-[#131B2B] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white text-2xl shadow-lg shadow-orange-500/30">
              🔥
            </div>
            <div>
              <h2 className="text-xl font-black">{streak}-Day Streak Active</h2>
              <p className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Best record: <strong className="text-amber-500">{stats.longestStreak || streak} Days</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all ${
              isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            ✕
          </button>
        </div>

        {/* 7-Day Flame Calendar */}
        <div className="space-y-2">
          <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            This Week's Activity Rhythm:
          </span>

          <div className="grid grid-cols-7 gap-2 text-center pt-1">
            {weeklyData.map((item, idx) => {
              const isCompleted = item.status === "completed";
              const isFrozen = item.status === "frozen";
              const isToday = item.isToday;

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                    isToday
                      ? "border-[#6C63FF] bg-[#6C63FF]/10 shadow-sm"
                      : isDark
                      ? "bg-slate-800/40 border-white/5"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase ${isToday ? "text-[#6C63FF]" : isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {item.day}
                  </span>

                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                    isCompleted
                      ? "bg-amber-500 text-white shadow-md shadow-orange-500/30"
                      : isFrozen
                      ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30"
                      : isDark
                      ? "bg-slate-800 text-slate-600 border border-white/10"
                      : "bg-slate-200 text-slate-400"
                  }`}>
                    {isCompleted ? "🔥" : isFrozen ? "❄️" : "⭕"}
                  </div>

                  <span className={`text-[9px] font-black ${isCompleted ? "text-emerald-500" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {item.studyMinutes}m
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Broken Streak Recovery Alert */}
        {canRepair && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚠️</span> Broken Streak Recovery Available
              </span>
              <span className="text-[10px] font-black text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-full">
                48h Grace Period
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
              You missed a day, but you can restore your <strong>{stats.brokenStreakSnapshot.streak}-day streak</strong> for 150 XP!
            </p>
            <button
              onClick={handleRepairStreak}
              disabled={stats.xp < 150}
              className={`w-full py-2.5 rounded-xl font-black text-xs transition-all shadow-md ${
                stats.xp >= 150
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer"
                  : "bg-gray-400/20 text-gray-400 cursor-not-allowed"
              }`}
            >
              🔥 Restore Streak (150 XP)
            </button>
          </div>
        )}

        {/* Streak Freeze Shield Section */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isDark ? "bg-slate-900/60 border-white/10" : "bg-cyan-50/60 border-cyan-100"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🛡️</span>
              <div>
                <h3 className="text-sm font-black">Streak Freeze Shield</h3>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Auto-protects your streak if you miss a day
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-cyan-500 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/20">
              ❄️ {streakFreezes} Active
            </span>
          </div>

          <button
            onClick={handleBuyFreeze}
            disabled={stats.xp < 100}
            className={`w-full py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md ${
              stats.xp >= 100
                ? "bg-gradient-to-r from-cyan-500 to-[#6C63FF] text-white hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                : "bg-gray-400/20 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>❄️ Buy 1 Streak Freeze (100 XP)</span>
            <span className="opacity-80">• You have {stats.xp} XP</span>
          </button>
        </div>

        {/* Streak Milestones Ladder */}
        <div className="space-y-3">
          <span className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Streak Milestone Rewards:
          </span>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {milestones.map((m) => {
              const isClaimed = claimedMilestones.includes(m.days);
              const isEligible = (stats.streak >= m.days || (stats.longestStreak || 0) >= m.days) && !isClaimed;

              return (
                <div
                  key={m.days}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    isClaimed
                      ? isDark
                        ? "bg-slate-800/20 border-white/5 opacity-60"
                        : "bg-slate-100/60 border-slate-200 opacity-60"
                      : isEligible
                      ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                      : isDark
                      ? "bg-slate-800/40 border-white/10"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h4 className="text-xs font-black">{m.title}</h4>
                      <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{m.desc}</p>
                    </div>
                  </div>

                  {isClaimed ? (
                    <span className="text-[11px] font-black text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      ✓ Claimed
                    </span>
                  ) : isEligible ? (
                    <button
                      onClick={() => handleClaimMilestone(m.days)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      Claim +{m.xp} XP
                    </button>
                  ) : (
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      isDark ? "bg-slate-800 text-slate-500" : "bg-slate-200 text-slate-500"
                    }`}>
                      {m.days} Days
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StreakModal;
