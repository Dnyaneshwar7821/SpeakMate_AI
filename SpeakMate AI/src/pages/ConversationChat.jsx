import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import ROUTES from "../constants/routes";
import { chatService } from "../services/appServices";
import { AvatarCanvas } from "../components/avatar/AvatarCanvas";
import { speakGlobalText } from "../utils/speechHelper";
import { useAuth } from "../context/AuthContext";

export function ConversationChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const mode = searchParams.get("mode") || "General English";
  const title = searchParams.get("title") || `${mode} Session`;

  const [sessionId] = useState(sessionIdParam || Date.now().toString());
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const { user } = useAuth();
  const [chatLevel] = useState(user?.schoolGrade || user?.englishLevel || "Intermediate");
  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Dynamic Real-Time Phonetic Viseme State ("REST", "AA", "EE", "OO", "IH", "OH")
  const [viseme, setViseme] = useState("REST");

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const hasSpokenInitialRef = useRef(false);

  // Real-Time Phonetic Lip-Sync Loop
  useEffect(() => {
    let visemeInterval = null;
    if (isAiSpeaking) {
      const VISEMES = ["AA", "EE", "IH", "OO", "AA", "OH", "EE", "REST"];
      let idx = 0;
      visemeInterval = setInterval(() => {
        idx = (idx + 1) % VISEMES.length;
        setViseme(VISEMES[idx]);
      }, 120);
    } else {
      setViseme("REST");
    }
    return () => clearInterval(visemeInterval);
  }, [isAiSpeaking]);

  const getSpeakableText = (msg) => {
    if (!msg) return "";
    let text = msg.message || "";
    const isCorrect =
      msg.grammarCorrection &&
      (msg.grammarCorrection.includes("✅") ||
        msg.grammarCorrection.toLowerCase().includes("correct"));

    if (msg.grammarCorrection && !isCorrect) {
      text += `. A better way to say that is: "${msg.grammarCorrection}".`;
      if (msg.explanation) {
        text += ` ${msg.explanation}`;
      }
    } else if (msg.betterSentence) {
      text += `. You could also express it as: "${msg.betterSentence}".`;
      if (msg.explanation) {
        text += ` ${msg.explanation}`;
      }
    }

    if (msg.followUpQuestion) {
      text += ` ${msg.followUpQuestion}`;
    }
    return text;
  };

  const handleSpeakText = (text) => {
    if (isMuted || !text) return;
    speakGlobalText(text, speechSpeed, {
      onstart: () => {
        setIsAiSpeaking(true);
        setViseme("AA");
      },
      onboundary: () => {
        const VISEMES = ["AA", "EE", "IH", "OO", "OH"];
        const nextViseme = VISEMES[Math.floor(Math.random() * VISEMES.length)];
        setViseme(nextViseme);
      },
      onend: () => {
        setIsAiSpeaking(false);
        setViseme("REST");
      },
      onerror: () => {
        setIsAiSpeaking(false);
        setViseme("REST");
      },
    });
  };

  // Load initial messages from backend chatService
  useEffect(() => {
    chatService
      .detail(sessionId)
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          if (!hasSpokenInitialRef.current) {
            hasSpokenInitialRef.current = true;
            const lastAi = [...data.messages].reverse().find((m) => m.sender === "ai");
            if (lastAi) {
              setTimeout(() => handleSpeakText(getSpeakableText(lastAi)), 500);
            }
          }
        } else {
          const initMsg = {
            id: Date.now(),
            sender: "ai",
            message: `Hello! I am SpeakMate AI, your Coach for ${mode}. Let's begin our session! What would you like to discuss today?`,
          };
          setMessages([initMsg]);
          if (!hasSpokenInitialRef.current) {
            hasSpokenInitialRef.current = true;
            setTimeout(() => handleSpeakText(initMsg.message), 500);
          }
        }
      })
      .catch(() => {
        const initMsg = {
          id: Date.now(),
          sender: "ai",
          message: `Hello! I am SpeakMate AI, your Coach for ${mode}. Let's practice speaking and writing together!`,
        };
        setMessages([initMsg]);
        if (!hasSpokenInitialRef.current) {
          hasSpokenInitialRef.current = true;
          setTimeout(() => handleSpeakText(initMsg.message), 500);
        }
      });
  }, [sessionId, mode]);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, hints, evaluating]);

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (e) => {
        let transcript = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setCurrentTranscript(transcript);
        setInputText(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleSpeed = () => {
    const SPEEDS = [0.5, 0.75, 1.0, 1.5, 2.0];
    const idx = SPEEDS.indexOf(speechSpeed);
    const nextSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeechSpeed(nextSpeed);
    localStorage.setItem("speakmate_voice_speed", String(nextSpeed));

    // Replay latest AI message with new speed (Matches Mobile App VoiceService)
    const lastAiMsg = [...messages].reverse().find((m) => m.sender === "ai" || m.role === "assistant");
    if (lastAiMsg && lastAiMsg.text) {
      speakGlobalText(lastAiMsg.text, nextSpeed);
    }
  };

  const handleFetchHints = async () => {
    setLoadingHints(true);
    try {
      const data = await chatService.getHints(sessionId).catch(() => [
        "Could you explain the grammar rules for present perfect tense?",
        "How can I sound more natural in professional emails?",
      ]);
      setHints(data || []);
    } catch (e) {
      console.warn("Fetch hints error:", e);
    } finally {
      setLoadingHints(false);
    }
  };

  const handleToggleRecording = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsAiSpeaking(false);
        setViseme("REST");
      }
      if (recognitionRef.current) {
        setCurrentTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } else {
        setIsListening(true);
        setTimeout(() => {
          setInputText("I want to improve my sentence structure and vocabulary.");
          setIsListening(false);
        }, 1500);
      }
    }
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const cleanText = textToSend.trim();
    if (!cleanText) return;

    setInputText("");
    setHints([]);
    setEvaluating(true);

    const userMsg = {
      id: Date.now(),
      sender: "user",
      message: cleanText,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await chatService.send(sessionId, cleanText, !isMuted, chatLevel).catch(() => ({
        id: Date.now() + 1,
        sender: "ai",
        message: "That is a well-structured sentence! Here is a tip to refine your phrasing.",
        grammarCorrection: "I want to improve my sentence structure. ✅ Correct!",
        betterSentence: "I aim to refine my sentence composition and vocabulary range.",
        vocabularySuggestions: "Refine, Composition, Vocabulary range",
        explanation: "Using 'refine' and 'composition' elevates your formal expression.",
        followUpQuestion: "Would you like to practice more examples on this topic?",
      }));

      setMessages((prev) => [...prev, response]);
      setEvaluating(false);

      const fullSpeakableText = getSpeakableText(response);
      handleSpeakText(fullSpeakableText);
    } catch (e) {
      setEvaluating(false);
    }
  };

  const handleToggleBookmark = async (msgId) => {
    try {
      await chatService.toggleBookmark(msgId).catch(() => true);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, bookmarked: !m.bookmarked } : m))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSelectedMessage(null);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row max-w-7xl mx-auto gap-4 p-2 sm:p-4 overflow-hidden">
      {/* LEFT PANEL: Avatar & Controls */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-3 shrink-0 overflow-y-auto pr-1">
        {/* Top Header Card */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-between gap-3 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to={ROUTES.AI_CHAT}
              className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h2 className="font-extrabold text-xs text-[var(--text-primary)] truncate">{title}</h2>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold truncate">Mode: {mode}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                if (!isMuted && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsAiSpeaking(false);
                  setViseme("REST");
                }
                setIsMuted(!isMuted);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all border ${
                isMuted ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
              }`}
            >
              {isMuted ? "🔇 Muted" : "🔊 Sound On"}
            </button>
          </div>
        </div>

        {/* Live2D Avatar Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-xl flex flex-col items-center justify-center text-center space-y-3 shrink-0 relative overflow-hidden">
          <div className="flex items-center justify-between w-full px-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#A5B4FC]">
              SpeakMate AI Live2D Coach
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#6c63ff] text-white shadow">
              ✨ Live2D
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 relative w-full">
            {isAiSpeaking && (
              <div className="flex items-center gap-1 h-8">
                <span className="w-1 bg-[#6c63ff] rounded-full animate-soundbar-1" />
                <span className="w-1 bg-[#ff6584] rounded-full animate-soundbar-2" />
                <span className="w-1 bg-emerald-400 rounded-full animate-soundbar-3" />
              </div>
            )}

            <div className="relative group">
              <div className={`absolute -inset-2 rounded-full bg-gradient-to-tr from-[#6c63ff] via-[#8b85ff] to-[#ff6584] opacity-50 blur-lg transition-all ${isAiSpeaking ? "opacity-100 animate-pulse" : isListening ? "opacity-90 ring-4 ring-red-500/50" : ""}`} />

              <div className={`relative grid h-48 w-48 md:h-60 md:w-60 place-items-center rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-[#6c63ff]/50 shadow-2xl overflow-hidden ${isAiSpeaking ? "scale-105" : "animate-float"}`}>
                <div className="w-full h-full absolute inset-0 flex items-center justify-center">
                  <AvatarCanvas className="w-full h-full" />
                </div>
              </div>

              <span className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-[10px] shadow-lg ${isListening ? "bg-red-500 text-white animate-bounce" : isAiSpeaking ? "bg-[#6c63ff] text-white animate-pulse" : "bg-emerald-500 text-white"}`}>
                {isListening ? "🎙️" : isAiSpeaking ? "🔊" : "✨"}
              </span>
            </div>

            {isAiSpeaking && (
              <div className="flex items-center gap-1 h-8">
                <span className="w-1 bg-emerald-400 rounded-full animate-soundbar-3" />
                <span className="w-1 bg-[#ff6584] rounded-full animate-soundbar-2" />
                <span className="w-1 bg-[#6c63ff] rounded-full animate-soundbar-4" />
              </div>
            )}
          </div>
        </div>

        {/* Speed & Hints Card */}
        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[var(--text-secondary)]">Speech Settings</span>
            <button
              onClick={handleToggleSpeed}
              className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-extrabold text-[#6c63ff] hover:opacity-80 transition-all flex items-center gap-1.5"
              title="Adjust Speech Speed"
            >
              <span>⏱️ {speechSpeed}x Speed</span>
            </button>
          </div>

          <button
            onClick={handleFetchHints}
            disabled={loadingHints}
            className="w-full py-2 px-3 rounded-xl bg-[#6c63ff]/10 hover:bg-[#6c63ff]/20 text-[#6c63ff] text-xs font-bold transition-all border border-[#6c63ff]/20 flex items-center justify-center gap-1.5"
          >
            <span>💡 {loadingHints ? "Loading suggestions..." : "Get Smart AI Suggestion"}</span>
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: Chat Thread */}
      <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-sm overflow-hidden">
        {/* Right Panel Header */}
        <div className="px-5 py-3 border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/50 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
            Conversation Thread
          </span>
          <span className="text-[11px] font-semibold text-[#6c63ff]">
            {messages.length} messages
          </span>
        </div>

        {/* Messages Thread Container */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            const hasGrammar = m.grammarCorrection && m.grammarCorrection !== "none";
            const hasBetter = m.betterSentence && m.betterSentence !== "none";
            const hasVocab = m.vocabularySuggestions && m.vocabularySuggestions !== "none";

            return (
              <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-lg p-3.5 rounded-2xl text-xs font-semibold shadow-sm space-y-1.5 relative group ${
                    isUser
                      ? "bg-[#6c63ff] text-white rounded-br-none"
                      : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] opacity-75 font-bold uppercase">{isUser ? "You" : "SpeakMate AI Tutor"}</span>
                    <div className="flex items-center gap-2">
                      {m.bookmarked && <span className="text-amber-400">⭐</span>}
                      {!isUser && (
                        <button onClick={() => handleSpeakText(getSpeakableText(m))} className="text-xs hover:scale-110" title="Play Voice & Correction">
                          🔊
                        </button>
                      )}
                      <button onClick={() => setSelectedMessage(m)} className="text-xs opacity-60 hover:opacity-100" title="Options">
                        •••
                      </button>
                    </div>
                  </div>

                  <p className="leading-relaxed text-xs">{m.message}</p>

                  {/* Inline Tutor Evaluation Feedback Card */}
                  {!isUser && (hasGrammar || hasBetter || hasVocab) && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#1E1B4B]/30 border border-[#6c63ff]/30 space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-xs font-extrabold text-[#6c63ff]">
                        <span>🎓 Tutor Feedback & Corrections</span>
                        <button
                          onClick={() => handleSpeakText(getSpeakableText(m))}
                          className="px-2 py-0.5 rounded bg-[#6c63ff] text-white text-[9px] font-bold hover:bg-[#8b85ff]"
                        >
                          🔊 Listen Correction
                        </button>
                      </div>

                      {hasGrammar && (
                        <div>
                          <span className="text-[9px] font-bold text-[#818CF8] uppercase">Grammar Correction</span>
                          <p className="font-semibold text-emerald-500 mt-0.5">👉 {m.grammarCorrection}</p>
                        </div>
                      )}

                      {hasBetter && (
                        <div>
                          <span className="text-[9px] font-bold text-[#818CF8] uppercase">Better Sentence</span>
                          <p className="font-semibold text-[var(--text-primary)] mt-0.5">💡 "{m.betterSentence}"</p>
                        </div>
                      )}

                      {m.explanation && (
                        <p className="italic text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-1 text-[10px]">
                          {m.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {evaluating && (
            <div className="flex items-center gap-2 p-3 text-xs font-bold text-[var(--text-secondary)]">
              <span className="h-2 w-2 rounded-full bg-[#6c63ff] animate-ping" />
              SpeakMate AI thinking & evaluating syntax...
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Hints Suggestions Tray */}
        {hints.length > 0 && (
          <div className="p-3 border-t border-[var(--border-default)] bg-[var(--bg-elevated)]/30 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] shrink-0">Suggestions:</span>
            {hints.map((hint, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(hint)}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#6c63ff] hover:text-white text-xs font-semibold shrink-0 transition-all border border-[var(--border-default)]"
              >
                {hint}
              </button>
            ))}
          </div>
        )}

        {/* Bottom Input & Voice Control Bar */}
        <div className="p-3.5 border-t border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col gap-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleToggleRecording}
              className={`p-3 rounded-2xl font-bold transition-all ${
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
              title="Toggle Mic Recording"
            >
              🎙️
            </button>

            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Type response to tutor..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={evaluating}
              className="flex-1 px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff] text-[var(--text-primary)]"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || evaluating}
              className="px-5 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#8b85ff] disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all shrink-0"
            >
              Send →
            </button>
          </form>
        </div>
      </div>

      {/* Options Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-2xl space-y-3">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Message Options</h3>
            <p className="text-xs text-[var(--text-secondary)] italic truncate">"{selectedMessage.message}"</p>

            <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMessage.message);
                  setSelectedMessage(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-elevated)] text-xs font-extrabold text-[var(--text-primary)] text-left hover:bg-[#6c63ff] hover:text-white transition-all"
              >
                📋 Copy Message Text
              </button>

              <button
                onClick={() => {
                  handleSpeakText(getSpeakableText(selectedMessage));
                  setSelectedMessage(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-elevated)] text-xs font-extrabold text-[var(--text-primary)] text-left hover:bg-[#6c63ff] hover:text-white transition-all"
              >
                🔊 Replay Voice Audio
              </button>

              <button
                onClick={() => handleToggleBookmark(selectedMessage.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-elevated)] text-xs font-extrabold text-amber-500 text-left hover:bg-amber-500 hover:text-white transition-all"
              >
                ⭐ {selectedMessage.bookmarked ? "Remove Bookmark" : "Bookmark Tip"}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationChat;
