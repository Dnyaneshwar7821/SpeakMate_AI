import { motion } from "framer-motion";
import { UserPlus, BookOpen, Megaphone, Download, ArrowRight } from "lucide-react";

/**
 * admin-dashboard/components/QuickActions.jsx
 *
 * Grid of quick-action shortcut buttons for the dashboard.
 *
 * Props:
 *   actions: [{ id, label, icon, accent }]
 *   onAction: (action) => void
 */

const ICONS = {
    "user-plus": UserPlus,
    book: BookOpen,
    megaphone: Megaphone,
    download: Download,
};

export function QuickActions({ actions, onAction }) {
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((a, i) => {
                const Icon = ICONS[a.icon] || UserPlus;
                return (
                    <motion.button
                        key={a.id}
                        type="button"
                        onClick={() => onAction?.(a)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                        whileHover={{ y: -2 }}
                        className="group flex flex-col items-start gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-left transition-colors hover:border-[var(--border-strong)]"
                    >
                        <span
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                            style={{ background: `${a.accent}1a`, color: a.accent }}
                        >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                        </span>
                        <div className="flex w-full items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold leading-tight text-[var(--text-primary)]">
                                {a.label}
                            </span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--text-primary)]" />
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
}

export default QuickActions;
