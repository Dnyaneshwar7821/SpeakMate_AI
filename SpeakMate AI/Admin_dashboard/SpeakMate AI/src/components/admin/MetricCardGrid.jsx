import { motion } from "framer-motion";
import MetricCard, { formatValue } from "@components/admin/MetricCard";

export function MetricCardGrid({ metrics, className = "" }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.04,
          },
        },
      }}
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}
    >
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          <MetricCard
            icon={metric.icon}
            label={metric.label}
            value={metric.value}
            trend={metric.trend}
            loading={metric.loading}
            error={metric.error}
            onRetry={metric.onRetry}
            index={index}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export { formatValue };

export default MetricCardGrid;
