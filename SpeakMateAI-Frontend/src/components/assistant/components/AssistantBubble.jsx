import React from "react";
import { MessagesSquare, Sparkles, X } from "lucide-react";
import { useAssistantTheme } from "../useAssistantTheme";

/**
 * Modern floating AI Assistant launcher button (bottom-right).
 * Features dynamic accent styling (matching settings swatches), live AI chatbot bubble icon,
 * smooth rotate transition, contained subtle ambient glow, and hover tooltip.
 */
export const AssistantBubble = React.forwardRef(function AssistantBubble(
    { isOpen, loading, onClick },
    ref
) {
    const theme = useAssistantTheme();

    return (
        <div ref={ref} className="fixed bottom-5 right-5 z-[9999] flex items-center justify-end select-none">
            {/* Launcher Container */}
            <div className="relative group flex items-center justify-center">
                {/* Floating Tooltip Pill (Appears to the left on desktop hover) */}
                {!isOpen && (
                    <div className="pointer-events-none absolute right-full mr-3 hidden sm:flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200/90 dark:border-slate-700/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 shadow-lg shadow-black/10 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all duration-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                        <Sparkles className={`h-3.5 w-3.5 ${theme.sparkleColor}`} />
                        <span>Ask SpeakMate AI</span>
                    </div>
                )}

                {/* Contained Ambient Glow Halo (Strictly 56x56 circle behind button) */}
                <div
                    className={`absolute inset-0 rounded-full blur-md pointer-events-none transition-all duration-300 ${
                        isOpen
                            ? "scale-90 opacity-20"
                            : "scale-105 opacity-40 group-hover:opacity-75 group-hover:scale-110"
                    }`}
                    style={{
                        background: `radial-gradient(circle, ${theme.primary} 0%, ${theme.primaryHover} 70%, transparent 100%)`,
                    }}
                    aria-hidden="true"
                />

                {/* Main Floating Button */}
                <button
                    type="button"
                    onClick={onClick}
                    aria-label={isOpen ? "Close SpeakMate Assistant" : "Open SpeakMate Assistant"}
                    style={{
                        boxShadow: `0 10px 25px -3px ${theme.glow}, 0 4px 6px -4px ${theme.glow}`,
                    }}
                    className={`relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr ${theme.gradient} text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 ${theme.ring} focus-visible:ring-offset-2 cursor-pointer`}
                >
                    {/* Subtle Inner Glass Top Highlight */}
                    <div
                        className="absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent pointer-events-none"
                        aria-hidden="true"
                    />

                    {/* Circular Loading Spinner Ring */}
                    {loading && !isOpen ? (
                        <span
                            className="absolute -inset-1 rounded-full border-2 border-white/60 border-t-transparent animate-spin"
                            aria-hidden="true"
                        />
                    ) : null}

                    {/* Icon Transition */}
                    <div className={`transition-transform duration-300 ${isOpen ? "rotate-90 scale-95" : "rotate-0 scale-100"}`}>
                        {isOpen ? (
                            <X className="h-6 w-6 stroke-[2.2]" aria-hidden="true" />
                        ) : (
                            <div className="relative grid place-items-center">
                                <MessagesSquare className="h-6 w-6 stroke-[2.2] fill-white/10" aria-hidden="true" />
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
});

export default AssistantBubble;

