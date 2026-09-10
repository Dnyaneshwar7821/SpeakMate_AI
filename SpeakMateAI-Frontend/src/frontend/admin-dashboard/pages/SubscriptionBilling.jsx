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
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";

import Modal from "@components/common/Modal";
import SectionCard from "@admin/components/SectionCard";
import KpiCard from "@admin/components/KpiCard";

import { subscriptionApi } from "@services/admin/subscriptionApi";
import { adminUserApi } from "@services/admin/adminUserApi";
const SUBSCRIPTION_STATUS_OPTIONS = ["All", "Active", "Trial", "Past Due", "Cancelled"];
const BILLING_CYCLE_OPTIONS = ["Monthly", "Quarterly", "Annual"];

/**
 * admin-dashboard/pages/SubscriptionBilling.jsx
 *
 * Super Admin Panel > Subscription & Billing — displays subscribed users and their
 * subscription details (plan, billing cycle, status, amount, renewal date).
 * Frontend-only; mock data can be swapped for a real API later.
 */

const STATUS_STYLES = {
    Active: {
        badge: "bg-emerald-100 text-emerald-700",
        icon: CheckCircle2,
    },
    Cancelled: {
        badge: "bg-rose-100 text-rose-700",
        icon: XCircle,
    },
    "Past Due": {
        badge: "bg-amber-100 text-amber-700",
        icon: AlertTriangle,
    },
};

const PLAN_STYLES = {
    Basic: "bg-slate-100 text-slate-700",
    Premium: "bg-indigo-100 text-indigo-700",
    Pro: "bg-purple-100 text-purple-700",
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
    kpis: { total: 0, active: 0, revenue: 0 },
    plans: null,
    users: null,
};

