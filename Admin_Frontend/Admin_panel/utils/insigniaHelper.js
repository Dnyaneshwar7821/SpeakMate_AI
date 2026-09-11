/**
 * insigniaHelper.js
 *
 * Unified utility for managing Profile Insignias (institutional badges, portraits,
 * and calligraphy crests) across Super Admin, School Admin, and Teacher Admin.
 *
 * Uses the institutional term "Profile Insignia" and stores preferences locally
 * per role and email, synchronizing seamlessly across Profile pages and Navbars
 * without any backend changes.
 */

export const INSIGNIA_STORAGE_PREFIX = "speakmate_insignia";
export const INSIGNIA_CHANGED_EVENT = "speakmate:insignia-changed";

/**
 * 6 Luxury Calligraphy & Typography Crest Styles
 */
export const CALLIGRAPHY_CRESTS = [
    {
        id: "royal_crest",
        name: "Royal Crest",
        subtitle: "Golden Serif Luxury",
        description: "Obsidian backdrop with metallic gold serif typography and regal gold ring",
        containerClass: "bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)]",
        textClass: "font-serif tracking-widest font-black bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
        accent: "#f59e0b",
        badge: "👑 Royal",
    },
    {
        id: "cyber_neon",
        name: "Cyber Neon",
        subtitle: "Futuristic Hologram",
        description: "Midnight dark base with electric cyan glow and geometric typography",
        containerClass: "bg-slate-950 border-2 border-cyan-400/50 shadow-[0_0_16px_rgba(34,211,238,0.35)]",
        textClass: "font-mono font-black tracking-wider text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]",
        accent: "#06b6d4",
        badge: "⚡ Cyber",
    },
    {
        id: "executive_luxe",
        name: "Executive Luxe",
        subtitle: "Contemporary Violet",
        description: "Smooth royal indigo-to-violet gradient with crisp modern sans-serif",
        containerClass: "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 border-2 border-white/25 shadow-[0_4px_16px_rgba(99,102,241,0.3)]",
        textClass: "font-sans font-black tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
        accent: "#8b5cf6",
        badge: "💎 Executive",
    },
    {
        id: "emerald_botanical",
        name: "Emerald Botanical",
        subtitle: "Nordic Prestige",
        description: "Deep forest emerald gradient with refined italic serif calligraphy",
        containerClass: "bg-gradient-to-br from-teal-950 via-emerald-900 to-slate-900 border-2 border-emerald-400/40 shadow-[0_4px_16px_rgba(16,185,129,0.25)]",
        textClass: "font-serif italic font-bold tracking-widest text-emerald-100 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]",
        accent: "#10b981",
        badge: "🌿 Botanical",
    },
    {
        id: "sunset_radiant",
        name: "Sunset Radiant",
        subtitle: "Warm Modernist",
        description: "Tangerine-to-rose warm gradient with smooth rounded typography",
        containerClass: "bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 border-2 border-white/30 shadow-[0_4px_16px_rgba(244,63,94,0.3)]",
        textClass: "font-sans font-black tracking-normal text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]",
        accent: "#f43f5e",
        badge: "🌅 Sunset",
    },
    {
        id: "frosted_glass",
        name: "Frosted Glass",
        subtitle: "Minimalist Luxe",
        description: "Frosted acrylic glass with crisp stark monogram and clean borders",
        containerClass: "bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md border-2 border-slate-300 dark:border-slate-700 shadow-md",
        textClass: "font-sans font-extrabold tracking-widest text-slate-800 dark:text-slate-100",
        accent: "#64748b",
        badge: "🧊 Frosted",
    },
];

/**
 * Standardize 2-letter uppercase initials from user full name.
 * e.g., "Super Admin" -> "SA", "Teacher John" -> "TJ", "Principal" -> "PR"
 */
