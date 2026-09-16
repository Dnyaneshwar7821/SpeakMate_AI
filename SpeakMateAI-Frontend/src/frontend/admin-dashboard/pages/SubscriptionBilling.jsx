import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    CreditCard,
    Search,
    CalendarClock,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Plus,
    RefreshCw,
    Users,
    Activity,
    IndianRupee,
    ShieldCheck,
    Receipt,
    Sparkles,
    BarChart3,
    Layers,
    Building2,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";
import SectionCard from "@admin/components/SectionCard";
import KpiCard from "@admin/components/KpiCard";
import SubscriptionPlans from "@admin/components/SubscriptionPlans";

import { subscriptionApi } from "@services/admin/subscriptionApi";
import { adminUserApi } from "@services/admin/adminUserApi";
import { schoolApi } from "@services/admin/schoolApi";

const SUBSCRIPTION_STATUS_OPTIONS = ["All", "Active", "Pending", "Expired", "Cancelled"];

/**
 * admin-dashboard/pages/SubscriptionBilling.jsx
 *
 * Super Admin Panel > Subscription Overview & Billing
 *
 * Displays:
 * 1. 7 Real-time Database KPI Cards:
 *    - Total Subscribers, Active Pro Subscribers, Free Users, Conversion Rate,
 *    - Monthly Pro Subscribers, Annual Pro Subscribers, Total Revenue
 * 2. Subscription Distribution:
 *    - Free Starter, SpeakMate Pro Monthly, SpeakMate Pro Annual
 * 3. Revenue & Payment Information:
 *    - Backed by actual Payment records from PostgreSQL
 * 4. Subscribed Users Table & Manual Subscription Assignment
 */

const STATUS_STYLES = {
    Active: {
        badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
        icon: CheckCircle2,
    },
    Cancelled: {
        badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
        icon: XCircle,
    },
    "Past Due": {
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
        icon: AlertTriangle,
    },
    Pending: {
        badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
        icon: AlertTriangle,
    },
    Expired: {
        badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        icon: CalendarClock,
    },
};

const PLAN_STYLES = {
    Basic: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    Premium: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400",
    Pro: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400",
    MONTHLY_PRO: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400",
    YEARLY_PRO: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-400",
    "SpeakMate Pro Monthly": "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400",
    "SpeakMate Pro Annual": "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-400",
};

function StatusBadge({ status }) {
    const cfg = STATUS_STYLES[status] ?? STATUS_STYLES.Active;
    const Icon = cfg.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.badge}`}
        >
            <Icon className="h-3 w-3" />
            {status}
        </span>
    );
}

function PlanBadge({ plan }) {
    const cls = PLAN_STYLES[plan] ?? PLAN_STYLES.Basic;
    return (
        <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-bold ${cls}`}>
            {plan}
        </span>
    );
}

let subscriptionCache = {
    subscriptions: null,
    stats: null,
    plans: null,
    users: null,
};

