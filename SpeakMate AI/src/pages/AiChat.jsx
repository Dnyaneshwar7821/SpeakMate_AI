import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Card from "@components/common/Card";
import { chatMockData } from "@data/chatMockData";
import { sendMessage } from "@services/aiChat";

const MAX_MESSAGE_LENGTH = 1000;

function formatTime(date) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function AiChat() {
  const [messages, setMessages] = useState(chatMockData.starterMessages);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const canSend = useMemo(() => draft.trim().length > 0 && draft.trim().length <= MAX_MESSAGE_LENGTH, [draft]);

  const handleSend = async () => {
    const value = draft.trim();
    if (!value || isTyping || value.length > MAX_MESSAGE_LENGTH) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: value,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setIsTyping(true);

    try {
      const response = await sendMessage(value);
      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: response?.data?.reply || "I am here to help you practice.",
        timestamp: new Date(),
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch {
      const fallbackMessage = {
        id: Date.now() + 2,
        role: "assistant",
        content: "I had trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((current) => [...current, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptSelect = (prompt) => {
    setDraft(prompt);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <section className="mx-auto flex min-h-[calc(100vh-180px)] max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-4"
      >
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
          AI Chat Coach
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
          Practice conversations with your AI coach
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          Start a conversation, refine your phrasing, and build confidence with guided feedback.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
            {chatMockData.title}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            Topic: {chatMockData.topic}
          </span>
        </div>
      </motion.div>

      <Card className="flex flex-1 flex-col overflow-hidden border-slate-200 bg-white shadow-lg">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 p-3 sm:p-4">
          {chatMockData.suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptSelect(prompt)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              Start your first conversation
            </div>
          ) : (
            messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex max-w-[85%] items-end gap-2 sm:max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${isUser ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"}`}>
                      {isUser ? "You" : "AI"}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        isUser
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                      <p className={`mt-2 text-[11px] ${isUser ? "text-indigo-100" : "text-slate-400"}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.2s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.1s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-500" />
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <label htmlFor="chat-input" className="sr-only">
            Type your message
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <textarea
              id="chat-input"
              rows={2}
              value={draft}
              onChange={(event) => {
                const nextValue = event.target.value.slice(0, MAX_MESSAGE_LENGTH);
                setDraft(nextValue);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask for help with a conversation or speaking topic..."
              className="min-h-[84px] flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!canSend || isTyping}
              className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isTyping ? "Thinking..." : "Send"}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <p>Press Enter to send. Use Shift + Enter for a new line.</p>
            <p className={draft.length >= MAX_MESSAGE_LENGTH ? "font-semibold text-rose-500" : ""}>
              {draft.length}/{MAX_MESSAGE_LENGTH}
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}

export default AiChat;
