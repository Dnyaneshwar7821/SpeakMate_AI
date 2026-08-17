import { motion } from "framer-motion";
import Card from "@components/common/Card";

function TransactionRow({ txn, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-slate-50"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${txn.type === "credit" ? "bg-emerald-50" : "bg-slate-100"
          }`}
      >
        {txn.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{txn.title}</p>
        <p className="text-[11px] text-slate-500 truncate">{txn.description}</p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-bold ${txn.type === "credit" ? "text-emerald-600" : "text-slate-900"
            }`}
        >
          {txn.amount}
        </p>
        <p className="text-[10px] font-medium text-slate-400">{txn.date}</p>
      </div>
    </motion.div>
  );
}

const transactions = [
  {
    id: "txn-1",
    title: "Premium Subscription",
    description: "Monthly Pro Plan renewal",
    amount: "-$12.99",
    date: "Today",
    type: "debit",
    icon: "✨",
  },
  {
    id: "txn-2",
    title: "XP Bonus",
    description: "7-day streak reward",
    amount: "+50 XP",
    date: "Yesterday",
    type: "credit",
    icon: "🎁",
  },
  {
    id: "txn-3",
    title: "Grammar Pack",
    description: "Advanced tenses unlock",
    amount: "-$4.99",
    date: "3 days ago",
    type: "debit",
    icon: "📚",
  },
  {
    id: "txn-4",
    title: "Speaking Session",
    description: "Pronunciation feedback",
    amount: "+15 XP",
    date: "4 days ago",
    type: "credit",
    icon: "🎙️",
  },
];

export function AdminRecentTransactions() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-950">Recent Transactions</h3>
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
      <div className="space-y-0.5">
        {transactions.map((txn, index) => (
          <TransactionRow key={txn.id} txn={txn} index={index} />
        ))}
      </div>
    </Card>
  );
}

export default AdminRecentTransactions;
