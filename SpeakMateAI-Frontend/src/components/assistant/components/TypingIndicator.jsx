import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

/**
 * Enhanced Assistant Typing & Loading Indicator with a round/circular loader.
 * Displays dynamic progressive feedback when queries take time to resolve.
 */
export function TypingIndicator() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const getStatusText = () => {
        if (seconds < 3) {
            return "Thinking...";
        } else if (seconds < 6) {
            return "Searching platform data...";
        } else if (seconds < 10) {
            return "Formulating detailed answer...";
        } else {
            return "Cross-referencing records, almost ready...";
        }
    };

    return (
        <div className="flex justify-start">
            <div
                className="max-w-[92%] rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-sm shadow-sm border-[var(--border-default,#e2e8f0)] bg-[var(--bg-surface,#f8fafc)] text-[var(--text-primary,#0f172a)] transition-all duration-300"
                role="status"
                aria-label="Assistant is generating response"
            >
                {/* Assistant Header */}
                <div className="mb-2 flex items-center justify-between border-b border-[var(--border-default,#e2e8f0)]/40 pb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)]">
                        Assistant
                    </span>
                    {seconds >= 3 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-primary,#6C63FF)] animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary,#6C63FF)]" />
                            {seconds}s
                        </span>
                    ) : null}
                </div>

                {/* Round Circular Loader and Status */}
                <div className="flex items-center gap-3 py-1">
                    {/* Round Circular Loader Spinner */}
                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                        {/* Static track circle */}
                        <div className="absolute h-7 w-7 rounded-full border-2 border-[var(--color-primary,#6C63FF)]/20" />
                        {/* Spinning round circle */}
                        <div className="absolute h-7 w-7 rounded-full border-2 border-[var(--color-primary,#6C63FF)] border-t-transparent animate-spin" />
                        {/* Center glowing spark */}
                        <Sparkles className="h-3 w-3 text-[var(--color-primary,#6C63FF)] animate-pulse" />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-[var(--text-secondary,#475569)]">
                                {getStatusText()}
                            </span>
                            {/* Animated dots */}
                            <div className="flex items-center gap-1 ml-0.5">
                                {[0, 1, 2].map((dot) => (
                                    <span
                                        key={dot}
                                        className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary,#6C63FF)] animate-bounce"
                                        style={{ animationDelay: `${dot * 0.16}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                        {seconds >= 4 ? (
                            <p className="mt-0.5 text-[11px] text-[var(--text-muted,#94a3b8)]">
                                Analyzing platform records and synthesizing answer...
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TypingIndicator;
