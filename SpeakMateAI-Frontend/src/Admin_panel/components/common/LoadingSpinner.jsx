import { motion } from "framer-motion";

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function LoadingSpinner({ size = "sm", tone = "muted", className = "" }) {
  const isLight = tone === "light";
  
  return (
    <div className={`relative flex items-center justify-center ${SIZE_CLASSES[size]} ${className}`}>
      <motion.span
        className={`absolute inset-0 rounded-full border-[2px] ${isLight ? "border-white/20" : "border-indigo-600/20"}`}
      />
      <motion.span
        className={`absolute inset-0 rounded-full border-[2px] border-transparent ${isLight ? "border-t-white border-l-white" : "border-t-indigo-600 border-l-indigo-600"}`}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "linear"
        }}
      />
      <motion.span
        className={`absolute inset-1 rounded-full border-[2px] border-transparent ${isLight ? "border-b-white/60" : "border-b-indigo-400"}`}
        animate={{ rotate: -360 }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear"
        }}
      />
    </div>
  );
}

export default LoadingSpinner;
