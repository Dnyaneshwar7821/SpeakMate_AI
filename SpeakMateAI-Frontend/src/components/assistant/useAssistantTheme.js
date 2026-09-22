import { useState, useEffect } from "react";

export const ASSISTANT_THEME_PALETTES = Object.freeze({
    purple: {
        id: "purple",
        primary: "#9333EA",
        primaryHover: "#7E22CE",
        gradient: "from-[#7C3AED] via-[#9333EA] to-[#A855F7]",
        topRibbon: "from-[#7C3AED] via-[#9333EA] to-[#C084FC]",
        avatarGradient: "from-[#6D28D9] via-[#9333EA] to-[#A855F7]",
        sendGradient: "from-[#7C3AED] to-[#9333EA]",
        userBubbleGradient: "from-[#7C3AED] via-[#8B5CF6] to-[#9333EA]",
        glow: "rgba(147, 51, 234, 0.40)",
        shadow: "shadow-purple-500/25",
        badgeBg: "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60",
        ring: "focus-visible:ring-purple-500",
        focusBorder: "focus-within:border-purple-500 focus-within:ring-purple-500/20",
        hoverBorder: "hover:border-purple-500/80 hover:bg-purple-50/50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-300",
        textAccent: "text-purple-600 dark:text-purple-400",
        sparkleColor: "text-purple-500",
    },
    indigo: {
        id: "indigo",
        primary: "#4F46E5",
        primaryHover: "#4338CA",
        gradient: "from-[#4338CA] via-[#4F46E5] to-[#6366F1]",
        topRibbon: "from-[#4338CA] via-[#6366F1] to-[#38BDF8]",
        avatarGradient: "from-[#3730A3] via-[#4F46E5] to-[#818CF8]",
        sendGradient: "from-[#4F46E5] to-[#6366F1]",
        userBubbleGradient: "from-[#4338CA] via-[#4F46E5] to-[#6366F1]",
        glow: "rgba(79, 70, 229, 0.40)",
        shadow: "shadow-indigo-500/25",
        badgeBg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/60",
        ring: "focus-visible:ring-indigo-500",
        focusBorder: "focus-within:border-indigo-500 focus-within:ring-indigo-500/20",
        hoverBorder: "hover:border-indigo-500/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300",
        textAccent: "text-indigo-600 dark:text-indigo-400",
        sparkleColor: "text-indigo-500",
    },
    rose: {
        id: "rose",
        primary: "#E11D48",
        primaryHover: "#BE123C",
        gradient: "from-[#BE123C] via-[#E11D48] to-[#FB7185]",
        topRibbon: "from-[#9F1239] via-[#E11D48] to-[#FDA4AF]",
        avatarGradient: "from-[#BE123C] via-[#E11D48] to-[#F43F5E]",
        sendGradient: "from-[#E11D48] to-[#F43F5E]",
        userBubbleGradient: "from-[#BE123C] via-[#E11D48] to-[#F43F5E]",
        glow: "rgba(225, 29, 72, 0.40)",
        shadow: "shadow-rose-500/25",
        badgeBg: "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60",
        ring: "focus-visible:ring-rose-500",
        focusBorder: "focus-within:border-rose-500 focus-within:ring-rose-500/20",
        hoverBorder: "hover:border-rose-500/80 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300",
        textAccent: "text-rose-600 dark:text-rose-400",
        sparkleColor: "text-rose-500",
    },
    blue: {
        id: "blue",
        primary: "#2563EB",
        primaryHover: "#1D4ED8",
        gradient: "from-[#1D4ED8] via-[#2563EB] to-[#38BDF8]",
        topRibbon: "from-[#1E40AF] via-[#2563EB] to-[#67E8F9]",
        avatarGradient: "from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]",
        sendGradient: "from-[#2563EB] to-[#3B82F6]",
        userBubbleGradient: "from-[#1D4ED8] via-[#2563EB] to-[#3B82F6]",
        glow: "rgba(37, 99, 235, 0.40)",
        shadow: "shadow-blue-500/25",
        badgeBg: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60",
        ring: "focus-visible:ring-blue-500",
        focusBorder: "focus-within:border-blue-500 focus-within:ring-blue-500/20",
        hoverBorder: "hover:border-blue-500/80 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-300",
        textAccent: "text-blue-600 dark:text-blue-400",
        sparkleColor: "text-blue-500",
    },
    emerald: {
        id: "emerald",
        primary: "#059669",
        primaryHover: "#047857",
        gradient: "from-[#047857] via-[#059669] to-[#34D399]",
        topRibbon: "from-[#065F46] via-[#059669] to-[#6EE7B7]",
        avatarGradient: "from-[#047857] via-[#059669] to-[#10B981]",
        sendGradient: "from-[#059669] to-[#10B981]",
        userBubbleGradient: "from-[#047857] via-[#059669] to-[#10B981]",
        glow: "rgba(5, 150, 105, 0.40)",
        shadow: "shadow-emerald-500/25",
        badgeBg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60",
        ring: "focus-visible:ring-emerald-500",
        focusBorder: "focus-within:border-emerald-500 focus-within:ring-emerald-500/20",
        hoverBorder: "hover:border-emerald-500/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-300",
        textAccent: "text-emerald-600 dark:text-emerald-400",
        sparkleColor: "text-emerald-500",
    },
    amber: {
        id: "amber",
        primary: "#D97706",
        primaryHover: "#B45309",
        gradient: "from-[#B45309] via-[#D97706] to-[#FBBF24]",
        topRibbon: "from-[#92400E] via-[#D97706] to-[#FCD34D]",
        avatarGradient: "from-[#B45309] via-[#D97706] to-[#F59E0B]",
        sendGradient: "from-[#D97706] to-[#F59E0B]",
        userBubbleGradient: "from-[#B45309] via-[#D97706] to-[#F59E0B]",
        glow: "rgba(217, 119, 6, 0.40)",
        shadow: "shadow-amber-500/25",
        badgeBg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60",
        ring: "focus-visible:ring-amber-500",
        focusBorder: "focus-within:border-amber-500 focus-within:ring-amber-500/20",
        hoverBorder: "hover:border-amber-500/80 hover:bg-amber-50/50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-300",
        textAccent: "text-amber-600 dark:text-amber-400",
        sparkleColor: "text-amber-500",
    },
});

