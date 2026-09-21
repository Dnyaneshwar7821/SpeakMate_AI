import React from "react";
import { MessageSquare, Sparkles, X, Bot } from "lucide-react";

/**
 * Modern floating AI Assistant launcher button (bottom-right).
 * Features rich gradient styling, breathing glow halo, online status badge,
 * smooth rotate transition between chat/close states, and an animated hover tooltip.
 */
export function AssistantBubble({ isOpen, loading, onClick }) {
    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center group">
            {/* Floating Tooltip Pill (Desktop hover) */}
            {!isOpen && (
                <div className="mr-3 hidden sm:flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 shadow-lg shadow-black/10 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none select-none">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Ask SpeakMate AI</span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                </div>
            )}

            {/* Glowing Ambient Halo */}
            <div
                className={`absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-50 blur-md transition-all duration-500 ${
                    isOpen ? "opacity-30 scale-95" : "group-hover:opacity-80 group-hover:scale-110 animate-pulse"
                }`}
                aria-hidden="true"
            />

            {/* Main Floating Button */}
            <button
                type="button"
                onClick={onClick}
                aria-label={isOpen ? "Close SpeakMate Assistant" : "Open SpeakMate Assistant"}
                className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-[#5243F5] via-[#6C63FF] to-[#8F4FFF] text-white shadow-xl shadow-indigo-500/35 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 cursor-pointer"
            >
                {/* Subtle Glass Inner Shine */}
                <div
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none"
                    aria-hidden="true"
                />

                {/* Loading Circular Spinner Ring */}
                {loading && !isOpen ? (
                    <span
                        className="absolute -inset-1 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"
                        aria-hidden="true"
                    />
                ) : null}

                {/* Online Status Green Indicator Dot */}
                {!isOpen && !loading && (
                    <span
                        className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white dark:bg-slate-900"
                        title="Assistant is Online"
                    >
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    </span>
                )}

                {/* Icon Transition */}
                <div className={`transition-transform duration-300 ${isOpen ? "rotate-90 scale-95" : "rotate-0 scale-100"}`}>
                    {isOpen ? (
                        <X className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
                    ) : (
                        <div className="relative">
                            <Bot className="h-6 w-6 stroke-[2.1]" aria-hidden="true" />
                            <Sparkles className="absolute -top-1.5 -right-1.5 h-3 w-3 text-amber-300 animate-bounce" />
                        </div>
                    )}
                </div>
            </button>
        </div>
    );
}

export default AssistantBubble;
