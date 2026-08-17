import { motion } from "framer-motion";
import Card from "@components/common/Card";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3">
      <div className="h-9 w-9 rounded-xl bg-slate-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-2.5 w-48 rounded bg-slate-200 animate-pulse" />
      </div>
      <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">No transactions yet</p>
      <p className="mt-1 text-xs text-slate-400">Your learning activity will appear here.</p>
    </div>
  );
}

export function TransactionsTable({ transactions, loading }) {
  if (loading) {
    return (
      <Card className="overflow-hidden p-5">
        <div className="h-4 w-32 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-black text-slate-950 mb-4">Recent Transactions</h3>
        <EmptyState />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-950">Recent Transactions</h3>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600"
        >
          View all
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="space-y-1">
        {transactions.map((txn, index) => (
          <motion.div
            key={txn.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className="flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-slate-50"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                txn.amount.startsWith("+") ? "bg-emerald-50" : "bg-slate-100"
              }`}
            >
              {txn.icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{txn.title}</p>
              <p className="text-xs text-slate-500 truncate">{txn.description}</p>
            </div>

            <div className="text-right shrink-0">
              <p
                className={`text-sm font-black ${
                  txn.amount.startsWith("+") ? "text-emerald-600" : "text-slate-900"
                }`}
              >
                {txn.amount}
              </p>
              <p className="text-[10px] font-semibold text-slate-400">{txn.date}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

export default TransactionsTable;
