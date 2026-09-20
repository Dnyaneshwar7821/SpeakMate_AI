import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Volume2, VolumeX } from "lucide-react";

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

const DIGIT_WORDS = {
    "0": "zero",
    "1": "one",
    "2": "two",
    "3": "three",
    "4": "four",
    "5": "five",
    "6": "six",
    "7": "seven",
    "8": "eight",
    "9": "nine",
};

/**
 * Formats phone numbers and long digit sequences so TTS speaks them digit-by-digit
 * (e.g. "9823456789" -> "nine, eight, two, three, four, five, six, seven, eight, nine")
 * instead of treating them as huge integers ("9 billion 23 million").
 */
function formatPhoneNumbersForSpeech(text) {
    if (!text) return "";

    const phonePattern = /(?:\+91[\s\-]?)?(?:\b0)?[6-9]\d{4}[\s\-]?\d{5}\b|(?:\+91[\s\-]?)?(?:\b0)?[6-9]\d{9}\b|\b\d{7,15}\b/g;

    return text.replace(phonePattern, (match) => {
        const hasPlus91 = match.startsWith("+91");
        let digits = match.replace(/\D/g, "");
        if (hasPlus91 && digits.startsWith("91")) {
            digits = digits.slice(2);
        }

        const spokenDigits = digits
            .split("")
            .map((d) => DIGIT_WORDS[d] || d)
            .join(", ");

        return hasPlus91 ? `plus nine one, ${spokenDigits}` : spokenDigits;
    });
}

/**
 * Selects the best Indian English Female voice available in the user's browser,
 * with fallbacks to other Indian English voices or standard English female voices.
 */
function getIndianFemaleVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const inFemaleKeywords = ["heera", "neerja", "veena", "swara", "kavya", "prabha", "lekha", "ananya", "kalpana"];

    // 1. Indian English voice with a known Indian female name
    let voice = voices.find((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        const isIndian = lang.includes("en-in") || lang.includes("en_in") || name.includes("india");
        return isIndian && inFemaleKeywords.some((kw) => name.includes(kw));
    });
    if (voice) return voice;

    // 2. Indian English voice labelled female
    voice = voices.find((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        const isIndian = lang.includes("en-in") || lang.includes("en_in");
        return isIndian && (name.includes("female") || name.includes("woman"));
    });
    if (voice) return voice;

    // 3. Any Indian English voice
    voice = voices.find((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return lang.includes("en-in") || lang.includes("en_in") || name.includes("india");
    });
    if (voice) return voice;

    // 4. Any natural English female voice
    const enFemaleKeywords = ["zira", "jenny", "samantha", "victoria", "karen", "sonia", "hazel", "female"];
    voice = voices.find((v) => {
        const lang = (v.lang || "").toLowerCase();
        const name = (v.name || "").toLowerCase();
        return lang.startsWith("en") && enFemaleKeywords.some((kw) => name.includes(kw));
    });
    if (voice) return voice;

    // 5. Any English voice
    voice = voices.find((v) => (v.lang || "").toLowerCase().startsWith("en"));
    if (voice) return voice;

    // 6. Default system voice
    return voices[0] || null;
}

export function MessageBubble({ message, role, onClose }) {
    const isUser = message.sender === "user";
    const [speaking, setSpeaking] = useState(false);

    const { content, stats = [], chart = null, suggestions = [], accessDenied } = message;

    const handleToggleSpeech = () => {
        if (!("speechSynthesis" in window)) {
            alert("Text-to-speech is not supported in this browser.");
            return;
        }

        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
        } else {
            window.speechSynthesis.cancel();

            // Format phone numbers to enunciate each digit individually
            const textWithSpokenPhones = formatPhoneNumbersForSpeech(content || "");

            const cleanText = textWithSpokenPhones
                .replace(/[*#`_~[\]]/g, "")
                .replace(/\(http[^)]+\)/g, "")
                .replace(/[|]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

            if (!cleanText) return;

            const utterance = new SpeechSynthesisUtterance(cleanText);
            const voice = getIndianFemaleVoice();
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang || "en-IN";
            } else {
                utterance.lang = "en-IN";
            }

            // Ideal parameters for natural, clear Indian English speech
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);
            setSpeaking(true);
            window.speechSynthesis.speak(utterance);
        }
    };

    useEffect(() => {
        // Preload voices in browsers where voices load asynchronously
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.getVoices();
            const onVoicesChanged = () => {
                window.speechSynthesis.getVoices();
            };
            window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
            return () => {
                window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
                if (speaking) {
                    window.speechSynthesis.cancel();
                }
            };
        }
    }, [speaking]);

    if (isUser) {
        return (
            <div className="flex justify-end">
                <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-[var(--color-primary)] px-3.5 py-2 text-sm text-white shadow-sm">
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                </div>
            </div>
        );
    }

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
                    <div className="mb-2 flex items-center justify-between border-b border-[var(--border-default)]/40 pb-1.5">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                            Assistant
                        </span>
                        <button
                            type="button"
                            onClick={handleToggleSpeech}
                            title={speaking ? "Stop reading" : "Read aloud"}
                            aria-label={speaking ? "Stop reading" : "Read aloud"}
                            className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                                speaking
                                    ? "bg-red-500 text-white animate-pulse"
                                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--color-primary)]"
                            }`}
                        >
                            {speaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            <span>{speaking ? "Stop" : "Listen"}</span>
                        </button>
                    </div>
                ) : null}

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
                        {suggestions.slice(0, 2).map((suggestion, index) => (
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
