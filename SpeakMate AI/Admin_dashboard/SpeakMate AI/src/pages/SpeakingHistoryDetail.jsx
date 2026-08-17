import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService } from "../services/appServices";

export function SpeakingHistoryDetail() {
  const { id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    speakingService
      .detail(id)
      .then((data) => {
        setSessionData(data);
      })
      .catch(() => {
        // Fallback mock history detail if offline
        setSessionData({
          id: id || "1",
          scenario: "Software Job Interview",
          duration: 360,
          score: 88,
          createdAt: new Date().toISOString(),
          messages: [
            { sender: "ai", message: "Hello! Tell me about a challenging software project you led recently." },
            { sender: "user", message: "I led a team of four developers to rebuild our web frontend application." },
            { sender: "ai", message: "That sounds impressive! What technologies did you use for the migration?" },
          ],
          grammarCorrections: "Great usage of past tense verbs. Minor tip: use 'lead' in past as 'led'.",
          vocabularyLearned: "Migration, Architecture, Optimization",
          betterSentences: "I managed a team of four software engineers to re-architect our web app.",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSpeakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[var(--text-secondary)] font-bold">
        Loading conversation transcript...
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
          Score: {sessionData?.score || 88}%
        </span>
      </div>

      {/* Session Details Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-xl space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
          Historical Session Replay
        </span>
        <h1 className="text-2xl font-extrabold">{sessionData?.scenario}</h1>
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
