import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Briefcase, CalendarDays, Save, Camera, Shield, Building, Key, Lock, CheckCircle2, Pencil } from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";

import SectionCard from "@school-admin/components/SectionCard";
import { getInitials } from "@utils/formatters";
import ROUTES from "@constants/routes";

const SCHOOL_ADMIN_PROFILE = {
    name: "Rajesh Kumar",
    role: "School Admin",
    email: "school.admin@speakmate.ai",
    phone: "+1 212-555-0198",
    location: "New York, NY",
    department: "Academic Coordination",
    joinedAt: "2025-01-15",
    bio: "Responsible for managing students, tests, results and day-to-day school operations on SpeakMate AI.",
    schoolName: "Greenwood High",
    schoolCode: "GH-4592",
    schoolEmail: "contact@greenwoodhigh.edu",
    twoFactorEnabled: true
};

export function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(SCHOOL_ADMIN_PROFILE);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const update = (key) => (e) => {
        // Handle checkbox vs text input
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSaved(true);
            setIsEditing(false);
            setTimeout(() => setSaved(false), 2000);
        }, 800);
    };

    return (
        <div className="space-y-5 sm:space-y-6">
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
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            School Admin Profile
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Manage your administrator account and school settings
                        </p>
                    </div>
                </div>
                {!isEditing ? (
                    <Button 
                        className="!h-11 shrink-0"
                        onClick={() => setIsEditing(true)}
                    >
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <Button 
                        className={`!h-11 shrink-0 transition-colors ${saved ? '!bg-emerald-500 !text-white hover:!bg-emerald-600' : ''}`}
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
                                <Save className="mr-1.5 h-4 w-4" />
                                {isSaving ? "Saving..." : "Save Changes"}
                            </>
                        )}
                    </Button>
                )}
            </motion.div>

            <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr] lg:gap-6 relative items-start">
                {/* LEFT COLUMN */}
                <div className="space-y-5 sm:space-y-6 sticky top-24">
                    {/* Profile Overview Card */}
                    <SectionCard delay={0.05} bodyClassName="text-center relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-[var(--color-primary)] to-purple-500 opacity-20" />
                        
                        <div className="relative mx-auto w-fit mt-6">
                            <div className="group relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-black text-white ring-4 ring-[var(--bg-surface)] shadow-lg overflow-hidden cursor-pointer transition-transform hover:scale-105">
                                {getInitials(form.name)}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
                            {form.name}
                        </h2>
                        <p className="text-sm font-medium text-[var(--text-secondary)]">{form.email}</p>
                        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                            <Shield className="h-3.5 w-3.5" />
                            {form.role}
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

                    {/* Subscription Widget */}
                    <SectionCard delay={0.1}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                <span className="text-[var(--color-primary)]">💎</span> Enterprise Plan
                            </h3>
                            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold">
                                <span className="text-[var(--text-secondary)]">Student Capacity</span>
                                <span className="text-[var(--text-primary)]">123 / 500</span>
                            </div>
                            <div className="h-2.5 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '25%' }} />
                            </div>
                            <p className="text-[11px] text-[var(--text-muted)] mt-2">Billing cycle resets in 14 days.</p>
                        </div>
                    </SectionCard>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-5 sm:space-y-6">
                    {/* Personal Account Details */}
                    <SectionCard
                        title="Personal Details"
                        subtitle="Update your contact and professional information"
                        delay={0.15}
                        action={null}
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                    Full Name
                                </label>
                                <Input value={form.name} onChange={update("name")} disabled={!isEditing} />
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
                                        disabled={!isEditing}
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
                                        disabled={!isEditing}
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
                                    disabled={!isEditing}
                                    className="w-full resize-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* School Details */}
                    <SectionCard
                        title="School Information"
                        subtitle="Manage the global profile for your institution"
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
                                <Input value={form.schoolCode} onChange={update("schoolCode")} disabled={!isEditing} />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-[var(--text-secondary)]">
                                    Support Email
                                </label>
                                <Input value={form.schoolEmail} onChange={update("schoolEmail")} disabled={!isEditing} />
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
                        subtitle="Keep your admin account secure"
                        delay={0.25}
                        action={null}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-[var(--border-subtle)] p-4 rounded-xl bg-[var(--bg-elevated)]">
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <Key className="h-4 w-4 text-[var(--color-primary)]" />
                                        Password
                                    </h4>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">Last changed 3 months ago</p>
                                </div>
                                <Button 
                                    variant="secondary" 
                                    className="mt-3 sm:mt-0 !h-9"
                                    onClick={() => navigate(ROUTES.SCHOOL_ADMIN_SETTINGS)}
                                >
                                    Update Password
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-[var(--border-subtle)] p-4 rounded-xl bg-[var(--bg-elevated)]">
                                <div>
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-emerald-500" />
                                        Two-Factor Authentication
                                    </h4>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1">Add an extra layer of security to your account</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer mt-3 sm:mt-0">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={form.twoFactorEnabled}
                                        onChange={update("twoFactorEnabled")}
                                        disabled={!isEditing}
                                    />
                                    <div className={`w-11 h-6 bg-[var(--border-default)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)] ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}></div>
                                </label>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}

export default Profile;
