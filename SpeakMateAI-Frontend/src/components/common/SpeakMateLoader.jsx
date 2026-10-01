import React from "react";
import { Sparkles } from "lucide-react";

/**
 * SpeakMateLoader
 * Premium dual-spinning ring loader matching the Admin Dashboard design token.
 * Features outer primary ring, inner counter-spinning accent ring, center glowing gradient emblem,
 * and animated typing/pulsing dots.
 */
export function SpeakMateLoader({
  message = "Loading...",
  subMessage = "Synchronizing your learning workspace",
  fullScreen = false,
  size = "md", // "sm", "md", "lg"
  className = "",
}) {
  const sizeMap = {
    sm: {
      ring: "h-14 w-14",
      innerRing: "inset-1.5",
      badge: "h-7 w-7",
      icon: "h-3.5 w-3.5",
      title: "text-sm",
      sub: "text-[11px]",
    },
    md: {
      ring: "h-20 w-20",
      innerRing: "inset-2",
      badge: "h-10 w-10",
      icon: "h-5 w-5",
      title: "text-lg",
      sub: "text-xs",
    },
    lg: {
      ring: "h-24 w-24",
      innerRing: "inset-2",
      badge: "h-12 w-12",
      icon: "h-6 w-6",
      title: "text-xl",
      sub: "text-sm",
    },
  };

  const s = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 ${className}`}>
      {/* Animated Dual-Ring Emblem */}
      <div className={`relative flex ${s.ring} items-center justify-center`}>
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[#6C63FF]/20 border-t-[#6C63FF] animate-spin" />
        {/* Inner counter-spinning ring */}
        <div className={`absolute ${s.innerRing} rounded-full border-[3px] border-purple-500/20 border-b-purple-500 animate-[spin_1.5s_linear_infinite_reverse]`} />
        {/* Center glowing badge */}
        <div className={`flex ${s.badge} items-center justify-center rounded-full bg-gradient-to-br from-[#6C63FF] to-purple-600 text-white shadow-lg shadow-[#6C63FF]/30`}>
          <Sparkles className={`${s.icon} animate-pulse`} />
        </div>
      </div>

      {/* Brand title */}
      <h3 className={`mt-4 font-black tracking-tight text-[#6C63FF] ${s.title}`}>
        SpeakMate AI
      </h3>

      {/* Message with animated pulsing dots */}
      <div className="mt-1 flex items-center justify-center gap-1 font-semibold text-[var(--text-secondary)] text-sm">
        <span>{message}</span>
        <span className="flex w-4 justify-start">
          <span className="animate-[ping_1.4s_infinite] text-lg leading-none">.</span>
          <span className="animate-[ping_1.4s_0.2s_infinite] text-lg leading-none">.</span>
          <span className="animate-[ping_1.4s_0.4s_infinite] text-lg leading-none">.</span>
        </span>
      </div>

      {subMessage && (
        <p className={`mt-1 font-medium text-[var(--text-muted)] ${s.sub}`}>
          {subMessage}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)]/80 backdrop-blur-md transition-all duration-300">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-[40vh] w-full flex items-center justify-center py-12">
      {content}
    </div>
  );
}

/**
 * Shimmer card skeleton for cards, statistics, and list placeholders.
 */
export function SpeakMateCardSkeleton({ className = "h-32" }) {
  return (
    <div className={`rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-sm animate-pulse flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded-lg bg-slate-200 dark:bg-slate-700/60" />
        <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-700/60" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-7 w-20 rounded-lg bg-slate-200 dark:bg-slate-700/80" />
        <div className="h-3 w-36 rounded-md bg-slate-100 dark:bg-slate-800/80" />
      </div>
    </div>
  );
}

export default SpeakMateLoader;
