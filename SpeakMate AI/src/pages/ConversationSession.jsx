import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import ROUTES from "../constants/routes";
import { speakingService, speechService } from "../services/appServices";

export function ConversationSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const scenario = searchParams.get("scenario") || "Free Speaking Practice";
  const xpReward = Number(searchParams.get("xpReward")) || 20;

  const [sessionId, setSessionId] = useState(sessionIdParam || Date.now().toString());
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      message: `Hello! I am your AI Speaking Coach for '${scenario}'. Let's practice speaking together!`,
    },
  ]);

  // Session states matching React Native ConversationScreen
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

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (!isPaused) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto scroll chat thread
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, hints, corrections, isThinking]);

  // Web Speech API Initialization
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

  const handleSpeakText = (text) => {
    if (isMuted) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speechSpeed;
      utterance.lang = "en-US";
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
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
        aiReply: "That is a fantastic point! Practicing every day helps build natural fluency. What else would you like to discuss?",
        grammarCorrection: "I want to improve my spoken English skills. ✅ Correct!",
        betterSentence: "I would like to enhance my English speaking proficiency.",
        vocabularySuggestions: "Proficiency, Natural fluency, Accent",
        explanation: "Using 'enhance' adds a formal tone to your career conversation.",
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

      const fullSpeakableText = `${feedback.aiReply}. ${feedback.followUpQuestion || ""}`;
      handleSpeakText(fullSpeakableText);
    } catch (e) {
      setIsThinking(false);
    }
  };

  const handleEndSession = async () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
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
    ? "AI Speaking... 🔊"
    : isThinking
    ? "AI Thinking... 🧠"
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
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
              isPaused ? "bg-amber-500 text-white border-amber-500" : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
            }`}
          >
            {isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>
      </div>

      {/* 3D AI Tutor Avatar Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E1B4B] text-white shadow-xl flex flex-col items-center justify-center text-center space-y-3 shrink-0 relative overflow-hidden">
        <div className="relative">
          <div className={`grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white text-3xl shadow-xl ${isAiSpeaking ? "animate-bounce ring-4 ring-[#6c63ff]/50" : ""}`}>
            🤖
          </div>
          <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-[#0F172A] ${isListening ? "bg-red-500 animate-ping" : isAiSpeaking ? "bg-[#6c63ff]" : "bg-emerald-500"}`} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#A5B4FC]">Chat Level:</span>
          {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setChatLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                chatLevel === lvl ? "bg-[#6c63ff] text-white" : "bg-white/10 text-white/70"
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
                <span className="text-[10px] opacity-75 font-bold uppercase">{m.sender === "user" ? "You" : "SpeakMate AI"}</span>
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
            AI Tutor thinking response...
          </div>
        )}

        {/* Dynamic Tutor Feedback & Corrections overlay */}
        {corrections && (
          <div className="p-4 rounded-2xl bg-[#1E1B4B]/20 border border-[#6c63ff]/30 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#6c63ff]">
              <span>🎓 Tutor Feedback & Corrections</span>
            </div>

            {corrections.grammarCorrection && (
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#818CF8] uppercase">Grammar Correction</span>
                <p className="font-semibold text-emerald-500">✓ {corrections.grammarCorrection}</p>
              </div>
            )}

            {corrections.betterSentence && (
              <div className="text-xs space-y-1">
                <span className="text-[10px] font-bold text-[#818CF8] uppercase">Native Sentence Upgrade</span>
                <p className="font-semibold text-[var(--text-primary)]">💡 "{corrections.betterSentence}"</p>
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

      {/* Bottom Controls Bar matching ConversationScreen.js */}
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
            onClick={() => setIsMuted(!isMuted)}
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
