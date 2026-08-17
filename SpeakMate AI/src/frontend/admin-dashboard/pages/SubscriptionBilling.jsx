import { useMemo, useState } from "react";
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

import {
    adminSubscriptions,
    SUBSCRIPTION_PLAN_OPTIONS,
    SUBSCRIPTION_STATUS_OPTIONS,
    BILLING_CYCLE_OPTIONS,
} from "@admin/data/adminSubscriptionsMockData";

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

export function SubscriptionBilling() {
    const [search, setSearch] = useState("");
    const [planFilter, setPlanFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        plan: SUBSCRIPTION_PLAN_OPTIONS[0],
        billingCycle: BILLING_CYCLE_OPTIONS[0],
        status: SUBSCRIPTION_STATUS_OPTIONS[0],
        amount: "",
        currency: "₹",
        startedAt: "",
        renewsAt: "",
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

    const validate = () => {
        const next = {};
        if (!form.amount.trim()) next.amount = "Amount is required";
        else if (Number.isNaN(Number(form.amount))) next.amount = "Enter a valid amount";
        if (!form.startedAt) next.startedAt = "Start date is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate()) return;
        alert("Subscription added successfully");
        setModalOpen(false);
        setForm({
            plan: SUBSCRIPTION_PLAN_OPTIONS[0],
            billingCycle: BILLING_CYCLE_OPTIONS[0],
            status: SUBSCRIPTION_STATUS_OPTIONS[0],
            amount: "",
            currency: "₹",
            startedAt: "",
            renewsAt: "",
        });
        setErrors({});
    };

    const openModal = () => {
        setForm({
            plan: SUBSCRIPTION_PLAN_OPTIONS[0],
            billingCycle: BILLING_CYCLE_OPTIONS[0],
            status: SUBSCRIPTION_STATUS_OPTIONS[0],
            amount: "",
            currency: "₹",
            startedAt: "",
            renewsAt: "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => setModalOpen(false);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return adminSubscriptions.filter((s) => {
            const matchesQuery =
                !q ||
                s.user.name.toLowerCase().includes(q) ||
                s.user.email.toLowerCase().includes(q);
            const matchesPlan = planFilter === "All" || s.plan === planFilter;
            const matchesStatus = statusFilter === "All" || s.status === statusFilter;
            return matchesQuery && matchesPlan && matchesStatus;
        });
    }, [search, planFilter, statusFilter]);

    const kpis = useMemo(() => {
        const active = adminSubscriptions.filter((s) => s.status === "Active").length;
        const mrr = adminSubscriptions
            .filter((s) => s.status === "Active" && s.billingCycle === "Monthly")
            .reduce((sum, s) => sum + s.amount, 0);
        const arr = adminSubscriptions
            .filter((s) => s.status === "Active" && s.billingCycle === "Yearly")
            .reduce((sum, s) => sum + s.amount, 0);
        return {
            total: adminSubscriptions.length,
            active,
            revenue: mrr + arr,
        };
    }, []);

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
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Subscription & Billing
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Track subscribed users, plans and revenue
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
                <KpiCard
                    kpi={{
                        id: "subs-total",
                        label: "Total Subscriptions",
                        value: kpis.total,
                        change: 12.5,
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
                        change: 8.2,
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
                        change: 9.8,
                        trend: "up",
                        icon: "rupee",
                        accent: "#10b981",
                        sparkline: [28, 30, 33, 36, 39, 42, 45, 48, 51, kpis.revenue / 1000],
                    }}
                    index={2}
                />
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
                            {filtered.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-sm text-[var(--text-muted)]"
                                    >
                                        No subscriptions match your filters.
                                    </td>
                                </tr>
                            )}
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
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Plan</label>
                            <select value={form.plan} onChange={setField("plan")} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                                {SUBSCRIPTION_PLAN_OPTIONS.map((p) => (
                                    <option key={p} value={p}>
                                        {p}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Billing Cycle</label>
                            <select value={form.billingCycle} onChange={setField("billingCycle")} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                                {BILLING_CYCLE_OPTIONS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
                            <select value={form.status} onChange={setField("status")} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                                {SUBSCRIPTION_STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Input
                                label="Amount"
                                placeholder="Enter amount"
                                type="number"
                                value={form.amount}
                                onChange={setField("amount")}
                                error={errors.amount}
                            />
                        </div>
                        <div>
                            <Input
                                label="Started At"
                                type="date"
                                value={form.startedAt}
                                onChange={setField("startedAt")}
                                error={errors.startedAt}
                            />
                        </div>
                        <div>
                            <Input
                                label="Renews At"
                                type="date"
                                value={form.renewsAt}
                                onChange={setField("renewsAt")}
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
