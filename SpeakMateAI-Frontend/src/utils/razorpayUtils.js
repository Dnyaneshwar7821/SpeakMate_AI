import { toast } from "./toast";

/**
 * Dynamically loads the Razorpay checkout script if not already present.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay checkout flow with provided order details.
 *
 * @param {Object} params
 * @param {Object} params.orderData - Data received from /api/subscription/create-order
 * @param {Function} params.onSuccess - Callback on successful payment
 * @param {Function} params.onFailure - Callback on failed payment
 */
export async function openRazorpayCheckout({ orderData, onSuccess, onFailure, onDismiss }) {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded || !window.Razorpay) {
    // If Razorpay CDN is blocked / dev environment without internet, provide simulated confirmation
    if (orderData.razorpayOrderId && orderData.razorpayOrderId.startsWith("order_dev_")) {
      const confirmMock = window.confirm(
        `[Dev Test Mode] Sandbox simulated payment for ${orderData.planName} (${orderData.currency} ${orderData.amount})?\nClick OK to simulate successful payment.`
      );
      if (confirmMock) {
        onSuccess({
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: "pay_dev_mock_" + Date.now(),
          razorpay_signature: "mock_signature_dev_ok",
          planType: orderData.planType,
        });
      } else if (onDismiss) {
        onDismiss();
      }
      return;
    }
    toast.error("Razorpay checkout SDK failed to load. Please check your internet connection.");
    if (onFailure) onFailure(new Error("Razorpay SDK load failed"));
    return;
  }

  // Handle mock order IDs directly for frictionless local dev testing
  if (orderData.razorpayOrderId && (orderData.razorpayOrderId.startsWith("order_mock_") || orderData.razorpayOrderId.startsWith("order_dev_"))) {
    const confirmMock = window.confirm(
      `[Dev Mode] Complete sandbox payment for ${orderData.planName} (${orderData.currency} ${orderData.amount})?`
    );
    if (confirmMock) {
      onSuccess({
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id: "pay_mock_" + Date.now(),
        razorpay_signature: "mock_signature_ok",
        planType: orderData.planType,
      });
    } else if (onDismiss) {
      onDismiss();
    }
    return;
  }

  const options = {
    key: orderData.razorpayKeyId,
    amount: (orderData.planType === 'MONTHLY_PRO' || orderData.planType === 'MONTHLY') ? 100 : (orderData.amountInPaise || 119900),
    currency: orderData.currency || "INR",
    name: "SpeakMate AI",
    description: orderData.description || "SpeakMate Pro Plan",
    order_id: orderData.razorpayOrderId,
    prefill: {
      name: orderData.userName || "",
      email: orderData.userEmail || "",
    },
    theme: {
      color: "#6366F1", // SpeakMate brand indigo
    },
    handler: function (response) {
      if (onSuccess) {
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          planType: orderData.planType,
        });
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) onDismiss();
      },
    },
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      if (onFailure) {
        onFailure(response.error);
      }
    });
    rzp.open();
  } catch (err) {
    if (onFailure) onFailure(err);
  }
}
