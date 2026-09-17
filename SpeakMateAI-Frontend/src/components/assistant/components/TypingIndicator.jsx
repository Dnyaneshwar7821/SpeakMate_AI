import React from "react";

export function TypingIndicator() {
    return (
        <div
            className="flex items-center gap-1.5 px-1 py-2"
            role="status"
            aria-label="Assistant is typing"
        >
            {[0, 1, 2].map((dot) => (
                <span
                    key={dot}
                    className="h-2 w-2 rounded-full bg-[var(--color-primary, #6C63FF)] animate-bounce"
                    style={{ animationDelay: `${dot * 0.15}s` }}
                />
            ))}
            <span className="sr-only">Assistant is typing</span>
        </div>
    );
}

export default TypingIndicator;
