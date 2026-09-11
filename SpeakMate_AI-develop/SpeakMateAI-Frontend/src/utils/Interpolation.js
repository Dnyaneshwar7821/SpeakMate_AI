/**
 * Interpolation Math Utilities
 * Provides smooth linear interpolation (lerp) and clamping for Live2D parameter transforms.
 */

/**
 * Linear Interpolation (lerp)
 * @param {number} start Current value
 * @param {number} end Target value
 * @param {number} t Smoothing factor (0..1)
 */
export function lerp(start, end, t) {
  return start + (end - start) * Math.min(1, Math.max(0, t));
}

/**
 * Clamp value within min and max
 */
export function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

/**
 * Map cursor clientX, clientY to normalized Live2D angles (-1 to +1)
 * @param {number} clientX
 * @param {number} clientY
 * @param {DOMRect} rect Canvas bounding rectangle
 */
export function calculateNormalizedCursorPosition(clientX, clientY, rect) {
  if (!rect || rect.width === 0 || rect.height === 0) {
    return { x: 0, y: 0 };
  }

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Normalized range: -1.0 (left/top) to +1.0 (right/bottom)
  const normX = clamp((clientX - centerX) / (rect.width / 2), -1.0, 1.0);
  const normY = clamp((clientY - centerY) / (rect.height / 2), -1.0, 1.0);

  return { x: normX, y: normY };
}
