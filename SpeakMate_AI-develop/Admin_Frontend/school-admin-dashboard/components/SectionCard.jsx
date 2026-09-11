import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";

export function SectionCard({
    title,
    subtitle,
    action,
    className = "",
    bodyClassName = "",
    delay = 0,
    children,
}) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay, ease: "easeOut" }}
            className={[
                "flex flex-col rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-sm)]",
                className,
            ].join(" ")}
        >
            {(title || action) && (
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3.5 sm:px-5 sm:py-4">
                    <div className="min-w-0">
                        {title && (
                            <h3 className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="mt-0.5 text-xs leading-5 text-[var(--text-secondary)]">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {action ?? (
                        <button
                            type="button"
                            className="grid h-8 w-8 shrink-0 place-items-center self-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                            aria-label="More options"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}
            <div className={["flex-1 p-4 sm:p-5", bodyClassName].join(" ")}>{children}</div>
        </motion.section>
    );
}

export default SectionCard;
