import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Trash2, Send, Sparkles, X } from "lucide-react";

import { useAssistant } from "../AssistantContext";
import {
    WELCOME_TEXT_BY_ROLE,
    QUICK_SUGGESTIONS_BY_ROLE,
    ROLE_LABEL,
    DEFAULT_ROLE,
} from "../constants";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export function AssistantPanel() {
    const {
        messages,
        loading,
        error,
        role,
        send,
        startNewChat,
        closeWidget,
        clearError,
    } = useAssistant();

    const [draft, setDraft] = useState("");
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const messagesEndRef = useRef(null);

    const welcome = WELCOME_TEXT_BY_ROLE[role] || WELCOME_TEXT_BY_ROLE[DEFAULT_ROLE];
    const suggestions = QUICK_SUGGESTIONS_BY_ROLE[role] || [];
    const roleLabel = ROLE_LABEL[role] || role || "Guest";

    const isEmpty = messages.length === 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        if (!loading && isEmpty) {
            inputRef.current?.focus();
        }
    }, [loading, isEmpty]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed || loading) return;

        setDraft("");
        const ok = await send(trimmed);
        if (!ok) {
            setDraft((prev) => (prev ? prev : trimmed));
        }
        inputRef.current?.focus();
    };

    const handleSuggestion = (text) => {
        if (loading) return;
        send(text);
    };

    return (
        <div className="fixed bottom-24 right-5 z-[9999] flex h-[min(580px,calc(100dvh-8rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--border-default,#e2e8f0)] bg-[var(--bg-base,#ffffff)] shadow-2xl shadow-black/30">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border-default,#e2e8f0)] bg-[var(--bg-surface,#f8fafc)] px-4 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-primary,#6C63FF)] text-white shadow-sm">
                    <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[var(--text-primary,#0f172a)]">
                        SpeakMate Assistant
                    </p>
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-[var(--color-primary,#6C63FF)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary,#6C63FF)]">
                        {roleLabel}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={startNewChat}
                    title="Delete chat"
                    aria-label="Delete chat and start fresh"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-secondary,#64748b)] transition-colors duration-200 hover:bg-red-500/10 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={closeWidget}
                    title="Close"
                    aria-label="Close SpeakMate Assistant"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-secondary,#64748b)] transition-colors duration-200 hover:bg-[var(--bg-hover,#f1f5f9)] hover:text-[var(--text-primary,#0f172a)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#6C63FF)] cursor-pointer"
                >
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            {/* Error Banner */}
            {error ? (
                <div className="flex items-start gap-2 border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="flex-1 leading-snug">{error}</span>
                    <button
                        type="button"
                        onClick={clearError}
                        aria-label="Dismiss error"
                        className="text-red-600/70 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 cursor-pointer"
                    >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>
            ) : null}

            {/* Messages Scroll Area */}
            <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto p-4 text-xs leading-relaxed"
            >
                {isEmpty ? (
                    <div className="flex flex-col gap-3">
                        <MessageBubble
                            message={{
                                id: "welcome",
                                sender: "assistant",
                                content: welcome,
                            }}
                            role={role}
                            onClose={closeWidget}
                        />

                        {suggestions.length > 0 ? (
                            <div className="pt-2">
                                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted,#94a3b8)]">
                                    Suggested questions
                                </p>
                                <div className="flex flex-col gap-1.5">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => handleSuggestion(suggestion)}
                                            disabled={loading}
                                            className="rounded-xl border border-[var(--border-default,#e2e8f0)] bg-[var(--bg-surface,#f8fafc)] px-3 py-2 text-left text-xs text-[var(--text-secondary,#475569)] transition-colors duration-200 hover:border-[var(--color-primary,#6C63FF)] hover:bg-[var(--bg-hover,#f1f5f9)] hover:text-[var(--text-primary,#0f172a)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#6C63FF)] disabled:opacity-50 cursor-pointer"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                role={role}
                                onClose={closeWidget}
                            />
                        ))}
                        {loading ? <TypingIndicator /> : null}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t border-[var(--border-default,#e2e8f0)] bg-[var(--bg-surface,#f8fafc)] p-3"
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={loading ? "Waiting for assistant..." : "Ask SpeakMate Assistant..."}
                    disabled={loading}
                    className="min-w-0 flex-1 rounded-xl border border-[var(--border-default,#e2e8f0)] bg-[var(--bg-base,#ffffff)] px-3.5 py-2 text-xs text-[var(--text-primary,#0f172a)] placeholder-[var(--text-muted,#94a3b8)] transition-colors duration-200 focus:border-[var(--color-primary,#6C63FF)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#6C63FF)] disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={loading || !draft.trim()}
                    aria-label="Send message"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-primary,#6C63FF)] text-white transition-opacity duration-200 hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary,#6C63FF)] disabled:opacity-40 cursor-pointer"
                >
                    <Send className="h-4 w-4" aria-hidden="true" />
                </button>
            </form>
        </div>
    );
}

export default AssistantPanel;
