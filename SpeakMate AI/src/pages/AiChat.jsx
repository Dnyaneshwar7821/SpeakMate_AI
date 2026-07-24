import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ROUTES from "../constants/routes";

const CHAT_TOPICS = [
  { id: "grammar-coach", title: "Grammar & Sentence Fixer", desc: "Get immediate feedback and explanations on your sentence structure.", icon: "✍️", category: "Grammar" },
  { id: "vocab-builder", title: "Idiom & Slang Master", desc: "Learn native expressions, phrasal verbs, and daily idioms.", icon: "📚", category: "Vocabulary" },
  { id: "job-interview", title: "Behavioral Job Interview", desc: "Practice answering tough interview questions using the STAR method.", icon: "💼", category: "Career" },
  { id: "free-chat", title: "Open Conversation", desc: "Talk freely about any topic, hobbies, news, or life experiences.", icon: "💬", category: "General" },
];

export function AiChat() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleStartChat = (topicTitle) => {
    navigate(`${ROUTES.CONVERSATION_CHAT}?topic=${encodeURIComponent(topicTitle)}`);
  };

  const filteredTopics = CHAT_TOPICS.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">AI Chat Coach</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Choose a guided tutor topic or start an open text & voice conversation.
          </p>
        </div>

        <button
          onClick={() => handleStartChat("Open Free Conversation")}
          className="px-6 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-extrabold text-xs shadow-md shadow-[#6c63ff]/20 flex items-center justify-center gap-2"
        >
          <span>💬 Start Open Chat</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3.5 top-3 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search chat topics or coaches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTopics.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-4xl p-3 rounded-2xl bg-[#6c63ff]/10">{t.icon}</span>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/10 text-[#6c63ff]">
                  {t.category}
                </span>
              </div>

              <h3 className="font-extrabold text-lg text-[var(--text-primary)]">{t.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{t.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--border-default)] flex justify-end">
              <button
                onClick={() => handleStartChat(t.title)}
                className="px-5 py-2.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#6c63ff] hover:text-white text-[var(--text-primary)] font-extrabold text-xs transition-all"
              >
                Start Topic Chat →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AiChat;
