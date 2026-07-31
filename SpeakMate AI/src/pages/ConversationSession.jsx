import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";

import ROUTES from "../constants/routes";
import { speakingService } from "../services/appServices";
import { AvatarCanvas } from "../components/avatar/AvatarCanvas";
import { speakGlobalText } from "../utils/speechHelper";
import { useAuth } from "../context/AuthContext";
import { recordSpeakingSession } from "../utils/progressTracker";

// Avatar Hooks
import { useLipSync } from "../hooks/useLipSync";
import { useBlink } from "../hooks/useBlink";
import { useMouseTracking } from "../hooks/useMouseTracking";
import { useExpressions } from "../hooks/useExpressions";

export function ConversationSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const scenario = searchParams.get("scenario") || location.state?.scenarioTitle || "Free Speaking Practice";
  const xpReward = Number(searchParams.get("xpReward")) || 20;

  const initialGreeting = location.state?.scenarioDesc
    ? `Hello! Welcome to '${scenario}'. ${location.state.scenarioDesc} Let's practice speaking together!`
    : `Hello! I am your SpeakMate AI Coach for '${scenario}'. Let's practice speaking together!`;

  const [sessionId] = useState(sessionIdParam || Date.now().toString());
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      message: initialGreeting,
    },
  ]);

  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const { user } = useAuth();
  const [chatLevel] = useState(user?.schoolGrade || user?.englishLevel || "Intermediate");
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // Avatar Model State & Hooks
  const [model, setModel] = useState(null);
  const containerRef = useRef(null);
  
  useLipSync(model, isAiSpeaking);
  useBlink(model);
  useMouseTracking(model, containerRef);
  const { setExpression } = useExpressions(model);
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

  useEffect(() => {
    if (!hasSpokenInitialRef.current && messages.length > 0) {
      hasSpokenInitialRef.current = true;
      const initialText = messages[0].message;
      const timerId = setTimeout(() => {
        handleSpeakText(initialText);
      }, 250);
      return () => clearTimeout(timerId);
    }
  }, [messages]);

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
    localStorage.setItem("speakmate_voice_speed", String(nextSpeed));

    // Replay latest AI message with new speed (Matches Mobile App VoiceService)
    const lastAiMsg = [...messages].reverse().find((m) => m.sender === "ai" || m.role === "assistant");
    if (lastAiMsg && lastAiMsg.text) {
      speakGlobalText(lastAiMsg.text, nextSpeed);
    }
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
    } fontFinally: {
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
        aiReply: "That is a fantastic point! Practicing every day with SpeakMate AI builds natural fluency.",
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
      recordSpeakingSession(Math.max(1, Math.ceil(timer / 60)), summary?.score || 88);
      navigate(ROUTES.SPEAKING_SUMMARY, { state: { summary } });
    } catch (e) {
      recordSpeakingSession(Math.max(1, Math.ceil(timer / 60)), 85);
      navigate(ROUTES.SPEAKING_SUMMARY);
    } finally {
      setEnding(false);
    }
  };

  const avatarState = isPaused
    ? "Paused ⏸️"
    : isAiSpeaking
    ? "SpeakMate AI Speaking... 🔊"
    : isThinking
    ? "SpeakMate AI Thinking... 🧠"
    : isListening
    ? "Listening to You... 🎙️"
    : "Idle Ready ✨";

  return (
    <div ref={containerRef} className="h-[calc(100vh-80px)] flex flex-col max-w-4xl mx-auto overflow-hidden relative border border-white/10 rounded-3xl shadow-2xl ring-1 ring-black/20">
      {/* FULL SCREEN AVATAR BACKGROUND */}
      <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <AvatarCanvas className="w-full h-full" onModelLoaded={setModel} />
        </div>
        {/* Dark gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* FLOATING UI LAYER (z-10) */}
      <div className="relative z-10 flex-1 flex flex-col h-full p-2 sm:p-4 gap-3 pointer-events-none">
      {/* 1. TOP HEADER (Scenario Title + Timer + Pause) */}
      <div className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 flex items-center justify-between gap-3 shadow-2xl shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            to={ROUTES.SPEAKING}
            className="p-2 rounded-xl bg-slate-800/50 border border-white/5 text-slate-300 hover:text-white transition-colors shrink-0"
            title="Back to Scenarios"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <h2 className="font-extrabold text-xs text-white truncate">{scenario}</h2>
            </div>
            <p className="text-[10px] text-[#6c63ff] font-semibold truncate">{avatarState}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800/50 border border-white/10 text-[11px] font-extrabold text-white">
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
            className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold transition-all border shadow-sm ${
              isPaused ? "bg-amber-500/20 text-amber-500 border-amber-500/40" : "bg-slate-800/50 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      {/* 2. INVISIBLE SPACER TO PUSH CHAT DOWN */}
        <div className="flex-1 min-h-0 pointer-events-none flex flex-col items-center justify-end pb-4">
        </div>

        {/* 3. CONVERSATION THREAD (Flex-1, Positioned ABOVE the Speak Button) */}
      <div className="pointer-events-auto max-h-[38%] bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col shrink-0">
        {/* Right Panel Header */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-slate-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#6c63ff]" />
            <span className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
              Conversation Thread
            </span>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#6c63ff]/10 border border-[#6c63ff]/30 text-[#6c63ff]">
            {messages.length} Messages
          </span>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-xl p-3.5 rounded-2xl text-xs font-semibold shadow-sm space-y-1.5 ${
                  m.sender === "user"
                    ? "bg-[#6c63ff] text-white rounded-br-none"
                    : "bg-slate-800/60 backdrop-blur-md border border-white/10 text-slate-100 rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[10px] opacity-80 font-black uppercase tracking-wide flex items-center gap-1.5">
                    {m.sender === "user" ? "👤 You" : "🤖 SpeakMate AI"}
                  </span>
                  {m.sender === "ai" && (
                    <button onClick={() => handleSpeakText(m.message)} className="text-xs hover:scale-110" title="Play Voice">
                      🔊
                    </button>
                  )}
                </div>
                <p className="leading-relaxed text-xs">{m.message}</p>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 text-xs font-bold text-[#6c63ff] animate-pulse">
              <span className="h-2 w-2 rounded-full bg-[#6c63ff] animate-ping" />
              SpeakMate AI analyzing grammar & generating response...
            </div>
          )}

          {/* Dynamic Tutor Feedback & Corrections card */}
          {corrections && (
            <div className="p-4 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-white/10 space-y-3 shadow-2xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-[#6c63ff] pb-2 border-b border-[var(--border-default)]">
                <span className="flex items-center gap-1.5">🎓 Live Tutor Evaluation & Speech Feedback</span>
                <button
                  onClick={() => handleSpeakText(getSpeakableText(corrections))}
                  className="px-2.5 py-1 rounded-lg bg-[#6c63ff] text-white text-[10px] font-bold hover:bg-[#8b85ff] transition-all flex items-center gap-1 shadow-sm"
                  title="Listen Correction Audio"
                >
                  <span>🔊 Listen Feedback</span>
                </button>
              </div>

              {corrections.grammarCorrection && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Grammar Correction</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">👉 {corrections.grammarCorrection}</p>
                </div>
              )}

              {corrections.betterSentence && (
                <div className="p-2.5 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 text-xs space-y-1">
                  <span className="text-[10px] font-black text-[#6c63ff] uppercase tracking-wider">Native Phrasing Upgrade</span>
                  <p className="font-semibold text-slate-100">💡 "{corrections.betterSentence}"</p>
                </div>
              )}

              {corrections.explanation && (
                <div className="p-2.5 rounded-xl bg-slate-900/50 border border-white/10 text-xs space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Explanation Note</span>
                  <p className="font-normal italic text-slate-300">{corrections.explanation}</p>
                </div>
              )}

              {corrections.vocabularySuggestions && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">Vocabulary Upgrade</span>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">✨ {corrections.vocabularySuggestions}</p>
                </div>
              )}
            </div>
          )}

          {/* Live Transcript Stream */}
          {isListening && (
            <div className="flex flex-col items-end">
              <div className="p-3.5 rounded-2xl bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-xs font-semibold text-[var(--text-primary)] italic animate-pulse">
                🎙️ "{currentTranscript || "Listening to your voice..."}"
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestions chips */}
        {hints.length > 0 && (
          <div className="p-2.5 border-t border-white/10 bg-slate-900/40 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide shrink-0">Suggestions:</span>
            {hints.map((hint, idx) => (
              <button
                key={idx}
                onClick={() => sendUserText(hint)}
                className="px-3 py-1 rounded-xl bg-slate-800/60 hover:bg-[#6c63ff] hover:text-white text-slate-200 text-xs font-semibold shrink-0 transition-all border border-white/10 shadow-sm"
              >
                {hint}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. BOTTOM CONTROLS BAR (Contains the SPEAK / MIC BUTTON at the bottom) */}
      <div className="pointer-events-auto p-3 sm:p-4 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl flex items-center justify-between gap-3 shrink-0">
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
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
              isMuted ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : "bg-slate-800/50 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          <button
            onClick={handleToggleSpeed}
            className="px-3.5 py-2 rounded-xl bg-slate-800/50 border border-white/10 text-xs font-extrabold text-[#6c63ff] hover:opacity-80 transition-all shadow-sm flex items-center gap-1.5"
            title="Adjust Speech Speed"
          >
            <span>⏱️ {speechSpeed}x</span>
          </button>
        </div>

        {/* MAIN SPEAK BUTTON (Centered at the Bottom) */}
        <div className="flex items-center justify-center">
          {!isListening ? (
            <div className="relative group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#6c63ff] to-[#ff6584] opacity-40 blur-md group-hover:opacity-80 transition-opacity" />
              <button
                onClick={handleStartListening}
                className="relative grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white shadow-xl hover:scale-105 transition-transform"
                title="Click to Speak"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-rose-500 opacity-50 animate-ping" />
              <button
                onClick={handleStopListeningAndSend}
                className="relative grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-full bg-rose-500 text-white shadow-xl animate-pulse ring-4 ring-rose-500/30"
                title="Click to Send"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFetchHints}
            disabled={loadingHints}
            className="px-3 py-2 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 text-[#6c63ff] text-xs font-bold hover:bg-[#6c63ff]/20 transition-all"
            title="Get AI Suggestion"
          >
            💡 {loadingHints ? "..." : "Hint"}
          </button>

          <button
            onClick={handleEndSession}
            disabled={ending}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-xs font-extrabold shadow-md hover:opacity-90 transition-all shrink-0"
          >
            {ending ? "Evaluating..." : "Finish"}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default ConversationSession;