export function SubscriptionBilling() {
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [subscriptions, setSubscriptions] = useState(() => subscriptionCache.subscriptions || []);
    const [kpis, setKpis] = useState(() => subscriptionCache.kpis || { total: 0, active: 0, revenue: 0 });
    const [plans, setPlans] = useState(() => subscriptionCache.plans || []);
    const [users, setUsers] = useState(() => subscriptionCache.users || []);
    const [loading, setLoading] = useState(() => !subscriptionCache.subscriptions);
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
            const userList = usersRes.data?.content || [];
            subscriptionCache.users = userList;
            setUsers(userList);
        } catch (err) {
            console.error("Failed to load users for subscription modal:", err);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    const loadAllData = useCallback(async (isSilent = false) => {
        if (!isSilent && !subscriptionCache.subscriptions) {
            setLoading(true);
        }
        try {
            const [subsRes, statsRes, plansRes] = await Promise.all([
                subscriptionApi.getUserSubscriptions(0, 100),
                subscriptionApi.getStatistics(),
                subscriptionApi.getAllPlans(0, 100),
            ]);

            const mappedSubs = (subsRes.data?.content || []).map((s) => ({
                id: s.id,
                user: {
                    id: s.userId,
                    name: `${s.userFirstName || ""} ${s.userLastName || ""}`.trim() || "Unknown User",
                    email: s.userEmail,
                },
                plan: s.planName,
                billingCycle: "Monthly",
                status: s.subscriptionStatus === "ACTIVE" ? "Active" : (s.subscriptionStatus === "CANCELLED" ? "Cancelled" : "Past Due"),
                amount: s.amountPaid || 0,
                currency: "₹",
                startedAt: s.startDate ? s.startDate.slice(0, 10) : "—",
                renewsAt: s.expiryDate ? s.expiryDate.slice(0, 10) : "—",
            }));
            subscriptionCache.subscriptions = mappedSubs;
            setSubscriptions(mappedSubs);

            const stats = statsRes.data || {};
            const newKpis = {
                total: stats.totalSubscribers || 0,
                active: stats.activeSubscribers || 0,
                revenue: stats.totalRevenue || 0,
            };
            subscriptionCache.kpis = newKpis;
            setKpis(newKpis);

            const planList = plansRes.data?.content || [];
            subscriptionCache.plans = planList;
            setPlans(planList);
        } catch (err) {
            console.error("Failed to load subscription page data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const isCached = Boolean(subscriptionCache.subscriptions);
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

    const handleSubmit = handleFormSubmit;

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
            const matchesQuery =
                !q ||
                s.user.name.toLowerCase().includes(q) ||
                s.user.email.toLowerCase().includes(q);
            const matchesPlan = planFilter === "All" || s.plan.toLowerCase() === planFilter.toLowerCase();
            const matchesStatus = statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase();
            return matchesQuery && matchesPlan && matchesStatus;
        });
    }, [search, planFilter, statusFilter, subscriptions]);

    const SUBSCRIPTION_PLAN_OPTIONS = useMemo(() => {
        return plans.map((p) => p.planName);
    }, [plans]);

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
                        <CreditCard className="h-5 w-5" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                                Subscription & Billing
                            </h1>
                            {loading && (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {loading ? "Loading subscriptions..." : "Track subscribed users, plans and revenue"}
                        </p>
                    </div>
                </div>
                <Button onClick={openModal} className="!h-11 shrink-0">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Subscription
                </Button>
            </motion.div>

            {/* KPI summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)]">
                            <div className="flex items-center justify-between">
                                <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                            </div>
                            <div className="mt-4 h-7 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-2 h-3 w-36 rounded bg-slate-100 dark:bg-slate-800" />
                        </div>
                    ))
                ) : (
                    <>
                        <KpiCard
                            kpi={{
                                id: "subs-total",
                                label: "Total Subscriptions",
                                value: kpis.total,
                                change: 0,
                                trend: "up",
                                icon: "users",
                                accent: "#6c63ff",
                                sparkline: [3, 3.4, 3.6, 4, 4.4, 4.8, 5.2, 5.6, 5.8, kpis.total],
                            }}
                            index={0}
                        />
                        <KpiCard
                            kpi={{
                                id: "subs-active",
                                label: "Active Subscriptions",
                                value: kpis.active,
                                change: 0,
                                trend: "up",
                                icon: "trending",
                                accent: "#22c55e",
                                sparkline: [2, 2.4, 2.8, 3.1, 3.4, 3.7, 4, 4.2, 4.4, kpis.active],
                            }}
                            index={1}
                        />
                        <KpiCard
                            kpi={{
                                id: "subs-revenue",
                                label: "Total Revenue",
                                value: kpis.revenue,
                                prefix: "₹",
                                change: 0,
                                trend: "up",
                                icon: "rupee",
                                accent: "#10b981",
                                sparkline: [28, 30, 33, 36, 39, 42, 45, 48, 51, kpis.revenue / 1000],
                            }}
                            index={2}
                        />
                    </>
                )}
            </div>

            {/* Subscriptions table */}
            <SectionCard
                title="Subscribed Users"
                subtitle="Plan, billing cycle, status and renewal details"
                delay={0.2}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative sm:w-56">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                            <Input
                                placeholder="Search user…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="!pl-9"
                            />
                        </div>
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
                            <option value="All">All Status</option>
                            {SUBSCRIPTION_STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
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
                                <th className="px-4 py-3 font-semibold sm:px-5">User</th>
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
                                                <p className="text-xs text-[var(--text-secondary)]">Please wait while subscription records are being fetched.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-[var(--text-muted)]"
                                    >
                                        No subscriptions match your filters.
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
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                                                {s.user.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-[var(--text-primary)]">
                                                    {s.user.name}
                                                </p>
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

            <Modal isOpen={modalOpen} onClose={closeModal} title="Add Subscription" description="Create a new subscription for a user.">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* User selection dropdown */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">User</label>
                            <select value={form.userId} onChange={setField("userId")} className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950/50">
                                <option value="">Select User</option>
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
