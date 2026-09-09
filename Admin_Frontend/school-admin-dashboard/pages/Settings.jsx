import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Settings as SettingsIcon,
    Bell,
    Moon,
    Shield,
    Database,
    HelpCircle,
    Save,
    RotateCcw,
    ExternalLink,
    Check,
    Loader2,
    AlertCircle,
    Globe,
    CreditCard,
    Cpu,
    AlertTriangle,
    Sun,
    Laptop,
    Trash2,
    Info,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";
import SectionCard from "@school-admin/components/SectionCard";
import { useTheme } from "@context/ThemeContext";
import { schoolAdminDataApi } from "../../src/services/schoolAdminDataApi";

const ACCENT_COLORS = [
    { id: "purple", label: "Purple (Brand)", color: "bg-purple-600" },
    { id: "indigo", label: "Indigo", color: "bg-indigo-600" },
    { id: "rose", label: "Rose", color: "bg-rose-600" },
    { id: "blue", label: "Blue", color: "bg-blue-600" },
    { id: "emerald", label: "Emerald", color: "bg-emerald-600" },
    { id: "amber", label: "Amber", color: "bg-amber-600" },
];

const TABS = [
    { id: "general", label: "General", icon: Globe },
    { id: "account", label: "Account & Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "integrations", label: "Integrations", icon: Cpu },
    { id: "backup", label: "Backup & Restore", icon: Database },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
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
    const location = useLocation();
    const navigate = useNavigate();
    const { theme, setTheme, accent: accentColor, setAccent: setAccentColor, sidebarDensity, setSidebarDensity } = useTheme();
    const [activeTab, setActiveTab] = useState(() => {
        return location.state?.activeTab || "general";
    });

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        } else {
            const params = new URLSearchParams(location.search);
            const tabParam = params.get("tab");
            if (tabParam) {
                setActiveTab(tabParam);
            }
        }
    }, [location]);

    const [selectedThemeCard, setSelectedThemeCard] = useState(theme);

    // Integrations States
    const [integrations, setIntegrations] = useState({
        google: true,
        slack: false,
        zoom: false,
        stripe: true,
    });

    const toggleIntegration = (key, name) => {
        setIntegrations((prev) => {
            const nextVal = !prev[key];
            setToast({ message: `${name} is now ${nextVal ? "Connected" : "Disconnected"}.`, type: "success" });
            setTimeout(() => setToast(null), 3000);
            return { ...prev, [key]: nextVal };
        });
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [toast, setToast] = useState(null);
    const [lastBackupDate, setLastBackupDate] = useState(() => localStorage.getItem("lastBackupDate"));

    const formatBackupDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });

    const [prefs, setPrefs] = useState({
        darkMode: false,
        emailAlerts: true,
        pushAlerts: true,
        twoFactor: true,
        loginAlerts: true,
    });

    const [generalSettings, setGeneralSettings] = useState({
        schoolName: "Delhi Public School",
        contactEmail: "admin@dps.edu.in",
        contactPhone: "+91 9876543210",
        address: "Sector 12, Dwarka, New Delhi",
        language: "English",
        timezone: "Asia/Kolkata (IST)",
        academicYear: "2025-2026",
        dateFormat: "MM/DD/YYYY"
    });

    const [isEditingGeneral, setIsEditingGeneral] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const res = await schoolAdminDataApi.getSettings();
                const data = res?.data || res;
                if (data) {
                    setPrefs((prev) => ({
                        ...prev,
                        darkMode: data.darkMode ?? (theme === "dark"),
                        emailAlerts: data.emailNotificationsEnabled ?? data.notificationsEnabled ?? true,
                        pushAlerts: data.pushNotificationsEnabled ?? data.notificationsEnabled ?? true,
                        twoFactor: data.twoFactorEnabled ?? true,
                    }));
                }
            } catch (err) {
                console.error("Failed to load settings from API:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const setPref = (key) => (val) => setPrefs((prev) => ({ ...prev, [key]: val }));

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        setToast(null);
        try {
            await Promise.all([
                schoolAdminDataApi.updateSettings({
                    darkMode: theme === "dark",
                    notificationsEnabled: prefs.emailAlerts || prefs.pushAlerts,
                    emailNotificationsEnabled: prefs.emailAlerts,
                    pushNotificationsEnabled: prefs.pushAlerts,
                }),
                schoolAdminDataApi.updateTwoFactor(prefs.twoFactor),
            ]);
            setToast({ message: "Settings saved successfully!", type: "success" });
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            console.error("Failed to save settings:", err);
            setToast({
                message: err?.response?.data?.message || "Failed to save settings.",
                type: "error",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setToast({ message: "Please fill in all password fields.", type: "error" });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setToast({ message: "New passwords do not match.", type: "error" });
            return;
        }
        if (passwords.new.length < 8) {
            setToast({ message: "New password must be at least 8 characters long.", type: "error" });
            return;
        }

        setIsChangingPassword(true);
        setToast(null);
        try {
            await schoolAdminDataApi.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
                confirmPassword: passwords.confirm,
            });
            setPasswords({ current: "", new: "", confirm: "" });
            setToast({ message: "Password updated successfully!", type: "success" });
            setIsEditingPassword(false);
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            console.error("Failed to change password:", err);
            setToast({
                message: err?.response?.data?.message || "Failed to update password. Please check your current password.",
                type: "error",
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleBackupAction = async (actionType) => {
        setIsSaving(true);
        setToast(null);
        try {
            if (actionType === "backup") {
                const blob = await schoolAdminDataApi.downloadBackup();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "speakmate_backup.json");
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                
                const now = new Date().toISOString();
                localStorage.setItem("lastBackupDate", now);
                setLastBackupDate(now);
                
                setToast({ message: "Database backup downloaded successfully!", type: "success" });
            } else {
                setToast({ message: "Restore functionality coming soon!", type: "info" });
            }
        } catch (err) {
            console.error("Backup action failed:", err);
            setToast({ message: "Failed to perform backup action.", type: "error" });
        } finally {
            setIsSaving(false);
            setTimeout(() => setToast(null), 3000);
        }
    };

    const handleResetPlatform = async () => {
        setIsResetModalOpen(false);

        setIsSaving(true);
        try {
            await schoolAdminDataApi.resetPlatform();
            setToast({ message: "Platform data reset successfully. Settings restored to defaults.", type: "success" });
            setTimeout(() => window.location.reload(), 2000); // Reload to apply default settings
        } catch (err) {
            console.error("Reset failed:", err);
            setToast({ message: "Failed to reset platform.", type: "error" });
            setTimeout(() => setToast(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeactivatePlatform = async () => {
        setIsDeactivateModalOpen(false);

        setIsSaving(true);
        try {
            await schoolAdminDataApi.deactivatePlatform();
            setToast({ message: "Platform deactivated. Logging you out...", type: "success" });
            setTimeout(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Deactivation failed:", err);
            setToast({ message: "Failed to deactivate platform.", type: "error" });
            setTimeout(() => setToast(null), 3000);
            setIsSaving(false);
        }
    };

    const handleThemeChange = async (newTheme) => {
        setSelectedThemeCard(newTheme);
        setTheme(newTheme);
        schoolAdminDataApi.updateSettings({
            darkMode: newTheme === "dark",
        }).catch((err) => console.error("Failed to update appearance in DB:", err));
        setToast({ message: `Theme updated to ${newTheme} mode.`, type: "success" });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAccentChange = (col) => {
        setAccentColor(col);
        setToast({ message: "Accent color updated.", type: "success" });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDensityChange = (val) => {
        setSidebarDensity(val);
        setToast({ message: "Sidebar density updated.", type: "success" });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSaveGeneral = async (e) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            // Mock API Call
            await new Promise((resolve) => setTimeout(resolve, 800));
            setToast({ message: "General Settings saved successfully!", type: "success" });
            setIsEditingGeneral(false);
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast({ message: "Failed to save General Settings", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
            >
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-purple-700 dark:text-purple-400">
                        SCHOOL ADMIN / SETTINGS
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
                        Settings
                    </h1>
                    <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Manage platform configuration and preferences
                    </p>
                </div>
                {/* Toast Notification */}
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm border ${
                            toast.type === "success" 
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400" 
                                : "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400"
                        }`}
                    >
                        {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {toast.message}
                    </motion.div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-4 xl:col-span-3">
                    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 shadow-[var(--shadow-sm)]">
                        <nav className="flex flex-row overflow-x-auto gap-1 lg:flex-col no-scrollbar p-1 lg:p-0">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={[
                                            "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 text-left shrink-0",
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
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-12 text-[var(--text-muted)]">
                                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                                <p className="mt-2 text-xs font-medium">Loading settings...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === "danger" && (
                                    <SectionCard
                                        title="Danger Zone Operations"
                                        subtitle="High-risk platform actions with absolute database impact"
                                    >
                                        <div className="flex flex-col gap-6">
                                            
                                            <div className="flex items-start gap-4 border border-orange-200 bg-orange-50 p-4 rounded-xl dark:border-orange-900/50 dark:bg-orange-900/10">
                                                <div className="text-orange-500 mt-0.5">
                                                    <Info className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-orange-800 dark:text-orange-400 mb-1 tracking-wider uppercase">Critical Instructions</h4>
                                                    <p className="text-sm text-orange-700/90 dark:text-orange-400/80 leading-relaxed">
                                                        Actions carried out below cannot be undone. Please confirm authorization credentials before triggering database reset sequences.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 rounded-xl">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Reset Platform Data</h4>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
                                                        Wipe all mock databases, school records, student credentials and reset settings back to stock defaults.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setIsResetModalOpen(true)}
                                                    disabled={isSaving}
                                                    className="shrink-0 flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                                                    Reset Platform Data
                                                </button>
                                            </div>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 rounded-xl">
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Deactivate Platform Workspace</h4>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
                                                        Instantly lock all school portals, block learner login authentication, and suspend active outgoing API routes.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => setIsDeactivateModalOpen(true)}
                                                    disabled={isSaving}
                                                    className="shrink-0 flex items-center px-4 py-2.5 rounded-lg font-medium text-sm transition-colors text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                                    Deactivate Platform
                                                </button>
                                            </div>

                                        </div>
                                    </SectionCard>
                                )}
                                {activeTab === "general" && (
                                    <SectionCard
                                        title="General Settings"
                                        subtitle="Configure your school's core identity, contact info, and localization preferences"
                                    >
                                        <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-3xl">
                                            {/* School Identity */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="School Name"
                                                    value={generalSettings.schoolName}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, schoolName: e.target.value })}
                                                    disabled={!isEditingGeneral}
                                                />
                                                <div className="space-y-1.5">
                                                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Academic Year</label>
                                                    <select
                                                        value={generalSettings.academicYear}
                                                        onChange={(e) => setGeneralSettings({ ...generalSettings, academicYear: e.target.value })}
                                                        disabled={!isEditingGeneral}
                                                        className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
                                                    >
                                                        <option value="2024-2025">2024-2025</option>
                                                        <option value="2025-2026">2025-2026</option>
                                                        <option value="2026-2027">2026-2027</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Contact Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Contact Email"
                                                    type="email"
                                                    value={generalSettings.contactEmail}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                                                    disabled={!isEditingGeneral}
                                                />
                                                <Input
                                                    label="Contact Phone"
                                                    value={generalSettings.contactPhone}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                                                    disabled={!isEditingGeneral}
                                                />
                                            </div>

                                            {/* Address */}
                                            <div className="space-y-1.5">
                                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">School Address</label>
                                                <textarea
                                                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] resize-none disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
                                                    rows={3}
                                                    value={generalSettings.address}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                                                    disabled={!isEditingGeneral}
                                                />
                                            </div>

                                            {/* Localization Settings */}
                                            <div className="pt-4 border-t border-[var(--border-subtle)]">
                                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Localization Preferences</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Default Language</label>
                                                        <select
                                                            value={generalSettings.language}
                                                            onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                                                            disabled={!isEditingGeneral}
                                                            className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
                                                        >
                                                            <option value="English">English</option>
                                                            <option value="Spanish">Spanish</option>
                                                            <option value="French">French</option>
                                                            <option value="Hindi">Hindi</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Timezone</label>
                                                        <select
                                                            value={generalSettings.timezone}
                                                            onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                                                            disabled={!isEditingGeneral}
                                                            className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
                                                        >
                                                            <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                                                            <option value="UTC">UTC</option>
                                                            <option value="America/New_York (EST)">America/New_York (EST)</option>
                                                            <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Date Format</label>
                                                        <select
                                                            value={generalSettings.dateFormat}
                                                            onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                                                            disabled={!isEditingGeneral}
                                                            className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
                                                        >
                                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-3 gap-3">
                                                {!isEditingGeneral ? (
                                                    <Button type="button" onClick={() => setIsEditingGeneral(true)}>
                                                        Edit Settings
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button type="button" variant="secondary" onClick={() => setIsEditingGeneral(false)} disabled={isSaving}>
                                                            Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={isSaving}>
                                                            {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                                            Save Changes
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </form>
                                    </SectionCard>
                                )}

                                {activeTab === "account" && (
                                    <div className="space-y-6">
                                        <SectionCard
                                            title="Change Password"
                                            subtitle="Update your account password regularly to stay secure"
                                        >
                                            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
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
                                                        disabled={!isEditingPassword}
                                                        className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
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
                                                        disabled={!isEditingPassword}
                                                        className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
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
                                                        disabled={!isEditingPassword}
                                                        className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-primary)] disabled:opacity-60 disabled:bg-[var(--bg-muted)]"
                                                    />
                                                </div>

                                                <div className="flex justify-end pt-2 gap-3">
                                                    {!isEditingPassword ? (
                                                        <Button type="button" onClick={() => setIsEditingPassword(true)}>
                                                            Edit Password
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button type="button" variant="secondary" onClick={() => {
                                                                setIsEditingPassword(false);
                                                                setPasswords({ current: "", new: "", confirm: "" });
                                                            }} disabled={isChangingPassword}>
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit"
                                                                disabled={isChangingPassword || !passwords.current || !passwords.new || !passwords.confirm}
                                                            >
                                                                {isChangingPassword ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                                                Update Password
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </form>
                                        </SectionCard>

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
                                                <div className="flex justify-end pt-3">
                                                    <Button onClick={handleSave} disabled={isSaving || isLoading}>
                                                        {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                                        Save Security Settings
                                                    </Button>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    </div>
                                )}

                                {/* APPEARANCE TAB */}
                                {activeTab === "appearance" && (
                                    <div className="space-y-5 sm:space-y-6">
                                        <SectionCard
                                            title="Platform Theme"
                                            subtitle="Customize your School Admin Panel user interface styling"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                                                {/* Light Card */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleThemeChange("light")}
                                                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all ${
                                                        selectedThemeCard === "light"
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]/20"
                                                            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
                                                    }`}
                                                >
                                                    <Sun className={`h-8 w-8 mb-3 ${selectedThemeCard === "light" ? "text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`} />
                                                    <span className="text-sm font-bold text-[var(--text-primary)]">Light Mode</span>
                                                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">Clean and standard theme</p>
                                                </button>

                                                {/* Dark Card */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleThemeChange("dark")}
                                                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all ${
                                                        selectedThemeCard === "dark"
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]/20"
                                                            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
                                                    }`}
                                                >
                                                    <Moon className={`h-8 w-8 mb-3 ${selectedThemeCard === "dark" ? "text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`} />
                                                    <span className="text-sm font-bold text-[var(--text-primary)]">Dark Mode</span>
                                                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">Premium dark workspace</p>
                                                </button>

                                                {/* System Card */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleThemeChange("system")}
                                                    className={`flex flex-col items-center justify-center p-5 rounded-2xl border text-center transition-all ${
                                                        selectedThemeCard === "system"
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]/20"
                                                            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
                                                    }`}
                                                >
                                                    <Laptop className={`h-8 w-8 mb-3 ${selectedThemeCard === "system" ? "text-[var(--color-primary)]" : "text-[var(--text-secondary)]"}`} />
                                                    <span className="text-sm font-bold text-[var(--text-primary)]">System Preference</span>
                                                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">Sync theme with your OS</p>
                                                </button>
                                            </div>
                                        </SectionCard>

                                        <SectionCard
                                            title="Accent Color Swatches"
                                            subtitle="Customize primary colors utilized across the UI (Visual Demo)"
                                        >
                                            <div className="flex flex-wrap gap-4 items-center max-w-lg">
                                                {ACCENT_COLORS.map((col) => (
                                                    <button
                                                        key={col.id}
                                                        type="button"
                                                        onClick={() => handleAccentChange(col.id)}
                                                        className={`relative flex items-center justify-center h-10 w-10 rounded-full cursor-pointer hover:scale-105 transition ${col.color} border-2 ${
                                                            accentColor === col.id ? "border-slate-800 dark:border-white ring-4 ring-[var(--color-primary)]/25" : "border-transparent"
                                                        }`}
                                                        title={col.label}
                                                    >
                                                        {accentColor === col.id && (
                                                            <Check className="h-4 w-4 text-white font-bold" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </SectionCard>

                                        <SectionCard
                                            title="Sidebar Density Layout"
                                            subtitle="Customize display density for dashboard sidebar menu"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDensityChange("comfortable")}
                                                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${
                                                        sidebarDensity === "comfortable"
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
                                                    }`}
                                                >
                                                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] shrink-0">
                                                        ✨
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Comfortable Density</p>
                                                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Generous spacing for clean, focus-oriented navigation.</p>
                                                    </div>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDensityChange("compact")}
                                                    className={`flex items-start gap-3 p-4 rounded-xl border text-left transition ${
                                                        sidebarDensity === "compact"
                                                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]"
                                                    }`}
                                                >
                                                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] shrink-0">
                                                        ⚡
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Compact Density</p>
                                                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Denser, compact layouts displaying maximum content paths.</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </SectionCard>
                                    </div>
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
                                            <div className="flex justify-end pt-3">
                                                <Button onClick={handleSave} disabled={isSaving || isLoading}>
                                                    {isSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                                                    Save Notification Settings
                                                </Button>
                                            </div>
                                        </div>
                                    </SectionCard>
                                )}

                                {activeTab === "integrations" && (
                                    <SectionCard
                                        title="Platform Integrations"
                                        subtitle="Connect external services to synchronize classroom and student data"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                                            {/* Google Calendar */}
                                            <div className="flex flex-col justify-between p-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-xl space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-blue-600 text-sm font-bold">
                                                            G
                                                        </span>
                                                        <h4 className="text-sm font-bold text-[var(--text-primary)]">Google Calendar</h4>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                        Synchronize speaking drills, mock class schedules and speaking practice dates with instructor calendars.
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                                                    <span className={`text-[11px] font-medium ${integrations.google ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                                                        {integrations.google ? "Connected" : "Disconnected"}
                                                    </span>
                                                    <Button
                                                        variant={integrations.google ? "secondary" : "primary"}
                                                        size="sm"
                                                        className="!h-8 text-[11px]"
                                                        onClick={() => toggleIntegration("google", "Google Calendar")}
                                                    >
                                                        {integrations.google ? "Disconnect" : "Connect"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Slack */}
                                            <div className="flex flex-col justify-between p-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-xl space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-orange-500/10 text-orange-600 text-sm font-bold">
                                                            S
                                                        </span>
                                                        <h4 className="text-sm font-bold text-[var(--text-primary)]">Slack Workspace</h4>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                        Dispatch critical billing failures, platform error alerts and license notifications directly to Slack channels.
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                                                    <span className={`text-[11px] font-medium ${integrations.slack ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                                                        {integrations.slack ? "Connected" : "Disconnected"}
                                                    </span>
                                                    <Button
                                                        variant={integrations.slack ? "secondary" : "primary"}
                                                        size="sm"
                                                        className="!h-8 text-[11px]"
                                                        onClick={() => toggleIntegration("slack", "Slack Workspace")}
                                                    >
                                                        {integrations.slack ? "Disconnect" : "Connect"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Zoom */}
                                            <div className="flex flex-col justify-between p-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-xl space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-500/10 text-sky-600 text-sm font-bold">
                                                            Z
                                                        </span>
                                                        <h4 className="text-sm font-bold text-[var(--text-primary)]">Zoom Video API</h4>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                        Auto-generate online meeting rooms for virtual lectures, teacher-student speaking sessions, or grammar lessons.
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                                                    <span className={`text-[11px] font-medium ${integrations.zoom ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                                                        {integrations.zoom ? "Connected" : "Disconnected"}
                                                    </span>
                                                    <Button
                                                        variant={integrations.zoom ? "secondary" : "primary"}
                                                        size="sm"
                                                        className="!h-8 text-[11px]"
                                                        onClick={() => toggleIntegration("zoom", "Zoom Video API")}
                                                    >
                                                        {integrations.zoom ? "Disconnect" : "Connect"}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Stripe */}
                                            <div className="flex flex-col justify-between p-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-xl space-y-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-purple-500/10 text-purple-600 text-sm font-bold">
                                                            S
                                                        </span>
                                                        <h4 className="text-sm font-bold text-[var(--text-primary)]">Stripe Gateway</h4>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                        Process learner subscription payments, school invoicing, and view real-time platform revenue records.
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                                                    <span className={`text-[11px] font-medium ${integrations.stripe ? "text-emerald-500" : "text-[var(--text-muted)]"}`}>
                                                        {integrations.stripe ? "Connected" : "Disconnected"}
                                                    </span>
                                                    <Button
                                                        variant={integrations.stripe ? "secondary" : "primary"}
                                                        size="sm"
                                                        className="!h-8 text-[11px]"
                                                        onClick={() => toggleIntegration("stripe", "Stripe Gateway")}
                                                    >
                                                        {integrations.stripe ? "Disconnect" : "Connect"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-center border-t border-[var(--border-subtle)] pt-6">
                                            <Button variant="secondary" onClick={() => {
                                                setToast({ message: "Integration Marketplace coming soon!", type: "info" });
                                                setTimeout(() => setToast(null), 3000);
                                            }}>
                                                Explore More Integrations
                                            </Button>
                                        </div>
                                    </SectionCard>
                                )}

                                {activeTab === "backup" && (
                                    <SectionCard
                                        title="Backup & Restore"
                                        subtitle="Manage school data backups and recovery"
                                    >
                                        <div className="flex flex-col gap-6">
                                            <div className="flex items-center gap-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 rounded-xl">
                                                <div className="bg-[var(--color-primary)]/10 p-3 rounded-lg text-[var(--color-primary)] shrink-0">
                                                    <Database className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Database Backup</h4>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        Download a structured JSON backup containing your school profile, settings, and student data.
                                                    </p>
                                                    <p className="text-xs mt-1 font-medium text-[var(--text-primary)]">
                                                        Last backup: {lastBackupDate ? formatBackupDate(lastBackupDate) : 'Never'}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Button 
                                                    onClick={() => handleBackupAction("backup")}
                                                    disabled={isSaving || isLoading}
                                                >
                                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                                                    Backup Now
                                                </Button>
                                                <Button 
                                                    variant="secondary"
                                                    onClick={() => handleBackupAction("restore")}
                                                    disabled={isSaving || isLoading}
                                                >
                                                    <RotateCcw className="w-4 h-4 mr-2" />
                                                    Restore Backup
                                                </Button>
                                            </div>
                                        </div>
                                    </SectionCard>
                                )}

                            </>
                        )}
                    </motion.div>
                </div>
            </div>

            <Modal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} title="Reset Platform Data" maxWidth="max-w-md">
                <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                    </span>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        Are you sure you want to reset the platform data? This will wipe all mock databases, school records, student credentials and reset settings back to stock defaults. <strong>This action cannot be undone.</strong>
                    </p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setIsResetModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={handleResetPlatform} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Reset Data
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isDeactivateModalOpen} onClose={() => setIsDeactivateModalOpen(false)} title="Deactivate Platform Workspace" maxWidth="max-w-md">
                <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-500/10 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                    </span>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        Are you sure you want to deactivate the platform? This will lock all school portals, block learner login authentication, and suspend active outgoing API routes. <strong>This action cannot be undone.</strong>
                    </p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={() => setIsDeactivateModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="danger" onClick={handleDeactivatePlatform} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Deactivate Platform
                    </Button>
                </div>
            </Modal>
        </div>
    );
}

export default Settings;
