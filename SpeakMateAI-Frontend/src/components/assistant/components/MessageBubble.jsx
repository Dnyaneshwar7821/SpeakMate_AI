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
 * Phonetic pronunciation rules for Indian proper names, educational terms,
 * and acronyms so Western/system TTS engines pronounce them accurately with native cadence.
 */
const PHONETIC_NAME_REPLACEMENTS = [
    // Common Indian surnames where English phonetics incorrectly silences the trailing 'e'
    [/\bNarke\b/gi, "Narkay"],
    [/\bShinde\b/gi, "Shinday"],
    [/\bBhosale\b/gi, "Bhoslay"],
    [/\bBhosle\b/gi, "Bhoslay"],
    [/\bSalunkhe\b/gi, "Salunkhay"],
    [/\bTambe\b/gi, "Tambay"],
    [/\bKamble\b/gi, "Kaamblay"],
    [/\bGade\b/gi, "Gaaday"],
    [/\bMane\b/gi, "Maanay"],
    [/\bKapse\b/gi, "Kaapsay"],
    [/\bChavan\b/gi, "Chav-haan"],
    [/\bJadhav\b/gi, "Jaa-dhav"],
    [/\bPatil\b/gi, "Paatil"],
    [/\bPawar\b/gi, "Pawaar"],

    // First names that Western TTS engines stumble on
    [/\bDigvijay\b/gi, "Dig-vijay"],
    [/\bEkvira\b/gi, "Ek-veera"],
    [/\bSiddhi\b/gi, "Sid-dhi"],
    [/\bAarav\b/gi, "Aarav"],
    [/\bAnanya\b/gi, "Anan-ya"],
    [/\bShruti\b/gi, "Shroo-ti"],
    [/\bVaishnavi\b/gi, "Vaish-navi"],
    [/\bTanvi\b/gi, "Taan-vi"],
    [/\bSakshi\b/gi, "Saak-shi"],
    [/\bPrashant\b/gi, "Prashant"],
    [/\bSantosh\b/gi, "Santosh"],
    [/\bSuresh\b/gi, "Sur-esh"],
    [/\bRamesh\b/gi, "Ram-esh"],
    [/\bGanesh\b/gi, "Gan-esh"],
    [/\bMahesh\b/gi, "Mah-esh"],

    // Educational Institutions & Schools
    [/\bHighschool\b/gi, "High School"],
    [/\bhighschools\b/gi, "High Schools"],
    [/\bVidyalaya\b/gi, "Vidya-laya"],
    [/\bVidyalayas\b/gi, "Vidya-layas"],
    [/\bVidyapeeth\b/gi, "Vidya-peeth"],
    [/\bGurukul\b/gi, "Guru-kul"],
    [/\bShikshan\b/gi, "Shik-shan"],
    [/\bSanstha\b/gi, "Sans-tha"],

    // Educational terminology & abbreviations
    [/\bRoll\s*no\.?\b/gi, "Roll number"],
    [/\bRoll\s*No\.?\b/gi, "Roll number"],
    [/\bStd\.?\b/gi, "Standard"],
    [/\bDiv\.?\b/gi, "Division"],
    [/\bSec\.?\b/gi, "Section"],
    [/\bXP\b/g, "X P"],
    [/\bKPIs\b/g, "K P I s"],
    [/\bKPI\b/g, "K P I"],
    [/\bDOJ\b/g, "Date of joining"],
    [/\bAI\b/g, "A I"],
    [/\bavg\.?\b/gi, "average"],
    [/\bapprox\.?\b/gi, "approximately"],
    [/\bdept\.?\b/gi, "department"],
    [/\bgovt\.?\b/gi, "government"],
    [/\bvs\.?\b/gi, "versus"],
    [/\bNo\.?\s*(\d+)/gi, "Number $1"],
    [/(\d+)%/g, "$1 percent"],
    [/&/g, " and "],
];

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
 * Transforms raw markdown into clean speech with natural sentence boundaries,
 * pauses between items, accurate Indian name pronunciations, and spelled-out phone numbers.
 */
