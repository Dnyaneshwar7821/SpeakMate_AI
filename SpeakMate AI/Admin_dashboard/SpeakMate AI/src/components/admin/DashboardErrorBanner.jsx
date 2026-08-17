import { motion } from "framer-motion";
import { RefreshCw, AlertTriangle } from "lucide-react";
import Button from "@components/common/Button";

function DashboardErrorBanner({ errors, onRetry }) {
  const hasErrors = Object.values(errors || {}).some(Boolean);

  if (!hasErrors) return null;

  const errorMessages = Object.entries(errors || {})
    .filter(([, msg]) => msg)
    .map(([, msg]) => msg);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-xl border border-red-200/80 bg-red-50/80 p-4 backdrop-blur-sm"
    >
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle size={12} className="text-red-600" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-red-900">Some data failed to load</h3>
        <p className="mt-0.5 text-xs text-red-700">
          {errorMessages.length > 0 ? errorMessages[0] : "An unexpected error occurred."}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="shrink-0 gap-1 text-red-700 hover:bg-red-100"
      >
        <RefreshCw size={12} />
        Retry
      </Button>
    </motion.div>
  );
}

export default DashboardErrorBanner;
