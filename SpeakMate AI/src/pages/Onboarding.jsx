import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";

const LEVELS = [
  { id: "A1", label: "A1 - Beginner", desc: "Know basic words & simple phrases" },
  { id: "A2", label: "A2 - Elementary", desc: "Understand everyday expressions" },
  { id: "B1", label: "B1 - Intermediate", desc: "Can discuss familiar topics & experiences" },
  { id: "B2", label: "B2 - Upper Intermediate", desc: "Speak fluently with native speakers" },
  { id: "C1", label: "C1 - Advanced", desc: "Express ideas effortlessly & flexibly" },
  { id: "C2", label: "C2 - Mastery / Proficient", desc: "Near-native precision & comprehension" },
];

const GOALS = [
  { id: "career", title: "Career & Business", desc: "Prepare for job interviews, presentations, and meetings", icon: "💼" },
  { id: "travel", title: "Travel & Culture", desc: "Navigate airports, order food, and chat with locals", icon: "✈️" },
  { id: "exams", title: "IELTS / TOEFL Prep", desc: "Target high scores in speaking & listening sections", icon: "🎓" },
  { id: "fluency", title: "Daily Conversation", desc: "Build social confidence and speak naturally", icon: "💬" },
];

const COMMITMENTS = [
  { id: "5min", time: "5 Mins / day", tag: "Casual", desc: "Quick daily practice drills" },
  { id: "15min", time: "15 Mins / day", tag: "Recommended", desc: "Balanced steady progress" },
  { id: "30min", time: "30 Mins / day", tag: "Intensive", desc: "Fast-track fluency mastery" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [selectedLevel, setSelectedLevel] = useState("B1");
  const [selectedGoal, setSelectedGoal] = useState("fluency");
  const [selectedCommitment, setSelectedCommitment] = useState("15min");

  // Audio mic test state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micTested, setMicTested] = useState(false);
  const [micSupported, setMicSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicSupported(false);
    }
  }, []);

  const handleStartMicTest = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Speech recognition is not supported in this browser. You can proceed!");
      setMicTested(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        setTranscript("Listening... Please speak: 'Hello SpeakMate AI!'");
      };

      recognition.onresult = (e) => {
        const current = e.resultIndex;
        const text = e.results[current][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = (e) => {
        console.error("Speech error:", e);
        setIsRecording(false);
        setTranscript("Mic permission or recognition issue. You can still continue.");
        setMicTested(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setMicTested(true);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
      setMicTested(true);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      level: selectedLevel,
      goal: selectedGoal,
      commitment: selectedCommitment,
    });
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden">
        {/* Top Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-xs">
              SM
            </span>
            <span className="font-extrabold text-sm tracking-tight text-[var(--text-primary)]">
              Personalized Setup
            </span>
          </div>
          <span className="text-xs font-bold text-[#6c63ff] bg-[#6c63ff]/10 px-3 py-1 rounded-full">
            Step {step} of 5
          </span>
        </div>

        <div className="w-full bg-[var(--border-subtle)] h-2 rounded-full mb-8 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#6c63ff] to-[#ff6584] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step 1: CEFR Level */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">What is your English level?</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Select your current proficiency to customize lessons.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selectedLevel === lvl.id
                      ? "border-[#6c63ff] bg-[#6c63ff]/10 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] hover:border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">{lvl.label}</span>
                  <span className="text-xs text-[var(--text-secondary)] mt-2">{lvl.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Learning Goal */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">What is your main goal?</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">We will recommend topics tailored to your objectives.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGoal(g.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                    selectedGoal === g.id
                      ? "border-[#6c63ff] bg-[#6c63ff]/10 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--border-subtle)]"
                  }`}
                >
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">{g.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Daily Commitment */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Daily Learning Commitment</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Consistency is key to mastering spoken English.</p>
            </div>

            <div className="space-y-3">
              {COMMITMENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCommitment(c.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedCommitment === c.id
                      ? "border-[#6c63ff] bg-[#6c63ff]/10 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--border-subtle)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-[var(--text-primary)]">{c.time}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                        {c.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{c.desc}</p>
                  </div>
                  {selectedCommitment === c.id && (
                    <span className="text-[#6c63ff] font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Audio Mic Test */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Test Your Microphone</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Ensure live speech recognition works properly on your device.
              </p>
            </div>

            <div className="py-8 flex flex-col items-center justify-center">
              <button
                onClick={handleStartMicTest}
                disabled={isRecording}
                className={`grid h-24 w-24 place-items-center rounded-full transition-all shadow-xl ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse ring-8 ring-red-500/20"
                    : micTested
                    ? "bg-emerald-500 text-white"
                    : "bg-[#6c63ff] hover:bg-[#8b85ff] text-white"
                }`}
              >
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              <p className="mt-4 text-xs font-semibold text-[var(--text-secondary)]">
                {isRecording
                  ? "Listening... Speak into your mic!"
                  : micTested
                  ? "✓ Audio mic test complete!"
                  : "Tap mic button to test speech recognition"}
              </p>

              {transcript && (
                <div className="mt-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] max-w-md w-full">
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Transcript:</p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-1">"{transcript}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Confirmation Summary */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">All Set Up!</h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">Your AI Speaking Coach is ready to start training with you.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Starting Level:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{selectedLevel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Learning Goal:</span>
                <span className="font-extrabold text-[var(--text-primary)] capitalize">{selectedGoal}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Daily Commitment:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{selectedCommitment}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Nav Buttons */}
        <div className="mt-8 pt-6 border-t border-[var(--border-default)] flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-default)] text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
            >
              Back
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-sm font-bold shadow-lg shadow-[#6c63ff]/25"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-sm font-extrabold shadow-lg shadow-[#6c63ff]/30"
            >
              Start Learning Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
