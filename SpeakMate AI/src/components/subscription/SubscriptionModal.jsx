import { useState } from "react";
import { subscriptionService } from "../../services/appServices";
import { openRazorpayCheckout } from "../../utils/razorpayUtils";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

/**
 * Reusable Paywall / Daily Limit Modal.
 * Triggers when Free users hit their 10-min speaking cap or 5-grammar-check limit.
 */
export function SubscriptionModal({ isOpen, onClose, triggerReason = "daily_limit" }) {
  const { user, login } = useAuth();
  const toast = useToast();
  const [billingCycle, setBillingCycle] = useState("YEARLY"); // 'MONTHLY' | 'YEARLY'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleUpgrade = async (planType) => {
    setErrorMsg("");
    setLoading(true);

    try {
      const orderData = await subscriptionService.createOrder(planType);

      await openRazorpayCheckout({
        orderData,
        onSuccess: async (paymentResponse) => {
          try {
            setLoading(true);
            await subscriptionService.verifyPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              planType: paymentResponse.planType || planType,
            });

            if (user) {
              const updatedUser = { ...user, isPro: true, subscriptionPlan: planType };
              if (login) login(updatedUser, localStorage.getItem("token"));
            }
            toast.success("🎉 Upgrade Successful! You now have unlimited Pro access.");
            onClose();
          } catch (err) {
            const msg = err.response?.data?.message || err.message || "Payment verification failed.";
            setErrorMsg(msg);
            toast.error(msg);
          } finally {
            setLoading(false);
          }
        },
        onFailure: (err) => {
          const msg = err?.description || err?.message || "Payment was cancelled or failed.";
          setErrorMsg(msg);
          toast.error(msg);
          setLoading(false);
        },
        onDismiss: () => {
          setLoading(false);
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to initiate payment.";
      setErrorMsg(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border-2 border-indigo-500/50 p-6 sm:p-8 shadow-2xl space-y-6 text-[var(--text-primary)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs font-bold"
        >
          ✕
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white text-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            ⭐
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {triggerReason === "speaking_limit"
              ? "Daily Free Practice Completed"
              : triggerReason === "grammar_limit"
              ? "Daily Grammar Checks Reached"
              : "Upgrade to SpeakMate Pro"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {triggerReason === "speaking_limit"
              ? "You've used today's 10-minute free practice! Upgrade to Pro for unlimited 24/7 AI conversations."
              : "You've used your 5 daily free grammar checks. Upgrade to Pro for unlimited deep analysis."}
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center gap-3">
          <button
            type="button"
            onClick={() => setBillingCycle("MONTHLY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              billingCycle === "MONTHLY"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            }`}
          >
            Monthly Pass (₹149/mo)
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("YEARLY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === "YEARLY"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            }`}
          >
            <span>Annual Pass (₹1,199/yr)</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-400 text-amber-950 font-black">
              Save 33%
            </span>
          </button>
        </div>

        {/* Pro Benefits Checklist */}
        <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--border-subtle)] space-y-2 text-xs">
          <p className="font-bold text-[var(--text-primary)]">✨ What you get with Pro:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <strong className="text-emerald-400">✓</strong> Unlimited AI Speaking
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-emerald-400">✓</strong> Unlimited Grammar Doctor
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-emerald-400">✓</strong> All Voice Accents & Avatars
            </span>
            <span className="flex items-center gap-1.5">
              <strong className="text-emerald-400">✓</strong> Fluency Certificates
            </span>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <p className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 text-center">
            ⚠️ {errorMsg}
          </p>
        )}

        {/* Upgrade Action Button */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleUpgrade(billingCycle === "YEARLY" ? "YEARLY_PRO" : "MONTHLY_PRO")}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? "Connecting Razorpay..."
              : `Unlock Pro Now (${billingCycle === "YEARLY" ? "₹1,199 / year" : "₹149 / month"}) ➔`}
          </button>
          <p className="text-[10px] text-center text-[var(--text-tertiary)]">
            🔒 Safe & Secure via Razorpay (UPI, GPay, PhonePe, Paytm, Cards)
          </p>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionModal;
