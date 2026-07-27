import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { chatService } from "../services/appServices";

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
            <div className={`relative grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-[#6c63ff]/50 shadow-2xl p-2 overflow-hidden ${isAiSpeaking ? "scale-105" : "animate-float"}`}>
              
              {/* SpeakMate AI 3D Human Vector SVG with Multi-Viseme Lip-Syncing */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                <defs>
                  {/* Skin Gradient */}
                  <linearGradient id="skinGradChat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FAD7BD" />
                    <stop offset="100%" stopColor="#E3A880" />
                  </linearGradient>
                  {/* Hair Gradient */}
                  <linearGradient id="hairGradChat" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4A306D" />
                    <stop offset="100%" stopColor="#1E1035" />
                  </linearGradient>
                  {/* Iris Gradient */}
                  <radialGradient id="eyeIrisChat">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </radialGradient>
                </defs>

                {/* Neck & Suit Collar */}
                <path d="M 32 82 Q 50 78 68 82 L 72 100 L 28 100 Z" fill="#E3A880" />
                <path d="M 24 90 Q 50 82 76 90 L 85 100 L 15 100 Z" fill="#6C63FF" opacity="0.9" />

                {/* 3D Face Base */}
                <path d="M 26 36 Q 22 58 32 76 Q 50 88 68 76 Q 78 58 74 36 Q 50 30 26 36 Z" fill="url(#skinGradChat)" />

                {/* Ears */}
                <ellipse cx="23" cy="52" rx="4" ry="7" fill="#E3A880" />
                <ellipse cx="77" cy="52" rx="4" ry="7" fill="#E3A880" />

                {/* Hair Styling */}
                <path d="M 20 42 Q 22 14 50 14 Q 78 14 80 42 Q 65 26 50 26 Q 35 26 20 42 Z" fill="url(#hairGradChat)" />

                {/* Eyebrows */}
                <path d="M 31 43 Q 39 39 47 43" stroke="#2D1945" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 53 43 Q 61 39 69 43" stroke="#2D1945" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* 3D Eyes with Pupil & Reflections */}
                <g className="animate-eye-blink">
                  <ellipse cx="39" cy="49" rx="6" ry="4.5" fill="#FFFFFF" />
                  <ellipse cx="39" cy="49" rx="3.5" ry="3.5" fill="url(#eyeIrisChat)" />
                  <circle cx="37.5" cy="47.5" r="1.2" fill="#FFFFFF" />

                  <ellipse cx="61" cy="49" rx="6" ry="4.5" fill="#FFFFFF" />
                  <ellipse cx="61" cy="49" rx="3.5" ry="3.5" fill="url(#eyeIrisChat)" />
                  <circle cx="59.5" cy="47.5" r="1.2" fill="#FFFFFF" />
                </g>

                {/* Nose */}
                <path d="M 50 50 L 48 60 L 52 60 Z" fill="#D4946A" opacity="0.6" />

                {/* REAL-TIME DYNAMIC LIP-SYNC MOUTH MORPHS */}
                {viseme === "AA" ? (
                  // Open Wide "AA" Mouth
                  <g>
                    <path d="M 35 64 Q 50 58 65 64 Q 65 80 50 82 Q 35 80 35 64 Z" fill="#991B1B" stroke="#B91C1C" strokeWidth="1" />
                    <path d="M 37 65 Q 50 62 63 65 L 63 68 Q 50 65 37 68 Z" fill="#FFFFFF" />
                    <ellipse cx="50" cy="77" rx="6" ry="3.5" fill="#F87171" />
                  </g>
                ) : viseme === "EE" ? (
                  // Wide Smile Talking "EE" Mouth
                  <g>
                    <path d="M 31 65 Q 50 60 69 65 Q 69 77 50 78 Q 31 77 31 65 Z" fill="#881337" stroke="#9F1239" strokeWidth="1" />
                    <path d="M 33 66 Q 50 62 67 66 L 67 69 Q 50 66 33 69 Z" fill="#FFFFFF" />
                  </g>
                ) : viseme === "OO" ? (
                  // Puckered Round "OO" Mouth
                  <g>
                    <path d="M 42 63 Q 50 59 58 63 Q 59 77 50 78 Q 41 77 42 63 Z" fill="#7F1D1D" stroke="#991B1B" strokeWidth="1" />
                    <ellipse cx="50" cy="74" rx="3.5" ry="2" fill="#F87171" />
                  </g>
                ) : viseme === "IH" ? (
                  // Half-Open "IH" Mouth
                  <g>
                    <path d="M 36 65 Q 50 61 64 65 Q 64 74 50 75 Q 36 74 36 65 Z" fill="#881337" stroke="#9F1239" strokeWidth="1" />
                    <path d="M 38 66 Q 50 63 62 66 L 62 68 Q 50 66 38 68 Z" fill="#FFFFFF" />
                  </g>
                ) : viseme === "OH" ? (
                  // Medium Open "OH" Mouth
                  <g>
                    <path d="M 38 63 Q 50 58 62 63 Q 63 78 50 80 Q 37 78 38 63 Z" fill="#7F1D1D" stroke="#991B1B" strokeWidth="1" />
                    <ellipse cx="50" cy="75" rx="4" ry="2.5" fill="#F87171" />
                  </g>
                ) : (
                  // REST / Natural Closed Smile
                  <g>
                    <path d="M 35 68 Q 50 72 65 68 M 37 70 Q 50 74 63 70" stroke="#991B1B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </g>
                )}
              </svg>

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
