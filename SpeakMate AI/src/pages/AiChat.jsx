import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";
import { chatService } from "../services/appServices";

const CHAT_MODES = [
  { key: "General English", title: "General English", desc: "Improve conversation, general fluency and grammar.", difficulty: "All levels", icon: "💬", color: "#6366F1" },
  { key: "Grammar Coach", title: "Grammar Coach", desc: "Deep-dive into correct syntax, tenses, and sentence styling.", difficulty: "Beginner", icon: "✍️", color: "#EC4899" },
  { key: "Vocabulary Builder", title: "Vocabulary Builder", desc: "Enrich expression, learn native synonyms and idioms.", difficulty: "Intermediate", icon: "📚", color: "#F59E0B" },
  { key: "Daily Conversation", title: "Daily Conversation", desc: "Practice common everyday talking scenarios.", difficulty: "Beginner", icon: "☕", color: "#10B981" },
  { key: "Interview Coach", title: "Interview Coach", desc: "Practice responses for job interviews and professional feedback.", difficulty: "Advanced", icon: "💼", color: "#8B5CF6" },
  { key: "Business English", title: "Business English", desc: "Master corporate emails, meetings, and business talk.", difficulty: "Advanced", icon: "📊", color: "#3B82F6" },
  { key: "Travel English", title: "Travel English", desc: "Learn useful vocabulary for flights, hotels, and directions.", difficulty: "Beginner", icon: "✈️", color: "#06B6D4" },
  { key: "IELTS Speaking", title: "IELTS Speaking", desc: "Simulate official IELTS speaking parts with targeted scoring.", difficulty: "Advanced", icon: "🏅", color: "#EF4444" },
  { key: "Storytelling", title: "Storytelling", desc: "Construct narratives, descriptive tales, and explain events.", difficulty: "Intermediate", icon: "📖", color: "#10B981" },
  { key: "Debate", title: "Debate", desc: "Discuss controversial topics, formulate arguments, and reply.", difficulty: "Advanced", icon: "⚖️", color: "#6366F1" },
  { key: "Free Chat", title: "Free Chat", desc: "Open-ended dialogue with your tutor on any topic.", difficulty: "All levels", icon: "✨", color: "#F59E0B" },
];