export function SubscriptionBilling() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All"); // "All" | "Users" | "Schools"
    const [planFilter, setPlanFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [activeTab, setActiveTab] = useState("overview"); // "overview" | "plans"

    const [subscriptions, setSubscriptions] = useState(() => subscriptionCache.subscriptions || []);
    const [stats, setStats] = useState(() => subscriptionCache.stats || null);
    const [plans, setPlans] = useState(() => subscriptionCache.plans || []);
    const [users, setUsers] = useState(() => subscriptionCache.users || []);
    const [loading, setLoading] = useState(() => !subscriptionCache.subscriptions || !subscriptionCache.stats);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [usersLoading, setUsersLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        userId: "",
        planId: "",
        paymentMethod: "CARD",
        amountPaid: "",
        transactionId: "",
        startedAt: new Date().toISOString().slice(0, 10),
    });
    const [errors, setErrors] = useState({});

    const setField = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const loadUsersForModal = useCallback(async () => {
        if (subscriptionCache.users && subscriptionCache.users.length > 0) {
            setUsers(subscriptionCache.users);
            return;
        }
        setUsersLoading(true);
        try {
            const usersRes = await adminUserApi.getAllUsers(0, 500);
            const rawUsers = usersRes.data?.content || [];
            // Filter strictly to individual learner accounts (Role.USER)
            const userList = rawUsers.filter((u) => {
                const r = String(u.role || "").toUpperCase();
                return r === "USER" || r === "ROLE_USER" || r === "LEARNER";
            });
            subscriptionCache.users = userList;
            setUsers(userList);
        } catch (err) {
            console.error("Failed to load users for subscription modal:", err);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    const loadAllData = useCallback(async (isSilent = false) => {
        if (!isSilent && (!subscriptionCache.subscriptions || !subscriptionCache.stats)) {
            setLoading(true);
        } else if (isSilent) {
            setIsRefreshing(true);
        }
        setError(null);
        try {
            const [subsRes, statsRes, plansRes, schoolsRes] = await Promise.all([
                subscriptionApi.getUserSubscriptions(0, 100),
                subscriptionApi.getStatistics(),
                subscriptionApi.getAllPlans(0, 100),
                schoolApi.getSchools().catch(() => []),
            ]);

            // Filter out any non-USER roles (Super Admin, Student, Teacher, School Admin)
            const mappedSubs = (subsRes.data?.content || [])
                .filter((s) => {
                    const role = String(s.userRole || s.role || "").toUpperCase();
                    if (role && role !== "USER" && role !== "ROLE_USER") return false;
                    const email = String(s.userEmail || "").toLowerCase();
                    const name = String(s.userFirstName || "").toLowerCase();
                    if (email.includes("admin@") || email.includes("rslsolution.com") || name.includes("super admin")) return false;
                    return true;
                })
                .map((s) => ({
                    id: `user-${s.id}`,
                    rawId: s.id,
                    type: "User",
                    user: {
                        id: s.userId,
                        name: `${s.userFirstName || ""} ${s.userLastName || ""}`.trim() || "Learner",
                        email: s.userEmail,
                        role: "USER",
                    },
                    plan: s.planName,
                    billingCycle: s.planName?.toLowerCase().includes("annual") || s.planName?.toLowerCase().includes("yearly") ? "Annual" : "Monthly",
                    status: s.subscriptionStatus === "ACTIVE" ? "Active" : (s.subscriptionStatus === "CANCELLED" ? "Cancelled" : (s.subscriptionStatus === "EXPIRED" ? "Expired" : "Pending")),
                    amount: s.amountPaid || 0,
                    currency: "₹",
                    startedAt: s.startDate ? s.startDate.slice(0, 10) : "—",
                    renewsAt: s.expiryDate ? s.expiryDate.slice(0, 10) : "—",
                }));

            // Map onboarded schools as institutional accounts
            const rawSchools = Array.isArray(schoolsRes) ? schoolsRes : (schoolsRes?.data || []);
            const mappedSchools = rawSchools.map((sc) => ({
                id: `school-${sc.id}`,
                rawId: sc.id,
                type: "School",
                user: {
                    id: sc.id,
                    name: sc.name || sc.schoolName || "Institution",
                    email: sc.adminEmail || sc.email || sc.schoolCode || "—",
                    role: "SCHOOL",
                    code: sc.schoolCode,
                },
                plan: sc.subscriptionPlanName || sc.subscriptionPlan || "Institutional Pro",
                billingCycle: sc.subscriptionBillingCycle || (sc.subscriptionPlanName?.toLowerCase().includes("month") ? "Monthly" : "Annual"),
                status: sc.active ? "Active" : "Inactive",
                amount: sc.subscriptionPrice != null ? sc.subscriptionPrice : 0,
                currency: "₹",
                startedAt: sc.subscriptionStartDate ? sc.subscriptionStartDate.slice(0, 10) : (sc.createdAt ? sc.createdAt.slice(0, 10) : "—"),
                renewsAt: sc.subscriptionEndDate ? sc.subscriptionEndDate.slice(0, 10) : "—",
            }));

            const combinedAccounts = [...mappedSubs, ...mappedSchools];
            subscriptionCache.subscriptions = combinedAccounts;
            setSubscriptions(combinedAccounts);

            const fetchedStats = statsRes.data || {};
            subscriptionCache.stats = fetchedStats;
            setStats(fetchedStats);

            const planList = plansRes.data?.content || [];
            subscriptionCache.plans = planList;
            setPlans(planList);
        } catch (err) {
            console.error("Failed to load subscription overview data:", err);
            setError(err.response?.data?.message || err.message || "Failed to load subscription overview data");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        const isCached = Boolean(subscriptionCache.subscriptions && subscriptionCache.stats);
        loadAllData(isCached);
    }, [loadAllData]);

    const validate = () => {
        const next = {};
        if (!form.userId) next.userId = "User is required";
        if (!form.planId) next.planId = "Plan is required";
        if (!form.amountPaid || Number(form.amountPaid) <= 0) next.amountPaid = "Valid amount is required";
        if (!form.transactionId) next.transactionId = "Transaction ID is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            await subscriptionApi.assignPlanToUser(
                form.userId,
                form.planId,
                form.paymentMethod,
                form.amountPaid,
                form.transactionId
            );
            alert("Subscription added successfully");
            setModalOpen(false);
            setForm({
                userId: "",
                planId: "",
                paymentMethod: "CARD",
                amountPaid: "",
                transactionId: "",
                startedAt: new Date().toISOString().slice(0, 10),
            });
            setErrors({});
            subscriptionCache.subscriptions = null;
            subscriptionCache.stats = null;
            loadAllData();
        } catch (err) {
            console.error("Failed to add subscription:", err);
            alert(err.response?.data?.message || "Failed to add subscription");
        }
    };

    const handlePlanChange = (e) => {
        const pId = e.target.value;
        const plan = plans.find((p) => String(p.id) === String(pId));
        setForm((prev) => ({
            ...prev,
            planId: pId,
            amountPaid: plan ? plan.price : "",
        }));
        if (errors.planId) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.planId;
                return next;
            });
        }
    };

    const openModal = () => {
        setForm({
            userId: "",
            planId: "",
            paymentMethod: "CARD",
            amountPaid: "",
            transactionId: "",
            startedAt: new Date().toISOString().slice(0, 10),
        });
        setErrors({});
        loadUsersForModal();
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return subscriptions.filter((s) => {
            const matchesType =
                typeFilter === "All" ||
                (typeFilter === "Users" && s.type === "User") ||
                (typeFilter === "Schools" && s.type === "School");
            const matchesQuery =
                !q ||
                s.user.name.toLowerCase().includes(q) ||
                s.user.email.toLowerCase().includes(q) ||
                (s.user.code && s.user.code.toLowerCase().includes(q));
            const matchesPlan = planFilter === "All" || s.plan.toLowerCase() === planFilter.toLowerCase();
            const matchesStatus = statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesType && matchesQuery && matchesPlan && matchesStatus;
        });
    }, [search, typeFilter, planFilter, statusFilter, subscriptions]);

    const SUBSCRIPTION_PLAN_OPTIONS = useMemo(() => {
        return plans.map((p) => p.planName);
    }, [plans]);

    // Proportional breakdown calculations
    const totalUsers = stats?.totalUsers || 0;
    const freeStarterCount = stats?.freeStarterCount ?? stats?.freeUsers ?? 0;
    const monthlyProCount = stats?.monthlyProCount ?? stats?.monthlyProSubscribers ?? 0;
    const annualProCount = stats?.annualProCount ?? stats?.annualProSubscribers ?? 0;

    const freePercent = totalUsers > 0 ? ((freeStarterCount / totalUsers) * 100).toFixed(1) : 0;
    const monthlyPercent = totalUsers > 0 ? ((monthlyProCount / totalUsers) * 100).toFixed(1) : 0;
    const annualPercent = totalUsers > 0 ? ((annualProCount / totalUsers) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Top Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
                <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        activeTab === "overview"
                            ? "bg-[var(--color-primary,#6c63ff)] text-white shadow-sm"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    }`}
                >
                    <BarChart3 className="h-4 w-4" />
                    Overview
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("plans")}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        activeTab === "plans"
                            ? "bg-[var(--color-primary,#6c63ff)] text-white shadow-sm"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                    }`}
                >
                    <Layers className="h-4 w-4" />
                    Subscription Plans
                    <span className="ml-1 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-extrabold">
                        {plans.length}
                    </span>
                </button>
            </div>

            {activeTab === "plans" ? (
                <SubscriptionPlans />
            ) : (
                <>
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3.5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[var(--primary-brand,#6c63ff)]/10 text-[var(--primary-brand,#6c63ff)]">
                        <CreditCard className="h-6 w-6" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                                Subscription Overview
                            </h1>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live DB Data
                            </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
                            Super Admin real-time subscription analytics, distribution breakdown, and verified payments
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="secondary"
                        onClick={() => loadAllData(true)}
                        disabled={loading || isRefreshing}
                        className="!h-10 text-xs sm:text-sm"
                    >
                        <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Syncing..." : "Refresh"}
                    </Button>
                    <Button onClick={openModal} className="!h-10 text-xs sm:text-sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Subscription
                    </Button>
                </div>
            </motion.div>

            {/* Error state banner if API fails */}
            {error && (
                <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold">Failed to load subscription statistics</p>
                            <p className="text-xs opacity-90">{error}</p>
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => loadAllData()}
                        className="!h-8 text-xs !bg-rose-100 hover:!bg-rose-200 dark:!bg-rose-900/60"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Row 1: Core Subscriber KPI Cards (4 columns) */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={`kpi-skel-1-${i}`} className="animate-pulse rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className="mt-3 h-7 w-16 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-2 h-2.5 w-32 rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                    ))
                ) : (
                    <>
                        <KpiCard
                            kpi={{
                                id: "kpi-total-subs",
                                label: "Total Subscribers",
                                value: stats?.totalSubscribers ?? 0,
                                subtitle: "Distinct registered subscribers",
                                icon: "users",
                                accent: "#6366f1",
                            }}
                            index={0}
                        />
                        <KpiCard
                            kpi={{
                                id: "kpi-active-pro",
                                label: "Active Pro Subscribers",
                                value: stats?.activeProSubscribers ?? 0,
                                subtitle: "Active paid learners",
                                icon: "user-check",
                                accent: "#10b981",
                            }}
                            index={1}
                        />
                        <KpiCard
                            kpi={{
                                id: "kpi-free-users",
                                label: "Free Users",
                                value: stats?.freeUsers ?? 0,
                                subtitle: "Free Starter tier learners",
                                icon: "user-plus",
                                accent: "#3b82f6",
                            }}
                            index={2}
                        />
                        <KpiCard
                            kpi={{
                                id: "kpi-conversion-rate",
                                label: "Conversion Rate",
                                value: `${stats?.conversionRate ?? 0}%`,
                                subtitle: "Learners converted to Pro",
                                icon: "trending",
                                accent: "#f59e0b",
                            }}
                            index={3}
                        />
                    </>
                )}
            </div>

            {/* Row 2: Plan Breakdown & Verified Revenue KPI Cards (3 columns) */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={`kpi-skel-2-${i}`} className="animate-pulse rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="h-3 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="h-7 w-7 rounded-lg bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className="mt-3 h-7 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-2 h-2.5 w-36 rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                    ))
                ) : (
                    <>
                        <KpiCard
                            kpi={{
                                id: "kpi-monthly-pro",
                                label: "Monthly Pro Subscribers",
                                value: stats?.monthlyProSubscribers ?? 0,
                                subtitle: "Active ₹149/mo subscriptions",
                                icon: "activity",
                                accent: "#8b5cf6",
                            }}
                            index={4}
                        />
                        <KpiCard
                            kpi={{
                                id: "kpi-annual-pro",
                                label: "Annual Pro Subscribers",
                                value: stats?.annualProSubscribers ?? 0,
                                subtitle: "Active ₹1,199/yr subscriptions",
                                icon: "graduation-cap",
                                accent: "#ec4899",
                            }}
                            index={5}
                        />
                        <KpiCard
                            kpi={{
                                id: "kpi-total-revenue",
                                label: "Total Revenue",
                                value: stats?.totalRevenue ?? 0,
                                prefix: "₹",
                                subtitle: "Verified from Payment records",
                                icon: "rupee",
                                accent: "#059669",
                            }}
                            index={6}
                        />
                    </>
                )}
            </div>

            {/* Subscription Distribution & Revenue Information */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* Subscription Distribution (Left 7 Cols) */}
                <SectionCard
                    title="Subscription Distribution"
                    subtitle="Proportional breakdown across Free Starter, Monthly Pro, and Annual Pro tiers"
                    delay={0.1}
                    className="lg:col-span-7"
                    action={
                        <span className="text-xs font-semibold text-[var(--text-muted)]">
                            {totalUsers} Total Registered Accounts
                        </span>
                    }
                >
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-4 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
                            <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
                            <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Proportional Multi-Segment Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80 p-0.5">
                                    {totalUsers === 0 ? (
                                        <div className="w-full rounded-full bg-slate-200 dark:bg-slate-700" />
                                    ) : (
                                        <>
                                            <div
                                                style={{ width: `${Math.max(Number(freePercent), freeStarterCount > 0 ? 4 : 0)}%` }}
                                                className="bg-blue-500 rounded-l-full transition-all duration-500"
                                                title={`Free Starter: ${freeStarterCount} (${freePercent}%)`}
                                            />
                                            <div
                                                style={{ width: `${Math.max(Number(monthlyPercent), monthlyProCount > 0 ? 4 : 0)}%` }}
                                                className="bg-purple-600 transition-all duration-500"
                                                title={`Monthly Pro: ${monthlyProCount} (${monthlyPercent}%)`}
                                            />
                                            <div
                                                style={{ width: `${Math.max(Number(annualPercent), annualProCount > 0 ? 4 : 0)}%` }}
                                                className="bg-pink-500 rounded-r-full transition-all duration-500"
                                                title={`Annual Pro: ${annualProCount} (${annualPercent}%)`}
                                            />
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--text-muted)]">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        Free Starter ({freePercent}%)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-purple-600" />
                                        Monthly Pro ({monthlyPercent}%)
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-pink-500" />
                                        Annual Pro ({annualPercent}%)
                                    </span>
                                </div>
                            </div>

                            {/* Plan 1: Free Starter */}
                            <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between hover:bg-[var(--bg-elevated)]">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-[var(--text-primary)]">
                                                Free Starter
                                            </h4>
                                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                                                Free Tier
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            5 free AI sessions • Daily practice limits • Core speech tests
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                                    <div className="text-right">
                                        <span className="text-base font-extrabold text-[var(--text-primary)] sm:text-lg">
                                            {freeStarterCount.toLocaleString("en-IN")}
                                        </span>
                                        <span className="ml-1 text-xs text-[var(--text-secondary)]">learners</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                                        {freePercent}% of userbase
                                    </span>
                                </div>
                            </div>

                            {/* Plan 2: SpeakMate Pro Monthly */}
                            <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between hover:bg-[var(--bg-elevated)]">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-[var(--text-primary)]">
                                                SpeakMate Pro Monthly
                                            </h4>
                                            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
                                                ₹149 / mo
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Unlimited AI conversations • Real-time accent scoring • Grammar coaching
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                                    <div className="text-right">
                                        <span className="text-base font-extrabold text-[var(--text-primary)] sm:text-lg">
                                            {monthlyProCount.toLocaleString("en-IN")}
                                        </span>
                                        <span className="ml-1 text-xs text-[var(--text-secondary)]">subscribers</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                                        {monthlyPercent}% of userbase
                                    </span>
                                </div>
                            </div>

                            {/* Plan 3: SpeakMate Pro Annual */}
                            <div className="flex flex-col gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between hover:bg-[var(--bg-elevated)]">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-[var(--text-primary)]">
                                                SpeakMate Pro Annual
                                            </h4>
                                            <span className="rounded-md bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700 dark:bg-pink-950/60 dark:text-pink-400">
                                                Best Value • ₹1,199 / yr
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            Full annual access • Priority AI inference • 33% discount savings
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                                    <div className="text-right">
                                        <span className="text-base font-extrabold text-[var(--text-primary)] sm:text-lg">
                                            {annualProCount.toLocaleString("en-IN")}
                                        </span>
                                        <span className="ml-1 text-xs text-[var(--text-secondary)]">subscribers</span>
                                    </div>
                                    <span className="text-[11px] font-semibold text-pink-600 dark:text-pink-400">
                                        {annualPercent}% of userbase
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* Revenue & Payment Information (Right 5 Cols) */}
                <SectionCard
                    title="Revenue & Payment Ledger"
                    subtitle="Verified settlements from actual Payment database records"
                    delay={0.15}
                    className="lg:col-span-5"
                    action={
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Razorpay Verified
                        </span>
                    }
                >
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
                                <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Primary Revenue Banner */}
                            <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 dark:border-emerald-800/40">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                        Total Verified Revenue
                                    </span>
                                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                        <IndianRupee className="h-4 w-4" />
                                    </span>
                                </div>
                                <div className="mt-2 text-2xl font-black tracking-tight text-[var(--text-primary)] sm:text-3xl">
                                    ₹{(stats?.totalRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">
                                    Aggregated strictly from Payment records with status <span className="font-semibold text-emerald-600 dark:text-emerald-400">PAID</span>
                                </p>
                            </div>

                            {/* Secondary Financial Breakdown Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/40 p-3">
                                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                        This Month
                                    </span>
                                    <div className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                        ₹{(stats?.monthlyRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Month to date</p>
                                </div>

                                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/40 p-3">
                                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                        Today&apos;s Revenue
                                    </span>
                                    <div className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                        ₹{(stats?.todaysRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Last 24 hours</p>
                                </div>

                                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/40 p-3">
                                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                        Total Transactions
                                    </span>
                                    <div className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                        {(stats?.totalPayments ?? 0).toLocaleString("en-IN")}
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Payment order attempts</p>
                                </div>

                                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/40 p-3">
                                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                                        Successful Paid
                                    </span>
                                    <div className="mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400">
                                        {(stats?.successfulPayments ?? 0).toLocaleString("en-IN")}
                                    </div>
                                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">Settled transactions</p>
                                </div>
                            </div>

                            {/* Database Source-of-Truth Assurance Card */}
                            <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-[11px] text-[var(--text-secondary)] space-y-1">
                                <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                                    <Receipt className="h-3.5 w-3.5 text-indigo-500" />
                                    Source of Truth Policy
                                </div>
                                <p>
                                    Revenue is calculated directly via SQL aggregation on the <code className="font-mono text-indigo-600 dark:text-indigo-400">payments</code> table. Legacy USD plans remain isolated and do not pollute learner INR stats.
                                </p>
                            </div>
                        </div>
                    )}
                </SectionCard>
            </div>

            {/* Subscriptions Table */}
            <SectionCard
                title="Subscribed Users & Institutions"
                subtitle="Individual learner and institutional school subscription records with plan, cycle, amount, and renewal dates"
                delay={0.2}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative sm:w-56">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                            <Input
                                placeholder="Search subscriber / account…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="!pl-9"
                            />
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-10 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="All">All Accounts</option>
                            <option value="Users">Users (Learners)</option>
                            <option value="Schools">Schools (Institutions)</option>
                        </select>
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="h-10 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
                        >
                            <option value="All">All Plans</option>
                            {SUBSCRIPTION_PLAN_OPTIONS.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-10 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
                        >
                            {SUBSCRIPTION_STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s === "All" ? "All Statuses" : s}
                                </option>
                            ))}
                        </select>
                    </div>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                                <th className="px-4 py-3 font-semibold sm:px-5">Subscriber / Account</th>
                                <th className="px-4 py-3 font-semibold">Plan</th>
                                <th className="px-4 py-3 font-semibold">Billing</th>
                                <th className="px-4 py-3 font-semibold">Amount</th>
                                <th className="px-4 py-3 font-semibold">Started</th>
                                <th className="px-4 py-3 font-semibold">Renews</th>
                                <th className="px-4 py-3 font-semibold sm:px-5">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 text-center">
                                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500 shadow-sm" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">Loading subscriptions...</p>
                                                <p className="text-xs text-[var(--text-secondary)]">Please wait while subscription records are being fetched from the database.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-12 text-center text-sm text-[var(--text-muted)]"
                                    >
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <CreditCard className="h-8 w-8 opacity-40 text-[var(--text-muted)]" />
                                            <p className="font-medium text-[var(--text-secondary)]">No subscriptions found</p>
                                            <p className="text-xs text-[var(--text-muted)]">No records match your active search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                            {filtered.map((s) => (
                                <tr
                                    key={s.id}
                                    className="border-b border-[var(--border-subtle)] text-sm transition-colors last:border-0 hover:bg-[var(--bg-hover)]"
                                >
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="flex items-center gap-3">
                                            {s.type === "School" ? (
                                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                    <Building2 className="h-4 w-4" />
                                                </span>
                                            ) : (
                                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-primary,#6c63ff)]/10 text-xs font-bold text-[var(--color-primary,#6c63ff)]">
                                                    {s.user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .slice(0, 2)}
                                                </span>
                                            )}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="truncate font-semibold text-[var(--text-primary)]">
                                                        {s.user.name}
                                                    </p>
                                                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                                                        s.type === "School"
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                                                            : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40"
                                                    }`}>
                                                        {s.type}
                                                    </span>
                                                </div>
                                                <p className="truncate text-xs text-[var(--text-secondary)]">
                                                    {s.user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <PlanBadge plan={s.plan} />
                                    </td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                                        {s.billingCycle}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                                        {s.currency}
                                        {s.amount.toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">
                                        {s.startedAt}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                                            <CalendarClock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                                            {s.renewsAt}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 sm:px-5">
                                        <StatusBadge status={s.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
            </>
            )}

            {/* Modal for manual subscription assignment */}
            <Modal isOpen={modalOpen} onClose={closeModal} title="Add Subscription" description="Create a new subscription for a user.">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* User selection dropdown */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">User</label>
                            <select value={form.userId} onChange={setField("userId")} className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50">
                                <option value="">{usersLoading ? "Loading users..." : "Select User"}</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.firstName} {u.lastName} ({u.email})
                                    </option>
                                ))}
                            </select>
                            {errors.userId && <p className="mt-1 text-xs text-rose-500">{errors.userId}</p>}
                        </div>

                        {/* Plan selection dropdown */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Plan</label>
                            <select value={form.planId} onChange={handlePlanChange} className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50">
                                <option value="">Select Plan</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.planName} (₹{p.price})
                                    </option>
                                ))}
                            </select>
                            {errors.planId && <p className="mt-1 text-xs text-rose-500">{errors.planId}</p>}
                        </div>

                        {/* Payment Method dropdown */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                            <select value={form.paymentMethod} onChange={setField("paymentMethod")} className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50">
                                <option value="CARD">Card</option>
                                <option value="UPI">UPI</option>
                                <option value="NET_BANKING">Net Banking</option>
                                <option value="WALLET">Wallet</option>
                                <option value="CASH">Cash</option>
                            </select>
                        </div>

                        {/* Amount field */}
                        <div>
                            <Input
                                label="Amount"
                                placeholder="Enter amount"
                                type="number"
                                value={form.amountPaid}
                                onChange={setField("amountPaid")}
                                error={errors.amountPaid}
                            />
                        </div>

                        {/* Transaction ID field */}
                        <div>
                            <Input
                                label="Transaction ID (Optional)"
                                placeholder="Enter transaction ID"
                                value={form.transactionId}
                                onChange={setField("transactionId")}
                            />
                        </div>

                        {/* Started At (read-only/disabled) */}
                        <div>
                            <Input
                                label="Started At"
                                type="date"
                                value={form.startedAt}
                                onChange={setField("startedAt")}
                                disabled
                            />
                        </div>
                    </div>

                    <div className="mt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit">Add Subscription</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default SubscriptionBilling;