function formatMarkdownToSpeech(markdown) {
    if (!markdown) return "";

    // 1. Remove URLs and links: [Text](url) -> Text, bare urls -> ""
    let text = markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/https?:\/\/\S+/g, "");

    // 2. Strip emojis completely (so speech engine doesn't pronounce icon descriptions)
    text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");

    // 3. Process line by line to introduce natural structural pauses
    const lines = text.split("\n");
    const processedLines = [];

    for (let rawLine of lines) {
        let line = rawLine.trim();
        if (!line) continue;

        // Skip markdown horizontal rules (---, ***) or table divider (|---|---|)
        if (/^[-*_]{3,}$/.test(line) || /^\|?[\s-:]+\|[\s-:|]+$/.test(line)) {
            continue;
        }

        // Headers (### Heading) -> Heading. (full pause)
        if (/^#{1,6}\s+/.test(line)) {
            line = line.replace(/^#{1,6}\s+/, "").trim();
            if (line && !/[.!?:]$/.test(line)) {
                line += ".";
            }
            processedLines.push(line);
            continue;
        }

        // Table rows (| Col1 | Col2 | Col3 |)
        if (line.startsWith("|") && line.endsWith("|")) {
            const cells = line
                .split("|")
                .map((c) => c.trim())
                .filter(Boolean);
            if (cells.length > 0) {
                line = cells.join(", ") + ".";
                processedLines.push(line);
                continue;
            }
        }

        // Bullet points (- Item, * Item, 1. Item)
        if (/^[-*•]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
            line = line.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "").trim();
            // Convert "Label: Value" to "Label, Value" for natural pause
            line = line.replace(/:\s+/g, ", ");
            if (line && !/[.!?]$/.test(line)) {
                line += ".";
            }
            processedLines.push(line);
            continue;
        }

        // Convert key-value colons to commas for natural inflection pause
        line = line.replace(/:\s*$/, ".");
        line = line.replace(/:\s+/g, ", ");

        if (line && !/[.!?]$/.test(line)) {
            line += ".";
        }
        processedLines.push(line);
    }

    let speechText = processedLines.join(" ");

    // 4. Strip leftover markdown syntax (asterisks, underscores, code ticks, pipes)
    speechText = speechText
        .replace(/[*_`~|]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    // 5. Apply phonetic pronunciation corrections for Indian names and terms
    for (const [pattern, replacement] of PHONETIC_NAME_REPLACEMENTS) {
        speechText = speechText.replace(pattern, replacement);
    }

    // 6. Format phone numbers to digit-by-digit enunciation
    speechText = formatPhoneNumbersForSpeech(speechText);

    // 7. Clean up and standardize punctuation spacing for natural breathing pauses
    speechText = speechText
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s*\.\s*/g, ". ")
        .replace(/\.{2,}/g, ".")
        .replace(/\s+/g, " ")
        .trim();

    return speechText;
}

/**
 * Selects the absolute best Indian English Female voice available in the browser,
 * prioritizing natural/neural AI voices (like Microsoft Neerja Online / Google en-IN)
 * and strictly excluding male voices.
 */
function getIndianFemaleVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleNames = ["neerja", "heera", "veena", "swara", "kavya", "prabha", "lekha", "ananya", "kalpana", "female", "girl", "zira", "jenny", "samantha", "victoria"];
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

        // Heavily penalize male voices so they are never selected
        if (isKnownMale && !isKnownFemale) {
            score -= 1000;
        }

        // Tier 1: Indian English Female + Natural/Neural (e.g. Microsoft Neerja Online (Natural))
        if (isIndian && isKnownFemale && isNeuralOrNatural) {
            score += 500;
        }
        // Tier 2: Indian English with prominent female names (Neerja, Heera, Veena, Swara)
        else if (isIndian && (name.includes("neerja") || name.includes("heera") || name.includes("veena") || name.includes("swara"))) {
            score += 400;
        }
        // Tier 3: Any Indian English Female voice
        else if (isIndian && isKnownFemale) {
            score += 300;
        }
        // Tier 4: Indian English + Natural/Neural (e.g. Google en-IN)
        else if (isIndian && isNeuralOrNatural) {
            score += 250;
        }
        // Tier 5: Any Indian English voice
        else if (isIndian) {
            score += 150;
        }
        // Tier 6: Non-Indian English Female + Natural/Neural (e.g. Microsoft Jenny Online (Natural))
        else if (lang.startsWith("en") && isKnownFemale && isNeuralOrNatural) {
            score += 100;
        }
        // Tier 7: Non-Indian English Female
        else if (lang.startsWith("en") && isKnownFemale) {
            score += 70;
        }
        // Tier 8: Any English Natural voice
        else if (lang.startsWith("en") && isNeuralOrNatural) {
            score += 40;
        }
        // Tier 9: Any English voice
        else if (lang.startsWith("en")) {
            score += 20;
        }

        return { voice: v, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.voice || voices[0] || null;
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

            // Transform markdown into natural spoken text with proper pauses and pronunciations
            const cleanText = formatMarkdownToSpeech(content || "");
            if (!cleanText) return;

            const utterance = new SpeechSynthesisUtterance(cleanText);
            const voice = getIndianFemaleVoice();
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang || "en-IN";
            } else {
                utterance.lang = "en-IN";
            }

            // 0.90 is the ideal rate: measured, clear, elegant cadence with natural breathing pauses
            utterance.rate = 0.90;
            utterance.pitch = 1.0;
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);

            setSpeaking(true);
            window.speechSynthesis.speak(utterance);

            // Chrome/Edge auto-pause workaround for longer text
            const resumeInterval = setInterval(() => {
                if (!window.speechSynthesis.speaking) {
                    clearInterval(resumeInterval);
                } else if (window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                }
            }, 5000);
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
