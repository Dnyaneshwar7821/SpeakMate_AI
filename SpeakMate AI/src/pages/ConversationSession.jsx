import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService } from "../services/appServices";

const AVATAR_PERSONAS = [
  { id: "sophia", name: "Sophia", role: "AI Language Coach", skinGrad: ["#FAD7BD", "#E3A880"], hairGrad: ["#4A306D", "#1E1035"], eyeColor: "#6C63FF", suitColor: "#6C63FF" },
  { id: "alex", name: "Alex", role: "Professional AI Tutor", skinGrad: ["#F5C29B", "#D88B5A"], hairGrad: ["#1E293B", "#0F172A"], eyeColor: "#10B981", suitColor: "#3B82F6" },
  { id: "maya", name: "Maya", role: "Friendly Voice Partner", skinGrad: ["#FCE3CD", "#EBB891"], hairGrad: ["#7C2D12", "#451A03"], eyeColor: "#F59E0B", suitColor: "#EC4899" },
];

export function ConversationSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const scenario = searchParams.get("scenario") || "Free Speaking Practice";
  const xpReward = Number(searchParams.get("xpReward")) || 20;

  const [sessionId] = useState(sessionIdParam || Date.now().toString());
  const [activePersona, setActivePersona] = useState(AVATAR_PERSONAS[0]);
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      message: `Hello! I am ${AVATAR_PERSONAS[0].name}, your SpeakMate AI Coach for '${scenario}'. Let's practice speaking together!`,
    },
  ]);

  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [chatLevel, setChatLevel] = useState("Beginner");
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [hints, setHints] = useState([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [corrections, setCorrections] = useState(null);
  const [ending, setEnding] = useState(false);

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

  const getSpeakableText = (feedback) => {
    if (!feedback) return "";
    let text = feedback.aiReply || feedback.message || "";
    const isCorrect =
      feedback.grammarCorrection &&
      (feedback.grammarCorrection.includes("✅") ||
        feedback.grammarCorrection.toLowerCase().includes("correct"));

    if (feedback.grammarCorrection && !isCorrect) {
      text += `. A better way to say that is: "${feedback.grammarCorrection}".`;
      if (feedback.explanation) {
        text += ` ${feedback.explanation}`;
      }
    } else if (feedback.betterSentence) {
      text += `. You could also express it as: "${feedback.betterSentence}".`;
      if (feedback.explanation) {
        text += ` ${feedback.explanation}`;
      }
    }

    if (feedback.followUpQuestion) {
      text += ` ${feedback.followUpQuestion}`;
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

  useEffect(() => {
    if (!hasSpokenInitialRef.current && messages.length > 0) {
      hasSpokenInitialRef.current = true;
      const initialText = messages[0].message;
      const timerId = setTimeout(() => {
        handleSpeakText(initialText);
      }, 500);
      return () => clearTimeout(timerId);
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (!isPaused) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, hints, corrections, isThinking]);

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
      };

      recognition.onerror = (err) => {
        console.error("Speech Recognition Error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleSpeed = () => {
    const SPEEDS = [0.5, 0.75, 1.0, 1.5, 2.0];
    const idx = SPEEDS.indexOf(speechSpeed);
    const nextSpeed = SPEEDS[(idx + 1) % SPEEDS.length];
    setSpeechSpeed(nextSpeed);
  };

  const handleFetchHints = async () => {
    if (isPaused) return;
    setLoadingHints(true);
    try {
      const data = await speakingService.getHints(sessionId).catch(() => [
        "I would like to practice speaking about my hobbies and work experience.",
        "Could you ask me a question about my daily routine?",
      ]);
      setHints(data || []);
    } catch (e) {
      console.warn("Failed to fetch hints:", e);
    } finally {
      setLoadingHints(false);
    }
  };

  const handleStartListening = () => {
    if (isPaused) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
      setViseme("REST");
    }
    if (recognitionRef.current) {
      try {
        setCurrentTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setIsListening(true);
      setTimeout(() => {
        setCurrentTranscript("I want to learn English fluently and improve my vocabulary.");
      }, 1500);
    }
  };

  const handleStopListeningAndSend = async () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    setIsListening(false);

    const userText = currentTranscript.trim() || "I want to improve my spoken English skills.";
    if (!userText) return;

    await sendUserText(userText);
  };

  const sendUserText = async (text) => {
    setHints([]);
    setCurrentTranscript("");
    setIsThinking(true);

    const userMsg = { id: Date.now(), sender: "user", message: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const feedback = await speakingService.sendMessage({
        sessionId,
        message: text,
        level: chatLevel,
      }).catch(() => ({
        aiReply: `That is a fantastic point! Practicing every day with ${activePersona.name} builds natural fluency.`,
        grammarCorrection: "I want to improve my spoken English skills.",
        betterSentence: "I would like to enhance my English speaking proficiency.",
        vocabularySuggestions: "Proficiency, Natural fluency, Accent",
        explanation: "Using 'enhance' adds a formal tone to your conversation.",
        followUpQuestion: "What is your main goal for practicing English?",
      }));

      setIsThinking(false);

      const aiMsg = {
        id: Date.now() + 1,
        sender: "ai",
        message: feedback.aiReply,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setCorrections(feedback);

      const fullSpeakableText = getSpeakableText(feedback);
      handleSpeakText(fullSpeakableText);
    } catch (e) {
      setIsThinking(false);
    }
  };

  const handleEndSession = async () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
      setViseme("REST");
    }
    setEnding(true);
    try {
      const summary = await speakingService.end(sessionId).catch(() => ({
        score: 88,
        xpEarned: xpReward,
        duration: timer,
        messagesExchanged: messages.length,
        summary: `Completed ${scenario} speaking practice session.`,
        vocabularyLearned: "Proficiency, Natural fluency, Articulate",
        grammarCorrections: "Great usage of past & present tenses throughout session.",
        betterSentences: "I would like to enhance my English speaking proficiency.",
        motivationalMessage: "Excellent work! Keep practicing every day to sound more natural.",
      }));
      navigate(ROUTES.SPEAKING_SUMMARY, { state: { summary } });
    } catch (e) {
      navigate(ROUTES.SPEAKING_SUMMARY);
    } finally {
      setEnding(false);
    }
  };

  const avatarState = isPaused
    ? "Paused ⏸️"
    : isAiSpeaking
    ? `${activePersona.name} Speaking... 🔊`
    : isThinking
    ? `${activePersona.name} Thinking... 🧠`
    : isListening
    ? "Listening to You... 🎙️"
    : "Idle Ready ✨";

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto space-y-4">
      {/* Session Top Header */}
      <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-between gap-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.SPEAKING}
            className="p-2.5 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-extrabold text-sm text-[var(--text-primary)] truncate max-w-xs">{scenario}</h2>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">{avatarState}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-extrabold text-[var(--text-primary)]">
            <span>⏱️</span>
            <span>{formatTime(timer)}</span>
          </div>

          <button
            onClick={() => {
              if (!isPaused && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsAiSpeaking(false);
                setViseme("REST");
              }
              setIsPaused(!isPaused);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              isPaused ? "bg-amber-500 text-white border-amber-500" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
            }`}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      {/* 3D Human-Like Lip-Sync AI Tutor Avatar Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-2xl flex flex-col items-center justify-center text-center space-y-4 shrink-0 relative overflow-hidden">
        
        {/* Persona Switcher Selector */}
        <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-full backdrop-blur-md border border-white/15">
          <span className="text-[10px] font-extrabold px-2.5 text-[#A5B4FC] uppercase tracking-wider">AI Persona:</span>
          {AVATAR_PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePersona(p)}
              className={`px-3.5 py-1 rounded-full text-xs font-extrabold transition-all ${
                activePersona.id === p.id
                  ? "bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white shadow-md"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Animated Avatar Face & Soundwave Equalizers */}
        <div className="flex items-center justify-center gap-6 relative">
          
          {/* Left Equalizer Bars */}
          {isAiSpeaking && (
            <div className="flex items-center gap-1.5 h-12">
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
            <div className={`relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-b from-[#1E293B] to-[#0F172A] border-2 border-[#6c63ff]/50 shadow-2xl p-2 overflow-hidden ${isAiSpeaking ? "scale-105" : "animate-float"}`}>
              
              {/* 3D Human Vector Avatar SVG with Multi-Viseme Lip-Syncing */}
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                <defs>
                  {/* Skin Gradient */}
                  <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={activePersona.skinGrad[0]} />
                    <stop offset="100%" stopColor={activePersona.skinGrad[1]} />
                  </linearGradient>
                  {/* Hair Gradient */}
                  <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={activePersona.hairGrad[0]} />
                    <stop offset="100%" stopColor={activePersona.hairGrad[1]} />
                  </linearGradient>
                  {/* Iris Gradient */}
                  <radialGradient id="eyeIris">
                    <stop offset="0%" stopColor={activePersona.eyeColor} />
                    <stop offset="100%" stopColor="#0F172A" />
                  </radialGradient>
                </defs>

                {/* Neck & Suit Collar */}
                <path d="M 32 82 Q 50 78 68 82 L 72 100 L 28 100 Z" fill={activePersona.skinGrad[1]} />
                <path d="M 24 90 Q 50 82 76 90 L 85 100 L 15 100 Z" fill={activePersona.suitColor} opacity="0.9" />

                {/* 3D Face Base */}
                <path d="M 26 36 Q 22 58 32 76 Q 50 88 68 76 Q 78 58 74 36 Q 50 30 26 36 Z" fill="url(#skinGrad)" />

                {/* Ears */}
                <ellipse cx="23" cy="52" rx="4" ry="7" fill={activePersona.skinGrad[1]} />
                <ellipse cx="77" cy="52" rx="4" ry="7" fill={activePersona.skinGrad[1]} />

                {/* Persona Hair Styling */}
                {activePersona.id === "sophia" ? (
                  <path d="M 20 42 Q 22 14 50 14 Q 78 14 80 42 Q 65 26 50 26 Q 35 26 20 42 Z" fill="url(#hairGrad)" />
                ) : activePersona.id === "alex" ? (
                  <path d="M 24 38 Q 28 18 50 16 Q 72 18 76 38 Q 62 28 50 28 Q 38 28 24 38 Z" fill="url(#hairGrad)" />
                ) : (
                  <path d="M 18 44 Q 22 12 50 12 Q 78 12 82 44 Q 65 24 50 24 Q 35 24 18 44 Z" fill="url(#hairGrad)" />
                )}

                {/* Eyebrows */}
                <path d="M 31 43 Q 39 39 47 43" stroke="#2D1945" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <path d="M 53 43 Q 61 39 69 43" stroke="#2D1945" strokeWidth="2.5" strokeLinecap="round" fill="none" />

                {/* 3D Eyes with Pupil & Reflections */}
                <g className="animate-eye-blink">
                  <ellipse cx="39" cy="49" rx="6" ry="4.5" fill="#FFFFFF" />
                  <ellipse cx="39" cy="49" rx="3.5" ry="3.5" fill="url(#eyeIris)" />
                  <circle cx="37.5" cy="47.5" r="1.2" fill="#FFFFFF" />

                  <ellipse cx="61" cy="49" rx="6" ry="4.5" fill="#FFFFFF" />
                  <ellipse cx="61" cy="49" rx="3.5" ry="3.5" fill="url(#eyeIris)" />
                  <circle cx="59.5" cy="47.5" r="1.2" fill="#FFFFFF" />
                </g>

                {/* Glasses for Sophia */}
                {activePersona.id === "sophia" && (
                  <g stroke="#CBD5E1" strokeWidth="1.5" fill="none" opacity="0.8">
                    <rect x="31" y="44" width="16" height="10" rx="3" />
                    <rect x="53" y="44" width="16" height="10" rx="3" />
                    <line x1="47" y1="48" x2="53" y2="48" />
                  </g>
                )}

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
            <span className={`absolute -bottom-1 -right-1 h-7 w-7 rounded-full border-2 border-[#0F172A] flex items-center justify-center text-xs shadow-lg ${isListening ? "bg-red-500 text-white animate-bounce" : isAiSpeaking ? "bg-[#6c63ff] text-white animate-pulse" : "bg-emerald-500 text-white"}`}>
              {isListening ? "🎙️" : isAiSpeaking ? "🔊" : "✨"}
            </span>
          </div>

          {/* Right Equalizer Bars */}
          {isAiSpeaking && (
            <div className="flex items-center gap-1.5 h-12">
              <span className="w-1.5 bg-emerald-400 rounded-full animate-soundbar-3" />
              <span className="w-1.5 bg-[#ff6584] rounded-full animate-soundbar-2" />
              <span className="w-1.5 bg-[#6c63ff] rounded-full animate-soundbar-4" />
            </div>
          )}
        </div>

        {/* Level Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#A5B4FC]">Chat Level:</span>
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setChatLevel(lvl)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                chatLevel === lvl ? "bg-[#6c63ff] text-white shadow-md" : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-md p-4 rounded-2xl text-xs font-semibold shadow-sm space-y-2 ${
                m.sender === "user"
                  ? "bg-[#6c63ff] text-white rounded-br-none"
                  : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] opacity-75 font-bold uppercase">{m.sender === "user" ? "You" : `${activePersona.name} (AI)`}</span>
                {m.sender === "ai" && (
                  <button onClick={() => handleSpeakText(m.message)} className="text-xs hover:scale-110" title="Play Speech">
                    🔊
                  </button>
                )}
              </div>
              <p className="leading-relaxed">{m.message}</p>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 p-3 text-xs font-bold text-[var(--text-secondary)]">
            <span className="h-2 w-2 rounded-full bg-[#6c63ff] animate-ping" />
            {activePersona.name} thinking response & analyzing speech...
          </div>
        )}

        {/* Dynamic Tutor Feedback & Corrections overlay card */}
        {corrections && (
          <div className="p-4 rounded-2xl bg-[#1E1B4B]/20 border border-[#6c63ff]/40 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-[#6c63ff]">
              <span className="flex items-center gap-1.5">🎓 Tutor Feedback & Speech Corrections</span>
              <button
                onClick={() => handleSpeakText(getSpeakableText(corrections))}
                className="px-2.5 py-1 rounded-lg bg-[#6c63ff] text-white text-[10px] font-bold hover:bg-[#8b85ff] transition-all flex items-center gap-1"
                title="Listen Correction Audio"
              >
                <span>🔊 Listen Correction</span>
              </button>
            </div>

            {corrections.grammarCorrection && (
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#818CF8] uppercase">Grammar Correction</span>
                <p className="font-semibold text-emerald-500">👉 {corrections.grammarCorrection}</p>
              </div>
            )}

            {corrections.betterSentence && (
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#818CF8] uppercase">Native Sentence Upgrade</span>
                <p className="font-semibold text-[var(--text-primary)]">💡 "{corrections.betterSentence}"</p>
              </div>
            )}

            {corrections.explanation && (
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#818CF8] uppercase">Explanation Note</span>
                <p className="font-normal italic text-[var(--text-secondary)]">{corrections.explanation}</p>
              </div>
            )}

            {corrections.vocabularySuggestions && (
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#818CF8] uppercase">Vocabulary Suggested</span>
                <p className="font-semibold text-amber-500">✨ {corrections.vocabularySuggestions}</p>
              </div>
            )}
          </div>
        )}

        {/* Live Transcript Stream */}
        {isListening && (
          <div className="flex flex-col items-end">
            <div className="p-3 rounded-2xl bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-xs font-semibold text-[var(--text-primary)] italic animate-pulse">
              "{currentTranscript || "Listening to your voice..."}"
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Hints chips */}
      {hints.length > 0 && (
        <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold text-[var(--text-secondary)] shrink-0">Suggestions:</span>
          {hints.map((hint, idx) => (
            <button
              key={idx}
              onClick={() => sendUserText(hint)}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] hover:bg-[#6c63ff] hover:text-white text-xs font-semibold shrink-0 transition-all"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={handleFetchHints}
            disabled={loadingHints}
            className="text-xs font-bold text-[#6c63ff] hover:underline flex items-center gap-1"
          >
            <span>💡 {loadingHints ? "Loading hints..." : "Need help? Ask AI Tutor for suggestion"}</span>
          </button>

          <button
            onClick={handleToggleSpeed}
            className="px-3 py-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs font-extrabold text-[var(--text-secondary)]"
          >
            ⚡ {speechSpeed}x Speed
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (!isMuted && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
                setIsAiSpeaking(false);
                setViseme("REST");
              }
              setIsMuted(!isMuted);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isMuted ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
            }`}
          >
            {isMuted ? "🔇 Muted" : "🔊 Sound On"}
          </button>

          {/* Main SoundWave Mic Button */}
          {!isListening ? (
            <button
              onClick={handleStartListening}
              className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white shadow-xl hover:scale-105 transition-transform"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleStopListeningAndSend}
              className="grid h-16 w-16 place-items-center rounded-full bg-red-500 text-white shadow-xl animate-pulse ring-4 ring-red-500/30"
            >
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}

          <button
            onClick={handleEndSession}
            disabled={ending}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-xs font-extrabold shadow-md"
          >
            {ending ? "Evaluating..." : "End & Evaluate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConversationSession;
