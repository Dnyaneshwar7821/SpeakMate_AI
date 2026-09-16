import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    Download,
    Building2,
    ArrowRight,
    Copy,
    Check,
    ShieldCheck,
    Mail,
    Calendar,
    CreditCard,
    Sparkles,
    FileText,
    X,
} from "lucide-react";
import Button from "@components/common/Button";
import { generateReceiptPdf } from "@utils/receiptPdfGenerator";

/**
 * PaymentSuccessModal.jsx
 *
 * Real-world SaaS Transaction Success Modal with a blurred backdrop,
 * animated verification seal, transaction breakdown, and instant PDF receipt download.
 */
export function PaymentSuccessModal({ isOpen, onClose, data }) {
    const [copied, setCopied] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    if (!isOpen || !data) return null;

    const isFree = Boolean(data.isFree || Number(data.planPrice || 0) === 0);
    const formattedPrice = isFree
        ? "Free Tier"
        : `₹${Number(data.planPrice || 0).toLocaleString("en-IN")}`;

    const handleCopyTxn = () => {
        const textToCopy = data.paymentId || data.orderId || "";
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleDownloadPdf = () => {
        setIsGeneratingPdf(true);
        try {
            generateReceiptPdf(data);
        } catch (err) {
            console.error("Failed to generate PDF receipt:", err);
        } finally {
            setTimeout(() => setIsGeneratingPdf(false), 800);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    initial={{ opacity: 0, scale: 0.92, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 24 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-xl rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl my-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    {/* Animated Success Badge */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.1, stiffness: 260, damping: 20 }}
                                className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-500 ring-8 ring-emerald-500/10 dark:bg-emerald-500/20 dark:ring-emerald-500/15"
                            >
                                <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400" />
                            </motion.div>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
                            </span>
                        </div>

                        <div className="mt-4 space-y-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-700 dark:text-emerald-300">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {isFree ? "INSTITUTIONAL WORKSPACE CREATED" : "TRANSACTION VERIFIED & COMPLETED"}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white pt-1">
                                {isFree ? "School Workspace Created! 🎉" : "Payment & Setup Successful! 🎉"}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                Institutional license active. School code & login credentials dispatched.
                            </p>
                        </div>
                    </div>

                    {/* Transaction Breakdown Container */}
                    <div className="mt-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 p-4 sm:p-5 space-y-4">
                        {/* Primary Amount Highlight */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-3.5">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                    {isFree ? "Subscription Tier" : "Total Amount Paid"}
                                </p>
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    {formattedPrice}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                                    <Sparkles className="h-3 w-3" />
                                    {data.planName || "Standard Plan"}
                                </span>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                                    {data.durationMonths ? `${data.durationMonths} Months` : "Annual License"}
                                </p>
                            </div>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-0.5">
                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">School Name</span>
                                <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {data.schoolName}
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Institutional Code</span>
                                <p className="font-mono font-bold text-slate-800 dark:text-slate-100">
                                    {data.schoolCode || "SCH-ACTIVE"}
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">School Admin</span>
                                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {data.adminName} ({data.adminEmail})
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Payment Gateway</span>
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                    {isFree ? "Institutional Grant" : "Razorpay (UPI / NetBanking / Cards)"}
                                </p>
                            </div>
                        </div>

                        {/* Transaction Reference ID bar */}
                        {data.paymentId && data.paymentId !== "FREE_TIER" && (
                            <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 px-3 py-2 border border-slate-200 dark:border-slate-700/60">
                                <div className="min-w-0 flex-1">
                                    <span className="block text-[10px] uppercase font-bold text-slate-400">Payment ID</span>
                                    <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block">
                                        {data.paymentId}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyTxn}
                                    className="ml-2 inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors shrink-0"
                                    title="Copy Payment ID"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3 w-3 text-emerald-500" />
                                            <span className="text-emerald-500 font-bold">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3 w-3" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email Notice Box */}
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-800 dark:text-emerald-300 text-xs">
                        <Mail className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                        <p className="leading-relaxed">
                            Official institutional registration details, temporary login password, and payment receipt have been emailed to <strong className="font-semibold">{data.adminEmail}</strong>.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="w-full sm:w-auto text-xs !h-11"
                        >
                            <Building2 className="mr-1.5 h-4 w-4 text-slate-500" />
                            Back to Super Admin
                        </Button>

                        <Button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            isLoading={isGeneratingPdf}
                            loadingText="Generating PDF..."
                            className="w-full sm:w-auto !bg-emerald-600 hover:!bg-emerald-700 text-white font-bold text-xs !h-11 shadow-sm"
                        >
                            <Download className="mr-1.5 h-4 w-4" />
                            Download Receipt (PDF)
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default PaymentSuccessModal;
