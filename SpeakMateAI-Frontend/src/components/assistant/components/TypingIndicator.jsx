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
                className="max-w-[94%] rounded-2xl rounded-tl-xs border p-3.5 text-xs shadow-xs border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 transition-all duration-300"
                role="status"
                aria-label="Assistant is generating response"
            >
                {/* Assistant Header */}
                <div className="mb-2.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                    <div className="flex items-center gap-1.5">
                        <span className="grid h-4.5 w-4.5 place-items-center rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                        </span>
                        <span className="text-[11px] font-bold tracking-tight text-slate-700 dark:text-slate-200">
                            SpeakMate AI
                        </span>
                    </div>
                    {seconds >= 3 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                            {seconds}s
                        </span>
                    ) : null}
                </div>

                {/* Round Circular Loader and Status */}
                <div className="flex items-center gap-3 py-1">
                    {/* Round Circular Loader Spinner */}
                    <div className="relative flex h-7 w-7 shrink-0 items-center justify-center">
                        <div className="absolute h-7 w-7 rounded-full border-2 border-indigo-500/20" />
                        <div className="absolute h-7 w-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                        <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                    </div>

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {getStatusText()}
                            </span>
                            {/* Animated dots */}
                            <div className="flex items-center gap-1 ml-0.5">
                                {[0, 1, 2].map((dot) => (
                                    <span
                                        key={dot}
                                        className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce"
                                        style={{ animationDelay: `${dot * 0.16}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                        {seconds >= 4 ? (
                            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                                Grounding response with school records...
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TypingIndicator;
