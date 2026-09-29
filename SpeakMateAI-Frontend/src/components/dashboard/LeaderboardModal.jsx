import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { progressService } from "../../services/appServices";

export function LeaderboardModal({ isOpen, onClose, currentUser }) {
  const { user: authUser } = useAuth();
  const effectiveUser = currentUser || authUser;
  const { isDark } = useTheme();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    progressService
      .leaderboard(10)
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setLeaderboard(data);
          } else {
            // Default friendly self representation if no other users
            setLeaderboard([
              {
                rank: 1,
                userId: effectiveUser?.id || 1,
                name: effectiveUser?.firstName || effectiveUser?.name || "You",
                avatar: effectiveUser?.avatar || "🎓",
                xp: effectiveUser?.xp || 0,
                streak: effectiveUser?.streak || 0,
                rankTier: effectiveUser?.rank || "Bronze III",
                isCurrentUser: true,
              },
            ]);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Failed to fetch leaderboard:", err);
          setError("Unable to load leaderboard. Showing local standing.");
          setLeaderboard([
            {
              rank: 1,
              userId: effectiveUser?.id || 1,
              name: effectiveUser?.firstName || effectiveUser?.name || "You",
              avatar: effectiveUser?.avatar || "🎓",
              xp: effectiveUser?.xp || 0,
              streak: effectiveUser?.streak || 0,
              rankTier: effectiveUser?.rank || "Bronze III",
              isCurrentUser: true,
            },
          ]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, effectiveUser]);

  if (!isOpen) return null;

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/30">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-400 text-slate-900 font-black text-sm flex items-center justify-center shadow-md">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md">
          🥉
        </span>
      );
    }
    return (
      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
        isDark ? "bg-slate-800 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"
      }`}>
        #{rank}
      </span>
    );
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
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b shrink-0 flex items-center justify-between ${
          isDark
            ? "border-slate-800 bg-gradient-to-r from-amber-500/10 via-transparent to-indigo-500/10"
            : "border-slate-100 bg-gradient-to-r from-amber-50/80 via-white to-indigo-50/80"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-500 flex items-center justify-center text-2xl shadow-md shadow-amber-500/30">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">Global Leaderboard</h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Top 10
                </span>
              </div>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Top English learners ranked by XP and streak
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Leaderboard Modal"
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#6C63FF] border-t-transparent" />
              <p className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Loading top learners...
              </p>
            </div>
          ) : error ? (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs text-amber-500 font-bold">
              {error}
            </div>
          ) : null}

          {!loading && leaderboard.map((item) => {
            const isUser = item.isCurrentUser || item.userId === effectiveUser?.id;
            const rank = item.rank || 1;

            return (
              <div
                key={item.userId || rank}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isUser
                    ? isDark
                      ? "bg-indigo-950/40 border-[#6C63FF] ring-2 ring-[#6C63FF]/30 shadow-lg shadow-indigo-950/50"
                      : "bg-indigo-50/80 border-[#6C63FF] ring-2 ring-[#6C63FF]/20 shadow-md shadow-indigo-100"
                    : isDark
                    ? "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                    : "bg-white border-slate-200/90 hover:border-slate-300 shadow-sm"
                }`}
              >
                {/* Left: Rank & User Info */}
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(rank)}

                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C63FF] to-[#8B5CF6] text-white flex items-center justify-center text-sm font-black shadow-sm shrink-0">
                    {item.avatar && (item.avatar.length <= 4 || item.avatar.startsWith("data:") || item.avatar.startsWith("http")) ? (
                      item.avatar.startsWith("http") || item.avatar.startsWith("data:") ? (
                        <img src={item.avatar} alt={item.name} className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <span>{item.avatar}</span>
                      )
                    ) : (
                      <span>{(item.name || "U").charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className={`text-xs sm:text-sm font-black truncate ${isUser ? "text-[#6C63FF]" : ""}`}>
                        {item.name || "Anonymous Learner"}
                      </h4>
                      {isUser && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#6C63FF] text-white">
                          You
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] font-semibold truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {item.rankTier || "Bronze Speaker"} • {item.streak || 0}d streak 🔥
                    </p>
                  </div>
                </div>

                {/* Right: XP Score */}
                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-black text-amber-500">
                    {item.xp || 0} XP
                  </span>
                  <p className={`text-[10px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    ⭐ Score
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`py-3 px-4 border-t text-center text-[10px] sm:text-[11px] font-semibold shrink-0 ${
          isDark ? "border-slate-800 text-slate-400 bg-slate-900/90" : "border-slate-100 text-slate-500 bg-slate-50"
        }`}>
          💡 Complete speaking sessions and daily lessons to climb the ranks!
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
}

export default LeaderboardModal;
