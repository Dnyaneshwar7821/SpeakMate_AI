import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import StatRow from "./StatRow";
import MiniChart from "./MiniChart";
import DeepLinkChip from "./DeepLinkChip";

const markdownComponents = {
    a: (props) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-primary)] underline underline-offset-2"
        />
    ),
    table: (props) => (
        <div className="my-2 overflow-x-auto rounded-lg border border-[var(--border-default)]">
            <table className="w-full min-w-max border-collapse text-xs" {...props} />
        </div>
    ),
    th: (props) => (
        <th
            className="border-b border-[var(--border-default)] bg-[var(--bg-hover)] px-2.5 py-1.5 text-left font-semibold text-[var(--text-secondary)]"
            {...props}
        />
    ),
    td: (props) => (
        <td
            className="border-b border-[var(--border-default)] px-2.5 py-1.5 text-[var(--text-primary)]"
            {...props}
        />
    ),
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    ul: ({ children }) => <ul className="my-1.5 ml-4 list-disc space-y-0.5">{children}</ul>,
    ol: ({ children }) => <ol className="my-1.5 ml-4 list-decimal space-y-0.5">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    code: ({ inline, children, ...props }) =>
        inline ? (
            <code
                className="rounded bg-[var(--bg-hover)] px-1 py-0.5 font-mono text-[11px] text-[var(--color-primary)]"
                {...props}
            >
                {children}
            </code>
        ) : (
            <pre className="my-2 overflow-x-auto rounded-lg bg-[var(--bg-hover)] p-2 font-mono text-[11px] text-[var(--text-primary)]">
                <code {...props}>{children}</code>
            </pre>
        ),
};

export function MessageBubble({ message, role, onClose }) {
    const isUser = message.sender === "user";

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-[var(--color-primary)] px-3.5 py-2 text-sm text-white shadow-sm">
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                </div>
            </div>
        );
    }

    const { content, stats = [], chart = null, suggestions = [], accessDenied } = message;

    return (
        <div className="flex justify-start">
            <div
                className={`max-w-[92%] rounded-2xl rounded-tl-sm border px-3.5 py-2.5 text-sm shadow-sm ${
                    accessDenied
                        ? "border-amber-500/40 bg-amber-500/10 text-[var(--text-primary)]"
                        : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                }`}
            >
                {content ? (
                    <div className="prose-xs max-w-none break-words text-[var(--text-primary)]">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                ) : null}

                {Array.isArray(stats) && stats.length > 0 ? (
                    <StatRow stats={stats} />
                ) : null}

                {chart ? <MiniChart chart={chart} /> : null}

                {Array.isArray(suggestions) && suggestions.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {suggestions.map((suggestion, index) => (
                            <DeepLinkChip
                                key={`${suggestion.route}-${index}`}
                                suggestion={suggestion}
                                role={role}
                                onClose={onClose}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default MessageBubble;
