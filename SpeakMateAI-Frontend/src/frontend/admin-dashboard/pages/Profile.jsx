import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    CalendarDays,
    Save,
    Pencil,
    X,
    Copy,
    Check,
    MoreHorizontal,
    CheckCircle2,
    Laptop,
    Globe2,
    Clock,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@admin/components/SectionCard";
import InsigniaBadge from "@components/common/InsigniaBadge";
import InsigniaStudioModal from "@components/common/InsigniaStudioModal";
import { adminProfileApi } from "@services/admin/adminProfileApi";
import { getIndianMobileError, normalizeIndianMobile, sanitizeMobileInput } from "@utils/phoneValidator";

/**
 * admin-dashboard/pages/Profile.jsx
 *
 * Super Admin Panel > Profile — enterprise-grade administrator account management.
 * Features:
 *  - View Mode (default, locked read-only display) vs Edit Mode (interactive inputs)
 *  - Profile Insignia Studio (portraits, calligraphy crests, 2-letter initials)
 *  - 1-Click Copy with animated feedback tooltips for Email & Phone
 *  - Active Session & Security Snapshot
 */

const ADMIN_PROFILE = {
    name: "",
    role: "Super Admin",
    email: "",
    phone: "",
    location: "",
    department: "",
    joinedAt: "",
    bio: "",
};

let adminProfileCache = null;

