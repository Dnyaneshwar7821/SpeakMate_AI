import Modal from "@components/common/Modal";
import { BookOpen, MessageSquare, Headphones, TrendingUp, Flame, Trophy } from "lucide-react";
import { getUserProgress } from "@admin/data/userProgressMockData";

const modules = [
    { key: "vocabulary", label: "Vocabulary", Icon: BookOpen, color: "text-indigo-600 bg-indigo-50", barColor: "bg-indigo-600" },
    { key: "grammar", label: "Grammar", Icon: MessageSquare, color: "text-emerald-600 bg-emerald-50", barColor: "bg-emerald-600" },
    { key: "speaking", label: "Speaking", Icon: TrendingUp, color: "text-violet-600 bg-violet-50", barColor: "bg-violet-600" },
    { key: "listening", label: "Listening", Icon: Headphones, color: "text-amber-600 bg-amber-50", barColor: "bg-amber-600" },
];

function ProgressBar({ value, color = "bg-indigo-600" }) {
    return (
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
                className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}

function StatCard({ icon: Icon, label, value, suffix, color = "text-indigo-600 bg-indigo-50" }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-indigo-100 hover:shadow-sm bg-white">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon size={20} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-base font-bold text-slate-950 truncate">
                    {value}
                    {suffix && <span className="text-xs font-medium text-slate-500 ml-1">{suffix}</span>}
                </p>
            </div>
        </div>
    );
}

export function UserProgressModal({ user, onClose }) {
    const progress = user ? getUserProgress(user.id) : null;

    if (!user) return null;

    const fullName = user.name || "User";

    return (
        <Modal isOpen={Boolean(user)} onClose={onClose} maxWidth="max-w-2xl" title="User Progress">
            <div className="mt-4 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white shadow-md">
                        {fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">{fullName}</h3>
                        <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold mt-1 ${user.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--bg-subtle)] text-[var(--text-muted)]"}`}>
                            {user.status === "active" ? "Active" : "Inactive"}
                        </span>
                    </div>
                </div>

                {progress ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <StatCard icon={Trophy} label="Total XP" value={progress.overallXp.toLocaleString()} color="text-indigo-600 bg-indigo-50" />
                            <StatCard icon={Flame} label="Streak" value={progress.streak} suffix="days" color="text-orange-600 bg-orange-50" />
                            <StatCard icon={TrendingUp} label="Level" value={progress.level} color="text-emerald-600 bg-emerald-50" />
                            <StatCard
                                icon={BookOpen}
                                label="Status"
                                value={user.status === "active" ? "Active" : "Inactive"}
                                color={user.status === "active" ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}
                            />
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-5">Learning Progress</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {modules.map(({ key, label, Icon, color, barColor }) => {
                                    const mod = progress[key];
                                    if (!mod) return null;
                                    return (
                                        <div key={key} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
                                                        <Icon size={16} strokeWidth={1.5} />
                                                    </span>
                                                    <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">{mod.percentage}%</span>
                                            </div>
                                            <ProgressBar value={mod.percentage} color={barColor} />
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {key === "vocabulary" && `${mod.learned} / ${mod.total} words learned`}
                                                {key === "grammar" && `${mod.completed} / ${mod.total} exercises completed`}
                                                {key === "speaking" && `${mod.sessions} / ${mod.total} sessions completed`}
                                                {key === "listening" && `${mod.lessons} / ${mod.total} lessons completed`}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 mb-4">
                            <TrendingUp size={24} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">No progress data available</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">Progress metrics will appear here once the user starts engaging with learning modules.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default UserProgressModal;
