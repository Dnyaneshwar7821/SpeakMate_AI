import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles, Volume2, VolumeX } from "lucide-react";

import StatRow from "./StatRow";
import MiniChart from "./MiniChart";
import DeepLinkChip from "./DeepLinkChip";

const markdownComponents = {
    a: (props) => (
        <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-700 dark:hover:text-indigo-300"
        />
    ),
    table: (props) => (
        <div className="my-2.5 overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/50 shadow-xs">
            <table className="w-full min-w-max border-collapse text-xs" {...props} />
        </div>
    ),
    th: (props) => (
        <th
            className="border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-100/80 dark:bg-slate-800/80 px-3 py-2 text-left text-[11px] font-semibold tracking-wider text-slate-600 dark:text-slate-300 uppercase"
            {...props}
        />
    ),
    td: (props) => (
        <td
            className="border-b border-slate-100 dark:border-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200"
            {...props}
        />
    ),
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-slate-800 dark:text-slate-100">{children}</p>,
    ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1 text-slate-800 dark:text-slate-100">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1 text-slate-800 dark:text-slate-100">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed pl-0.5">{children}</li>,
    code: ({ inline, children, ...props }) =>
        inline ? (
            <code
                className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 font-mono text-[11px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-800/40"
                {...props}
            >
                {children}
            </code>
        ) : (
            <pre className="my-2.5 overflow-x-auto rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-[11px] shadow-sm">
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
 * Educational abbreviations and honorifics expansions.
 * Note: Indian names are kept clean without artificial hyphens or distorted vowels,
 * allowing the Indian female voice engine to pronounce them smoothly without breaking.
 */
const ABBREVIATION_REPLACEMENTS = [
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
    [/\bno\.\b/gi, "number"],
    [/\bNo\.\b/gi, "number"],
    [/\betc\.?\b/gi, "and so on"],
];

const KNOWN_INDIAN_NAME_TOKENS = [
    "ayush", "chandgude", "digvijay", "patil", "nandini", "payal", "bhor",
    "gangu", "algule", "siddhi", "narke", "shinde", "bhosale", "bhosle",
    "salunkhe", "tambe", "kamble", "gade", "mane", "pawar", "raj", "malhotra", "virat", "sharma"
];

/**
 * Formats email usernames so glued names and trailing digits don't cause TTS
 * to swallow or cut off the last 3-4 letters of surnames (e.g. "ayushchandgude2010"
 * becomes "ayush chandgude two zero one zero").
 */
function formatEmailUserForSpeech(username, fullTextContext = "") {
    if (!username) return "";

    // 1. Separate trailing or internal digits with simple space (NO comma so it doesn't break the voice)
    let cleanUser = username
        .replace(/([a-zA-Z])(\d+)/g, "$1 $2")
        .replace(/(\d+)([a-zA-Z])/g, "$1 $2");

    // 2. Replace dots, underscores, hyphens with spoken equivalents
    cleanUser = cleanUser
        .replace(/\./g, " dot ")
        .replace(/_/g, " underscore ")
        .replace(/-/g, " hyphen ");

    // 3. Separate first name and surname if they are mashed together in the email
    const contextNames = [];
    const nameMatches = (fullTextContext || "").match(/[A-Z][a-z]+/g) || [];
    for (const n of nameMatches) {
        if (n.length >= 3 && !['Name', 'Email', 'Role', 'Status', 'Standard', 'Division', 'School'].includes(n)) {
            contextNames.push(n.toLowerCase());
        }
    }
    const allTokens = [...new Set([...contextNames, ...KNOWN_INDIAN_NAME_TOKENS])];

    for (const token of allTokens) {
        const regex = new RegExp(`(${token})([a-z]{3,})`, 'i');
        cleanUser = cleanUser.replace(regex, "$1 $2");
    }

    // 4. Convert all numbers in the username to 1-by-1 digit speech with spaces (NO commas to prevent audio stutters)
    cleanUser = cleanUser.replace(/\d+/g, (digits) => {
        return digits.split("").map((d) => DIGIT_WORDS[d] || d).join(" ");
    });

    return cleanUser.trim();
}

/**
 * Formats emails, domains, and decimals for speech so TTS reads them naturally
 * and prevents the sentence splitter from pausing awkwardly at ".com" or decimals.
 */
function formatEmailsAndUrlsForSpeech(text) {
    if (!text) return "";

    // 1. Email addresses: name@domain.com -> "name at domain dot com"
    text = text.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, user, domain) => {
        const spokenUser = formatEmailUserForSpeech(user, text);
        const spokenDomain = domain.replace(/\./g, " dot ");
        return `${spokenUser} at ${spokenDomain}`;
    });

    // 2. Web domains/URLs: e.g. www.speakmate.ai -> "speakmate dot ai"
    text = text.replace(/\b((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|in|net|edu|io|co|ai)(?:\/[^\s)]*)?)\b/gi, (match) => {
        return match.replace(/https?:\/\//gi, "").replace(/\./g, " dot ").replace(/\//g, " slash ");
    });

    // 3. Decimal numbers: 98.5% or 3.14 -> 98 point 5% (prevents dot from triggering a sentence split)
    text = text.replace(/(\d+)\.(\d+)/g, "$1 point $2");

    return text;
}

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
    // Format emails, domains, and decimals so they don't break on dots
    text = formatEmailsAndUrlsForSpeech(text);

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

        // Apply abbreviation expansions
        for (const [pattern, replacement] of ABBREVIATION_REPLACEMENTS) {
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
 * Selects an Indian English Female voice distinct from Neerja
 * (prioritizing Microsoft Heera, Microsoft Swara, Microsoft Veena, Google en-IN Female).
 * Strictly excludes Neerja and male voices.
 */
function getIndianFemaleVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const maleNames = ["david", "mark", "guy", "george", "prabhat", "rishi", "ravi", "male", "boy", "stefan", "oliver", "daniel", "william"];

    const scored = voices.map((v) => {
        const lang = (v.lang || "").toLowerCase().replace("_", "-");
        const name = (v.name || "").toLowerCase();
        let score = 0;

        const isIndianLang = lang === "en-in" || lang.startsWith("en-in");
        const isIndiaName = name.includes("india");
        const isIndian = isIndianLang || isIndiaName;

        const isMale = maleNames.some((n) => name.includes(n));
        const isNeerja = name.includes("neerja");

        // Strictly disqualify male voices and Neerja (user requested a different Indian female voice)
        if (isMale) score -= 20000;
        if (isNeerja) score -= 20000;

        // 1. Top priority: Heera (classic, gentle Windows Indian English Female)
        if (isIndian && name.includes("heera")) {
            score += 2000;
        }
        // 2. Swara (modern Windows/Edge Indian English Female)
        else if (isIndian && name.includes("swara")) {
            score += 1800;
        }
        // 3. Veena (clear Indian English Female)
        else if (isIndian && name.includes("veena")) {
            score += 1600;
        }
        // 4. Google Indian English Female (Chrome)
        else if (isIndian && name.includes("google") && !isMale) {
            score += 1400;
        }
        // 5. Apple / Mobile Indian female voices (Kavya, Lekha, etc.)
        else if (isIndian && (name.includes("kavya") || name.includes("lekha") || name.includes("ananya") || name.includes("kalpana"))) {
            score += 1200;
        }
        // 6. Any Indian English voice explicitly marked female (and not Neerja)
        else if (isIndian && (name.includes("female") || name.includes("woman"))) {
            score += 1000;
        }
        // 7. Any Indian English voice that is not male and not Neerja
        else if (isIndian) {
            score += 600;
        }
        // 8. High-quality natural English female voice fallback (e.g. Microsoft Jenny Online)
        else if (lang.startsWith("en") && (name.includes("jenny") || name.includes("aria")) && !isMale) {
            score += 300;
        }
        // 9. Standard English female voice fallback (e.g. Microsoft Zira)
        else if (lang.startsWith("en") && (name.includes("zira") || name.includes("female")) && !isMale) {
            score += 200;
        }
        // 10. Any English voice not male and not Neerja
        else if (lang.startsWith("en") && !isMale) {
            score += 50;
        }

        return { voice: v, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const chosen = scored[0]?.score > -10000 ? scored[0]?.voice : null;
    return chosen || voices.find((v) => !v.name.toLowerCase().includes("neerja") && !maleNames.some((m) => v.name.toLowerCase().includes(m))) || voices[0] || null;
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

                // 1.40 for brisk, rapid, highly responsive speech
                utterance.rate = 1.40;
                utterance.pitch = 1.0;

                utterance.onend = () => {
                    if (!speechQueueRef.current.isPlaying) return;
                    // Ultra-snappy 40ms transition between points so speech moves swiftly without lag
                    speechQueueRef.current.timer = setTimeout(() => {
                        playChunk(index + 1);
                    }, 40);
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
                <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-gradient-to-tr from-[#5243F5] to-[#7B61FF] px-4 py-2.5 text-xs text-white shadow-md shadow-indigo-500/15 font-normal">
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start">
            <div
                className={`max-w-[94%] rounded-2xl rounded-tl-xs border p-3.5 text-xs shadow-xs transition-all ${
                    accessDenied
                        ? "border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/30 text-slate-900 dark:text-slate-100"
                        : "border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-100"
                }`}
            >
                {content ? (
                    <div className="mb-2.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                        <div className="flex items-center gap-1.5">
                            <span className="grid h-4.5 w-4.5 place-items-center rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                                <Sparkles className="h-3 w-3" aria-hidden="true" />
                            </span>
                            <span className="text-[11px] font-bold tracking-tight text-slate-700 dark:text-slate-200">
                                SpeakMate AI
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggleSpeech}
                            title={speaking ? "Stop reading aloud" : "Read aloud with natural voice"}
                            aria-label={speaking ? "Stop reading" : "Read aloud"}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                                speaking
                                    ? "bg-red-500 text-white shadow-sm shadow-red-500/30 animate-pulse"
                                    : "bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                            }`}
                        >
                            {speaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                            <span>{speaking ? "Stop" : "Listen"}</span>
                        </button>
                    </div>
                ) : null}

                {content ? (
                    <div className="prose-xs max-w-none break-words text-slate-800 dark:text-slate-100">
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
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
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