export function getInitials(name, fallback = "AD") {
    if (!name || typeof name !== "string") return fallback;
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return fallback;
    if (parts.length === 1) {
        const single = parts[0].toUpperCase();
        return single.length > 1 ? single.slice(0, 2) : single;
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Storage key generator scoped by role and user email
 */
export function getInsigniaStorageKey(role = "super_admin", email = "default") {
    const safeRole = String(role || "super_admin").toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const safeEmail = String(email || "default").toLowerCase().replace(/[^a-z0-9_]/g, "_");
    return `${INSIGNIA_STORAGE_PREFIX}_${safeRole}_${safeEmail}`;
}

/**
 * Retrieve the current Profile Insignia configuration across all roles and portals.
 * Checks primary role+email key, global email key, normalized name key, and storage scan.
 * Returns:
 *   { type: "image", data: "data:image/..." }
 *   { type: "calligraphy", styleId: "royal_crest" }
 *   { type: "initials" }
 */
export function getProfileInsignia(role, email, name) {
    try {
        const safeEmail = email && email !== "default" ? String(email).toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";
        const safeName = name ? String(name).toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";
        const safeRole = role ? String(role).toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";

        // 1. Primary: role + email
        if (safeRole && safeEmail) {
            const primaryKey = getInsigniaStorageKey(safeRole, safeEmail);
            const val = localStorage.getItem(primaryKey);
            if (val) return JSON.parse(val);
        }

        // 2. Direct by email (across any role)
        if (safeEmail) {
            const byEmail = localStorage.getItem(`${INSIGNIA_STORAGE_PREFIX}_email_${safeEmail}`);
            if (byEmail) return JSON.parse(byEmail);

            // Scan localStorage for any speakmate_insignia key matching safeEmail
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(INSIGNIA_STORAGE_PREFIX) && k.includes(safeEmail)) {
                    const item = localStorage.getItem(k);
                    if (item) return JSON.parse(item);
                }
            }
        }

        // 3. Direct by name (across any role/portal)
        if (safeName) {
            const byName = localStorage.getItem(`${INSIGNIA_STORAGE_PREFIX}_name_${safeName}`);
            if (byName) return JSON.parse(byName);

            // Scan localStorage for any key containing safeName
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(INSIGNIA_STORAGE_PREFIX) && k.includes(safeName)) {
                    const item = localStorage.getItem(k);
                    if (item) return JSON.parse(item);
                }
            }
        }

        // 4. Super Admin legacy fallback
        if (!safeRole || safeRole.includes("super")) {
            const legacy = localStorage.getItem("speakmate_superadmin_avatar");
            if (legacy) return JSON.parse(legacy);
        }
    } catch (e) {
        console.error("Failed to read profile insignia:", e);
    }
    return { type: "initials" };
}

/**
 * Persist the Profile Insignia and dispatch live broadcast event.
 * Multi-indexes by role+email, global email, and full name so all admin portals
 * (Super Admin, School Admin, Teacher Admin) immediately reflect updates.
 */
export function saveProfileInsignia(role, email, insigniaConfig, name = "") {
    try {
        const safeRole = String(role || "super_admin").toLowerCase().replace(/[^a-z0-9_]/g, "_");
        const safeEmail = email && email !== "default" ? String(email).toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";
        const safeName = name ? String(name).toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";

        // 1. Save primary role+email key
        const primaryKey = getInsigniaStorageKey(role, email);
        localStorage.setItem(primaryKey, JSON.stringify(insigniaConfig));

        // 2. Save by global email
        if (safeEmail) {
            localStorage.setItem(`${INSIGNIA_STORAGE_PREFIX}_email_${safeEmail}`, JSON.stringify(insigniaConfig));
        }

        // 3. Save by normalized name
        if (safeName) {
            localStorage.setItem(`${INSIGNIA_STORAGE_PREFIX}_name_${safeName}`, JSON.stringify(insigniaConfig));
        }

        // 4. Legacy superadmin sync
        if (!role || safeRole.includes("super")) {
            localStorage.setItem("speakmate_superadmin_avatar", JSON.stringify(insigniaConfig));
        }

        // 5. Broadcast live update to all listening components
        window.dispatchEvent(
            new CustomEvent(INSIGNIA_CHANGED_EVENT, {
                detail: { role, email, name, insignia: insigniaConfig },
            })
        );
    } catch (e) {
        console.error("Failed to save profile insignia:", e);
    }
}

/**
 * Reset Profile Insignia to default institutional initials
 */
export function resetProfileInsignia(role, email, name = "") {
    try {
        const safeRole = String(role || "super_admin").toLowerCase().replace(/[^a-z0-9_]/g, "_");
        const safeEmail = email && email !== "default" ? String(email).toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";
        const safeName = name ? String(name).toLowerCase().replace(/[^a-z0-9_]/g, "_") : "";

        const primaryKey = getInsigniaStorageKey(role, email);
        localStorage.removeItem(primaryKey);

        if (safeEmail) {
            localStorage.removeItem(`${INSIGNIA_STORAGE_PREFIX}_email_${safeEmail}`);
        }
        if (safeName) {
            localStorage.removeItem(`${INSIGNIA_STORAGE_PREFIX}_name_${safeName}`);
        }
        if (!role || safeRole.includes("super")) {
            localStorage.removeItem("speakmate_superadmin_avatar");
        }

        window.dispatchEvent(
            new CustomEvent(INSIGNIA_CHANGED_EVENT, {
                detail: { role, email, name, insignia: { type: "initials" } },
            })
        );
    } catch (e) {
        console.error("Failed to reset profile insignia:", e);
    }
}
