const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-[3px]",
};

const TONE_CLASSES = {
  light: "border-white/30 border-t-white",
  muted: "border-slate-200 border-t-indigo-600",
};

export function LoadingSpinner({ size = "sm", tone = "muted", className = "" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} ${className}`}
    />
  );
}

export default LoadingSpinner;
