import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ROUTES from "../constants/routes";

export function ConversationChat() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") || "General English Practice";

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: `Hello! I am your AI Chat Tutor for '${topic}'. Ask me any question, practice sentences, or let's discuss a topic!`,
      timestamp: "12:00 PM",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: `Great sentence! Here is a tip: You used '${userText.split(" ")[0] || "your words"}' very naturally. Would you like to try using a new vocabulary word in your next response?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSpeakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-between gap-4 shadow-sm shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.AI_CHAT}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="font-extrabold text-sm text-[var(--text-primary)]">{topic}</h2>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">AI Tutor Chat Session</p>
          </div>
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-md p-4 rounded-2xl text-sm font-semibold shadow-sm space-y-2 ${
                m.sender === "user"
                  ? "bg-[#6c63ff] text-white rounded-br-none"
                  : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] opacity-75 font-bold uppercase">{m.sender === "user" ? "You" : "AI Tutor"}</span>
                <button onClick={() => handleSpeakText(m.text)} className="text-xs hover:scale-110" title="Listen Audio">
                  🔊
                </button>
              </div>
              <p className="leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 p-3 text-xs font-bold text-[var(--text-secondary)]">
            <span className="h-2 w-2 rounded-full bg-[#6c63ff] animate-ping" />
            AI Tutor is typing...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="mt-4 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message or sentence to practice..."
          className="flex-1 px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-semibold focus:outline-none focus:border-[#6c63ff]"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white font-bold text-sm shadow-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ConversationChat;
