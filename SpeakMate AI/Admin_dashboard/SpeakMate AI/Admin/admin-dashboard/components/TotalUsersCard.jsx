import { motion } from "framer-motion";
import Card from "@components/common/Card";

/**
 * admin-dashboard/components/TotalUsersCard.jsx
 *
 * Statistics card showing the total number of users.
 * Visual pattern mirrors src/components/dashboard/StatisticsCards.jsx
 * so the Admin Panel feels like part of the same product.
 */
export function TotalUsersCard({ total }) {
    return (
        <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            whileHover={{ y: -4, scale: 1.01 }}
        >
            <Card className="relative overflow-hidden p-5 transition-shadow hover:shadow-md">
                <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-slate-50 opacity-50" />

                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 shadow-inner">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</p>
                        <h3 className="mt-1 text-2xl font-black text-slate-950">{total}</h3>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-semibold text-slate-500">Learners, moderators & admins</span>
                </div>
            </Card>
        </motion.div>
    );
}

export default TotalUsersCard;
