import { ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Pencil, Trash2, Flame, Clock3, BookOpenCheck, Sparkles, Trophy, Mic2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { User, UserDetail } from "../../data/adminUsersMock";

const tabs = ["Overview", "Progress", "Speaking", "Grammar", "Vocabulary"] as const;
type Tab = typeof tabs[number];
const titleCase = (value: string) => value[0] + value.slice(1).toLowerCase();
const scoreColor = (score: number) => score >= 85 ? "bg-emerald-500" : score >= 70 ? "bg-indigo-500" : "bg-amber-500";
const statusDot: Record<User["status"], string> = {
  ACTIVE: "bg-emerald-500",
  INACTIVE: "bg-amber-500",
  SUSPENDED: "bg-rose-500",
};
const formatDate = (value: string) => new Date(value).toLocaleString("en-US", {
  month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
});

const tabIndicatorVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: (_i: number) => ({ scaleX: 1, opacity: 1, transition: { duration: 0.25, ease: "easeOut" } }),
  exit: { scaleX: 0, opacity: 0, transition: { duration: 0.15 } },
};

export default function UserDetailSheet({ user, detail, loading, onClose, onEdit, onDelete }: { user: User; detail: UserDetail | null; loading: boolean; onClose: () => void; onEdit: (user: User) => void; onDelete: (user: User) => void }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { const close = (event: KeyboardEvent) => event.key === "Escape" && onClose(); document.addEventListener("keydown", close); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", close); document.body.style.overflow = ""; }; }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const scores = detail ? [{ name: "Grammar", value: detail.grammarScore }, { name: "Fluency", value: detail.fluencyScore }, { name: "Vocabulary", value: detail.vocabularyScore }, { name: "Pronunciation", value: detail.pronunciationScore }] : [];

  return (
    <motion.div className="fixed inset-0 z-[9999] isolate" role="dialog" aria-modal="true" aria-label={`${user.firstName} ${user.lastName} profile`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <motion.button className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]" onClick={onClose} aria-label="Close profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside className="absolute inset-y-0 right-0 w-full max-w-3xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 24, stiffness: 200 }}>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <div className="flex items-start gap-4">
            <Avatar user={user} large />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-slate-950 dark:text-white">{user.firstName} {user.lastName}</h2>
                <TypeBadge value={user.userType} />
                <Status value={user.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              {user.userType === "SCHOOL" && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{user.schoolName} · Class {user.classGrade}{user.classSection ? `, Section ${user.classSection}` : ""}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X size={20} /></button>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => onEdit(user)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"><Pencil size={16} />Edit</button>
            <button onClick={() => onDelete(user)} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950"><Trash2 size={16} />Delete</button>
          </div>
        </header>

        {loading || !detail ? (
          <div className="space-y-4 p-6">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />)}</div>
        ) : (
          <div className="p-5 sm:p-6">
            <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              {[
                { Icon: Clock3, label: "Practice", value: `${Math.floor(detail.totalPracticeMinutes / 60)}h ${detail.totalPracticeMinutes % 60}m` },
                { Icon: Mic2, label: "Speaking", value: detail.speakingSessions },
                { Icon: Sparkles, label: "AI chats", value: detail.aiConversations },
                { Icon: BookOpenCheck, label: "Lessons", value: detail.lessonsCompleted },
                { Icon: Flame, label: "Streak", value: `${detail.currentStreak} days` },
                { Icon: Trophy, label: "XP", value: detail.xp.toLocaleString() },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <Icon size={16} className="mb-2 text-indigo-500" />
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100">{value}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </motion.div>

            <section className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">Account information</h3>
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="User ID" value={`#${user.id}`} />
                <Detail label="Full name" value={`${user.firstName} ${user.lastName}`} />
                <Detail label="Email" value={user.email} />
                <Detail label="Account type" value={titleCase(user.userType)} />
                <Detail label="Level" value={titleCase(user.level)} />
                <Detail label="Status" value={titleCase(user.status)} />
                {user.userType === "SCHOOL" && <Detail label="School" value={user.schoolName || "Not assigned"} />}
                {user.userType === "SCHOOL" && <Detail label="Class" value={`Class ${user.classGrade || "—"}${user.classSection ? `, Section ${user.classSection}` : ""}`} />}
                <Detail label="Registered" value={formatDate(user.registeredAt)} />
                <Detail label="Last active" value={formatDate(user.lastActiveAt)} />
              </dl>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100">Language scores</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {scores.map(score => (
                  <motion.div key={score.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300">{score.name}</span>
                      <motion.b className="text-slate-900 dark:text-slate-100">{mounted ? score.value : 0}%</motion.b>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div className={`h-full rounded-full ${scoreColor(score.value)}`} initial={{ width: 0 }} animate={{ width: `${score.value}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <div className="mt-6 flex overflow-x-auto border-b dark:border-slate-700 relative" role="tablist">
              {tabs.map((item, _i) => (
                <button key={item} onClick={() => setTab(item)} role="tab" aria-selected={tab === item} className={`relative whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === item ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"}`}>
                  {tab === item && (
                    <motion.span layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" variants={tabIndicatorVariants} initial="initial" animate="animate" exit="exit" custom={_i} />
                  )}
                  {item}
                </button>
              ))}
            </div>
            <div className="pt-5">
              {tab === "Overview" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  {detail.activities.map((event, index) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900" />
                        {index < detail.activities.length - 1 && <span className="h-full w-px bg-slate-200 dark:bg-slate-700" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.description}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
              {tab === "Progress" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Chart><ResponsiveContainer><LineChart data={detail.progress}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis domain={[0, 100]} /><Tooltip /><Line dataKey="fluency" stroke="#4f46e5" strokeWidth={3} /><Line dataKey="grammar" stroke="#10b981" strokeWidth={3} /><Line dataKey="vocabulary" stroke="#a855f7" strokeWidth={3} /></LineChart></ResponsiveContainer></Chart>
                </motion.div>
              )}
              {tab === "Speaking" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-3">
                  {detail.sessions.map(session => (
                    <div key={session.id} className="flex justify-between rounded-xl border p-4 dark:border-slate-700">
                      <div>
                        <b className="text-slate-900 dark:text-slate-100">{session.topic}</b>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{session.date} · {session.duration}</p>
                      </div>
                      <b className="text-emerald-600">{session.score}</b>
                    </div>
                  ))}
                </motion.div>
              )}
              {tab === "Grammar" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Chart><ResponsiveContainer><BarChart data={detail.grammarMistakes}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="category" /><YAxis /><Tooltip /><Bar dataKey="mistakes" fill="#6366f1" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></Chart>
                </motion.div>
              )}
              {tab === "Vocabulary" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                  <Chart><ResponsiveContainer><LineChart data={detail.vocabularyGrowth}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line dataKey="words" stroke="#8b5cf6" strokeWidth={3} /></LineChart></ResponsiveContainer></Chart>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {detail.recentWords.map(word => (
                      <div key={word.word} className="rounded-xl border p-3 dark:border-slate-700">
                        <b className="text-slate-900 dark:text-slate-100">{word.word}</b>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{word.meaning}</p>
                        <p className="mt-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">Mastery: {word.mastery}%</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">{value}</dd>
    </div>
  );
}

function Avatar({ user, large }: { user: User; large?: boolean }) {
  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className={`${large ? "h-16 w-16" : "h-9 w-9"} rounded-2xl object-cover`} />
  ) : (
    <div className={`flex ${large ? "h-16 w-16 text-xl" : "h-9 w-9 text-xs"} shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white`}>
      {user.firstName[0]}{user.lastName[0]}
    </div>
  );
}

function TypeBadge({ value }: { value: User["userType"] }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${value === "SCHOOL" ? "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"}`}>{titleCase(value)}</span>;
}

function Status({ value }: { value: User["status"] }) {
  const cls = value === "ACTIVE" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : value === "SUSPENDED" ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[value]}`} />
      {titleCase(value)}
    </span>
  );
}

function Chart({ children }: { children: ReactNode }) {
  return <div className="h-72 w-full rounded-xl border p-3 dark:border-slate-700">{children}</div>;
}
