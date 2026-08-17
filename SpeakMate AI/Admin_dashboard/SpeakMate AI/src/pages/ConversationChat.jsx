import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import ROUTES from "../constants/routes";
import { chatService } from "../services/appServices";
import { Avatar3D } from "../components/Avatar3D";

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
  const [chatLevel, setChatLevel] = useState("1st Std");
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
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.lang = "en-US";

      utterance.onstart = () => {
        setIsAiSpeaking(true);
        setViseme("AA");
      };

      utterance.onboundary = () => {
        const VISEMES = ["AA", "EE", "IH", "OO", "OH"];
        const nextViseme = VISEMES[Math.floor(Math.random() * VISEMES.length)];
        setViseme(nextViseme);
      };

      utterance.onend = () => {
        setIsAiSpeaking(false);
        setViseme("REST");
      };

      utterance.onerror = () => {
        setIsAiSpeaking(false);
        setViseme("REST");
      };

      window.speechSynthesis.speak(utterance);
    }
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
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.AI_CHAT}
            className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div>
            <h2 className="font-extrabold text-sm text-[var(--text-primary)] truncate max-w-xs">{title}</h2>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Mode: {mode}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!isMuted && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsAiSpeaking(false);
                setViseme("REST");
              }
              setIsMuted(!isMuted);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              isMuted ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
            }`}
          >
            {isMuted ? "🔇 Muted" : "🔊 Sound On"}
          </button>
        </div>
      </div>

      {/* 3D Human-Like Lip-Sync SpeakMate AI Tutor Avatar Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-2xl flex flex-col items-center justify-center text-center space-y-3 shrink-0 relative overflow-hidden">
        
        {/* Title */}
        <span className="text-[11px] font-black uppercase tracking-wider text-[#A5B4FC]">
          SpeakMate AI Coach
        </span>

        {/* Animated Avatar Face & Soundwave Equalizers */}
        <div className="flex items-center justify-center gap-6 relative">
          
          {/* Left Equalizer Bars */}
          {isAiSpeaking && (
            <div className="flex items-center gap-1.5 h-10">
              <span className="w-1.5 bg-[#6c63ff] rounded-full animate-soundbar-1" />
              <span className="w-1.5 bg-[#ff6584] rounded-full animate-soundbar-2" />
              <span className="w-1.5 bg-emerald-400 rounded-full animate-soundbar-3" />
            </div>
          )}

          {/* 3D Human Vector Avatar Head Box */}
          <div className="relative group">
            {/* Ambient Aura Glow */}
            <div className={`absolute -inset-3 rounded-full bg-gradient-to-tr from-[#6c63ff] via-[#8b85ff] to-[#ff6584] opacity-50 blur-xl transition-all ${isAiSpeaking ? "opacity-100 animate-pulse" : isListening ? "opacity-90 ring-4 ring-red-500/50" : ""}`} />




            {/* Avatar Frame Box */}
            <div className={`relative grid h-48 w-48 place-items-center rounded-full bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-[#6c63ff]/50 shadow-2xl overflow-hidden ${isAiSpeaking ? "scale-105" : "animate-float"}`}>
              
              {/* WebGL 3D Avatar */}
              <div className="w-full h-full absolute inset-0">
                <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
                  <ambientLight intensity={1.5} />
                  <directionalLight position={[2, 2, 2]} intensity={2} />
                  <Environment preset="city" />
                  <Avatar3D viseme={viseme} isSpeaking={isAiSpeaking} />
                </Canvas>
              </div>

            </div>

            {/* Live Status Indicator Badge */}
            <span className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-[10px] shadow-lg ${isListening ? "bg-red-500 text-white animate-bounce" : isAiSpeaking ? "bg-[#6c63ff] text-white animate-pulse" : "bg-emerald-500 text-white"}`}>
              {isListening ? "🎙️" : isAiSpeaking ? "🔊" : "✨"}
            </span>
          </div>

          {/* Right Equalizer Bars */}
          {isAiSpeaking && (
            <div className="flex items-center gap-1.5 h-10">
              <span className="w-1.5 bg-emerald-400 rounded-full animate-soundbar-3" />
              <span className="w-1.5 bg-[#ff6584] rounded-full animate-soundbar-2" />
              <span className="w-1.5 bg-[#6c63ff] rounded-full animate-soundbar-4" />
            </div>
          )}
        </div>

        {/* School Standard Level Controls (1st to 10th Standard) */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
          <span className="text-xs font-bold text-[#A5B4FC] shrink-0">School Standard:</span>
          {[
            "1st Std",
            "2nd Std",
            "3rd Std",
            "4th Std",
            "5th Std",
            "6th Std",
            "7th Std",
            "8th Std",
            "9th Std",
            "10th Std",
          ].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setChatLevel(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
                chatLevel === lvl
                  ? "bg-[#6c63ff] text-white shadow-md"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          const hasGrammar = m.grammarCorrection && m.grammarCorrection !== "none";
          const hasBetter = m.betterSentence && m.betterSentence !== "none";
          const hasVocab = m.vocabularySuggestions && m.vocabularySuggestions !== "none";

          return (
            <div key={m.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-md p-4 rounded-2xl text-xs font-semibold shadow-sm space-y-2 relative group ${
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

                <p className="leading-relaxed">{m.message}</p>

                {/* Inline Tutor Evaluation Feedback Card */}
                {!isUser && (hasGrammar || hasBetter || hasVocab) && (
                  <div className="mt-3 p-3 rounded-xl bg-[#1E1B4B]/30 border border-[#6c63ff]/30 space-y-2 text-[11px]">
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
        <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] shrink-0">Suggestions:</span>
          {hints.map((hint, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(hint)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#6c63ff] hover:text-white text-xs font-semibold shrink-0 transition-all"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input & Voice Control Bar */}
      <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleFetchHints}
            disabled={loadingHints}
            className="text-xs font-bold text-[#6c63ff] hover:underline flex items-center gap-1"
          >
            <span>💡 {loadingHints ? "Loading suggestions..." : "Suggest Response"}</span>
          </button>

          <button
            onClick={handleToggleSpeed}
            className="px-3 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-extrabold text-[var(--text-secondary)]"
          >
            ⚡ {speechSpeed}x Speed
          </button>
        </div>

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
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
            className="flex-1 px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
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
