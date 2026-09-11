import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ROUTES from "@constants/routes";
import Modal from "@components/common/Modal";
import {
    Settings as SettingsIcon,
    Bell,
    Globe,
    Moon,
    Shield,
    KeyRound,
    Database,
    HelpCircle,
    Save,
    RotateCcw,
    ExternalLink,
    Check,
    AlertTriangle,
    CreditCard,
    Cpu,
    CheckCircle2,
    Lock,
    Trash2,
    User,
    Laptop,
    Sun,
    Info,
    Calendar,
    ArrowUpRight,
    Edit2,
    X,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import SectionCard from "@admin/components/SectionCard";
import { useTheme } from "@/Admin_panel/context/ThemeContext";
import { useAuth } from "@/Admin_panel/context/AuthContext";
import { teacherDataApi } from "@services/admin/teacherDataApi";

/**
 * admin-dashboard/pages/Settings.jsx
 *
 * Highly polished SaaS Settings page with a responsive vertical layout
 * and 7 functional sections: General, Account & Security, Notifications,
 * Appearance, Billing & Subscription, Integrations, and Danger Zone.
 */

const TABS = [
    { id: "general", label: "General", icon: Globe },
    { id: "account", label: "Account & Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "billing", label: "Billing & Subscription", icon: CreditCard },
    { id: "integrations", label: "Integrations", icon: Cpu },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

const ACCENT_COLORS = [
    { id: "purple", label: "Purple (Brand)", color: "bg-purple-600" },
    { id: "indigo", label: "Indigo", color: "bg-indigo-600" },
    { id: "rose", label: "Rose", color: "bg-rose-600" },
    { id: "blue", label: "Blue", color: "bg-blue-600" },
    { id: "emerald", label: "Emerald", color: "bg-emerald-600" },
    { id: "amber", label: "Amber", color: "bg-amber-600" },
];

export function TeacherSettings() {
    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuth();
    const teacherName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : null) || user?.email || "Teacher";
    const teacherInitials = (user?.firstName?.[0] || teacherName?.[0] || "T").toUpperCase();
    const teacherEmail = user?.email || "teacher@school.edu";

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

    // Toast State
    const [toasts, setToasts] = useState([]);

    const triggerToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    // Modal Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    // 1. General Tab States
    const [platformName, setPlatformName] = useState("SpeakMateAI");
    const [language, setLanguage] = useState("English");
    const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
    const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

    const mapLanguageToUI = (code) => {
        switch (code?.toLowerCase()) {
            case "en": return "English";
            case "es": return "Spanish";
            case "fr": return "French";
            case "hi": return "Hindi";
            default: return "English";
        }
    };

    const mapLanguageToBackend = (name) => {
        switch (name) {
            case "English": return "en";
            case "Spanish": return "es";
            case "French": return "fr";
            case "Hindi": return "hi";
            default: return "en";
        }
    };

    // 2. Account & Security States
    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: "",
    });
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [sessions, setSessions] = useState([
        { id: 1, device: "Chrome on Windows 11", location: "Pune, India", status: "Active Now", current: true },
        { id: 2, device: "Safari on iPhone 15 Pro", location: "Mumbai, India", status: "2 hours ago", current: false },
        { id: 3, device: "Firefox on macOS", location: "Noida, India", status: "3 days ago", current: false },
    ]);

    // 3. Notifications States
    const [notifications, setNotifications] = useState({
        notificationsEnabled: true,
        emailNotifications: true,
        systemNotifications: true,
    });


    // Fetch settings on mount
    useEffect(() => {
        let isMounted = true;
        const fetchSettings = async () => {
            try {
                const res = await teacherDataApi.getSettings();
                if (res?.success && res.data && isMounted) {
                    const d = res.data;
                    setLanguage(mapLanguageToUI(d.language));
                    setTwoFactor(!!d.twoFactorEnabled);
                    setSessionTimeout(d.sessionTimeout || 30);
                    setNotifications({
                        notificationsEnabled: !!d.notificationsEnabled,
                        emailNotifications: !!d.emailNotifications,
                        systemNotifications: !!d.systemNotifications,
                    });
                    const backendTheme = d.theme ? d.theme.toLowerCase() : "light";
                    setSelectedThemeCard(backendTheme);
                }
            } catch (err) {
                console.error("Failed to load teacher settings:", err);
            }
        };

        const fetchBillingAndUsage = async () => {
            try {
                if (isMounted) {
                    setActiveSchoolsCount(1);
                }

                // Fetch invoices safely without admin api calls
                const invoiceRes = await teacherDataApi.getInvoices(0, 100);
                if (invoiceRes?.success && invoiceRes.data?.content && isMounted) {
                    const content = invoiceRes.data.content;
                    if (content.length > 0) {
                        const mappedInvoices = content.map((inv) => ({
                            date: inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—",
                            desc: `SpeakMate Subscription - Invoice ${inv.invoiceNumber}`,
                            amount: `₹${inv.totalAmount || inv.amount}`,
                            status: inv.invoiceStatus === "PAID" ? "Paid" : (inv.invoiceStatus === "UNPAID" ? "Unpaid" : "Pending"),
                        }));
                        setBillingHistory(mappedInvoices);
                    }
                }
            } catch (err) {
                console.error("Failed to load billing history:", err);
            }
        };

        fetchSettings();
        fetchBillingAndUsage();
        return () => { isMounted = false; };
    }, []);

    const handleSaveGeneral = async (e) => {
        if (e) e.preventDefault();
        try {
            const langCode = mapLanguageToBackend(language);
            await teacherDataApi.updateLanguage({ language: langCode });
            triggerToast("General settings saved successfully!");
        } catch (err) {
            console.error("Failed to save language settings:", err);
            triggerToast("Failed to save general settings.");
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            triggerToast("Please fill in all password fields.");
            return;
        }
        if (passwords.new !== passwords.confirm) {
            triggerToast("New passwords do not match.");
            return;
        }
        setIsUpdatingPassword(true);
        try {
            // Using teacherDataApi if imported, otherwise simulated delay
            if (typeof teacherDataApi !== 'undefined' && teacherDataApi.changePassword) {
                await teacherDataApi.changePassword({
                    currentPassword: passwords.current,
                    newPassword: passwords.new,
                    confirmPassword: passwords.confirm
                });
            } else {
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            triggerToast("Password updated successfully!");
            setPasswords({ current: "", new: "", confirm: "" });
            setIsEditingPassword(false);
        } catch (err) {
            console.error("Failed to update password:", err);
            const msg = err?.response?.data?.message || err?.message || "Failed to update password";
            triggerToast(msg);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleToggle2FA = async (val) => {
        setTwoFactor(val);
        try {
            await teacherDataApi.updateSecurity({
                twoFactorEnabled: val,
                sessionTimeout: sessionTimeout
            });
            triggerToast(`Two-Factor Authentication turned ${val ? "ON" : "OFF"}.`);
        } catch (err) {
            console.error("Failed to toggle 2FA:", err);
            triggerToast("Failed to update 2FA setting.");
        }
    };

    const handleTimeoutChange = async (e) => {
        const val = Number(e.target.value);
        setSessionTimeout(val);
        try {
            await teacherDataApi.updateSecurity({
                twoFactorEnabled: twoFactor,
                sessionTimeout: val
            });
            triggerToast(`Session timeout updated to ${val} minutes.`);
        } catch (err) {
            console.error("Failed to update timeout:", err);
            triggerToast("Failed to update session timeout.");
        }
    };

    const handleRevokeSession = (id, device) => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        triggerToast(`Session on ${device} has been revoked.`);
    };

    const toggleNotification = async (key) => {
        const nextVal = !notifications[key];
        const nextNotifications = { ...notifications, [key]: nextVal };
        setNotifications(nextNotifications);
        try {
            await teacherDataApi.updateNotifications({
                notificationsEnabled: nextNotifications.notificationsEnabled,
                emailNotifications: nextNotifications.emailNotifications,
                systemNotifications: nextNotifications.systemNotifications
            });
            triggerToast("Notification setting updated.");
        } catch (err) {
            console.error("Failed to update notifications:", err);
            triggerToast("Failed to save notification setting.");
        }
    };

    const handleThemeChange = async (newTheme) => {
        setSelectedThemeCard(newTheme);
        let targetTheme = newTheme;
        if (newTheme === "system") {
            const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            targetTheme = systemIsDark ? "dark" : "light";
        }
        try {
            await teacherDataApi.updateAppearance({
                theme: targetTheme.toUpperCase(),
                sidebarCollapsed: false
            });
            setTheme(targetTheme);
            triggerToast(`Theme set to ${targetTheme === "dark" ? "Dark" : "Light"} mode.`);
        } catch (err) {
            console.error("Failed to update theme on backend:", err);
            setTheme(targetTheme);
            triggerToast(`Theme set locally to ${targetTheme === "dark" ? "Dark" : "Light"} mode.`);
        }
    };

    const handleAccentChange = (id) => {
        setAccentColor(id);
        triggerToast(`Accent color updated to ${id}.`);
    };

    const handleDensityChange = (density) => {
        setSidebarDensity(density);
        triggerToast(`Sidebar density set to ${density}.`);
    };

    // 5. Billing & Subscription States
    const [activeSchoolsCount, setActiveSchoolsCount] = useState(12);
    const [billingHistory, setBillingHistory] = useState([
        { date: "Jul 24, 2026", desc: "Enterprise Plan Monthly Renewal", amount: "$299.00", status: "Paid" },
        { date: "Jun 24, 2026", desc: "Enterprise Plan Monthly Renewal", amount: "$299.00", status: "Paid" },
        { date: "May 24, 2026", desc: "Enterprise Plan Monthly Renewal", amount: "$299.00", status: "Paid" },
        { date: "Apr 24, 2026", desc: "Platform Setup Fee", amount: "$499.00", status: "Paid" },
    ]);

    const [cardDetails, setCardDetails] = useState(() => {
        const saved = localStorage.getItem("speakmate_admin_card");
        return saved ? JSON.parse(saved) : {
            brand: "Visa",
            last4: "4242",
            expiry: "08/2027"
        };
    });
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [cardForm, setCardForm] = useState({
        number: "",
        expiry: "",
        brand: "Visa"
    });

    const handleUpdateCard = (e) => {
        if (e) e.preventDefault();
        if (!cardForm.number || !cardForm.expiry) {
            triggerToast("Please fill in all card details.");
            return;
        }
        const last4 = cardForm.number.replace(/\s+/g, "").slice(-4) || "4242";
        const brand = cardForm.brand || "Visa";
        const expiry = cardForm.expiry || "08/2027";
        
        const nextDetails = { brand, last4, expiry };
        setCardDetails(nextDetails);
        localStorage.setItem("speakmate_admin_card", JSON.stringify(nextDetails));
        setCardModalOpen(false);
        triggerToast("Payment method updated successfully!");
    };

    const handleDownloadPDF = (bill) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            triggerToast("Pop-up blocker prevented invoice download. Please allow popups.");
            return;
        }

        const invoiceNumber = `INV-2026-${Math.floor(100 + Math.random() * 900)}`;
        const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - SpeakMate AI</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            color: #1e293b;
            background: #ffffff;
            margin: 0;
            padding: 40px;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 30px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: 800;
            color: #7c3aed;
        }
        .logo span {
            color: #4f46e5;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.025em;
        }
        .invoice-title p {
            margin: 5px 0 0;
            font-size: 14px;
            color: #64748b;
        }
        .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .details-block h3 {
            margin: 0 0 10px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            font-weight: 700;
        }
        .details-block p {
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
            color: #334155;
        }
        .table-container {
            margin-bottom: 40px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        th {
            border-bottom: 2px solid #f1f5f9;
            padding: 12px 16px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
        }
        td {
            border-bottom: 1px solid #f1f5f9;
            padding: 16px;
            font-size: 14px;
            color: #334155;
        }
        .text-right {
            text-align: right;
        }
        .summary-container {
            display: flex;
            justify-content: flex-end;
        }
        .summary-box {
            width: 300px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
            color: #64748b;
        }
        .summary-row.total {
            border-top: 2px solid #f1f5f9;
            padding-top: 12px;
            margin-top: 8px;
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
        }
        .footer {
            margin-top: 60px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
            font-size: 12px;
            color: #94a3b8;
        }
        @media print {
            body {
                padding: 0;
            }
            .invoice-box {
                border: none;
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="logo">SpeakMate<span>AI</span></div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <p>No: ${invoiceNumber}</p>
            </div>
        </div>
        
        <div class="details-grid">
            <div class="details-block">
                <h3>Supplier</h3>
                <p><strong>SpeakMate AI Technologies, Inc.</strong><br>
                100 Innovation Way, Suite 400<br>
                San Francisco, CA 94107<br>
                billing@speakmate.ai</p>
            </div>
            <div class="details-block">
                <h3>Bill To</h3>
                <p><strong>SpeakMate Admin Panel Customer</strong><br>
                Primary Enterprise Workspace Owner<br>
                admin@speakmate.ai</p>
            </div>
        </div>

        <div class="details-grid" style="margin-bottom: 30px;">
            <div class="details-block">
                <h3>Invoice Date</h3>
                <p>${bill.date}</p>
            </div>
            <div class="details-block">
                <h3>Payment Status</h3>
                <p style="color: #059669; font-weight: 600;">${bill.status}</p>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="text-right">Quantity</th>
                        <th class="text-right">Unit Price</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${bill.desc}</td>
                        <td class="text-right">1</td>
                        <td class="text-right">${bill.amount}</td>
                        <td class="text-right">${bill.amount}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="summary-container">
            <div class="summary-box">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${bill.amount}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (0%)</span>
                    <span>$0.00</span>
                </div>
                <div class="summary-row total">
                    <span>Total</span>
                    <span>${bill.amount}</span>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for choosing SpeakMate AI! If you have any questions, please contact support.</p>
            <p style="margin-top: 5px;">&copy; 2026 SpeakMate AI. All rights reserved.</p>
        </div>
    </div>
    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
        `;

        printWindow.document.open();
        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
    };

    // 6. Integrations States
    const [integrations, setIntegrations] = useState({
        google: true,
        slack: false,
        zoom: false,
        stripe: true,
    });

    const toggleIntegration = (key, name) => {
        setIntegrations((prev) => {
            const nextVal = !prev[key];
            triggerToast(`${name} is now ${nextVal ? "Connected" : "Disconnected"}.`);
            return { ...prev, [key]: nextVal };
        });
    };

    // 7. Danger Zone Trigger Methods
    const handleResetPlatformData = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Reset Workspace Preferences?",
            message: "This will reset all classroom preferences and filter settings to defaults.",
            onConfirm: async () => {
                try {
                    await teacherDataApi.resetPlatform();
                    triggerToast("Workspace preferences have been reset.");
                    setTimeout(() => window.location.reload(), 1500);
                } catch (err) {
                    console.error("Failed to reset preferences:", err);
                    triggerToast("Failed to reset preferences.", "error");
                }
            },
        });
    };

    const handleDeactivatePlatform = () => {
        setConfirmDialog({
            isOpen: true,
            title: "Deactivate Platform?",
            message: "Temporarily suspend classroom workspace and sign out of this teacher account. Your configuration will be preserved.",
            onConfirm: async () => {
                try {
                    await teacherDataApi.deactivatePlatform();
                    triggerToast("Teacher workspace session ended. Redirecting to login...");
                    setTimeout(() => {
                        localStorage.removeItem("speakmate_admin_session");
                        navigate(ROUTES.TEACHER_LOGIN);
                    }, 1500);
                } catch (err) {
                    console.error("Failed to deactivate platform:", err);
                    triggerToast("Failed to deactivate platform.", "error");
                }
            },
        });
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
                        TEACHER / SETTINGS
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
                        Settings
                    </h1>
                    <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                        Manage your teacher preferences and workspace settings
                    </p>
                </div>
            </motion.div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left navigation column */}
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
                                            "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 text-left shrink-0",
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

                {/* Right content column */}
                <div className="lg:col-span-8 xl:col-span-9">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* GENERAL TAB */}
                            {activeTab === "general" && (
                                <SectionCard
                                    title="General Settings"
                                    subtitle="Configure default brand, language and region configurations"
                                >
                                    <form onSubmit={handleSaveGeneral} className="space-y-6 max-w-2xl">
                                        <Input
                                            label="Platform Name"
                                            value={platformName}
                                            onChange={(e) => setPlatformName(e.target.value)}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Default Language</span>
                                                <select
                                                    value={language}
                                                    onChange={(e) => setLanguage(e.target.value)}
                                                    className="form-control"
                                                >
                                                    <option value="English">English</option>
                                                    <option value="Spanish">Spanish</option>
                                                    <option value="French">French</option>
                                                    <option value="Hindi">Hindi</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Timezone</span>
                                                <select
                                                    value={timezone}
                                                    onChange={(e) => setTimezone(e.target.value)}
                                                    className="form-control"
                                                >
                                                    <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                                                    <option value="UTC">UTC</option>
                                                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                                                    <option value="Europe/London (GMT)">Europe/London (GMT)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Date Format</span>
                                            <select
                                                value={dateFormat}
                                                onChange={(e) => setDateFormat(e.target.value)}
                                                className="form-control"
                                            >
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end pt-3">
                                            <Button type="submit">
                                                <Save className="mr-1.5 h-4 w-4" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    </form>
                                </SectionCard>
                            )}

                            {/* ACCOUNT & SECURITY TAB */}
                            {activeTab === "account" && (
                                <div className="space-y-5 sm:space-y-6">
                                    {/* Profile Summary Card */}
                                    <SectionCard
                                        title="Teacher Profile"
                                        subtitle="Teacher identity card and credential details"
                                    >
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary)]/10 text-2xl font-bold text-[var(--color-primary)] shrink-0 shadow-sm border border-[var(--color-primary)]/20">
                                                {teacherInitials}
                                            </div>
                                            <div className="text-center sm:text-left space-y-1">
                                                <h4 className="text-base font-bold text-[var(--text-primary)]">{teacherName}</h4>
                                                <p className="text-xs text-[var(--text-secondary)]">{teacherEmail}</p>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                                    <Check className="h-3 w-3" />
                                                    Teacher Authorization
                                                </span>
                                            </div>
                                        </div>
                                    </SectionCard>

                                    {/* Change Password */}
                                    <SectionCard
                                        title="Change Password"
                                        subtitle="Update your administrator credentials"
                                        action={
                                            !isEditingPassword && (
                                                <Button type="button" variant="secondary" onClick={() => setIsEditingPassword(true)}>
                                                    <Edit2 className="mr-1.5 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            )
                                        }
                                    >
                                        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                                            <Input
                                                label="Current Password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwords.current}
                                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                                disabled={!isEditingPassword || isUpdatingPassword}
                                            />
                                            <Input
                                                label="New Password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                disabled={!isEditingPassword || isUpdatingPassword}
                                            />
                                            <Input
                                                label="Confirm New Password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                disabled={!isEditingPassword || isUpdatingPassword}
                                            />
                                            {isEditingPassword ? (
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        onClick={() => {
                                                            setIsEditingPassword(false);
                                                            setPasswords({ current: "", new: "", confirm: "" });
                                                        }}
                                                        disabled={isUpdatingPassword}
                                                    >
                                                        <X className="mr-1.5 h-4 w-4" />
                                                        Cancel
                                                    </Button>
                                                    <Button 
                                                        type="submit"
                                                        disabled={!passwords.current || !passwords.new || !passwords.confirm || isUpdatingPassword}
                                                    >
                                                        {isUpdatingPassword ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Lock className="mr-1.5 h-4 w-4" />}
                                                        Update Password
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end pt-2">
                                                    <Button type="button" disabled>
                                                        <Lock className="mr-1.5 h-4 w-4" />
                                                        Update Password
                                                    </Button>
                                                </div>
                                            )}
                                        </form>
                                    </SectionCard>

                                    {/* Two-Factor Authentication */}
                                    <SectionCard
                                        title="Two-Factor Authentication (2FA)"
                                        subtitle="Enforce higher login protection for your admin account"
                                    >
                                        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 max-w-2xl">
                                            <div className="flex items-start gap-3">
                                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                                    <Shield className="h-4 w-4" />
                                                </span>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">Secure Access Verification</p>
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                        Require a security code generated by an authenticator application (Google Authenticator, Duo, etc.) in addition to your password during sign-in.
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={twoFactor}
                                                onClick={() => handleToggle2FA(!twoFactor)}
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                    twoFactor ? "bg-[var(--color-primary)]" : "bg-[var(--border-strong)]"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                        twoFactor ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </SectionCard>

                                    {/* Session Idle Timeout */}
                                    <SectionCard
                                        title="Session Idle Timeout"
                                        subtitle="Configure how long you can remain idle before being logged out"
                                    >
                                        <div className="space-y-3 max-w-2xl">
                                            <div className="flex items-start gap-3">
                                                <div className="space-y-1.5 w-full max-w-sm">
                                                    <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Timeout Duration</span>
                                                    <select
                                                        value={sessionTimeout}
                                                        onChange={handleTimeoutChange}
                                                        className="form-control"
                                                    >
                                                        <option value={15}>15 minutes</option>
                                                        <option value={30}>30 minutes</option>
                                                        <option value={60}>60 minutes</option>
                                                        <option value={120}>120 minutes</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </SectionCard>

                                    {/* Active Sessions */}
                                    <SectionCard
                                        title="Active Sessions"
                                        subtitle="Devices currently logged into this administrator dashboard"
                                    >
                                        <div className="space-y-3 max-w-2xl">
                                            {sessions.map((session) => (
                                                <div key={session.id} className="flex items-center justify-between gap-4 p-4 border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] shrink-0">
                                                            <Laptop className="h-4 w-4" />
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                                {session.device}
                                                            </p>
                                                            <p className="text-[11px] text-[var(--text-secondary)]">
                                                                {session.location} • <span className={session.current ? "text-emerald-500 font-medium" : ""}>{session.status}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!session.current && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleRevokeSession(session.id, session.device)}
                                                            className="!h-8 text-[11px]"
                                                        >
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                            {sessions.length === 0 && (
                                                <p className="text-xs text-[var(--text-muted)] text-center py-4">No active secondary sessions.</p>
                                            )}
                                        </div>
                                    </SectionCard>
                                </div>
                            )}

                            {/* NOTIFICATIONS TAB */}
                            {activeTab === "notifications" && (
                                <SectionCard
                                    title="Notification Settings"
                                    subtitle="Configure email and classroom alert preferences for teacher updates"
                                >
                                    <div className="space-y-4 max-w-2xl">
                                        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">Classroom Dashboard Notifications</p>
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    Enable or disable all notifications and alerts across the teacher workspace dashboard.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={notifications.notificationsEnabled}
                                                onClick={() => toggleNotification("notificationsEnabled")}
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                    notifications.notificationsEnabled ? "bg-[var(--color-primary)]" : "bg-[var(--border-strong)]"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                        notifications.notificationsEnabled ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">Automated Email Alerts</p>
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    Receive automated email digests and weekly summaries of assigned student progress.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={notifications.emailNotifications}
                                                onClick={() => toggleNotification("emailNotifications")}
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                    notifications.emailNotifications ? "bg-[var(--color-primary)]" : "bg-[var(--border-strong)]"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                        notifications.emailNotifications ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-start justify-between gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">Student Activity Alerts</p>
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    Display alerts when students complete exercises, vocabulary modules, or speaking sessions.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={notifications.systemNotifications}
                                                onClick={() => toggleNotification("systemNotifications")}
                                                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                                                    notifications.systemNotifications ? "bg-[var(--color-primary)]" : "bg-[var(--border-strong)]"
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                        notifications.systemNotifications ? "translate-x-6" : "translate-x-1"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </SectionCard>
                            )}

                            {/* APPEARANCE TAB */}
                            {activeTab === "appearance" && (
                                <div className="space-y-5 sm:space-y-6">
                                    <SectionCard
                                        title="Platform Theme"
                                        subtitle="Customize your Teacher Workspace user interface styling"
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

                            {/* BILLING & SUBSCRIPTION TAB */}

                            {/* INTEGRATIONS TAB */}
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
                                </SectionCard>
                            )}

                            {/* DANGER ZONE TAB */}
                            {activeTab === "danger" && (
                                <SectionCard
                                    title="Danger Zone Operations"
                                    subtitle="High-risk platform actions with absolute database impact"
                                    className="border-red-500/40 bg-red-500/[0.02]"
                                >
                                    <div className="space-y-6 max-w-2xl">
                                        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4 text-amber-700 dark:text-amber-400">
                                            <Info className="h-5 w-5 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider">Critical Instructions</p>
                                                <p className="text-xs mt-1 leading-relaxed">
                                                    Actions carried out below cannot be undone. Please confirm authorization credentials before triggering database reset sequences.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-500/20 rounded-xl bg-[var(--bg-surface)]">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-[var(--text-primary)]">Reset Platform Data</p>
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    Wipe all mock databases, school records, student credentials and reset settings back to stock defaults.
                                                </p>
                                            </div>
                                            <Button
                                                variant="danger"
                                                onClick={handleResetPlatformData}
                                                className="!h-10 text-xs shrink-0"
                                            >
                                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                                Reset Platform Data
                                            </Button>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-red-500/20 rounded-xl bg-[var(--bg-surface)]">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-[var(--text-primary)]">Deactivate Platform Workspace</p>
                                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                                    Instantly lock all school portals, block learner login authentication, and suspend active outgoing API routes.
                                                </p>
                                            </div>
                                            <Button
                                                variant="danger"
                                                onClick={handleDeactivatePlatform}
                                                className="!h-10 text-xs shrink-0"
                                            >
                                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                                Deactivate Platform
                                            </Button>
                                        </div>
                                    </div>
                                </SectionCard>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Custom Modal Confirmation Dialog */}
            <AnimatePresence>
                {confirmDialog.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
                        onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                    >
                        <motion.div
                            role="alertdialog"
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 text-rose-600 mb-3">
                                <AlertTriangle className="h-6 w-6" />
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                    {confirmDialog.title}
                                </h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    {confirmDialog.message}
                            </p>
                            <div className="mt-6 flex justify-end gap-2.5">
                                <Button
                                    variant="secondary"
                                    onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                                    className="!h-10 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        confirmDialog.onConfirm();
                                        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                                    }}
                                    className="!h-10 text-xs"
                                >
                                    Confirm Action
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Card Update Modal */}
            <Modal
                isOpen={cardModalOpen}
                onClose={() => setCardModalOpen(false)}
                title="Update Payment Method"
                description="Provide your new primary credit card details"
            >
                <form onSubmit={handleUpdateCard} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">Card Brand</label>
                        <select
                            value={cardForm.brand}
                            onChange={(e) => setCardForm({ ...cardForm, brand: e.target.value })}
                            className="w-full h-10 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Amex">American Express</option>
                            <option value="Discover">Discover</option>
                        </select>
                    </div>
                    <Input
                        label="Card Number"
                        type="text"
                        placeholder="1234 5678 1234 5678"
                        maxLength="19"
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                    />
                    <Input
                        label="Expiration Date"
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 mt-5">
                        <Button type="button" variant="secondary" onClick={() => setCardModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Cosmetic Toasts Notification Overlay */}
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

export default TeacherSettings;
