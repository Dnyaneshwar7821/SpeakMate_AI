import { motion } from "framer-motion";

/**
 * admin-dashboard/components/RecentActivities.jsx
 *
 * Vertical timeline of recent platform activity.
 * Each entry shows a colored dot, title, message and relative time.
 *
 * Props:
 *   activities: [{ id, title, message, time, color }]
 */

export function RecentActivities({ activities }) {
    return (
        <div className="relative">
            {/* Timeline rail */}
            <span className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border-default)]" />

            <ul className="space-y-5">
                {activities.map((a, i) => (
                    <motion.li
                        key={a.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                        className="relative pl-7"
                    >
                        <span
                            className="absolute left-0 top-1 grid h-[15px] w-[15px] place-items-center rounded-full ring-4 ring-[var(--bg-surface)]"
                            style={{ background: a.color }}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        </span>
                        <div>
                            <p className="text-[13px] font-semibold text-[var(--text-primary)]">{a.title}</p>
                            <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)]">{a.message}</p>
                            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                                {a.time}
                            </p>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}

export default RecentActivities;
