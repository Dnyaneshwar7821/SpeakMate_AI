import { motion } from "framer-motion";
import { Bell, Check } from "lucide-react";

/**
 * admin-dashboard/components/NotificationsPanel.jsx
 *
 * Compact notification feed for the dashboard right column.
 *
 * Props:
 *   notifications: [{ id, title, message, time, read }]
 */

export function NotificationsPanel({ notifications }) {
    return (
        <ul className="space-y-1">
            {notifications.map((n, i) => (
                <motion.li
                    key={n.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className={[
                        "flex gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-[var(--bg-hover)]",
                        !n.read && "bg-[var(--color-primary)]/[0.05]",
                    ].join(" ")}
                >
                    <span
                        className={[
                            "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                            n.read
                                ? "bg-[var(--bg-subtle)] text-[var(--text-muted)]"
                                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
                        ].join(" ")}
                    >
                        <Bell className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-[13px] font-semibold text-[var(--text-primary)]">{n.title}</p>
                            {!n.read && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                            )}
                        </div>
                        <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)]">{n.message}</p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                            {n.time}
                        </p>
                    </div>
                </motion.li>
            ))}
        </ul>
    );
}

export default NotificationsPanel;