export function AiChat() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for Rename
  const [renameTargetSession, setRenameTargetSession] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [renaming, setRenaming] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await chatService.history().catch(() => []);
      setHistory(data || []);
    } catch (e) {
      console.warn("Failed to load chat history", e);
    } fontFinally: {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStartSession = async (modeKey) => {
    try {
      const session = await chatService.start(modeKey).catch(() => ({
        id: Date.now().toString(),
        mode: modeKey,
        title: `${modeKey} Session`,
      }));
      navigate(`${ROUTES.CONVERSATION_CHAT}?sessionId=${session.id}&mode=${encodeURIComponent(modeKey)}&title=${encodeURIComponent(session.title)}`);
    } catch (e) {
      console.error("Start session failed:", e);
    }
  };

  const handleResumeSession = (session) => {
    navigate(`${ROUTES.CONVERSATION_CHAT}?sessionId=${session.id}&mode=${encodeURIComponent(session.mode)}&title=${encodeURIComponent(session.title)}`);
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to permanently delete this chat session and its full message history?")) {
      try {
        await chatService.deleteSession(id);
        setHistory((prev) => prev.filter((s) => s.id !== id));
      } catch (e) {
        console.error("Delete session error:", e);
      }
    }
  };

  const handleRenameSession = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !renameTargetSession) return;
    setRenaming(true);
    try {
      await chatService.rename(renameTargetSession.id, newTitle.trim());
      setHistory((prev) =>
        prev.map((s) => (s.id === renameTargetSession.id ? { ...s, title: newTitle.trim() } : s))
      );
      setRenameTargetSession(null);
      setNewTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setRenaming(false);
    }
  };

  const filteredHistory = history.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (s.title || "").toLowerCase().includes(q) || (s.mode || "").toLowerCase().includes(q);
  });

  const latestSession = history.length > 0 ? history[0] : null;

  return (
    <div className="space-y-8">
      {/* Gradient Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/10 uppercase tracking-wider text-amber-400">
              Interactive AI Tutor
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">AI Tutor Chat Hub</h1>
          <p className="text-xs sm:text-sm text-[#A5B4FC] leading-relaxed">
            Select a specialized tutoring mode to practice interactive reading, writing, grammar corrections, and natural speaking.
          </p>
        </div>

        <button
          onClick={() => handleStartSession("Free Chat")}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-xs shadow-lg hover:scale-105 transition-all text-center shrink-0"
        >
          ✨ Start Open Conversation
        </button>
      </div>

      {/* Continue Latest Session Card */}
      {latestSession && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6c63ff]/15 to-[#ff6584]/15 border border-[#6c63ff]/30 shadow-sm space-y-3">
          <span className="text-[10px] font-extrabold text-[#6c63ff] uppercase tracking-wider">Continue Recent Lesson</span>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 rounded-2xl bg-[#6c63ff]/10">💬</span>
              <div>
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">{latestSession.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Mode: {latestSession.mode} • {latestSession.messageCount || 2} turns exchanged
                </p>
              </div>
            </div>
            <button
              onClick={() => handleResumeSession(latestSession)}
              className="px-5 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-xs font-extrabold shadow-md shrink-0"
            >
              Resume Lesson →
            </button>
          </div>
        </div>
      )}

      {/* Suggested Tutoring Modes Carousel */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Choose Tutoring Focus Mode</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {CHAT_MODES.slice(0, 4).map((m) => (
            <div
              key={m.key}
              onClick={() => handleStartSession(m.key)}
              className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-3xl p-3 rounded-2xl bg-[#6c63ff]/10 group-hover:scale-110 transition-transform">
                    {m.icon}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-500/10 text-[var(--text-secondary)]">
                    {m.difficulty}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors">{m.title}</h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-2">{m.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-right">
                <span className="text-xs font-extrabold text-[#6c63ff] group-hover:translate-x-1 transition-transform inline-block">Start →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Tutoring Focus Areas Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Explore All Learning Modes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHAT_MODES.map((m) => (
            <div
              key={m.key}
              onClick={() => handleStartSession(m.key)}
              className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start gap-4 group"
            >
              <span className="text-3xl p-3 rounded-2xl bg-[#6c63ff]/10 shrink-0 group-hover:scale-110 transition-transform">
                {m.icon}
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)] group-hover:text-[#6c63ff] transition-colors truncate">{m.title}</h3>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-[var(--text-secondary)] shrink-0">
                    {m.difficulty}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Conversation Sessions List */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-extrabold text-[var(--text-primary)]">Recent Conversations & Lessons</h2>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <svg className="w-4 h-4 absolute left-3 top-3 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-secondary)] space-y-2">
            <p className="text-3xl">💬</p>
            <p className="font-bold text-sm">No historical tutoring sessions found.</p>
            <p className="text-xs">Start any tutoring mode above to practice with your AI coach!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((h) => (
              <div
                key={h.id}
                onClick={() => handleResumeSession(h)}
                className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[#6c63ff]/30 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl p-2.5 rounded-xl bg-[#6c63ff]/10 text-[#6c63ff] shrink-0">💬</span>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)] truncate">{h.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Mode: {h.mode} • {h.messageCount || 0} messages
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenameTargetSession(h);
                      setNewTitle(h.title);
                    }}
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[#6c63ff] hover:bg-[#6c63ff]/10 transition-all"
                    title="Rename Conversation"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={(e) => handleDeleteSession(h.id, e)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                    title="Delete Conversation"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Modal */}
      {renameTargetSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-[var(--text-primary)]">Rename Conversation</h3>
            <form onSubmit={handleRenameSession} className="space-y-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new session name..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameTargetSession(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={renaming}
                  className="px-5 py-2 rounded-xl bg-[#6c63ff] text-white text-xs font-extrabold shadow-md"
                >
                  {renaming ? "Saving..." : "Save Title"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiChat;
