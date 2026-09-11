import { motion } from "framer-motion";

export function ModulePageShell({ title, subtitle, badge, actions, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-8"
      >
        {badge && (
          <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            {badge}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p>
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </motion.div>

      {children}
    </section>
  );
}

export default ModulePageShell;