const HEX_TO_ACCENT = {
    "#9333ea": "purple",
    "#4f46e5": "indigo",
    "#e11d48": "rose",
    "#2563eb": "blue",
    "#059669": "emerald",
    "#d97706": "amber",
};

export function getAssistantTheme(accentKey) {
    const raw = (accentKey || "").trim().toLowerCase();
    const resolvedKey = HEX_TO_ACCENT[raw] || raw;
    return ASSISTANT_THEME_PALETTES[resolvedKey] || ASSISTANT_THEME_PALETTES.purple;
}

function resolveCurrentAccent() {
    if (typeof window === "undefined") return "purple";
    const stored =
        localStorage.getItem("speakmate_admin_accent") ||
        localStorage.getItem("speakmate_accent");
    if (stored) return stored;

    if (typeof document !== "undefined" && document.documentElement) {
        const hex = document.documentElement.style.getPropertyValue("--color-primary")?.trim().toLowerCase();
        if (hex && HEX_TO_ACCENT[hex]) {
            return HEX_TO_ACCENT[hex];
        }
    }
    return "purple";
}

/**
 * Reactive hook that synchronizes with active accent color preference in real time.
 * Listens to local storage, custom events, and document property updates without crashing outside ThemeProvider.
 */
export function useAssistantTheme() {
    const [accent, setAccent] = useState(resolveCurrentAccent);

    useEffect(() => {
        const updateFromEnvironment = () => {
            const current = resolveCurrentAccent();
            setAccent((prev) => (prev !== current ? current : prev));
        };

        window.addEventListener("storage", updateFromEnvironment);
        window.addEventListener("speakmate-accent-change", updateFromEnvironment);

        // Immediate reaction to same-window setting changes via style/data-theme changes
        let observer = null;
        if (typeof document !== "undefined" && document.documentElement) {
            observer = new MutationObserver(() => {
                updateFromEnvironment();
            });
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["style", "data-theme", "class"],
            });
        }

        return () => {
            window.removeEventListener("storage", updateFromEnvironment);
            window.removeEventListener("speakmate-accent-change", updateFromEnvironment);
            if (observer) observer.disconnect();
        };
    }, []);

    return getAssistantTheme(accent);
}

export default useAssistantTheme;

