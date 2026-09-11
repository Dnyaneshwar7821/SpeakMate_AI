import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Phone,
    MapPin,
    Briefcase,
    CalendarDays,
    Save,
    Building,
    Key,
    Lock,
    CheckCircle2,
    Pencil,
    Loader2,
    X,
    Copy,
    Check,
    Laptop,
    Globe2,
    Clock,
    School,
    Users,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@school-admin/components/SectionCard";
import InsigniaBadge from "@components/common/InsigniaBadge";
import InsigniaStudioModal from "@components/common/InsigniaStudioModal";
import ROUTES from "@constants/routes";
import { useAuth } from "@/Admin_panel/context/AuthContext";
import { schoolAdminDataApi } from "@services/admin/schoolAdminDataApi";

export function Profile() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Insignia Studio Modal
    const [isInsigniaModalOpen, setIsInsigniaModalOpen] = useState(false);

    // 1-Click Copy Feedback State
    const [copiedKey, setCopiedKey] = useState(null);

    // Toast state
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

    const [form, setForm] = useState({
        name: user?.name || "School Admin",
        role: "SCHOOL_ADMIN",
        email: user?.email || "",
        phone: "",
        location: "",
        department: "School Administration",
        joinedAt: new Date().toISOString().slice(0, 10),
        bio: "School Administrator for institutional speaking tests and student performance tracking on SpeakMate AI.",
        schoolName: "",
        schoolCode: "",
        schoolEmail: "",
        totalStudents: 0,
        twoFactorEnabled: true,
    });

    const [initialForm, setInitialForm] = useState(form);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const data = await schoolAdminDataApi.getProfile();
                let stats = {};
                try {
                    stats = await schoolAdminDataApi.getDashboardStats();
                } catch (err) {
                    console.error("Failed to load dashboard stats in profile:", err);
                }

                const fullName =
                    `${data.firstName || ""} ${data.lastName || ""}`.trim() || user?.name || "School Admin";
                const joinedDate = data.createdAt
                    ? new Date(data.createdAt).toISOString().slice(0, 10)
                    : new Date().toISOString().slice(0, 10);

                const loaded = {
                    name: fullName,
                    role: data.role || "SCHOOL_ADMIN",
                    email: data.email || user?.email || "",
                    phone: data.phone || stats.adminPhone || "",
                    location: stats.schoolAddress || "",
                    department: "School Administration",
                    joinedAt: joinedDate,
                    bio:
                        data.bio ||
                        "School Administrator for institutional speaking tests and student performance tracking on SpeakMate AI.",
                    schoolName: stats.schoolName || "",
                    schoolCode: stats.schoolCode || "",
                    schoolEmail: stats.schoolEmail || "",
                    totalStudents: stats.totalStudents || 0,
                    twoFactorEnabled: true,
                };
                setForm(loaded);
                setInitialForm(loaded);
            } catch (err) {
                console.error("Failed to load school admin profile:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const update = (key) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleCancel = () => {
        setForm(initialForm);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const [firstName = "", ...lastNameParts] = (form.name || "").split(" ");
            const lastName = lastNameParts.join(" ") || "";
            await schoolAdminDataApi.updateProfile({
                firstName,
                lastName,
                email: form.email,
            });
            setSaved(true);
            setInitialForm(form);
            setIsEditing(false);
            triggerToast("Profile updated successfully!");
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Failed to save profile:", err);
            triggerToast(err?.response?.data?.message || "Failed to update profile.", "error");
        } finally {
            setIsSaving(false);
        }
    };



    const maxCapacity = 500;
    const capacityPct = Math.min(100, Math.round(((form.totalStudents || 0) / maxCapacity) * 100));

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Briefcase className="h-5 w-5" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                                School Admin Profile
                            </h1>
                            {isEditing && (
                                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    Editing Mode
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {isLoading
                                ? "Loading admin profile..."
                                : isEditing
                                  ? "Make edits to your credentials and save or discard."
                                  : "Manage your administrator account, institutional insignia, and school profile"}
                        </p>
                    </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-2.5">
                    {!isEditing ? (
                        <Button
                            className="!h-11 shrink-0"
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                        >
                            <Pencil className="mr-1.5 h-4 w-4" />
                            Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                className="!h-11 shrink-0"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                <X className="mr-1.5 h-4 w-4" />
                                Discard Changes
                            </Button>
                            <Button
                                className={`!h-11 shrink-0 transition-colors ${
                                    saved ? "!bg-emerald-500 !text-white hover:!bg-emerald-600" : ""
                                }`}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {saved ? (
                                    <>
                                        <CheckCircle2 className="mr-1.5 h-4 w-4" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        {isSaving ? (
                                            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="mr-1.5 h-4 w-4" />
                                        )}
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 text-[var(--text-muted)]">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                    <p className="mt-3 text-xs font-medium">Loading admin profile...</p>
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr] lg:gap-6 relative items-start">
                    {/* LEFT COLUMN: Identity & Footprint */}
                    <div className="space-y-5 sm:space-y-6 sticky top-24">
                        {/* Profile Overview Card */}
                        <SectionCard delay={0.05} bodyClassName="text-center relative overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-[var(--color-primary)] to-purple-500 opacity-20" />

                            <div className="relative mx-auto w-fit mt-6">
                                <InsigniaBadge
                                    name={form.name}
                                    role="SCHOOL_ADMIN"
                                    email={form.email}
                                    size="lg"
                                    showCameraOverlay={true}
                                    onClick={() => setIsInsigniaModalOpen(true)}
                                />
                            </div>

                            <h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
                                {form.name}
                            </h2>
                            <p className="text-sm font-medium text-[var(--text-secondary)]">{form.email}</p>
                            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider border border-[var(--color-primary)]/20">
                                <School className="h-3.5 w-3.5" />
                                {form.schoolName || "Institutional Admin"}
                            </span>

                            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--border-subtle)] pt-5 text-left">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                        Department
                                    </p>
                                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 truncate">
                                        {form.department}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                        Member Since
                                    </p>
                                    <p className="text-sm font-semibold text-[var(--text-primary)] mt-1">
                                        {form.joinedAt}
                                    </p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Student Capacity / Subscription Widget */}
                        <SectionCard delay={0.1}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                    <span className="text-[var(--color-primary)]">💎</span> Institutional Plan
                                </h3>
                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    Active
                                </span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-semibold">
                                    <span className="text-[var(--text-secondary)]">Student Capacity</span>
                                    <span className="text-[var(--text-primary)]">
                                        {form.totalStudents} / {maxCapacity}
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                        style={{ width: `${capacityPct}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] mt-2">
                                    Full institutional speaking test coverage enabled.
                                </p>
                            </div>
                        </SectionCard>

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
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        Web Client • Secure Portal
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)]">
                                    <span className="flex items-center gap-1">
                                        <Globe2 className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                        Campus Network
                                    </span>
                                    <span className="font-semibold text-[var(--text-primary)]">
                                        {form.location || "Authorized School Network"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                        Session Status
                                    </span>
                                    <span className="font-semibold text-[var(--text-primary)]">Authenticated</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Account & School Information */}
                    <div className="space-y-5 sm:space-y-6">
                        {/* Personal Account Details */}
                        <SectionCard
                            title="Personal Details"
                            subtitle={
                                isEditing
                                    ? "Update your personal and contact details"
                                    : "Personal administrator credentials"
                            }
                            delay={0.15}
                            action={null}
                        >
                            {isEditing ? (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                            Full Name
                                        </label>
                                        <Input value={form.name} onChange={update("name")} />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <Input
                                                type="email"
                                                value={form.email}
                                                onChange={update("email")}
                                                className="!pl-9"
                                                disabled={true}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                            <Input
                                                value={form.phone}
                                                onChange={update("phone")}
                                                className="!pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                            Administrator Bio
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={form.bio}
                                            onChange={update("bio")}
                                            className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                                Full Name
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                                                {form.name}
                                            </p>
                                        </div>

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
                                                {form.email}
                                            </a>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-3.5 sm:col-span-2">
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
                                    </div>

                                    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-hover)]/30 p-4">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                                            Administrator Bio
                                        </p>
                                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                            {form.bio}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </SectionCard>

                        {/* School Details */}
                        <SectionCard
                            title="School Information"
                            subtitle="Institutional campus profile and identifiers"
                            delay={0.2}
                            action={null}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                        School Name
                                    </label>
                                    <div className="relative">
                                        <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <Input
                                            value={form.schoolName}
                                            onChange={update("schoolName")}
                                            className="!pl-9"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                        School Code
                                    </label>
                                    <Input
                                        value={form.schoolCode}
                                        onChange={update("schoolCode")}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                        Support Email
                                    </label>
                                    <Input
                                        value={form.schoolEmail}
                                        onChange={update("schoolEmail")}
                                        disabled={!isEditing}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                        Campus Location
                                    </label>
                                    <div className="relative">
                                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                        <Input
                                            value={form.location}
                                            onChange={update("location")}
                                            className="!pl-9"
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Security Details */}
                        <SectionCard
                            title="Security"
                            subtitle="Administrator credentials & security management"
                            delay={0.25}
                            action={null}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-[var(--border-subtle)] p-4 rounded-xl bg-[var(--bg-elevated)]">
                                    <div>
                                        <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                            <Key className="h-4 w-4 text-[var(--color-primary)]" />
                                            Password
                                        </h4>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                                            Protect your administrative privileges
                                        </p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        className="mt-3 sm:mt-0 !h-9 text-xs"
                                        onClick={() =>
                                            navigate(ROUTES.SCHOOL_ADMIN_SETTINGS, {
                                                state: { activeTab: "password" },
                                            })
                                        }
                                    >
                                        Update Password
                                    </Button>
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>
            )}

            {/* Profile Insignia Studio Modal */}
            <InsigniaStudioModal
                isOpen={isInsigniaModalOpen}
                onClose={() => setIsInsigniaModalOpen(false)}
                role="SCHOOL_ADMIN"
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
