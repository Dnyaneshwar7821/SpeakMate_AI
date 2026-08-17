import { BookOpen, MessageSquare, Headphones, Trophy, Flame, Users as UsersIcon, TrendingUp } from "lucide-react";
import Card from "@components/common/Card";
import Button from "@components/common/Button";

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

export function UserProgressPanel({ user, progress, onClose }) {
  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "User";

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${
              user.active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-600"
            }`}>
              {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">{fullName}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
            Close
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {progress ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Trophy} label="Total XP" value={progress.overallXp} color="text-indigo-600 bg-indigo-50" />
              <StatCard icon={Flame} label="Streak" value={progress.streak} suffix="days" color="text-orange-600 bg-orange-50" />
              <StatCard icon={UsersIcon} label="Level" value={progress.level} color="text-emerald-600 bg-emerald-50" />
              <StatCard
                icon={BookOpen}
                label="Status"
                value={user.active ? "Active" : "Inactive"}
                color={user.active ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}
              />
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">Learning Progress</h4>
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
                          <span className="text-sm font-semibold text-slate-700">{label}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{mod.percentage}%</span>
                      </div>
                      <ProgressBar value={mod.percentage} color={barColor} />
                      <p className="text-xs text-slate-400">
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
            <p className="text-sm font-semibold text-slate-900">No progress data available</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">Progress metrics will appear here once the user starts engaging with learning modules.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

export default UserProgressPanel;
