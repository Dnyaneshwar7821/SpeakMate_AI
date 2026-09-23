/**
 * Standalone Event Emitter for SpeakMate Assistant triggers.
 * Zero dependency file to prevent circular module evaluation in React Native.
 */
const listeners = new Set();

export const openLearnerAssistant = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (_) {}
  });
};

export const subscribeLearnerAssistant = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export default {
  openLearnerAssistant,
  subscribeLearnerAssistant,
};
