import { useState } from "react";
import { motion } from "framer-motion";
import {
    Settings as SettingsIcon,
    Bell,
    Globe,
    Moon,
    Shield,
    Database,
    HelpCircle,
    Save,
    RotateCcw,
    ExternalLink,
    Check,
} from "lucide-react";

import Button from "@components/common/Button";
import SectionCard from "@school-admin/components/SectionCard";
import { useTheme } from "@context/ThemeContext";

const TABS = [
    { id: "password", label: "Change Password", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "language", label: "Language", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "backup", label: "Backup & Restore", icon: Database },
    { id: "help", label: "Help & Support", icon: HelpCircle },
];

function Toggle({ checked, onChange, label, description, icon: Icon }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <div className="flex items-start gap-3">
                {Icon && (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Icon className="h-4 w-4" />
                    </span>
                )}
                <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                    {description && (
                        <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{description}</p>
                    )}
                </div>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    checked ? "bg-[var(--color-primary)]" : "bg-[var(--border-default)]"
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        checked ? "translate-x-6" : "translate-x-1"
                    }`}
                />
            </button>
        </div>
    );
}

export function Settings() {
    const { isDark, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("appearance");

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const [prefs, setPrefs] = useState({
        darkMode: false,
        emailAlerts: true,
        pushAlerts: true,
        language: "English",
        twoFactor: true,
        loginAlerts: true,
    });

    const [savedMsg, setSavedMsg] = useState(false);

    const setPref = (key) => (val) => setPrefs((prev) => ({ ...prev, [key]: val }));

    const handleSave = (e) => {
        if (e) e.preventDefault();
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
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
                        <SettingsIcon className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Settings
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Manage preferences, security, backups, and support
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {savedMsg && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                            <Check className="h-4 w-4" /> Saved!
                        </span>
                    )}
                    <Button onClick={handleSave} className="!h-11 shrink-0">
                        <Save className="mr-1.5 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 shadow-[var(--shadow-sm)]">
                        <nav className="flex flex-col gap-1">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={[
                                            "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 text-left",
                                            isActive
                                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold shadow-sm"
                                                : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-[var(--color-primary)] text-white"
                                                    : "bg-[var(--border-subtle)] text-[var(--text-secondary)]",
                                            ].join(" ")}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <span className="truncate">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <div className="lg:col-span-8 xl:col-span-9">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === "password" && (
                            <SectionCard title="Change Password" subtitle="Update your account password regularly to stay secure">
                                <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            value={passwords.current}
                                            onChange={(e) =>
                                                setPasswords({ ...passwords, current: e.target.value })
                                            }
                                            className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-primary)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={passwords.new}
                                            onChange={(e) =>
                                                setPasswords({ ...passwords, new: e.target.value })
                                            }
                                            className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-primary)]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={passwords.confirm}
                                            onChange={(e) =>
                                                setPasswords({ ...passwords, confirm: e.target.value })
                                            }
                                            className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-primary)]"
                                        />
                                    </div>

                                    {passwords.current && passwords.new && passwords.confirm && (
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                className="h-10 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-medium text-white transition hover:bg-[var(--color-primary-hover)] active:scale-95"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </SectionCard>
                        )}

                        {activeTab === "appearance" && (
                            <SectionCard
                                title="Appearance"
                                subtitle="Customize how the school admin dashboard looks"
                            >
                                <Toggle
                                    icon={Moon}
                                    label="Dark Mode"
                                    description="Use a darker theme across the school admin dashboard"
                                    checked={isDark}
                                    onChange={toggleTheme}
                                />
                            </SectionCard>
                        )}

                        {activeTab === "notifications" && (
                            <SectionCard
                                title="Notifications"
                                subtitle="Manage your notification and alert preferences"
                            >
                                <div className="space-y-3">
                                    <Toggle
                                        icon={Bell}
                                        label="Email Notifications"
                                        description="Receive email updates for critical activity"
                                        checked={prefs.emailAlerts}
                                        onChange={setPref("emailAlerts")}
                                    />
                                    <Toggle
                                        icon={Bell}
                                        label="Push Notifications"
                                        description="Receive desktop alerts while active"
                                        checked={prefs.pushAlerts}
                                        onChange={setPref("pushAlerts")}
                                    />
                                </div>
                            </SectionCard>
                        )}

                        {activeTab === "language" && (
                            <SectionCard
                                title="Language"
                                subtitle="Select your preferred display language"
                            >
                                <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 max-w-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                            <Globe className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                Display Language
                                            </p>
                                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                                System language settings
                                            </p>
                                        </div>
                                    </div>
                                    <select
                                        value={prefs.language}
                                        onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                                        className="h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm font-medium text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
                                    >
                                        <option value="English">English</option>
                                        <option value="Hindi">हिन्दी (Hindi)</option>
                                        <option value="Marathi">मराठी (Marathi)</option>
                                    </select>
                                </div>
                            </SectionCard>
                        )}

                        {activeTab === "security" && (
                            <SectionCard
                                title="Security"
                                subtitle="Configure security features for your account"
                            >
                                <div className="space-y-3">
                                    <Toggle
                                        icon={Shield}
                                        label="Two-Factor Authentication (2FA)"
                                        description="Require a security code when logging in"
                                        checked={prefs.twoFactor}
                                        onChange={setPref("twoFactor")}
                                    />
                                    <Toggle
                                        icon={Shield}
                                        label="Unrecognized Device Alerts"
                                        description="Notify when account is accessed from a new device"
                                        checked={prefs.loginAlerts}
                                        onChange={setPref("loginAlerts")}
                                    />
                                </div>
                            </SectionCard>
                        )}

                        {activeTab === "backup" && (
                            <SectionCard
                                title="Backup & Restore"
                                subtitle="Manage school data backups and recovery"
                            >
                                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-4 max-w-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                            <Database className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                Database Backup
                                            </p>
                                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                                Last automated backup:{" "}
                                                <span className="font-medium text-[var(--text-primary)]">
                                                    Today at 04:00 AM
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 pt-1">
                                        <Button onClick={handleSave} className="!h-9 text-xs">
                                            <Database className="mr-1.5 h-3.5 w-3.5" />
                                            Backup Now
                                        </Button>
                                        <Button onClick={handleSave} variant="secondary" className="!h-9 text-xs">
                                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                            Restore Backup
                                        </Button>
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {activeTab === "help" && (
                            <SectionCard title="Help & Support" subtitle="Get assistance or view documentation">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 max-w-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                            <HelpCircle className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                Technical Support & Documentation
                                            </p>
                                            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                                                Need help or have questions about the school admin panel?
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" className="!h-9 shrink-0 text-xs">
                                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                                        Contact Support
                                    </Button>
                                </div>
                            </SectionCard>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
