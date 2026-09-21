import React from "react";
import { MessageCircleMore, Sparkles, X } from "lucide-react";

/**
 * Modern floating AI Assistant launcher button (bottom-right).
 * Features an authentic live AI chatbot bubble icon, smooth rotate transition,
 * contained subtle ambient glow (no horizontal blur smudge), and hover tooltip.
 */
export function AssistantBubble({ isOpen, loading, onClick }) {
    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex items-center justify-end select-none">
            {/* Launcher Container */}
            <div className="relative group flex items-center justify-center">
                {/* Floating Tooltip Pill (Appears to the left on desktop hover) */}
                {!isOpen && (
                    <div className="pointer-events-none absolute right-full mr-3 hidden sm:flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 shadow-lg shadow-black/10 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all duration-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Ask SpeakMate AI</span>
                        <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                )}

                {/* Contained Ambient Glow Halo (Strictly 56x56 circle behind button) */}
                <div
                    className={`absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 blur-md pointer-events-none transition-all duration-300 ${
                        isOpen
                            ? "scale-90 opacity-20"
                            : "scale-105 opacity-40 group-hover:opacity-75 group-hover:scale-110"
                    }`}
                    aria-hidden="true"
                />

                {/* Main Floating Button */}
                <button
                    type="button"
                    onClick={onClick}
                    aria-label={isOpen ? "Close SpeakMate Assistant" : "Open SpeakMate Assistant"}
                    className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-[#4F46E5] via-[#6366F1] to-[#7C3AED] text-white shadow-xl shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 cursor-pointer"
                >
                    {/* Subtle Inner Glass Top Highlight */}
                    <div
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none"
                        aria-hidden="true"
                    />

                    {/* Circular Loading Spinner Ring */}
                    {loading && !isOpen ? (
                        <span
                            className="absolute -inset-1 rounded-full border-2 border-indigo-300 border-t-transparent animate-spin"
                            aria-hidden="true"
                        />
                    ) : null}

                    {/* Online Status Green Indicator Dot */}
                    {!isOpen && !loading && (
                        <span
                            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm"
                            title="Assistant is Online"
                        >
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                    )}

                    {/* Icon Transition */}
                    <div className={`transition-transform duration-300 ${isOpen ? "rotate-90 scale-95" : "rotate-0 scale-100"}`}>
                        {isOpen ? (
                            <X className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
                        ) : (
                            <div className="relative grid place-items-center">
                                <MessageCircleMore className="h-6 w-6 stroke-[2.2] fill-white/10" aria-hidden="true" />
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}

export default AssistantBubble;