export function Profile() {
    const [form, setForm] = useState(() => adminProfileCache || ADMIN_PROFILE);
    const [initialForm, setInitialForm] = useState(() => adminProfileCache || ADMIN_PROFILE);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(() => !adminProfileCache);
    const [phoneError, setPhoneError] = useState("");

    // Insignia Studio Modal state
    const [isInsigniaModalOpen, setIsInsigniaModalOpen] = useState(false);

    // Kebab Menu Popover State
    const [menuOpen, setMenuOpen] = useState(false);

    // 1-Click Copy Feedback State (key -> boolean)
    const [copiedKey, setCopiedKey] = useState(null);

    // Toast State
    const [toasts, setToasts] = useState([]);

    const triggerToast = (message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3200);
    };

    const handleCopy = (text, key) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        triggerToast(`Copied ${key === "email" ? "Email" : "Phone"} to clipboard!`);
        setTimeout(() => {
            setCopiedKey((curr) => (curr === key ? null : curr));
        }, 2000);
    };

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            if (!adminProfileCache) {
                setIsLoading(true);
            }
            try {
                const res = await adminProfileApi.getProfile();
                if (res?.success && res.data && isMounted) {
                    const d = res.data;
                    const profileData = {
                        name: d.fullName || "Super Admin",
                        role: d.role === "SUPER_ADMIN" ? "Super Admin" : d.role || "Super Admin",
                        email: d.email || "",
                        phone: d.phone || "",
                        location: d.location || "",
                        department: d.department || "",
                        joinedAt: d.createdAt ? d.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
                        bio: d.designation || "Super Administrator",
                    };
                    adminProfileCache = profileData;
                    setForm(profileData);
                    setInitialForm(profileData);
                }
            } catch (err) {
                console.error("Failed to fetch admin profile:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchProfile();
        return () => {
            isMounted = false;
        };
    }, []);

    const update = (key) => (e) => {
        let val = e.target.value;
        if (key === "phone") {
            val = sanitizeMobileInput(val);
            setPhoneError("");
        }
        setForm((prev) => ({ ...prev, [key]: val }));
    };

    const handleCancel = () => {
        setForm(initialForm);
        setPhoneError("");
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (form.phone && form.phone.trim()) {
            const err = getIndianMobileError(form.phone, "Phone number", false);
            if (err) {
                setPhoneError(err);
                triggerToast(err, "error");
                return;
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                fullName: form.name,
                phone: form.phone ? normalizeIndianMobile(form.phone) : "",
                department: form.department,
                designation: form.bio,
                location: form.location,
            };
            const res = await adminProfileApi.updateProfile(payload);
            if (res?.success && res.data) {
                const d = res.data;
                const updated = {
                    name: d.fullName || form.name,
                    role: d.role === "SUPER_ADMIN" ? "Super Admin" : d.role || "Super Admin",
                    email: d.email || form.email,
                    phone: d.phone || form.phone,
                    location: d.location || form.location,
                    department: d.department || form.department,
                    joinedAt: d.createdAt ? d.createdAt.slice(0, 10) : form.joinedAt,
                    bio: d.designation || form.bio,
                };
                adminProfileCache = updated;
                setForm(updated);
                setInitialForm(updated);
                setIsEditing(false);
                triggerToast("Profile updated successfully!");
            }
        } catch (err) {
            console.error("Failed to save profile:", err);
            const msg = err.response?.data?.message || err.message || "Failed to save changes";
            triggerToast(msg, "error");
        } finally {
            setIsSaving(false);
        }
    };



    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Page header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                                Super Admin Profile
                            </h1>
                            {isEditing && (
                                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    Editing Mode
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {isLoading
                                ? "Loading profile..."
                                : isEditing
                                  ? "Make edits to your credentials and save or discard."
                                  : "Manage your super administrator identity, profile insignia, and details"}
                        </p>
                    </div>
                </div>

                {/* View Mode vs Edit Mode Header Controls */}
                <div className="flex items-center gap-2.5">
                    {!isEditing ? (
                        <Button
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                            className="!h-11 shrink-0 bg-[var(--color-primary)] shadow-md hover:shadow-[var(--color-primary)]/20 transition-all duration-200"
                        >
                            <Pencil className="mr-1.5 h-4 w-4" />
                            Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="!h-11 shrink-0 border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-all"
                            >
                                <X className="mr-1.5 h-4 w-4" />
                                Discard Changes
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                isLoading={isSaving}
                                loadingText="Saving..."
                                className="!h-11 shrink-0 bg-[var(--color-primary)] shadow-md hover:shadow-[var(--color-primary)]/20 transition-all"
                            >
                                <Save className="mr-1.5 h-4 w-4" />
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Skeleton Loading State */}
            {isLoading ? (
                <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr] lg:gap-6 animate-pulse">
                    <div className="space-y-5">
                        <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
                        <div className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
                    </div>
                    <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-700/50" />
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr] lg:gap-6 items-start">
                    {/* LEFT COLUMN: Identity Card & Footprint */}
                    <div className="space-y-5 sm:space-y-6">
                        {/* Profile Identity Card */}
                        <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-all hover:shadow-md">
                            {/* Top decorative banner */}
                            <div className="h-24 bg-gradient-to-r from-purple-600/25 via-[var(--color-primary)]/20 to-pink-500/20" />

                            <div className="p-5 sm:p-6 text-center -mt-12">
                                <div className="relative mx-auto w-fit">
                                    {/* Insignia Badge with click-to-edit Studio */}
                                    <InsigniaBadge
                                        name={form.name}
                                        role="SUPER_ADMIN"
                                        email={form.email}
                                        size="lg"
                                        showCameraOverlay={true}
                                        onClick={() => setIsInsigniaModalOpen(true)}
                                    />
                                </div>

                                <h2 className="mt-4 text-lg font-bold text-[var(--text-primary)]">
                                    {form.name}
                                </h2>
                                <p className="text-xs text-[var(--text-secondary)]">{form.email}</p>

                                <span className="mt-3.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {form.role}
                                </span>

                                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border-subtle)] pt-5 text-left">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            Department
                                        </p>
                                        <p className="mt-1 inline-flex items-center gap-1 rounded-lg bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                                            <Briefcase className="h-3 w-3" />
                                            {form.department || "Administration"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                            Member Since
                                        </p>
                                        <p className="mt-1 text-xs font-bold text-[var(--text-primary)] pl-1">
                                            {form.joinedAt}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Session & Security Snapshot Card */}
                        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                    <Laptop className="h-3.5 w-3.5" />
                                    Active Session Snapshot
                                </h3>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Now
                                </span>
                            </div>
                            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                                <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                                    <span>Client & OS</span>
                                    <span className="font-semibold text-[var(--text-primary)]">Chrome • Windows 11</span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                                    <span className="flex items-center gap-1">
                                        <Globe2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                        Approx. Location
                                    </span>
                                    <span className="font-semibold text-[var(--text-primary)]">Pune, Maharashtra, India</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                        Session Started
                                    </span>
                                    <span className="font-semibold text-[var(--text-primary)]">Today, Active Session</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Personal & Account Details */}
                    <div className="space-y-5">
                        <SectionCard
                            title="Account Details"
                            subtitle={
                                isEditing
                                    ? "Edit your contact information and public bio"
                                    : "Personal and credential information"
                            }
                            delay={0.1}
                            action={
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setMenuOpen((v) => !v)}
                                        className={`grid h-8 w-8 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none ${
                                            menuOpen ? "bg-[var(--bg-hover)] border-[var(--border-strong)]" : ""
                                        }`}
                                        aria-label="More options"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                    {menuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                            <div className="absolute right-0 mt-1.5 w-48 z-20 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        setIsInsigniaModalOpen(true);
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Update Insignia
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setMenuOpen(false);
                                                        handleExportProfile();
                                                    }}
                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                                >
                                                    <Download className="h-3.5 w-3.5" />
                                                    Export Profile JSON
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            }
                        >
                            {/* IF IN EDIT MODE: Render Active Form Inputs */}
                            {isEditing ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                            Full Name
                                        </label>
                                        <Input value={form.name} onChange={update("name")} />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                            Email Address (System Fixed)
                                        </label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <Input
                                                type="email"
                                                value={form.email}
                                                disabled={true}
                                                className="!pl-9 opacity-70 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <Input
                                                value={form.phone}
                                                placeholder="e.g. 9876543210"
                                                onChange={update("phone")}
                                                error={phoneError}
                                                className="!pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                            Location / City
                                        </label>
                                        <div className="relative">
                                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <Input
                                                value={form.location}
                                                placeholder="e.g. Pune, Maharashtra"
                                                onChange={update("location")}
                                                className="!pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <Input
                                                value={form.department}
                                                placeholder="e.g. Executive Operations"
                                                onChange={update("department")}
                                                className="!pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                            Member Since
                                        </label>
                                        <div className="relative">
                                            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <Input
                                                value={form.joinedAt}
                                                disabled={true}
                                                className="!pl-9 opacity-70 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 pb-2">
                                        <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                            Bio & Designation
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={form.bio}
                                            onChange={update("bio")}
                                            placeholder="Brief introduction or role description..."
                                            className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3.5 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 transition shadow-sm"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* IF IN VIEW MODE: Sleek Read-Only Typography Display Cards */
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {/* Full Name */}
                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                Full Name
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                                                {form.name || "Super Admin"}
                                            </p>
                                        </div>

                                        {/* Email Address with 1-Click Copy */}
                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                                    <Mail className="h-3.5 w-3.5" />
                                                    Email Address
                                                </p>
                                                {form.email && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(form.email, "email")}
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
                                                    >
                                                        {copiedKey === "email" ? (
                                                            <>
                                                                <Check className="h-3 w-3 text-emerald-500" />
                                                                <span className="text-emerald-500">Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3 w-3" />
                                                                <span>Copy</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            <a
                                                href={`mailto:${form.email}`}
                                                className="mt-1 block text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition"
                                            >
                                                {form.email || "admin@speakmate.ai"}
                                            </a>
                                        </div>

                                        {/* Phone Number with 1-Click Copy */}
                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    Phone Number
                                                </p>
                                                {form.phone && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopy(form.phone, "phone")}
                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
                                                    >
                                                        {copiedKey === "phone" ? (
                                                            <>
                                                                <Check className="h-3 w-3 text-emerald-500" />
                                                                <span className="text-emerald-500">Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3 w-3" />
                                                                <span>Copy</span>
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            {form.phone ? (
                                                <a
                                                    href={`tel:${form.phone}`}
                                                    className="mt-1 block text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--color-primary)] transition"
                                                >
                                                    {form.phone}
                                                </a>
                                            ) : (
                                                <span className="mt-1 inline-block text-xs italic text-[var(--text-muted)]">
                                                    Not specified
                                                </span>
                                            )}
                                        </div>

                                        {/* Location */}
                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" />
                                                Location
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                                {form.location || (
                                                    <span className="text-xs italic text-[var(--text-muted)]">
                                                        Not specified
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Department */}
                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5" />
                                                Department
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                                {form.department || "Executive Operations"}
                                            </p>
                                        </div>

                                        {/* Joined On */}
                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                Joined On
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                                {form.joinedAt || "2026-08-20"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bio */}
                                    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-4">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                                            Administrator Bio
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                            {form.bio || "Super Administrator of SpeakMate AI institutional platform."}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </SectionCard>
                    </div>
                </div>
            )}

            {/* Profile Insignia Studio Modal */}
            <InsigniaStudioModal
                isOpen={isInsigniaModalOpen}
                onClose={() => setIsInsigniaModalOpen(false)}
                role="SUPER_ADMIN"
                name={form.name}
                email={form.email}
                onInsigniaUpdated={(msg) => triggerToast(msg)}
            />

            {/* Toast Notifications */}
            <div className="fixed bottom-5 right-5 z-[250] flex flex-col gap-2 max-w-sm w-full">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            role="status"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="flex items-center gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-primary)] shadow-2xl backdrop-blur-md"
                        >
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            <span className="font-semibold text-xs">{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Profile;
