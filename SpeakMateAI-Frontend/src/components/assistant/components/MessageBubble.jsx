import React, { useState, useEffect, useRef } from "react";
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
 * Phonetic pronunciation overrides for Indian surnames, academic abbreviations, and honorifics.
 */
const PHONETIC_NAME_REPLACEMENTS = [
    [/\bNarke\b/gi, "Narkay"],
    [/\bShinde\b/gi, "Shinday"],
    [/\bBhosale\b/gi, "Bhoslay"],
    [/\bBhosle\b/gi, "Bhoslay"],
    [/\bSalunkhe\b/gi, "Salunkhay"],
    [/\bTambe\b/gi, "Tambay"],
    [/\bKamble\b/gi, "Kaamblay"],
    [/\bGade\b/gi, "Gaaday"],
    [/\bMane\b/gi, "Maanay"],
    [/\bPatil\b/gi, "Paatil"],
    [/\bPawar\b/gi, "Pawaar"],
    [/\bDigvijay\b/gi, "Dig-vijay"],
    [/\bEkvira\b/gi, "Ek-veera"],
    [/\bVidyalaya\b/gi, "Vidya-laya"],
    [/\bHighschool\b/gi, "High School"],
    [/\bMr\./gi, "Mister"],
    [/\bMrs\./gi, "Missus"],
    [/\bMs\./gi, "Miss"],
    [/\bDr\./gi, "Doctor"],
    [/\bProf\./gi, "Professor"],
    [/\bvs\./gi, "versus"],
    [/\be\.g\./gi, "for example"],
    [/\bi\.e\./gi, "that is"],
    [/\bStd\.?\b/gi, "Standard"],
    [/\bDiv\.?\b/gi, "Division"],
    [/\bRoll\s*no\.?\b/gi, "Roll number"],
    [/\bXP\b/g, "X P"],
    [/\bKPIs?\b/g, "K P I"],
    [/\bIDs?\b/g, "I D"],
];

/**
 * Formats phone numbers so TTS speaks them digit-by-digit (1-by-1)
 * (e.g. "9823456789" -> "nine, eight, two, three, four...")
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
 * Parses markdown into clean, individual speech chunks.
 * Each chunk represents a discrete sentence or point, enabling
 * intentional pauses between points so speech never sounds like a continuous rush.
 */
