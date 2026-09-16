import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    ShieldCheck,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Plus,
    RefreshCw,
    Eye,
    Edit3,
    Lock,
    Users,
    Check,
    Search,
    Archive,
    Sliders,
    Zap,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";
import SectionCard from "@admin/components/SectionCard";
import { subscriptionApi } from "@services/admin/subscriptionApi";

const CORE_PLAN_NAMES = ["FREE", "FREE_STARTER", "MONTHLY_PRO", "YEARLY_PRO"];

function isCorePlan(name) {
    if (!name) return false;
    return CORE_PLAN_NAMES.includes(name.trim().toUpperCase());
}

function isLegacyPlan(plan) {
    if (!plan) return false;
    const name = (plan.planName || "").toUpperCase();
    const curr = (plan.currency || "").toUpperCase();
    return curr === "USD" || name.includes("UPDATED") || (!isCorePlan(name) && curr !== "INR");
}

export function SubscriptionPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive

    // Modals
    const [detailsModal, setDetailsModal] = useState({ open: false, plan: null });
    const [editModal, setEditModal] = useState({ open: false, plan: null });
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ open: false, plan: null, action: null });

    // Forms
    const [formData, setFormData] = useState({
        planName: "",
        description: "",
        durationMonths: 1,
        billingCycle: "MONTHLY",
        price: "",
        currency: "INR",
        features: "",
        maxLessons: 9999,
        maxTests: 9999,
        aiPracticeLimit: 9999,
        grammarPracticeLimit: 9999,
        speakingPracticeLimit: 9999,
        vocabularyPracticeLimit: 9999,
        aiMinutesLimit: 9999,
        isActive: true,
    });
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const loadPlans = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);
        setError(null);
        try {
            const res = await subscriptionApi.getAllPlans(0, 100);
            const content = res.data?.content || [];
            setPlans(content);
        } catch (err) {
            console.error("Failed to fetch subscription plans:", err);
            setError(err.response?.data?.message || err.message || "Failed to load subscription plans from backend.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    const notifySuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(""), 4000);
    };

    // Partition plans into Current SpeakMate Plans vs Legacy USD Plans vs Custom Plans
    const { currentPlans, customPlans, legacyPlans } = useMemo(() => {
        const current = [];
        const custom = [];
        const legacy = [];

        plans.forEach((p) => {
            const upper = (p.planName || "").toUpperCase();
            if (isCorePlan(upper)) {
                current.push(p);
            } else if (isLegacyPlan(p)) {
                legacy.push(p);
            } else {
                custom.push(p);
            }
        });

        // Ensure order: FREE_STARTER, MONTHLY_PRO, YEARLY_PRO
        current.sort((a, b) => {
            const order = { FREE_STARTER: 1, FREE: 1, MONTHLY_PRO: 2, YEARLY_PRO: 3 };
            const aOrder = order[a.planName?.toUpperCase()] || 99;
            const bOrder = order[b.planName?.toUpperCase()] || 99;
            return aOrder - bOrder;
        });

        return { currentPlans: current, customPlans: custom, legacyPlans: legacy };
    }, [plans]);

    // Filtered lists
    const matchesFilter = useCallback(
        (plan) => {
            if (statusFilter === "Active" && !plan.isActive) return false;
            if (statusFilter === "Inactive" && plan.isActive) return false;
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                (plan.planName && plan.planName.toLowerCase().includes(q)) ||
                (plan.description && plan.description.toLowerCase().includes(q)) ||
                (plan.features && plan.features.toLowerCase().includes(q))
            );
        },
        [search, statusFilter]
    );

    const filteredCurrent = useMemo(() => currentPlans.filter(matchesFilter), [currentPlans, matchesFilter]);
    const filteredCustom = useMemo(() => customPlans.filter(matchesFilter), [customPlans, matchesFilter]);
    const filteredLegacy = useMemo(() => legacyPlans.filter(matchesFilter), [legacyPlans, matchesFilter]);

    // Open Add Plan Modal
    const openAddPlan = () => {
        setFormData({
            planName: "",
            description: "",
            durationMonths: 1,
            billingCycle: "MONTHLY",
            price: "",
            currency: "INR",
            features: "Unlimited AI Speaking Practice, Grammar Doctor, Daily Vocabulary",
            maxLessons: 9999,
            maxTests: 9999,
            aiPracticeLimit: 9999,
            grammarPracticeLimit: 9999,
            speakingPracticeLimit: 9999,
            vocabularyPracticeLimit: 9999,
            aiMinutesLimit: 9999,
            isActive: true,
        });
        setFormErrors({});
        setAddModalOpen(true);
    };

    // Open Edit Plan Modal
    const openEditPlan = (plan) => {
        let cycle = plan.billingCycle;
        if (!cycle || !["MONTHLY", "YEARLY", "LIFETIME"].includes(cycle.toUpperCase())) {
            cycle = plan.durationMonths === 12 ? "YEARLY" : plan.durationMonths === 0 ? "LIFETIME" : "MONTHLY";
        } else {
            cycle = cycle.toUpperCase();
        }

        setFormData({
            id: plan.id,
            planName: plan.planName,
            description: plan.description || "",
            durationMonths: plan.durationMonths ?? 1,
            billingCycle: cycle,
            price: plan.price ?? 0,
            currency: plan.currency || "INR",
            features: plan.features || "",
            maxLessons: plan.maxLessons ?? 9999,
            maxTests: plan.maxTests ?? 9999,
            aiPracticeLimit: plan.aiPracticeLimit ?? 9999,
            grammarPracticeLimit: plan.grammarPracticeLimit ?? 9999,
            speakingPracticeLimit: plan.speakingPracticeLimit ?? 9999,
            vocabularyPracticeLimit: plan.vocabularyPracticeLimit ?? 9999,
            aiMinutesLimit: plan.aiMinutesLimit ?? 9999,
            isActive: plan.isActive ?? true,
        });
        setFormErrors({});
        setEditModal({ open: true, plan });
    };

    // Validate Form
    const validatePlanForm = (isEdit = false, originalPlan = null) => {
        const errs = {};
        const isCore = isEdit && isCorePlan(originalPlan?.planName);

        if (!isCore) {
            if (!formData.planName || !formData.planName.trim()) {
                errs.planName = "Plan name/identifier is required";
            } else if (isCorePlan(formData.planName) && (!isEdit || formData.planName.toUpperCase() !== originalPlan?.planName?.toUpperCase())) {
                errs.planName = "This identifier is reserved for core SpeakMate learner plans";
            }
            if (formData.price === "" || formData.price === null || Number(formData.price) < 0) {
                errs.price = "Valid price is required (0 or greater)";
            }
            if (!["MONTHLY", "YEARLY", "LIFETIME"].includes(formData.billingCycle)) {
                errs.billingCycle = "Supported billing cycles are: MONTHLY, YEARLY, LIFETIME";
            }
            if (formData.currency !== "INR" && formData.currency !== "USD") {
                errs.currency = "Currency must be INR or USD";
            }
        }

        if (!formData.features || !formData.features.trim()) {
            errs.features = "At least one feature description is required";
        }

        // Validate limits are non-negative
        const limitFields = [
            ["maxLessons", "Max lessons"],
            ["maxTests", "Max tests"],
            ["aiPracticeLimit", "AI practice limit"],
            ["grammarPracticeLimit", "Grammar limit"],
            ["speakingPracticeLimit", "Speaking limit"],
            ["vocabularyPracticeLimit", "Vocabulary limit"],
            ["aiMinutesLimit", "AI minutes limit"],
        ];
        for (const [key, label] of limitFields) {
            if (formData[key] !== "" && formData[key] !== null && Number(formData[key]) < 0) {
                errs[key] = `${label} cannot be negative`;
            }
        }

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Handle Create Plan
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!validatePlanForm(false)) return;
        setSubmitting(true);
        try {
            await subscriptionApi.createPlan({
                planName: formData.planName.trim(),
                description: formData.description.trim(),
                durationMonths: Number(formData.durationMonths),
                billingCycle: formData.billingCycle,
                price: Number(formData.price),
                currency: formData.currency.trim().toUpperCase(),
                features: formData.features.trim(),
                maxLessons: Number(formData.maxLessons) >= 0 ? Number(formData.maxLessons) : 9999,
                maxTests: Number(formData.maxTests) >= 0 ? Number(formData.maxTests) : 9999,
                aiPracticeLimit: Number(formData.aiPracticeLimit) >= 0 ? Number(formData.aiPracticeLimit) : 9999,
                grammarPracticeLimit: Number(formData.grammarPracticeLimit) >= 0 ? Number(formData.grammarPracticeLimit) : 9999,
                speakingPracticeLimit: Number(formData.speakingPracticeLimit) >= 0 ? Number(formData.speakingPracticeLimit) : 9999,
                vocabularyPracticeLimit: Number(formData.vocabularyPracticeLimit) >= 0 ? Number(formData.vocabularyPracticeLimit) : 9999,
                aiMinutesLimit: Number(formData.aiMinutesLimit) >= 0 ? Number(formData.aiMinutesLimit) : 9999,
                isActive: Boolean(formData.isActive),
            });
            notifySuccess(`Plan "${formData.planName}" created successfully!`);
            setAddModalOpen(false);
            loadPlans(true);
        } catch (err) {
            console.error("Failed to create plan:", err);
            alert(err.response?.data?.message || err.message || "Failed to create plan.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Edit Plan
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validatePlanForm(true, editModal.plan)) return;
        setSubmitting(true);
        const isCore = isCorePlan(editModal.plan.planName);
        try {
            await subscriptionApi.updatePlan(editModal.plan.id, {
                planName: editModal.plan.planName, // Ensure core identifiers remain intact
                description: formData.description.trim(),
                durationMonths: isCore ? editModal.plan.durationMonths : Number(formData.durationMonths),
                billingCycle: isCore ? editModal.plan.billingCycle : formData.billingCycle,
                price: isCore ? editModal.plan.price : Number(formData.price),
                currency: isCore ? editModal.plan.currency : formData.currency.trim().toUpperCase(),
                features: formData.features.trim(),
                maxLessons: isCore ? editModal.plan.maxLessons : (Number(formData.maxLessons) >= 0 ? Number(formData.maxLessons) : 9999),
                maxTests: isCore ? editModal.plan.maxTests : (Number(formData.maxTests) >= 0 ? Number(formData.maxTests) : 9999),
                aiPracticeLimit: isCore ? editModal.plan.aiPracticeLimit : (Number(formData.aiPracticeLimit) >= 0 ? Number(formData.aiPracticeLimit) : 9999),
                grammarPracticeLimit: isCore ? editModal.plan.grammarPracticeLimit : (Number(formData.grammarPracticeLimit) >= 0 ? Number(formData.grammarPracticeLimit) : 9999),
                speakingPracticeLimit: isCore ? editModal.plan.speakingPracticeLimit : (Number(formData.speakingPracticeLimit) >= 0 ? Number(formData.speakingPracticeLimit) : 9999),
                vocabularyPracticeLimit: isCore ? editModal.plan.vocabularyPracticeLimit : (Number(formData.vocabularyPracticeLimit) >= 0 ? Number(formData.vocabularyPracticeLimit) : 9999),
                aiMinutesLimit: isCore ? editModal.plan.aiMinutesLimit : (Number(formData.aiMinutesLimit) >= 0 ? Number(formData.aiMinutesLimit) : 9999),
                isActive: Boolean(formData.isActive),
            });
            notifySuccess(`Plan "${editModal.plan.planName}" updated successfully!`);
            setEditModal({ open: false, plan: null });
            loadPlans(true);
        } catch (err) {
            console.error("Failed to update plan:", err);
            alert(err.response?.data?.message || err.message || "Failed to update plan.");
        } finally {
            setSubmitting(false);
        }
    };

    // Open Confirmation Dialog
    const confirmToggleActive = (plan, action) => {
        setConfirmModal({ open: true, plan, action });
    };

    // Execute Toggle Active
    const handleConfirmToggle = async () => {
        if (!confirmModal.plan) return;
        const plan = confirmModal.plan;
        const action = confirmModal.action;
        setSubmitting(true);
        try {
            if (action === "activate") {
                await subscriptionApi.activatePlan(plan.id);
                notifySuccess(`Plan "${plan.planName}" has been activated.`);
            } else {
                await subscriptionApi.deactivatePlan(plan.id);
                notifySuccess(`Plan "${plan.planName}" has been deactivated.`);
            }
            setConfirmModal({ open: false, plan: null, action: null });
            loadPlans(true);
        } catch (err) {
            console.error(`Failed to ${action} plan:`, err);
            alert(err.response?.data?.message || err.message || `Failed to ${action} plan.`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary,#6c63ff)]/10 text-[var(--color-primary,#6c63ff)]">
                        <Sliders className="h-5 w-5" />
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                                Subscription Plans
                            </h2>
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Super Admin
                            </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Manage official SpeakMate tiers, custom enterprise plans, and inspect subscriber counts
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                        variant="secondary"
                        onClick={() => loadPlans(true)}
                        disabled={loading || isRefreshing}
                        className="!h-10 text-xs sm:text-sm"
                    >
                        <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Syncing..." : "Refresh"}
                    </Button>
                    <Button onClick={openAddPlan} className="!h-10 text-xs sm:text-sm">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Custom Plan
                    </Button>
                </div>
            </motion.div>

            {/* Success Toast / Banner */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{successMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
                    <div className="flex items-center gap-2.5">
                        <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold">Failed to load plans</p>
                            <p className="text-xs opacity-90">{error}</p>
                        </div>
                    </div>
                    <Button variant="secondary" onClick={() => loadPlans()} className="!h-8 text-xs !bg-rose-100 hover:!bg-rose-200">
                        Retry
                    </Button>
                </div>
            )}

            {/* Filters bar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative sm:w-72">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                    <Input
                        placeholder="Search plans by name…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="!pl-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-9 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--color-primary)]"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active Only</option>
                        <option value="Inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* SECTION 1: Current SpeakMate Learner Plans (Prominent) */}
            <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            Current SpeakMate Learner Plans
                        </h3>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Official learner-facing product structure: Free Starter, Pro Monthly, and Pro Annual
                        </p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                        {currentPlans.length} Core System Tiers
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={`plan-skel-${i}`} className="animate-pulse rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 space-y-4">
                                <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="h-8 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                                <div className="h-16 rounded bg-slate-100 dark:bg-slate-800" />
                                <div className="h-10 rounded bg-slate-100 dark:bg-slate-800" />
                            </div>
                        ))}
                    </div>
                ) : filteredCurrent.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
                        No core plans match your search filter.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {filteredCurrent.map((p) => {
                            const upper = p.planName?.toUpperCase();
                            const isFree = upper === "FREE_STARTER" || upper === "FREE";
                            const isMonthly = upper === "MONTHLY_PRO";
                            const isAnnual = upper === "YEARLY_PRO";

                            return (
                                <motion.div
                                    key={p.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`relative flex flex-col justify-between rounded-2xl border bg-[var(--bg-surface)] p-5 shadow-sm transition-all hover:shadow-md ${
                                        isAnnual
                                            ? "border-pink-500/40 bg-gradient-to-b from-pink-500/[0.04] to-transparent ring-1 ring-pink-500/20"
                                            : isMonthly
                                            ? "border-indigo-500/40 bg-gradient-to-b from-indigo-500/[0.04] to-transparent ring-1 ring-indigo-500/20"
                                            : "border-[var(--border-default)]"
                                    }`}
                                >
                                    {/* Top row */}
                                    <div>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <h4 className="text-base font-extrabold text-[var(--text-primary)]">
                                                        {isFree
                                                            ? "Free Starter"
                                                            : isMonthly
                                                            ? "SpeakMate Pro Monthly"
                                                            : "SpeakMate Pro Annual"}
                                                    </h4>
                                                </div>
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                                                        {p.planName}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:text-slate-300">
                                                        <Lock className="h-2.5 w-2.5" /> Core Protected
                                                    </span>
                                                </div>
                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                    p.isActive
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                                }`}
                                            >
                                                {p.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                                {p.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>

                                        {/* Price block */}
                                        <div className="mt-4 flex items-baseline gap-1.5">
                                            <span className="text-3xl font-black text-[var(--text-primary)]">
                                                {isFree ? "₹0" : isMonthly ? "₹149" : "₹1,199"}
                                            </span>
                                            <span className="text-xs text-[var(--text-secondary)]">
                                                {isFree
                                                    ? "/ forever"
                                                    : isMonthly
                                                    ? "/ month"
                                                    : "/ year (₹99/mo eq.)"}
                                            </span>
                                        </div>

                                        {isAnnual && (
                                            <div className="mt-1.5 inline-block rounded-md bg-pink-100 dark:bg-pink-950/60 px-2 py-0.5 text-[11px] font-bold text-pink-700 dark:text-pink-300">
                                                🎉 Save 33% vs Monthly Pass
                                            </div>
                                        )}

                                        {/* Subscriber Count Chip */}
                                        <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--bg-elevated)]/60 px-3.5 py-2 text-xs border border-[var(--border-subtle)]">
                                            <span className="text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
                                                <Users className="h-3.5 w-3.5 text-[var(--color-primary,#6c63ff)]" />
                                                Subscribers:
                                            </span>
                                            <span className="font-extrabold text-[var(--text-primary)]">
                                                {(p.subscriberCount ?? 0).toLocaleString("en-IN")}
                                                <span className="ml-1 text-[10px] font-normal text-[var(--text-muted)]">
                                                    ({(p.activeSubscriberCount ?? 0).toLocaleString("en-IN")} active)
                                                </span>
                                            </span>
                                        </div>

                                        {/* Description & Features summary */}
                                        <div className="mt-4 space-y-2 text-xs text-[var(--text-secondary)]">
                                            <p className="line-clamp-2 italic text-[11px] text-[var(--text-muted)]">
                                                {p.description || "Official SpeakMate core learning tier."}
                                            </p>
                                            <ul className="space-y-1.5 text-[11px]">
                                                {isFree ? (
                                                    <>
                                                        <li className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                                                            <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                            15 mins AI Speaking Practice daily
                                                        </li>
                                                        <li className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                                                            <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                            15 Grammar Doctor checks/day
                                                        </li>
                                                        <li className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                                                            <Check className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                                            Core vocabulary & speech tests
                                                        </li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                                                            <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                                            Unlimited AI Speaking Practice
                                                        </li>
                                                        <li className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                                                            <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                                            Unlimited Grammar Doctor
                                                        </li>
                                                        <li className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                                                            <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                                                            All 100+ Speaking Scenarios & Avatars
                                                        </li>
                                                        {isAnnual && (
                                                            <li className="flex items-center gap-1.5 font-semibold text-pink-600 dark:text-pink-400">
                                                                <Sparkles className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                                                                Official CEFR Fluency Certificate
                                                            </li>
                                                        )}
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-5 border-t border-[var(--border-subtle)] pt-4 flex items-center justify-between gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setDetailsModal({ open: true, plan: p })}
                                            className="!h-8 !px-2.5 text-xs flex-1"
                                        >
                                            <Eye className="mr-1 h-3.5 w-3.5" /> Details
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => openEditPlan(p)}
                                            className="!h-8 !px-2.5 text-xs flex-1"
                                        >
                                            <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
                                        </Button>
                                        {!isFree && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => confirmToggleActive(p, p.isActive ? "deactivate" : "activate")}
                                                className={`!h-8 !px-2 text-xs ${
                                                    p.isActive
                                                        ? "hover:!border-rose-300 hover:!text-rose-600"
                                                        : "hover:!border-emerald-300 hover:!text-emerald-600"
                                                }`}
                                                title={p.isActive ? "Deactivate Plan" : "Activate Plan"}
                                            >
                                                {p.isActive ? "Deactivate" : "Activate"}
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SECTION 2: Custom / Enterprise Plans (if any) */}
            {customPlans.length > 0 && (
                <SectionCard
                    title="Custom & Enterprise Plans"
                    subtitle="Dynamic custom plans created by Super Admin"
                    action={<span className="text-xs font-semibold text-[var(--text-muted)]">{customPlans.length} Plans</span>}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredCustom.map((p) => (
                            <div key={p.id} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-[var(--text-primary)]">{p.planName}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                                        {p.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="text-xl font-extrabold text-[var(--text-primary)]">
                                    {p.currency} {p.price.toLocaleString("en-IN")}
                                    <span className="text-xs font-normal text-[var(--text-secondary)]"> / {p.durationMonths}m</span>
                                </div>
                                <div className="text-xs text-[var(--text-secondary)] line-clamp-2">
                                    {p.features}
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                                    <Button variant="secondary" onClick={() => setDetailsModal({ open: true, plan: p })} className="!h-7 text-xs !px-2">
                                        Details
                                    </Button>
                                    <Button variant="secondary" onClick={() => openEditPlan(p)} className="!h-7 text-xs !px-2">
                                        Edit
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => confirmToggleActive(p, p.isActive ? "deactivate" : "activate")}
                                        className="!h-7 text-xs !px-2"
                                    >
                                        {p.isActive ? "Deactivate" : "Activate"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            )}

            {/* SECTION 3: Legacy / Archived USD Plans (Clearly Separated) */}
            <SectionCard
                title="Legacy / Archived USD Plans"
                subtitle="Deprecated initial tiers preserved for database integrity and historical records. Not presented to SpeakMate learners."
                delay={0.2}
                action={
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                        <Archive className="h-3.5 w-3.5" />
                        Legacy Archive (USD)
                    </span>
                }
            >
                {filteredLegacy.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] py-4 text-center">No legacy plans match filters.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                                    <th className="px-4 py-2.5 font-semibold">Legacy Plan Name</th>
                                    <th className="px-4 py-2.5 font-semibold">Status</th>
                                    <th className="px-4 py-2.5 font-semibold">Legacy Price</th>
                                    <th className="px-4 py-2.5 font-semibold">Duration</th>
                                    <th className="px-4 py-2.5 font-semibold">Subscribers</th>
                                    <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLegacy.map((p) => (
                                    <tr key={p.id} className="border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-hover)]">
                                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                                            <div className="flex items-center gap-2">
                                                <span>{p.planName}</span>
                                                <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                                    USD
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                p.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                            }`}>
                                                {p.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono font-medium text-[var(--text-secondary)]">
                                            ${p.price} {p.currency}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                                            {p.durationMonths} Months ({p.billingCycle || "Annual"})
                                        </td>
                                        <td className="px-4 py-3 text-xs font-semibold text-[var(--text-primary)]">
                                            {p.subscriberCount ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setDetailsModal({ open: true, plan: p })}
                                                    className="!h-7 !px-2 text-xs"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" /> View
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => confirmToggleActive(p, p.isActive ? "deactivate" : "activate")}
                                                    className="!h-7 !px-2 text-xs"
                                                >
                                                    {p.isActive ? "Deactivate" : "Activate"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </SectionCard>

            {/* MODAL 1: Plan Details View */}
            <Modal
                isOpen={detailsModal.open}
                onClose={() => setDetailsModal({ open: false, plan: null })}
                title={detailsModal.plan?.planName || "Plan Details"}
                description="Comprehensive plan configuration, limits, and database metadata."
            >
                {detailsModal.plan && (
                    <div className="space-y-4 text-sm">
                        {isCorePlan(detailsModal.plan.planName) && (
                            <div className="flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 p-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                                <Lock className="h-4 w-4 shrink-0" />
                                <span>System Protected — Core Learner Plan. Pricing and core identifiers cannot be altered.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Price</span>
                                <div className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                    {detailsModal.plan.currency} {detailsModal.plan.price}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Billing Cycle</span>
                                <div className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                    {detailsModal.plan.billingCycle || `${detailsModal.plan.durationMonths} Months`}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Status</span>
                                <div className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                    {detailsModal.plan.isActive ? "Active" : "Inactive"}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Subscribers</span>
                                <div className="mt-1 text-base font-bold text-[var(--text-primary)]">
                                    {(detailsModal.plan.subscriberCount ?? 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Active Subscribers</span>
                                <div className="mt-1 text-base font-bold text-emerald-600">
                                    {(detailsModal.plan.activeSubscriberCount ?? 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)]/50 p-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Plan ID</span>
                                <div className="mt-1 text-base font-mono font-bold text-[var(--text-primary)]">
                                    #{detailsModal.plan.id}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)]">Description:</span>
                            <p className="mt-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-xs text-[var(--text-primary)]">
                                {detailsModal.plan.description || "No description provided."}
                            </p>
                        </div>

                        {/* Features */}
                        <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)]">Features:</span>
                            <p className="mt-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-xs text-[var(--text-primary)]">
                                {detailsModal.plan.features || "No feature flags configured."}
                            </p>
                        </div>

                        {/* Usage Limits */}
                        <div>
                            <span className="text-xs font-bold text-[var(--text-secondary)]">Usage Limits:</span>
                            <div className="mt-1 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                                <div className="rounded-lg bg-[var(--bg-elevated)]/50 p-2 border border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-[var(--text-muted)] block">Max Lessons</span>
                                    <span className="font-bold text-[var(--text-primary)]">{detailsModal.plan.maxLessons ?? "Unlimited"}</span>
                                </div>
                                <div className="rounded-lg bg-[var(--bg-elevated)]/50 p-2 border border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-[var(--text-muted)] block">Max Tests</span>
                                    <span className="font-bold text-[var(--text-primary)]">{detailsModal.plan.maxTests ?? "Unlimited"}</span>
                                </div>
                                <div className="rounded-lg bg-[var(--bg-elevated)]/50 p-2 border border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-[var(--text-muted)] block">AI Practice Limit</span>
                                    <span className="font-bold text-[var(--text-primary)]">{detailsModal.plan.aiPracticeLimit ?? "Unlimited"}</span>
                                </div>
                                <div className="rounded-lg bg-[var(--bg-elevated)]/50 p-2 border border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-[var(--text-muted)] block">Grammar Limit</span>
                                    <span className="font-bold text-[var(--text-primary)]">{detailsModal.plan.grammarPracticeLimit ?? "Unlimited"}</span>
                                </div>
                                <div className="rounded-lg bg-[var(--bg-elevated)]/50 p-2 border border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-[var(--text-muted)] block">Speaking Limit</span>
                                    <span className="font-bold text-[var(--text-primary)]">{detailsModal.plan.speakingPracticeLimit ?? "Unlimited"}</span>
                                </div>
                                <div className="rounded-lg bg-[var(--bg-elevated)]/50 p-2 border border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-[var(--text-muted)] block">Vocabulary Limit</span>
                                    <span className="font-bold text-[var(--text-primary)]">{detailsModal.plan.vocabularyPracticeLimit ?? "Unlimited"}</span>
                                </div>
                                <div className="rounded-lg bg-[var(--bg-elevated)]/50 p-2 border border-[var(--border-subtle)]">
                                    <span className="text-[10px] text-[var(--text-muted)] block">AI Minutes Limit</span>
                                    <span className="font-bold text-[var(--text-primary)]">{detailsModal.plan.aiMinutesLimit ?? "Unlimited"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                            <span>Created: {detailsModal.plan.createdAt ? detailsModal.plan.createdAt.slice(0, 10) : "—"}</span>
                            <span>Updated: {detailsModal.plan.updatedAt ? detailsModal.plan.updatedAt.slice(0, 10) : "—"}</span>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button variant="secondary" onClick={() => setDetailsModal({ open: false, plan: null })}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 2: Add Custom Plan */}
            <Modal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                title="Create Custom Subscription Plan"
                description="Add a new custom or enterprise plan for SpeakMate learners."
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <Input
                                label="Plan Identifier / Name"
                                placeholder="e.g. ENTERPRISE_CORP"
                                value={formData.planName}
                                onChange={(e) => setFormData((p) => ({ ...p, planName: e.target.value.toUpperCase() }))}
                                error={formErrors.planName}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                label="Price"
                                type="number"
                                placeholder="e.g. 2999"
                                value={formData.price}
                                onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                                error={formErrors.price}
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">Currency</label>
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
                                className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">Billing Cycle</label>
                            <select
                                value={formData.billingCycle}
                                onChange={(e) => {
                                    const cycle = e.target.value;
                                    let dur = 1;
                                    if (cycle === "YEARLY") dur = 12;
                                    else if (cycle === "LIFETIME") dur = 0;
                                    setFormData((p) => ({ ...p, billingCycle: cycle, durationMonths: dur }));
                                }}
                                className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)]"
                            >
                                <option value="MONTHLY">Monthly (1 Month)</option>
                                <option value="YEARLY">Yearly (12 Months)</option>
                                <option value="LIFETIME">Lifetime (0 Months)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <Input
                            label="Description"
                            placeholder="Brief description of the plan purpose"
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        />
                    </div>

                    <div>
                        <Input
                            label="Features (comma-separated or list)"
                            placeholder="Unlimited AI Speaking, Grammar Doctor, Priority Latency"
                            value={formData.features}
                            onChange={(e) => setFormData((p) => ({ ...p, features: e.target.value }))}
                            error={formErrors.features}
                            required
                        />
                    </div>

                    {/* Limits */}
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                        <span className="text-xs font-bold text-[var(--text-secondary)] mb-2 block">Usage Limits (Set 9999 for unlimited):</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            <Input
                                label="Max Lessons"
                                type="number"
                                value={formData.maxLessons}
                                onChange={(e) => setFormData((p) => ({ ...p, maxLessons: e.target.value }))}
                            />
                            <Input
                                label="Max Tests"
                                type="number"
                                value={formData.maxTests}
                                onChange={(e) => setFormData((p) => ({ ...p, maxTests: e.target.value }))}
                            />
                            <Input
                                label="AI Practice Limit"
                                type="number"
                                value={formData.aiPracticeLimit}
                                onChange={(e) => setFormData((p) => ({ ...p, aiPracticeLimit: e.target.value }))}
                            />
                            <Input
                                label="Grammar Limit"
                                type="number"
                                value={formData.grammarPracticeLimit}
                                onChange={(e) => setFormData((p) => ({ ...p, grammarPracticeLimit: e.target.value }))}
                            />
                            <Input
                                label="Speaking Limit"
                                type="number"
                                value={formData.speakingPracticeLimit}
                                onChange={(e) => setFormData((p) => ({ ...p, speakingPracticeLimit: e.target.value }))}
                            />
                            <Input
                                label="Vocabulary Limit"
                                type="number"
                                value={formData.vocabularyPracticeLimit}
                                onChange={(e) => setFormData((p) => ({ ...p, vocabularyPracticeLimit: e.target.value }))}
                            />
                            <Input
                                label="AI Minutes Limit"
                                type="number"
                                value={formData.aiMinutesLimit}
                                onChange={(e) => setFormData((p) => ({ ...p, aiMinutesLimit: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3">
                        <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Creating..." : "Create Plan"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 3: Edit Plan */}
            <Modal
                isOpen={editModal.open}
                onClose={() => setEditModal({ open: false, plan: null })}
                title={`Edit Plan: ${editModal.plan?.planName || ""}`}
                description="Update plan features, description, and usage limits."
            >
                {editModal.plan && (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        {isCorePlan(editModal.plan.planName) && (
                            <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 p-3 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                                <Lock className="h-4 w-4 shrink-0 text-amber-600" />
                                <div>
                                    <p className="font-bold">System Protected — Core Learner Plan</p>
                                    <p className="font-normal opacity-90">
                                        Plan identifier, pricing, currency, duration, billing cycle, and learner usage limits are locked to protect learner checkout and entitlement engine.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <Input
                                    label="Plan Identifier / Name"
                                    value={formData.planName}
                                    onChange={(e) => setFormData((p) => ({ ...p, planName: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                    error={formErrors.planName}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                    error={formErrors.price}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Currency"
                                    value={formData.currency}
                                    onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-[var(--text-secondary)]">Billing Cycle</label>
                                <select
                                    value={formData.billingCycle}
                                    onChange={(e) => {
                                        const cycle = e.target.value;
                                        let dur = 1;
                                        if (cycle === "YEARLY") dur = 12;
                                        else if (cycle === "LIFETIME") dur = 0;
                                        setFormData((p) => ({ ...p, billingCycle: cycle, durationMonths: dur }));
                                    }}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                    className="h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] disabled:opacity-60 disabled:bg-[var(--bg-elevated)]"
                                >
                                    <option value="MONTHLY">Monthly (1 Month)</option>
                                    <option value="YEARLY">Yearly (12 Months)</option>
                                    <option value="LIFETIME">Lifetime (0 Months)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Input
                                label="Features"
                                value={formData.features}
                                onChange={(e) => setFormData((p) => ({ ...p, features: e.target.value }))}
                                error={formErrors.features}
                            />
                        </div>

                        {/* Usage Limits */}
                        <div className="pt-2 border-t border-[var(--border-subtle)]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[var(--text-secondary)]">Usage Limits:</span>
                                {isCorePlan(editModal.plan.planName) && (
                                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                        <Lock className="h-3 w-3" /> System-Protected Learner Limits (Read-Only)
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                <Input
                                    label="Max Lessons"
                                    type="number"
                                    value={formData.maxLessons}
                                    onChange={(e) => setFormData((p) => ({ ...p, maxLessons: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                                <Input
                                    label="Max Tests"
                                    type="number"
                                    value={formData.maxTests}
                                    onChange={(e) => setFormData((p) => ({ ...p, maxTests: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                                <Input
                                    label="AI Practice Limit"
                                    type="number"
                                    value={formData.aiPracticeLimit}
                                    onChange={(e) => setFormData((p) => ({ ...p, aiPracticeLimit: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                                <Input
                                    label="Grammar Limit"
                                    type="number"
                                    value={formData.grammarPracticeLimit}
                                    onChange={(e) => setFormData((p) => ({ ...p, grammarPracticeLimit: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                                <Input
                                    label="Speaking Limit"
                                    type="number"
                                    value={formData.speakingPracticeLimit}
                                    onChange={(e) => setFormData((p) => ({ ...p, speakingPracticeLimit: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                                <Input
                                    label="Vocabulary Limit"
                                    type="number"
                                    value={formData.vocabularyPracticeLimit}
                                    onChange={(e) => setFormData((p) => ({ ...p, vocabularyPracticeLimit: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                                <Input
                                    label="AI Minutes Limit"
                                    type="number"
                                    value={formData.aiMinutesLimit}
                                    onChange={(e) => setFormData((p) => ({ ...p, aiMinutesLimit: e.target.value }))}
                                    disabled={isCorePlan(editModal.plan.planName)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3">
                            <Button type="button" variant="secondary" onClick={() => setEditModal({ open: false, plan: null })}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* MODAL 4: Confirmation Dialog for Activate/Deactivate */}
            <Modal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, plan: null, action: null })}
                title={confirmModal.action === "activate" ? "Activate Subscription Plan" : "Deactivate Subscription Plan"}
                description={`Please confirm this action for "${confirmModal.plan?.planName || ""}".`}
            >
                {confirmModal.plan && (
                    <div className="space-y-4 text-sm">
                        {isCorePlan(confirmModal.plan.planName) && confirmModal.action === "deactivate" && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
                                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                                <div>
                                    <p className="font-bold">Caution: Core Learner Plan</p>
                                    <p className="mt-0.5">
                                        This is a primary SpeakMate learner tier. Deactivating it will prevent learners from selecting this plan during checkout.
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-[var(--text-secondary)]">
                            Are you sure you want to{" "}
                            <strong className="text-[var(--text-primary)]">
                                {confirmModal.action === "activate" ? "activate" : "deactivate"}
                            </strong>{" "}
                            the plan <code className="font-bold text-indigo-600 dark:text-indigo-400">{confirmModal.plan.planName}</code>?
                        </p>

                        <div className="flex justify-end gap-2.5 pt-2">
                            <Button
                                variant="secondary"
                                onClick={() => setConfirmModal({ open: false, plan: null, action: null })}
                                disabled={submitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant={confirmModal.action === "deactivate" ? "danger" : "primary"}
                                onClick={handleConfirmToggle}
                                disabled={submitting}
                            >
                                {submitting ? "Processing..." : confirmModal.action === "activate" ? "Yes, Activate" : "Yes, Deactivate"}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default SubscriptionPlans;
