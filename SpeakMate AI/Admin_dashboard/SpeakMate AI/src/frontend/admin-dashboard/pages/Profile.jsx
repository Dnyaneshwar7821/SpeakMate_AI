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
    Camera,
    MoreHorizontal,
    CheckCircle2,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@admin/components/SectionCard";

/**
 * admin-dashboard/pages/Profile.jsx
 *
 * Super Admin Panel > Profile — super admin account details, editable form and role info.
 * Frontend-only; values are local state and can be wired to an API later.
 */

const ADMIN_PROFILE = {
    name: "Dnyaneshwar Algule",
    role: "Super Admin",
    email: "admin@speakmate.ai",
    phone: "+91 98765 43210",
    location: "Pune, Maharashtra, India",
    department: "Platform Operations",
    joinedAt: "2025-01-15",
    bio: "Responsible for overseeing users, content, subscriptions and platform health on SpeakMate AI.",
};

export function Profile() {
    const [form, setForm] = useState(ADMIN_PROFILE);

    // Kebab Menu Popover State
    const [menuOpen, setMenuOpen] = useState(false);

    // Cosmetic Toast State
    const [toasts, setToasts] = useState([]);

    const triggerToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const handleSave = () => {
        triggerToast("Changes saved successfully!");
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
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Super Admin Profile
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Manage your super administrator account details
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    className="!h-11 shrink-0 bg-[var(--color-primary)] shadow-md hover:shadow-[var(--color-primary)]/20 transition-all duration-200"
                >
                    <Save className="mr-1.5 h-4 w-4" />
                    Save Changes
                </Button>
            </motion.div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr] lg:gap-6">
                {/* Left: identity card */}
                <div className="space-y-5 sm:space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-md">
                        {/* Top banner accent color */}
                        <div className="h-24 bg-gradient-to-r from-purple-600/20 via-[var(--color-primary)]/20 to-pink-500/20" />
                        
                        <div className="p-5 sm:p-6 text-center -mt-12">
                            <div className="relative mx-auto w-fit">
                                <button
                                    type="button"
                                    onClick={() => triggerToast("Avatar upload coming soon!")}
                                    className="group relative block rounded-full focus:outline-none"
                                    aria-label="Change avatar"
                                >
                                    <div className="grid h-24 w-24 place-items-center rounded-full bg-[var(--color-primary)]/15 text-4xl ring-4 ring-[var(--bg-surface)] transition-all duration-300 group-hover:scale-95 group-hover:brightness-95">
                                        🛡️
                                    </div>
                                    <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full bg-purple-600 text-white shadow-lg ring-2 ring-[var(--bg-surface)] transition-transform duration-300 group-hover:scale-110">
                                        <Camera size={14} />
                                    </span>
                                </button>
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
                                        {form.department}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                        Member Since
                                    </p>
                                    <p className="mt-1.5 text-sm font-bold text-[var(--text-primary)] pl-1">
                                        {form.joinedAt}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: editable details */}
                <SectionCard
                    title="Account Details"
                    subtitle="Update your personal and contact information"
                    delay={0.10}
                    action={
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                className={`grid h-8 w-8 place-items-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none ${menuOpen ? "bg-[var(--bg-hover)] border-[var(--border-strong)] text-[var(--text-primary)]" : ""}`}
                                aria-label="More options"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </button>
                            {menuOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                    <div className="absolute right-0 mt-1.5 w-44 z-20 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-lg">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                triggerToast("Account settings are up to date!");
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                                        >
                                            Check Status
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    }
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                Full Name
                            </label>
                            <Input value={form.name} onChange={update("name")} />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={update("email")}
                                    className="!pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                Phone
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

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                <Input
                                    value={form.location}
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
                                    onChange={update("department")}
                                    className="!pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                Joined On
                            </label>
                            <div className="relative">
                                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                                <Input
                                    value={form.joinedAt}
                                    onChange={update("joinedAt")}
                                    className="!pl-9"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2 pb-2">
                            <label className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
                                Bio
                            </label>
                            <textarea
                                rows={4}
                                value={form.bio}
                                onChange={update("bio")}
                                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400 dark:focus:ring-indigo-500/20 transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Toast Notifications */}
            <div className="fixed bottom-5 right-5 z-[150] flex flex-col gap-2 max-w-sm w-full">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            role="status"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            <span className="font-medium">{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Profile;