function parseMarkdownIntoSpeechChunks(content) {
    if (!content) return [];

    let text = formatPhoneNumbersForSpeech(content);

    // Strip markdown links [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Strip standalone URLs
    text = text.replace(/https?:\/\/\S+/g, "");

    const rawLines = text.split(/\r?\n+/);
    const chunks = [];

    for (let line of rawLines) {
        line = line.trim();
        if (!line) continue;

        // Skip divider lines (--- or ***)
        if (/^[-*_]{3,}$/.test(line)) continue;

        // Table separator line |---|---|
        if (/^\|[\s\-:|]+\|$/.test(line)) continue;

        // Markdown table row: | col1 | col2 |
        if (line.startsWith("|") && line.endsWith("|")) {
            const cells = line
                .split("|")
                .map((c) => c.trim())
                .filter(Boolean);
            if (cells.length > 0) {
                line = cells.join(", ") + ".";
            }
        }

        // Bullet points (- item, * item, • item)
        if (/^[-*•]\s+/.test(line)) {
            line = line.replace(/^[-*•]\s+/, "").trim();
        } else if (/^(\d+)\.\s+/.test(line)) {
            // Numbered list: 1. Item -> Point 1, Item
            line = line.replace(/^(\d+)\.\s+/, "Point $1, ").trim();
        }

        // Clean trailing colons
        line = line.replace(/:\s*$/, ".");
        // Convert internal key-value colons to commas for natural inflection pause
        line = line.replace(/:\s+/g, ", ");

        if (line && !/[.!?]$/.test(line)) {
            line += ".";
        }

        // Clean markdown formatting characters
        line = line.replace(/[*_`~#]/g, "").trim();

        // Apply phonetic and abbreviation replacements
        for (const [pattern, replacement] of PHONETIC_NAME_REPLACEMENTS) {
            line = line.replace(pattern, replacement);
        }

        // Clean up excess spaces and punctuation
        line = line
            .replace(/\s*,\s*/g, ", ")
            .replace(/\s*\.\s*/g, ". ")
            .replace(/\.{2,}/g, ".")
            .replace(/\s+/g, " ")
            .trim();

        if (line.length > 0 && /[a-zA-Z0-9]/.test(line)) {
            // If the line contains multiple sentences, split them so each sentence gets its own pause
            const subSentences = line.match(/[^.!?]+[.!?]+/g);
            if (subSentences && subSentences.length > 1) {
                for (const s of subSentences) {
                    const trimmedSub = s.trim();
                    if (trimmedSub.length > 0 && /[a-zA-Z0-9]/.test(trimmedSub)) {
                        chunks.push(trimmedSub);
                    }
                }
            } else {
                chunks.push(line);
            }
        }
    }

    return chunks;
}

/**
 * Selects the best Indian English Female voice available in the browser,
 * prioritizing natural/neural AI voices (like Microsoft Neerja Online / Microsoft Heera / Google en-IN)
 * and strictly excluding male voices.
 */
function getIndianFemaleVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleNames = ["heera", "neerja", "veena", "swara", "kavya", "prabha", "lekha", "ananya", "kalpana", "female", "girl", "zira", "jenny", "samantha", "victoria"];
    const maleNames = ["david", "mark", "guy", "george", "prabhat", "rishi", "ravi", "male", "boy", "stefan", "oliver", "daniel", "william"];

    const scored = voices.map((v) => {
        const lang = (v.lang || "").toLowerCase().replace("_", "-");
        const name = (v.name || "").toLowerCase();
        let score = 0;

        const isIndianLang = lang === "en-in" || lang.startsWith("en-in");
        const isIndiaName = name.includes("india");
        const isIndian = isIndianLang || isIndiaName;

        const isKnownFemale = femaleNames.some((n) => name.includes(n));
        const isKnownMale = maleNames.some((n) => name.includes(n));
        const isNeuralOrNatural = name.includes("natural") || name.includes("online") || name.includes("neural") || name.includes("google");

        // Heavily penalize male voices so they are NEVER selected
        if (isKnownMale && !isKnownFemale) {
            score -= 2000;
        }

        // Tier 1: Indian English Female + Natural/Neural (e.g. Microsoft Neerja Online, Google en-IN Female)
        if (isIndian && isKnownFemale && isNeuralOrNatural) {
            score += 600;
        }
        // Tier 2: Indian English with female names (Heera, Swara, Veena)
        else if (isIndian && isKnownFemale) {
            score += 500;
        }
        // Tier 3: Any Indian English voice not explicitly male
        else if (isIndian && !isKnownMale) {
            score += 300;
        }
        // Tier 4: English Female + Natural (e.g. Microsoft Jenny Online)
        else if (lang.startsWith("en") && isKnownFemale && isNeuralOrNatural) {
            score += 200;
        }
        // Tier 5: English Female (e.g. Microsoft Zira)
        else if (lang.startsWith("en") && isKnownFemale) {
            score += 100;
        }
        // Tier 6: Any English voice not explicitly male
        else if (lang.startsWith("en") && !isKnownMale) {
            score += 50;
        }

        return { voice: v, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.score > -500 ? scored[0]?.voice : (voices[0] || null);
}

export function MessageBubble({ message, role, onClose }) {
    const isUser = message.sender === "user";
    const [speaking, setSpeaking] = useState(false);
    const speechQueueRef = useRef({ isPlaying: false, timer: null });

    const { content, stats = [], chart = null, suggestions = [], accessDenied } = message;

    const stopSpeech = () => {
        speechQueueRef.current.isPlaying = false;
        if (speechQueueRef.current.timer) {
            clearTimeout(speechQueueRef.current.timer);
            speechQueueRef.current.timer = null;
        }
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeaking(false);
    };

    const handleToggleSpeech = () => {
        if (!("speechSynthesis" in window)) {
            alert("Text-to-speech is not supported in this browser.");
            return;
        }

        if (speaking) {
            stopSpeech();
        } else {
            stopSpeech();

            const chunks = parseMarkdownIntoSpeechChunks(content || "");
            if (chunks.length === 0) return;

            const voice = getIndianFemaleVoice();

            speechQueueRef.current.isPlaying = true;
            setSpeaking(true);

            const playChunk = (index) => {
                if (!speechQueueRef.current.isPlaying) return;
                if (index >= chunks.length) {
                    stopSpeech();
                    return;
                }

                const utterance = new SpeechSynthesisUtterance(chunks[index]);
                if (voice) {
                    utterance.voice = voice;
                    utterance.lang = voice.lang || "en-IN";
                } else {
                    utterance.lang = "en-IN";
                }

                // 0.90 is a calm, natural, well-paced cadence for clear comprehension
                utterance.rate = 0.90;
                utterance.pitch = 1.05;

                utterance.onend = () => {
                    if (!speechQueueRef.current.isPlaying) return;
                    // Natural 400ms pause between points/sentences so the user clearly hears each item distinctly
                    speechQueueRef.current.timer = setTimeout(() => {
                        playChunk(index + 1);
                    }, 400);
                };

                utterance.onerror = () => {
                    if (!speechQueueRef.current.isPlaying) return;
                    speechQueueRef.current.timer = setTimeout(() => {
                        playChunk(index + 1);
                    }, 200);
                };

                window.speechSynthesis.speak(utterance);
            };

            playChunk(0);
        }
    };

    useEffect(() => {
        // Preload voices in browsers where voices load asynchronously
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.getVoices();
        }
        return () => {
            stopSpeech();
        };
    }, []);

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
