import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import {
    getProfileInsignia,
    getInitials,
    CALLIGRAPHY_CRESTS,
    INSIGNIA_CHANGED_EVENT,
    INSIGNIA_STORAGE_PREFIX,
} from "@utils/insigniaHelper";

/**
 * InsigniaBadge.jsx
 *
 * Universal institutional badge / avatar replacement across SpeakMate AI.
 * Displays:
 *  - Custom uploaded Institutional Photo (cropped circular)
 *  - Stylized Calligraphy Crest (one of 6 luxury typography presets)
 *  - Standard Initials Crest (2-letter uppercase monogram)
 *
 * Automatically syncs in real-time across Navbars and Profile cards via custom DOM events.
 */
export function InsigniaBadge({
    name = "Admin",
    role = "SUPER_ADMIN",
    email = "",
    size = "md",
    className = "",
    showCameraOverlay = false,
    onClick,
}) {
    const [insignia, setInsignia] = useState(() => getProfileInsignia(role, email, name));

    useEffect(() => {
        setInsignia(getProfileInsignia(role, email, name));

        const handleChanged = (e) => {
            const detail = e.detail;
            if (!detail) {
                setInsignia(getProfileInsignia(role, email, name));
                return;
            }
            const matchEmail = detail.email && email && detail.email.toLowerCase() === email.toLowerCase();
            const matchName = detail.name && name && detail.name.toLowerCase() === name.toLowerCase();
            const matchRole = detail.role && role && detail.role.toLowerCase() === role.toLowerCase();

            if (matchEmail || matchName || (matchRole && !email && !name) || (!email && !name)) {
                setInsignia(detail.insignia || getProfileInsignia(role, email, name));
            }
        };

        const handleStorage = (e) => {
            if (e.key && (e.key.startsWith(INSIGNIA_STORAGE_PREFIX) || e.key === "speakmate_superadmin_avatar")) {
                setInsignia(getProfileInsignia(role, email, name));
            }
        };

        window.addEventListener(INSIGNIA_CHANGED_EVENT, handleChanged);
        window.addEventListener("storage", handleStorage);
        return () => {
            window.removeEventListener(INSIGNIA_CHANGED_EVENT, handleChanged);
            window.removeEventListener("storage", handleStorage);
        };
    }, [role, email, name]);

    const initials = getInitials(name);

    // Dynamic size classes - all circular by default
    const sizeConfig = {
        xs: {
            container: "h-6 w-6 rounded-full text-[10px] font-bold shadow-xs",
            cameraIconSize: 10,
            cameraBadge: "h-3 w-3 -bottom-0.5 -right-0.5",
        },
        sm: {
            container: "h-9 w-9 rounded-full text-xs font-bold shadow-[var(--shadow-sm)]",
            cameraIconSize: 12,
            cameraBadge: "h-4 w-4 -bottom-1 -right-1",
        },
        md: {
            container: "h-11 w-11 rounded-full text-base font-bold shadow-md",
            cameraIconSize: 13,
            cameraBadge: "h-5 w-5 -bottom-1 -right-1",
        },
        lg: {
            container: "h-24 w-24 rounded-full text-3xl font-black ring-4 ring-[var(--bg-surface)] shadow-xl",
            cameraIconSize: 16,
            cameraBadge: "h-7 w-7 bottom-0 right-0",
        },
        xl: {
            container: "h-32 w-32 rounded-full text-4xl font-black ring-4 ring-[var(--bg-surface)] shadow-2xl",
            cameraIconSize: 20,
            cameraBadge: "h-9 w-9 bottom-0 right-0",
        },
    };

    const curSize = sizeConfig[size] || sizeConfig.md;

    // Default gradient based on role
    const getRoleGradient = () => {
        const r = (role || "").toUpperCase();
        if (r.includes("SUPER")) {
            return "bg-gradient-to-br from-[#6c63ff] via-[#8e54e9] to-[#ff6584] text-white";
        }
        if (r.includes("SCHOOL")) {
            return "bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white";
        }
        if (r.includes("TEACHER")) {
            return "bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white";
        }
        if (r.includes("STUDENT")) {
            return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white";
        }
        return "bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-white";
    };

    // Render contents based on insignia type
    const renderInsigniaContent = () => {
        if (insignia?.type === "image" && insignia.data) {
            return (
                <img
                    src={insignia.data}
                    alt="Profile Insignia"
                    className="h-full w-full object-cover rounded-full"
                    style={{ borderRadius: "inherit" }}
                />
            );
        }

        if (insignia?.type === "calligraphy" && insignia.styleId) {
            const style = CALLIGRAPHY_CRESTS.find((s) => s.id === insignia.styleId) || CALLIGRAPHY_CRESTS[0];
            return (
                <div
                    className={`h-full w-full grid place-items-center rounded-full transition-transform ${style.containerClass}`}
                    style={{ borderRadius: "inherit" }}
                >
                    <span className={style.textClass}>{initials}</span>
                </div>
            );
        }

        // Standard 2-letter uppercase initials on signature institutional gradient
        return (
            <div
                className={`h-full w-full grid place-items-center rounded-full ${getRoleGradient()}`}
                style={{ borderRadius: "inherit" }}
            >
                <span className="tracking-wide select-none">{initials}</span>
            </div>
        );
    };

    const isInteractive = Boolean(onClick);

    return (
        <div className="relative inline-flex items-center justify-center shrink-0 select-none">
            <button
                type="button"
                disabled={!isInteractive}
                onClick={onClick}
                aria-label="Profile Insignia"
                className={`group relative grid shrink-0 place-items-center overflow-hidden rounded-full transition-all duration-300 ${
                    curSize.container
                } ${className} ${isInteractive ? "cursor-pointer hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40" : "cursor-default"}`}
            >
                {renderInsigniaContent()}

                {showCameraOverlay && (
                    <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera size={curSize.cameraIconSize + 4} className="text-white drop-shadow-md" />
                    </div>
                )}
            </button>

            {showCameraOverlay && (
                <button
                    type="button"
                    onClick={onClick}
                    aria-label="Change Profile Insignia"
                    className={`absolute ${curSize.cameraBadge} grid place-items-center rounded-full bg-[var(--color-primary)] text-white shadow-lg ring-2 ring-[var(--bg-surface)] transition-transform duration-200 hover:scale-110 focus:outline-none`}
                >
                    <Camera size={curSize.cameraIconSize} />
                </button>
            )}
        </div>
    );
}

export default InsigniaBadge;
