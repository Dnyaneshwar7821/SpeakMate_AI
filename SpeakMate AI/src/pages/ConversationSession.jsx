import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import ROUTES from "../constants/routes";

export function ConversationSession() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario") || "free-speak";

  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      text: "Hello! I am your SpeakMate AI Speaking Coach. What would you like to discuss today?",
      grammarCheck: null,
      timestamp: "12:00 PM",
    },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState("Try saying: 'I would like to practice speaking about my hobbies and work experience.'");
  const [showTranslation, setShowTranslation] = useState(false);
  const recognitionRef = useRef(null);

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

  const handleStartListening = () => {
    if (recognitionRef.current) {
      try {
        setCurrentTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      // Fallback simulate speech
      setIsListening(true);
      setTimeout(() => {
        setCurrentTranscript("I would like to practice my speaking skills for job interviews.");
      }, 1500);
    }
  };

  const handleStopListeningAndSend = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(err);
      }
    }
    setIsListening(false);

    const userText = currentTranscript.trim() || "I want to learn English fluently and improve my vocabulary.";
    if (!userText) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: userText,
      grammarCheck: {
        original: userText,
        corrected: userText.includes("want to learn") ? userText : "I want to learn English fluently.",
        issue: null,
      },
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setCurrentTranscript("");

    // Simulate AI response + Speech synthesis
    setTimeout(() => {
      const aiReplyText = `That sounds wonderful! Practicing daily is the key to building speaking confidence. Could you tell me more about your background?`;
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakAiResponse(aiReplyText);
    }, 1000);
  };

  const speakAiResponse = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = "en-US";
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFinishSession = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    navigate(ROUTES.SPEAKING_SUMMARY);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col max-w-4xl mx-auto">
      {/* Session Top Header */}
      <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-between gap-4 shadow-sm shrink-0 mb-4">
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.SPEAKING}
            className="p-2 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-extrabold text-sm text-[var(--text-primary)] capitalize">
                Live Session • {scenarioId.replace("-", " ")}
              </h2>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Real-Time Voice AI Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[#6c63ff] hover:bg-[#6c63ff]/10"
          >
            💡 Hint
          </button>
          <button
            onClick={handleFinishSession}
            className="px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md"
          >
            End Session
          </button>
        </div>
      </div>

      {/* Hint Banner Overlay */}
      {showHint && (
        <div className="p-3 mb-4 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 text-xs font-bold text-[#6c63ff] flex items-center justify-between shrink-0">
          <span>{hintText}</span>
          <button onClick={() => setShowHint(false)} className="text-sm font-extrabold">✕</button>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-md p-4 rounded-2xl text-sm font-semibold shadow-sm space-y-2 ${
                m.sender === "user"
                  ? "bg-[#6c63ff] text-white rounded-br-none"
                  : "bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] opacity-75 font-bold uppercase">
                  {m.sender === "user" ? "You" : "SpeakMate AI"}
                </span>
                {m.sender === "ai" && (
                  <button
                    onClick={() => speakAiResponse(m.text)}
                    className="text-xs hover:scale-110 transition-transform"
                    title="Play Speech"
                  >
                    🔊
                  </button>
                )}
              </div>
              <p className="leading-relaxed">{m.text}</p>
            </div>

            {/* Grammar Correction Badge for user */}
            {m.sender === "user" && m.grammarCheck && (
              <div className="mt-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[11px] font-bold">
                ✓ Perfect Grammar & Fluency!
              </div>
            )}
          </div>
        ))}

        {/* Interim Live Transcript */}
        {isListening && (
          <div className="flex flex-col items-end">
            <div className="p-3 rounded-2xl bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-xs font-semibold text-[var(--text-primary)] italic animate-pulse">
              "{currentTranscript || "Listening to your voice..."}"
            </div>
          </div>
        )}
      </div>

      {/* Live Voice Audio Controls Footer */}
      <div className="mt-4 p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-lg flex items-center justify-between gap-4 shrink-0">
        {/* Waveform Animation when mic or AI speaking */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className={`w-1 rounded-full bg-[#6c63ff] transition-all duration-300 ${
                isListening || isAiSpeaking ? "h-6 animate-pulse" : "h-2"
              }`}
            />
          ))}
          <span className="text-xs font-bold text-[var(--text-secondary)] ml-2 hidden sm:inline">
            {isListening ? "Listening..." : isAiSpeaking ? "AI Speaking..." : "Tap mic to speak"}
          </span>
        </div>

        {/* Mic Control Button */}
        <div className="flex items-center gap-3">
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
        </div>
      </div>
    </div>
  );
}

export default ConversationSession;
