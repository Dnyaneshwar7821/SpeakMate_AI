import React, { useState } from "react";
import { createPortal } from "react-dom";
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
  const currentXp = stats.xp || 0;

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

  const getTierMeta = (days) => {
    if (days <= 3) {
      return {
        name: "Bronze Tier",
        icon: "🔥",
        pillClass: isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-amber-100 text-amber-700 border-amber-200",
        iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-orange-500/20",
        xpBonus: "+50 XP",
      };
    }
    if (days <= 7) {
      return {
        name: "Silver Tier",
        icon: "⚡",
        pillClass: isDark ? "bg-purple-500/15 text-purple-400 border-purple-500/30" : "bg-purple-100 text-purple-700 border-purple-200",
        iconBg: "bg-gradient-to-tr from-purple-500 to-indigo-600 shadow-purple-500/20",
        xpBonus: "+100 XP",
      };
    }
    if (days <= 14) {
      return {
        name: "Gold Tier",
        icon: "🌟",
        pillClass: isDark ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" : "bg-yellow-100 text-yellow-800 border-yellow-200",
        iconBg: "bg-gradient-to-tr from-yellow-400 to-amber-500 shadow-yellow-500/20",
        xpBonus: "+200 XP",
      };
    }
    return {
      name: "Diamond Tier",
      icon: "💎",
      pillClass: isDark ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" : "bg-cyan-100 text-cyan-800 border-cyan-200",
      iconBg: "bg-gradient-to-tr from-cyan-400 to-blue-600 shadow-cyan-500/20",
      xpBonus: "+350 XP",
    };
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto animate-in zoom-in-95 duration-200 ${
          isDark
            ? "bg-[#0F172A] border-slate-700/80 text-white shadow-purple-950/40"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
        }`}
      >
        {/* ── 1. FIXED HEADER (Always visible at top, never scrolls away!) ── */}
        <div className={`p-4 sm:p-5 border-b shrink-0 flex items-center justify-between ${
          isDark
            ? "border-slate-800 bg-gradient-to-r from-orange-500/10 via-transparent to-purple-500/5"
            : "border-slate-100 bg-gradient-to-r from-orange-50/80 via-white to-purple-50/50"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-2xl shadow-md shadow-orange-500/30">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">{streak}-Day Streak Active</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-500 border border-orange-500/30">
                  Live
                </span>
              </div>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Best Record: <strong className="text-amber-500">{stats.longestStreak || streak} Days Continuous</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Streak Modal"
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            ✕
          </button>
        </div>

        {/* ── 2. SCROLLABLE CONTENT BODY (min-h-0 enables proper scrolling without pushing header offscreen!) ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-5 custom-scrollbar">

          {/* Activity Rhythm (7-Day Flame Grid) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span>📅</span> Weekly Habit Rhythm
              </span>
              <span className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {weeklyData.filter((d) => d.status === "completed").length}/7 Days Done
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {weeklyData.map((item, idx) => {
                const isCompleted = item.status === "completed";
                const isFrozen = item.status === "frozen";
                const isToday = item.isToday;

                return (
                  <div
                    key={idx}
                    className={`py-2 px-1 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                      isToday
                        ? "border-[#6C63FF] bg-[#6C63FF]/10 ring-2 ring-[#6C63FF]/30 shadow-sm"
                        : isDark
                        ? "bg-slate-800/30 border-slate-700/50"
                        : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <span className={`text-[10px] font-extrabold uppercase ${isToday ? "text-[#6C63FF]" : isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {item.day}
                    </span>

                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                      isCompleted
                        ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-500/30"
                        : isFrozen
                        ? "bg-gradient-to-tr from-cyan-400 to-blue-500 text-white shadow-cyan-500/30"
                        : isDark
                        ? "bg-slate-800 text-slate-600 border border-slate-700"
                        : "bg-slate-200/80 text-slate-400"
                    }`}>
                      {isCompleted ? "🔥" : isFrozen ? "❄️" : "·"}
                    </div>

                    <span className={`text-[9px] font-bold ${isCompleted ? "text-emerald-500" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {item.studyMinutes > 0 ? `${item.studyMinutes}m` : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Broken Streak Grace Alert */}
          {canRepair && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️</span> Streak Recovery Available
                </span>
                <span className="text-[10px] font-black text-amber-500 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  Restores {stats.brokenStreakSnapshot.streak} Days
                </span>
              </div>
              <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                Don't lose your progress! Repair your streak to keep your habit ladder active.
              </p>
              <button
                onClick={handleRepairStreak}
                disabled={currentXp < 150}
                className={`w-full py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  currentXp >= 150
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:brightness-110 cursor-pointer"
                    : "bg-slate-700/20 text-slate-400 cursor-not-allowed border border-slate-700/30"
                }`}
              >
                <span>🔥 Restore Streak (150 XP)</span>
                <span className="text-[10px] opacity-75">• Balance: {currentXp} XP</span>
              </button>
            </div>
          )}

          {/* Streak Freeze Shield Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark
              ? "bg-gradient-to-br from-cyan-950/30 via-slate-900/60 to-indigo-950/20 border-cyan-500/30"
              : "bg-gradient-to-br from-cyan-50/70 via-white to-sky-50/70 border-cyan-200"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-lg text-white shadow-sm shadow-cyan-500/30">
                  🛡️
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black flex items-center gap-1">
                    Streak Freeze Shield
                  </h3>
                  <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Protects your streak if you miss 1 day
                  </p>
                </div>
              </div>

              <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 bg-cyan-500/15 px-2.5 py-1 rounded-full border border-cyan-500/25">
                ❄️ {streakFreezes} Active
              </span>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={handleBuyFreeze}
                disabled={currentXp < 100}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm ${
                  currentXp >= 100
                    ? "bg-gradient-to-r from-cyan-500 to-[#6C63FF] text-white hover:opacity-95 active:scale-[0.99] cursor-pointer"
                    : isDark
                    ? "bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed"
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                }`}
              >
                <span>❄️ Buy 1 Shield (100 XP)</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  currentXp >= 100 ? "bg-white/20 text-white" : isDark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                }`}>
                  Balance: {currentXp} XP
                </span>
              </button>

              {currentXp < 100 && (
                <div className="flex items-center justify-between text-[10px] font-bold px-1 text-slate-400">
                  <span>Progress to next freeze:</span>
                  <span className="text-cyan-500">{currentXp}/100 XP</span>
                </div>
              )}
            </div>
          </div>

          {/* Streak Milestone Rewards Ladder */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <span>🏆</span> Milestone Rewards Ladder
              </span>
              <span className="text-[10px] font-black text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-0.5 rounded-full border border-[#6C63FF]/20">
                {claimedMilestones.length}/{milestones.length} Unlocked
              </span>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m) => {
                const isClaimed = claimedMilestones.includes(m.days);
                const isEligible = (stats.streak >= m.days || (stats.longestStreak || 0) >= m.days) && !isClaimed;
                const isReached = stats.streak >= m.days;
                const meta = getTierMeta(m.days);

                return (
                  <div
                    key={m.days}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isClaimed
                        ? isDark
                          ? "bg-slate-800/20 border-slate-700/40 opacity-65"
                          : "bg-slate-50/60 border-slate-200 opacity-65"
                        : isEligible
                        ? "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30"
                        : isDark
                        ? "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                        : "bg-white border-slate-200/90 hover:border-slate-300 shadow-sm"
                    }`}
                  >
                    {/* Left: Tier Icon & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm ${meta.iconBg} text-white`}>
                        {meta.icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className={`text-xs sm:text-sm font-black truncate ${isEligible ? "text-amber-500" : ""}`}>
                            {m.title}
                          </h4>
                          <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${meta.pillClass}`}>
                            {meta.name}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {m.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Claim Button or Status */}
                    <div className="shrink-0">
                      {isClaimed ? (
                        <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 inline-flex items-center gap-1">
                          ✓ Claimed
                        </span>
                      ) : isEligible ? (
                        <button
                          onClick={() => handleClaimMilestone(m.days)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 text-xs font-black shadow-md shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                        >
                          Claim +{m.xp} XP
                        </button>
                      ) : (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600"
                          }`}>
                            {m.days} Days
                          </span>
                          {!isReached && (
                            <span className="text-[9px] font-semibold text-slate-400">
                              {Math.max(0, m.days - streak)}d left
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── 3. FIXED FOOTER (Always visible, compact) ── */}
        <div className={`py-2.5 px-4 border-t text-center text-[10px] sm:text-[11px] font-semibold shrink-0 ${
          isDark ? "border-slate-800 text-slate-400 bg-slate-900/90" : "border-slate-100 text-slate-500 bg-slate-50"
        }`}>
          💡 Practice 5 minutes every day to maintain your streak flame!
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}

export default StreakModal;
