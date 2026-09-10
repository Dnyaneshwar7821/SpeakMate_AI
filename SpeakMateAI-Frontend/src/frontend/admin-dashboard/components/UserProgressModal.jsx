import { useState, useEffect } from "react";
import Modal from "@components/common/Modal";
import InsigniaBadge from "@components/common/InsigniaBadge";
import {
  BookOpen,
  MessageSquare,
  Headphones,
  TrendingUp,
  Flame,
  Trophy,
  Mic,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Stethoscope,
  Quote,
  Activity
} from "lucide-react";
import { adminUserApi } from "@services/admin/adminUserApi";

const modules = [
  { key: "vocabulary", label: "Vocabulary Range", Icon: BookOpen, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40", barColor: "bg-indigo-600" },
  { key: "grammar", label: "Grammar Precision", Icon: MessageSquare, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40", barColor: "bg-emerald-600" },
  { key: "speaking", label: "Speaking & Fluency", Icon: TrendingUp, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40", barColor: "bg-violet-600" },
  { key: "listening", label: "Listening & Pronunciation", Icon: Headphones, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40", barColor: "bg-amber-600" },
];

function ProgressBar({ value, color = "bg-indigo-600" }) {
  const safeVal = Math.min(100, Math.max(0, Math.round(value || 0)));
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
        style={{ width: `${safeVal}%` }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color = "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40" }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 transition hover:border-indigo-100 hover:shadow-sm bg-white dark:bg-slate-900">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-base font-black text-slate-900 dark:text-white truncate">
          {value}
          {suffix && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}

export function UserProgressModal({ user, onClose }) {
  const [loading, setLoading] = useState(false);
  const [liveProgress, setLiveProgress] = useState(null);
  const [speakingDetails, setSpeakingDetails] = useState(null);
  const [languageScores, setLanguageScores] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      adminUserApi.getUserProgress(user.id),
      adminUserApi.getUserSpeakingSessions(user.id),
      adminUserApi.getUserLanguageScores(user.id),
      adminUserApi.getUserActivities(user.id, 0, 10),
    ]).then(([progRes, speakRes, langRes, actRes]) => {
      if (!isMounted) return;

      if (progRes.status === "fulfilled" && progRes.value?.data) {
        setLiveProgress(progRes.value.data);
      }
      if (speakRes.status === "fulfilled" && speakRes.value?.data) {
        setSpeakingDetails(speakRes.value.data);
      }
      if (langRes.status === "fulfilled" && langRes.value?.data) {
        setLanguageScores(langRes.value.data);
      }
      if (actRes.status === "fulfilled" && actRes.value?.data) {
        const actData = actRes.value.data;
        const list = Array.isArray(actData) ? actData : actData.content || [];
        setActivities(list);
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  if (!user) return null;

  const fullName = user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User";

  // Synthesize metrics from liveProgress or user object
  const xp = liveProgress?.xp ?? user.xp ?? 0;
  const level = liveProgress?.level ?? user.level ?? 1;
  const streak = liveProgress?.currentStreak ?? user.streak ?? 0;
  const totalPracticeMins = liveProgress?.totalPracticeMinutes ?? speakingDetails?.totalPracticeMinutes ?? 0;
  const totalSessions = speakingDetails?.totalSessions ?? liveProgress?.totalSpeakingSessions ?? 0;

  // Latest speaking session & evaluation
  const latestSession = speakingDetails?.latestSession;
  const feedbackDetail = latestSession?.feedbackDetail;

  const overallScore = Math.round(
    latestSession?.overallScore ??
    latestSession?.score ??
    speakingDetails?.averageScore ??
    user.speakingScore ??
    0
  );

  const fluencyScore = Math.round(
    latestSession?.fluencyScore ??
    languageScores?.fluencyScore ??
    (overallScore > 0 ? Math.max(20, overallScore - 5) : 0)
  );
  const grammarScore = Math.round(
    latestSession?.grammarScore ??
    languageScores?.grammarScore ??
    (overallScore > 0 ? Math.max(20, overallScore - 2) : 0)
  );
  const vocabularyScore = Math.round(
    latestSession?.vocabularyScore ??
    languageScores?.vocabularyScore ??
    (overallScore > 0 ? Math.max(20, overallScore) : 0)
  );
  const pronunciationScore = Math.round(
    latestSession?.pronunciationScore ??
    languageScores?.pronunciationScore ??
    (overallScore > 0 ? Math.max(20, overallScore + 2) : 0)
  );

  const durationSecs = latestSession?.duration || 0;
  const durationMins = Math.floor(durationSecs / 60);
  const durationRemainingSecs = durationSecs % 60;
  const xpEarned = latestSession?.xpEarned || 20;

  // Status and titles
  const getHeaderTitle = (score) => {
    if (score >= 85) return "Outstanding Effort! 🎉";
    if (score >= 70) return "Great Practice! 🌟";
    if (score >= 50) return "Good Progress! 💪";
    if (score > 0) return "Keep Practicing! 🚀";
    return "Speaking Practice Session";
  };

  return (
    <Modal isOpen={Boolean(user)} onClose={onClose} maxWidth="max-w-4xl" title="User Progress & Evaluation Profile">
      <div className="mt-2 flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-1 pb-4">
        
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <div className="flex items-center gap-4">
            <InsigniaBadge
              name={fullName}
              email={user.email}
              role={user.role}
              size="md"
              className="!h-14 !w-14 shrink-0 rounded-full shadow-md text-lg"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-[var(--text-primary)]">{fullName}</h3>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-indigo-500/10 text-indigo-500">
                  {user.role || "USER"}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  user.status === "ACTIVE" || user.status === "active"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-slate-500/10 text-slate-500"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {user.status || "ACTIVE"}
                </span>
                {user.schoolName && (
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                    🏫 {user.schoolName}
                  </span>
                )}
                {user.standard && (
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
                    Std {user.standard} {user.division ? `- Div ${user.division}` : ""}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {loading && (
              <span className="text-xs text-indigo-500 font-semibold animate-pulse flex items-center gap-1">
                <Sparkles size={14} /> Syncing live...
              </span>
            )}
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard icon={Trophy} label="Total XP" value={xp.toLocaleString()} suffix="XP" color="text-amber-500 bg-amber-50 dark:bg-amber-950/40" />
          <StatCard icon={Flame} label="Streak" value={streak} suffix="days" color="text-orange-500 bg-orange-50 dark:bg-orange-950/40" />
          <StatCard icon={TrendingUp} label="Level" value={`Lvl ${level}`} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" />
          <StatCard icon={Mic} label="Sessions" value={totalSessions} color="text-violet-500 bg-violet-50 dark:bg-violet-950/40" />
          <StatCard icon={Clock} label="Practice" value={totalPracticeMins} suffix="mins" color="text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" />
        </div>

        {/* LATEST SESSION RESULTS & AI EVALUATION (Matches Webapp ConversationSession/SpeakingSummary) */}
        {latestSession ? (
          <div className="space-y-4">
            {/* Dark Indigo Hero Evaluation Banner */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#6C63FF] text-white shadow-xl flex flex-col items-center justify-center text-center space-y-4 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

              <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                Session Results & AI Evaluation
              </span>

              {/* Score Ring */}
              <div className="grid h-28 w-28 place-items-center rounded-full bg-white/10 border-4 border-[#6C63FF] shadow-2xl my-1">
                <div>
                  <span className="text-3xl font-black">{overallScore}%</span>
                  <p className="text-[8px] font-bold uppercase opacity-80 mt-0.5">Overall Score</p>
                </div>
              </div>

              <div className="space-y-1 max-w-md">
                <h4 className="text-xl sm:text-2xl font-black">{getHeaderTitle(overallScore)}</h4>
                <p className="text-xs text-indigo-200 font-medium">
                  {latestSession.scenario ? `Scenario: ${latestSession.scenario}` : "AI Speaking Evaluation Summary"}
                </p>
              </div>

              {/* Key Metrics Row */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-2">
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center border border-white/10">
                  <span className="text-lg">⚡</span>
                  <p className="text-base font-black text-amber-300">+{xpEarned} XP</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">XP Earned</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center border border-white/10">
                  <span className="text-lg">⏱️</span>
                  <p className="text-base font-black text-cyan-300">
                    {durationMins > 0 ? `${durationMins}m ` : ""}{durationRemainingSecs}s
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Speaking Time</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-center border border-white/10">
                  <span className="text-lg">💬</span>
                  <p className="text-base font-black text-emerald-300">{latestSession.dialogueTurns || 6}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-200">Dialogue Turns</p>
                </div>
              </div>
            </div>

            {/* Skill Evaluation Breakdown Cards */}
            <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                <span>Skill Evaluation Breakdown</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">🗣️ Fluency & Flow</span>
                    <span className="text-indigo-500 font-black">{fluencyScore}%</span>
                  </div>
                  <ProgressBar value={fluencyScore} color="bg-indigo-500" />
                  <p className="text-[11px] text-[var(--text-muted)]">Pacing, natural phrasing, and smooth continuity</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">🎯 Grammar Precision</span>
                    <span className="text-emerald-500 font-black">{grammarScore}%</span>
                  </div>
                  <ProgressBar value={grammarScore} color="bg-emerald-500" />
                  <p className="text-[11px] text-[var(--text-muted)]">Sentence syntax, verb tenses, and grammatical accuracy</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">📚 Vocabulary Range</span>
                    <span className="text-violet-500 font-black">{vocabularyScore}%</span>
                  </div>
                  <ProgressBar value={vocabularyScore} color="bg-violet-500" />
                  <p className="text-[11px] text-[var(--text-muted)]">Lexical richness, contextual relevance, and word diversity</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[var(--text-primary)]">🎙️ Speech Clarity</span>
                    <span className="text-amber-500 font-black">{pronunciationScore}%</span>
                  </div>
                  <ProgressBar value={pronunciationScore} color="bg-amber-500" />
                  <p className="text-[11px] text-[var(--text-muted)]">Enunciation precision, clarity, and comprehensibility</p>
                </div>
              </div>
            </div>

            {/* AI Evaluation Insights & Feedback Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Comprehensive Evaluation */}
              <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-500">
                  <Quote size={15} />
                  <span>Comprehensive Evaluation</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                  {feedbackDetail?.summary ||
                    latestSession.feedback ||
                    "Completed speaking practice session with active spoken dialogue turns and continuous language flow."}
                </p>
              </div>

              {/* Vocabulary Suggestions */}
              <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-violet-500">
                  <Lightbulb size={15} />
                  <span>Vocabulary & Synonyms Suggested</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                  {feedbackDetail?.vocabularySuggestions ||
                    "Proficiency, Natural fluency, Articulate, Contextual phrasing"}
                </p>
              </div>

              {/* Grammar Doctor Recommendations */}
              <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-500">
                  <Stethoscope size={15} />
                  <span>Grammar Doctor Recommendations</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                  {feedbackDetail?.grammarCorrections ||
                    "Good attempt! Focus on maintaining consistent past and present perfect tenses across spoken turns."}
                </p>
              </div>

              {/* Recommended Native Phrasing */}
              <div className="p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-500">
                  <Sparkles size={15} />
                  <span>Recommended Native Phrasing</span>
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed font-medium">
                  {feedbackDetail?.betterSentences ||
                    "Try expressing ideas with richer connecting phrases like 'Furthermore', 'From my perspective', or 'In addition'."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* When no speaking session has occurred yet */
          <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-4">Module Competency</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map(({ key, label, Icon, color, barColor }) => {
                const pct = key === "vocabulary" ? vocabularyScore : key === "grammar" ? grammarScore : key === "speaking" ? fluencyScore : pronunciationScore;
                return (
                  <div key={key} className="space-y-2 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${color}`}>
                          <Icon size={14} />
                        </span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{label}</span>
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)]">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color={barColor} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activities Timeline */}
        <div className="p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center justify-between">
            <span>Recent Activities</span>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">{activities.length} Recorded</span>
          </h4>

          {activities.length > 0 ? (
            <div className="space-y-2.5">
              {activities.slice(0, 5).map((act, idx) => (
                <div
                  key={act.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{act.description || act.title || act.activityType || "Learning Session"}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {act.timestamp ? new Date(act.timestamp).toLocaleString() : "Recently"}
                      </p>
                    </div>
                  </div>
                  {act.xpEarned && (
                    <span className="font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                      +{act.xpEarned} XP
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)] italic py-2">
              No recent logged activities recorded yet.
            </p>
          )}
        </div>

      </div>
    </Modal>
  );
}

export default UserProgressModal;
