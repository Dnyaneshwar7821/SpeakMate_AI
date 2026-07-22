/**
 * animations/variants.js
 *
 * WHY THIS FILE EXISTS:
 * Centralizing all Framer Motion animation variants in one place means:
 * 1. Consistent animations across the entire app
 * 2. Single source of truth — update once, applied everywhere
 * 3. No duplicated animation config in individual components
 * 4. Easy to tune timing globally (e.g., slow down all page transitions)
 */

// ─── Page Transitions ────────────────────────────────────────────────────────

export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: "easeIn" } },
};

export const pageSlideVariants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.25 } },
};

// ─── Container (stagger children) ────────────────────────────────────────────

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const containerVariantsSlow = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

// ─── Child Items ──────────────────────────────────────────────────────────────

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const itemFadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const itemScaleVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// ─── Slide Directions ─────────────────────────────────────────────────────────

export const slideFromLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const slideFromRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const slideFromBottom = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Modal / Overlay ──────────────────────────────────────────────────────────

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2 },
  },
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const sidebarVariants = {
  closed: { x: "-100%", opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
  open: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Card Hover ───────────────────────────────────────────────────────────────

export const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2, ease: "easeOut" } },
  tap: { scale: 0.98 },
};

// ─── Button ───────────────────────────────────────────────────────────────────

export const buttonTapVariant = { scale: 0.97 };

// ─── Toast / Notification ─────────────────────────────────────────────────────

export const toastVariants = {
  hidden: { opacity: 0, x: 60, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 60, scale: 0.95, transition: { duration: 0.25 } },
};

// ─── Number Counter ───────────────────────────────────────────────────────────

export const counterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Chat Bubble ──────────────────────────────────────────────────────────────

export const chatBubbleVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// ─── Voice Waveform Bars ──────────────────────────────────────────────────────

export const waveBarVariants = (delay = 0) => ({
  animate: {
    scaleY: [0.3, 1, 0.3],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      repeat: Infinity,
      delay,
    },
  },
});
