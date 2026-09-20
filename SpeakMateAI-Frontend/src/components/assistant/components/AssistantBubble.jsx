import React from "react";
import { MessageCircle, X } from "lucide-react";

/**
 * Floating launcher button (bottom-right). Toggles between a MessageCircle
 * icon (closed) and an X icon (open).
 * Displays a spinning outer ring loader when the assistant is generating an answer.
 */
export function AssistantBubble({ isOpen, loading, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={isOpen ? "Close SpeakMate Assistant" : "Open SpeakMate Assistant"}
            className="fixed bottom-5 right-5 z-[9999] grid h-14 w-14 place-items-center rounded-full bg-[var(--color-primary,#6C63FF)] text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#6C63FF)] focus-visible:ring-offset-2 cursor-pointer"
        >
            {loading && !isOpen ? (
                <span
                    className="absolute -inset-1 rounded-full border-2 border-[var(--color-primary,#6C63FF)] border-t-transparent animate-spin"
                    aria-hidden="true"
                />
            ) : null}
            {isOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
            ) : (
                <MessageCircle className="h-6 w-6" aria-hidden="true" />
            )}
        </button>
    );
}

export default AssistantBubble;
