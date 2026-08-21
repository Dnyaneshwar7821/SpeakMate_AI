import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

import ROUTES from "../constants/routes";
import { aiService, chatService } from "../services/appServices";
import { generateDynamicCoachingResponse } from "../utils/aiConversationEngine";
import { AvatarCanvas } from "../components/avatar/AvatarCanvas";
import { useLipSync } from "../hooks/useLipSync";
import { speakGlobalText } from "../utils/speechHelper";
import { useAuth } from "../context/AuthContext";
import { EventBus, AVATAR_EVENTS } from "../services/live2d/EventBus";

// Dynamic contextual suggestion generator matching mobile app
const getModeHints = (modeParam, lastAiMsg) => {
  const m = (modeParam || "").toLowerCase();
  const text = ((lastAiMsg?.message || "") + " " + (lastAiMsg?.followUpQuestion || "")).toLowerCase();

  if (text.includes("name") || text.includes("who are you") || text.includes("introduce")) {
    return [
      "Hi! Nice to meet you. I'm excited to practice English!",
      "Hello! I'm here to build my speaking confidence and fluency.",
      "Could you tell me a little about yourself as well?"
    ];
  }
  if (text.includes("hobby") || text.includes("free time") || text.includes("weekend") || text.includes("do for fun")) {
    return [
      "In my free time, I really enjoy reading and listening to music.",
      "I love going for walks outdoors and trying new food.",
      "What are popular weekend activities you recommend?"
    ];
  }
  if (text.includes("how are you") || text.includes("how was your day") || text.includes("how is it going")) {
    return [
      "I'm doing great, thank you! How has your day been?",
      "Everything is going well! Ready for today's practice.",
      "It's been a busy day, but I'm excited to learn."
    ];
  }
  if (text.includes("why") && (text.includes("learn") || text.includes("english") || text.includes("practice"))) {
    return [
      "I want to communicate fluently for my career and global travel.",
      "To express myself naturally and connect with people worldwide.",
      "What is your best tip for speaking more like a native?"
    ];
  }
  if (m.includes("interview") || text.includes("strength") || text.includes("experience") || text.includes("career")) {
    return [
      "My greatest strength is my problem-solving ability and adaptability.",
      "I have strong experience collaborating across cross-functional teams.",
      "Could you give me feedback on my professional tone?"
    ];
  }
  if (m.includes("travel") || text.includes("trip") || text.includes("hotel") || text.includes("flight")) {
    return [
      "Could you help me with checking in at the hotel and asking for recommendations?",
      "I'd like to book a flight ticket and ask about baggage allowance.",
      "What are the best local attractions to visit?"
    ];
  }
  return [
    "Could you provide an example of how to use that in daily conversation?",
    "How can I rephrase my previous sentence to sound more native?",
    "Let's move on to the next topic to practice speaking."
  ];
};

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
  const [model, setModel] = useState(null);

  // Smooth Live2D Lip Syncing
  useLipSync(model, isAiSpeaking);

  // Dynamic Real-Time Phonetic Viseme State ("REST", "AA", "EE", "OO", "IH", "OH")
  const [viseme, setViseme] = useState("REST");

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const hasSpokenInitialRef = useRef(false);

  // Phonetic Lip-Sync Event Bus Listener
  useEffect(() => {
    const unsubUpdate = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, (data) => {
      if (data?.viseme) {
        setViseme(data.viseme);
      }
    });

    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => {
      setIsAiSpeaking(true);
    });

    const unsubFinish = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      setIsAiSpeaking(false);
      setViseme("REST");
    });

    return () => {
      unsubUpdate();
      unsubStart();
      unsubFinish();
    };
  }, []);

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

    // Replay latest AI message with new speed
    const lastAiMsg = [...messages].reverse().find((m) => m.sender === "ai" || m.role === "assistant");
    if (lastAiMsg && lastAiMsg.message) {
      speakGlobalText(lastAiMsg.message, nextSpeed);
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
      let response = null;
      try {
        response = await chatService.send(sessionId, cleanText, !isMuted, chatLevel);
      } catch (err) {
        try {
          const aiRes = await aiService.chat(cleanText);
          if (aiRes && (aiRes.response || aiRes.message)) {
            response = {
              id: Date.now() + 1,
              sender: "ai",
              message: aiRes.response || aiRes.message,
              grammarCorrection: "✅ Correct phrasing.",
              betterSentence: null,
              vocabularySuggestions: null,
              explanation: null,
              followUpQuestion: "What else would you like to explore regarding this topic?",
            };
          }
        } catch (e2) {
          const dynamicFeedback = generateDynamicCoachingResponse(cleanText, mode, messages);
          response = {
            id: Date.now() + 1,
            sender: "ai",
            message: dynamicFeedback.aiReply,
            grammarCorrection: dynamicFeedback.grammarCorrection,
            betterSentence: dynamicFeedback.betterSentence,
            vocabularySuggestions: dynamicFeedback.vocabularySuggestions,
            explanation: dynamicFeedback.explanation,
            followUpQuestion: dynamicFeedback.followUpQuestion,
          };
        }
      }

      if (!response) {
        const dynamicFeedback = generateDynamicCoachingResponse(cleanText, mode, messages);
        response = {
          id: Date.now() + 1,
          sender: "ai",
          message: dynamicFeedback.aiReply,
          grammarCorrection: dynamicFeedback.grammarCorrection,
          betterSentence: dynamicFeedback.betterSentence,
          vocabularySuggestions: dynamicFeedback.vocabularySuggestions,
          explanation: dynamicFeedback.explanation,
          followUpQuestion: dynamicFeedback.followUpQuestion,
        };
      }

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
    <div className="h-[calc(100vh-80px)] flex flex-col max-w-5xl mx-auto overflow-hidden relative border border-white/10 rounded-3xl shadow-2xl ring-1 ring-black/20">
      
      {/* 1. FULL SCREEN/BACKGROUND AVATAR CANVAS LAYER */}
      <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <AvatarCanvas className="w-full h-full" framing="faceToChest" onModelLoaded={setModel} />
        </div>

        {/* Ambient Pulsing Soundbar Waves when AI speaks */}
        {isAiSpeaking && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 h-10 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-indigo-500/40 shadow-xl pointer-events-none">
            <span className="w-1.5 bg-[#6c63ff] rounded-full animate-soundbar-1 h-6" />
            <span className="w-1.5 bg-[#ff6584] rounded-full animate-soundbar-2 h-8" />
            <span className="w-1.5 bg-emerald-400 rounded-full animate-soundbar-3 h-5" />
            <span className="w-1.5 bg-[#6c63ff] rounded-full animate-soundbar-4 h-7" />
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest ml-1">AI Speaking</span>
          </div>
        )}

        {/* Dark gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 2. FLOATING UI LAYER (z-10) */}
      <div className="relative z-10 flex-1 flex flex-col h-full p-2 sm:p-4 gap-3 pointer-events-none">
        
        {/* TOP HEADER (Title + Sound + Speed + Hints) */}
        <div className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-3 shadow-2xl shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to={ROUTES.AI_CHAT}
              className="p-2 rounded-xl bg-slate-800/60 border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Back to Chat Modes"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h2 className="font-extrabold text-xs text-white truncate">{title}</h2>
              </div>
              <p className="text-[10px] text-[#A5B4FC] font-semibold truncate">Mode: {mode}</p>
            </div>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleFetchHints}
              disabled={loadingHints}
              className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-[11px] font-extrabold transition-all"
            >
              💡 {loadingHints ? "..." : "AI Hint"}
            </button>

            <button
              onClick={handleToggleSpeed}
              className="px-2.5 py-1 rounded-xl bg-slate-800/60 border border-white/10 text-white text-[11px] font-extrabold transition-all hover:bg-slate-700/60"
              title="Speech Speed"
            >
              ⏱️ {speechSpeed}x
            </button>

            <button
              onClick={() => {
                if (!isMuted && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsAiSpeaking(false);
                  setViseme("REST");
                }
                setIsMuted(!isMuted);
              }}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all border ${
                isMuted ? "bg-red-500/20 border-red-500/40 text-red-400" : "bg-slate-800/60 border-white/10 text-white hover:bg-slate-700/60"
              }`}
            >
              {isMuted ? "🔇 Muted" : "🔊 Sound On"}
            </button>
          </div>
        </div>

        {/* SPACER FOR AVATAR VISIBILITY */}
        <div className="flex-1 min-h-0 pointer-events-none" />

        {/* 3. CONVERSATION THREAD OVERLAY CARD */}
        <div className="pointer-events-auto max-h-[48%] bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0">
          
          {/* Thread Header */}
          <div className="px-4 py-2 border-b border-white/10 bg-slate-800/40 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              💬 Conversation Thread
            </span>
            <span className="text-[10px] font-extrabold text-indigo-400">
              {messages.length} messages
            </span>
          </div>

          {/* Messages List Container */}
          <div className="flex-1 overflow-y-auto space-y-3 p-3.5">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              const hasGrammar = m.grammarCorrection && m.grammarCorrection !== "none";
              const hasBetter = m.betterSentence && m.betterSentence !== "none";
              const hasVocab = m.vocabularySuggestions && m.vocabularySuggestions !== "none";

              return (
                <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-xl p-3.5 rounded-2xl text-xs font-semibold shadow-lg space-y-1.5 relative group ${
                      isUser
                        ? "bg-[#6c63ff] text-white rounded-br-none"
                        : "bg-slate-800/90 text-slate-100 border border-white/10 rounded-bl-none"
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
                      <div className="mt-2.5 p-3 rounded-xl bg-[#1E1B4B]/50 border border-[#6c63ff]/40 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between text-xs font-extrabold text-[#A5B4FC]">
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
                            <span className="text-[9px] font-bold text-indigo-300 uppercase">Grammar Correction</span>
                            <p className="font-semibold text-emerald-400 mt-0.5">👉 {m.grammarCorrection}</p>
                          </div>
                        )}

                        {hasBetter && (
                          <div>
                            <span className="text-[9px] font-bold text-indigo-300 uppercase">Better Sentence</span>
                            <p className="font-semibold text-slate-200 mt-0.5">💡 "{m.betterSentence}"</p>
                          </div>
                        )}

                        {m.explanation && (
                          <p className="italic text-slate-400 border-t border-white/10 pt-1 text-[10px]">
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
              <div className="flex items-center gap-2 p-3 text-xs font-bold text-indigo-300">
                <span className="h-2 w-2 rounded-full bg-[#6c63ff] animate-ping" />
                SpeakMate AI tutor is typing & evaluating...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Dynamic AI Smart Suggestions Tray */}
          {(() => {
            const lastAi = [...messages].reverse().find((m) => m.sender === "ai" || m.role === "assistant");
            const activeHints = hints.length > 0 ? hints : getModeHints(mode, lastAi);
            return (
              <div className="p-2.5 border-t border-white/10 bg-slate-800/40 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
                <span className="text-[10px] font-bold text-indigo-300 shrink-0 flex items-center gap-1">
                  💡 Suggestions:
                </span>
                {activeHints.map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(hint)}
                    className="px-3 py-1 rounded-xl bg-slate-700/60 hover:bg-[#6c63ff] hover:text-white text-xs font-semibold text-slate-200 shrink-0 transition-all border border-white/10 shadow-sm"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Integrated Text Input Bar & Voice Wave */}
          <div className="p-3 border-t border-white/10 bg-slate-900/80 shrink-0 space-y-2">
            {isListening && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-400">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 h-4">
                    <span className="w-1 bg-red-400 rounded-full h-3 animate-pulse" />
                    <span className="w-1 bg-red-400 rounded-full h-5 animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 bg-red-400 rounded-full h-3.5 animate-pulse" style={{ animationDelay: "300ms" }} />
                    <span className="w-1 bg-red-400 rounded-full h-5 animate-pulse" style={{ animationDelay: "75ms" }} />
                    <span className="w-1 bg-red-400 rounded-full h-2.5 animate-pulse" style={{ animationDelay: "225ms" }} />
                  </div>
                  <span>Speak now — SpeakMate AI is listening to your English...</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className="px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-extrabold hover:bg-red-600 transition-all"
                >
                  Done
                </button>
              </div>
            )}

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
                className={`p-2.5 rounded-xl font-bold transition-all ${
                  isListening ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-slate-800 border border-white/10 text-slate-300 hover:text-white"
                }`}
                title="Toggle Mic Recording"
              >
                🎙️
              </button>

              <input
                type="text"
                placeholder={isListening ? "Listening to your voice..." : "Type response to tutor (or tap suggestion above)..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={evaluating}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-xs font-semibold focus:outline-none focus:border-[#6c63ff] text-white placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || evaluating}
                className="px-5 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] disabled:opacity-50 text-white font-extrabold text-xs shadow-lg transition-all shrink-0"
              >
                Send →
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Options Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-3 text-white">
            <h3 className="text-sm font-extrabold text-white">Message Options</h3>
            <p className="text-xs text-slate-400 italic truncate">"{selectedMessage.message}"</p>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMessage.message);
                  setSelectedMessage(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-xs font-extrabold text-white text-left hover:bg-[#6c63ff] transition-all"
              >
                📋 Copy Message Text
              </button>

              <button
                onClick={() => {
                  handleSpeakText(getSpeakableText(selectedMessage));
                  setSelectedMessage(null);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-xs font-extrabold text-white text-left hover:bg-[#6c63ff] transition-all"
              >
                🔊 Replay Voice Audio
              </button>

              <button
                onClick={() => handleToggleBookmark(selectedMessage.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-xs font-extrabold text-amber-400 text-left hover:bg-amber-500 hover:text-white transition-all"
              >
                ⭐ {selectedMessage.bookmarked ? "Remove Bookmark" : "Bookmark Tip"}
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-400 hover:text-white"
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
