import { useState, useEffect } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { speakGlobalText } from "../utils/speechHelper";
import ROUTES from "../constants/routes";
import { speakingService } from "../services/appServices";

export function SpeakingHistoryDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const effectiveId = id && id !== ":id" ? id : searchParams.get("sessionId");

  const initialData = location.state?.session || null;
  const [sessionData, setSessionData] = useState(() => initialData);
  const [loading, setLoading] = useState(() => !initialData?.messages);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!effectiveId) {
      if (!initialData) setError(true);
      setLoading(false);
      return;
    }
    if (!sessionData?.messages) {
      setLoading(true);
    }
    setError(false);
    speakingService
      .detail(effectiveId)
      .then((data) => {
        if (data && (data.id || data.scenario)) {
          setSessionData(data);
        } else if (!sessionData) {
          setError(true);
        }
      })
      .catch(() => {
        if (!sessionData) setError(true);
      })
      .finally(() => setLoading(false));
  }, [effectiveId]);

  const handleSpeakText = (text) => {
    speakGlobalText(text);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)] font-bold">
        Loading conversation transcript...
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-3xl flex items-center justify-center mx-auto shadow-sm">
          ⚠️
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            Unable to Load Session Replay
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
            The requested speaking practice transcript could not be found or you are currently offline.
          </p>
        </div>
        <div>
          <Link
            to={ROUTES.SPEAKING}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6C63FF] hover:bg-[#5B52E0] text-white text-xs font-black shadow-lg shadow-[#6C63FF]/25 transition-all"
          >
            ← Back to Speaking Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to={ROUTES.SPEAKING}
          className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Speaking Practice</span>
        </Link>

        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
          Score: {sessionData?.score !== null && sessionData?.score !== undefined ? Math.round(sessionData.score) : 0}%
        </span>
      </div>

      {/* Session Details Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-xl">
        <div className="inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-3.5 py-1.5 rounded-full border border-white/25 shadow-sm mb-3">
          Historical Session Replay
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2">{sessionData?.scenario}</h1>
        <p className="text-xs opacity-90">
          Practiced on {new Date(sessionData?.createdAt || Date.now()).toLocaleDateString()} • Duration: {Math.round((sessionData?.duration || 300) / 60)} mins
        </p>
      </div>

      {/* Transcript Bubbles */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Conversation Transcript</h2>

        <div className="space-y-3">
          {sessionData?.messages?.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-md p-4 rounded-2xl text-xs font-semibold shadow-sm space-y-1 ${
                  m.sender === "user"
                    ? "bg-[#6c63ff] text-white rounded-br-none"
                    : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] opacity-75 font-bold uppercase">
                    {m.sender === "user" ? "You" : "AI Tutor"}
                  </span>
                  <button onClick={() => handleSpeakText(m.message)} className="text-xs hover:scale-110" title="Listen Audio">
                    🔊
                  </button>
                </div>
                <p className="leading-relaxed">{m.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corrections & Suggestions */}
      {(sessionData?.grammarCorrections || sessionData?.vocabularyLearned) && (
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Session Feedback & Corrections</h2>

          {sessionData?.grammarCorrections && (
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <h3 className="font-bold text-xs text-[#6c63ff] uppercase tracking-wider">Grammar Notes</h3>
              <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">{sessionData.grammarCorrections}</p>
            </div>
          )}

          {sessionData?.vocabularyLearned && (
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              <h3 className="font-bold text-xs text-amber-500 uppercase tracking-wider">Vocabulary Suggested</h3>
              <p className="text-xs font-semibold text-[var(--text-primary)] mt-1">{sessionData.vocabularyLearned}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SpeakingHistoryDetail;
