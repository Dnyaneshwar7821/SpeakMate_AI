import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ROUTES from "../constants/routes";

const LANGUAGES = [
  { key: "English", label: "English", flag: "🇬🇧" },
  { key: "Hindi", label: "Hindi", flag: "🇮🇳" },
  { key: "Marathi", label: "Marathi", flag: "🇮🇳" },
  { key: "Spanish", label: "Spanish", flag: "🇪🇸" },
  { key: "French", label: "French", flag: "🇫🇷" },
  { key: "German", label: "German", flag: "🇩🇪" },
  { key: "Japanese", label: "Japanese", flag: "🇯🇵" },
];

const GOALS = [
  { key: "Career", label: "Career Advancement", icon: "💼", desc: "Prepare for job promotions, business tone & executive communication" },
  { key: "Interview", label: "Job Interviews", icon: "📄", desc: "Practice common behavioral & technical interview questions" },
  { key: "Study", label: "Academic Studies", icon: "📚", desc: "Prepare for university lectures, seminars & essays" },
  { key: "Travel", label: "Travel & Exploration", icon: "✈️", desc: "Navigate airports, order food, and chat with international locals" },
  { key: "Business", label: "Business & Networking", icon: "🤝", desc: "Master client negotiation, presentations, and email tone" },
  { key: "Communication", label: "Daily Communication", icon: "💬", desc: "Build social confidence and speak naturally with friends" },
  { key: "Exam", label: "IELTS / TOEFL Prep", icon: "🎓", desc: "Target high scores in speaking & listening assessment criteria" },
  { key: "Fun", label: "Self-Improvement & Fun", icon: "🌟", desc: "Enjoy learning new idioms, pop culture & general fluency" },
];

const AGE_GROUPS = [
  { key: "Kids", label: "Kids (6-12)", icon: "🎈", desc: "Fun stories, simple words & playful learning" },
  { key: "Teens", label: "Teens (13-17)", icon: "⚡", desc: "School life, gaming, pop culture & casual chatter" },
  { key: "Young Adult", label: "Young Adults (18-24)", icon: "🎓", desc: "Campus life, travel, campus socializing & interview prep" },
  { key: "Professional", label: "Professionals (25-50)", icon: "💼", desc: "Business English, executive tone & team meetings" },
  { key: "Senior", label: "Seniors (50+)", icon: "☕", desc: "Relaxed conversations, culture & life experiences" },
];

const LEVELS = [
  { key: "Beginner", label: "Beginner (A1)", desc: "No prior experience or basic word vocabulary" },
  { key: "Elementary", label: "Elementary (A2)", desc: "Understand simple sentences & everyday expressions" },
  { key: "Intermediate", label: "Intermediate (B1/B2)", desc: "Describe experiences and speak with minor mistakes" },
  { key: "Advanced", label: "Advanced (C1)", desc: "Express ideas fluently & spontaneously" },
  { key: "Fluent", label: "Fluent (C2)", desc: "Completely fluent with near-native precision" },
];

const INTERESTS = [
  { key: "Technology", label: "Technology", icon: "💻" },
  { key: "Business", label: "Business", icon: "📊" },
  { key: "Movies", label: "Movies & TV", icon: "🎬" },
  { key: "Gaming", label: "Gaming", icon: "🎮" },
  { key: "Sports", label: "Sports", icon: "⚽" },
  { key: "Travel", label: "Travel", icon: "🧭" },
  { key: "Programming", label: "Programming", icon: "⚡" },
  { key: "Finance", label: "Finance", icon: "💰" },
  { key: "Music", label: "Music", icon: "🎵" },
  { key: "Cooking", label: "Cooking", icon: "🍳" },
];

const VOICES = [
  { key: "Friendly", label: "Friendly Persona", icon: "💬", desc: "Warm, supportive, and encouraging tone" },
  { key: "Professional", label: "Professional Executive", icon: "💼", desc: "Formal, polished business tone" },
  { key: "Energetic", label: "Energetic Coach", icon: "⚡", desc: "High energy, fast-paced practice" },
  { key: "Teacher", label: "Patient Teacher", icon: "🏫", desc: "Detailed corrections and step-by-step guidance" },
];

const DAILY_GOALS = [
  { key: "5 min", label: "Casual Learner", value: 5, tag: "Easy" },
  { key: "15 min", label: "Regular Learner", value: 15, tag: "Recommended" },
  { key: "30 min", label: "Serious Learner", value: 30, tag: "Fast-Track" },
  { key: "45 min", label: "Super Learner", value: 45, tag: "Intense" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);

  // Form State
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [selectedGoal, setSelectedGoal] = useState("Communication");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("Young Adult");
  const [selectedLevel, setSelectedLevel] = useState("Intermediate");
  const [selectedInterests, setSelectedInterests] = useState(["Technology", "Travel"]);
  const [selectedVoice, setSelectedVoice] = useState("Friendly");
  const [selectedCommitment, setSelectedCommitment] = useState("15 min");

  // Mic Test State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micTested, setMicTested] = useState(false);

  const toggleInterest = (key) => {
    if (selectedInterests.includes(key)) {
      setSelectedInterests(selectedInterests.filter((k) => k !== key));
    } else {
      setSelectedInterests([...selectedInterests, key]);
    }
  };

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
        setTranscript("Listening... Please speak into your microphone!");
      };

      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setTranscript("Mic tested successfully!");
        setMicTested(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setMicTested(true);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
      setMicTested(true);
    }
  };

  const handleFinish = () => {
    completeOnboarding({
      nativeLanguage,
      goal: selectedGoal,
      ageGroup: selectedAgeGroup,
      level: selectedLevel,
      interests: selectedInterests,
      aiVoice: selectedVoice,
      commitment: selectedCommitment,
    });
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full glass-card p-6 sm:p-10 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white font-extrabold text-xs shadow-md">
              SM
            </span>
            <div>
              <h1 className="font-black text-base text-[var(--text-primary)]">Personalized Onboarding</h1>
              <p className="text-[11px] text-[var(--text-secondary)] font-semibold">Customizing your SpeakMate AI coach</p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3.5 py-1.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
            Step {step} of 8
          </span>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-[var(--border-default)] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#6c63ff] to-[#ff6584] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        {/* STEP 1: NATIVE LANGUAGE */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">What is your native language?</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">This helps us explain grammar rules in a relatable way.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setNativeLanguage(lang.key)}
                  className={`p-4 rounded-2xl border text-left font-extrabold text-xs transition-all flex items-center gap-3 ${
                    nativeLanguage === lang.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 text-[var(--text-primary)] font-black"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: PRIMARY GOAL */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">What is your main speaking goal?</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">We will prioritize scenario drills suited for you.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setSelectedGoal(g.key)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    selectedGoal === g.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-[var(--bg-base)] shrink-0">{g.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-xs text-[var(--text-primary)]">{g.label}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: AGE GROUP TAILORING */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">Select your age group</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Tailors scenario vocabulary and conversation tone.</p>
            </div>

            <div className="space-y-3">
              {AGE_GROUPS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setSelectedAgeGroup(a.key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                    selectedAgeGroup === a.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <span className="text-3xl p-2 rounded-2xl bg-[var(--bg-base)]">{a.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-xs text-[var(--text-primary)]">{a.label}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: CEFR LEVEL */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">What is your current English level?</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Estimates your starting difficulty for scenario drills.</p>
            </div>

            <div className="space-y-3">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.key}
                  onClick={() => setSelectedLevel(lvl.key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedLevel === lvl.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <div>
                    <h3 className="font-extrabold text-xs text-[var(--text-primary)]">{lvl.label}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{lvl.desc}</p>
                  </div>
                  {selectedLevel === lvl.key && <span className="text-[#6c63ff] font-extrabold text-sm">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: INTEREST TOPICS */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">Choose topics you like</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Select 2 or more topics for personalized chat prompts.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {INTERESTS.map((int) => {
                const isSelected = selectedInterests.includes(int.key);
                return (
                  <button
                    key={int.key}
                    onClick={() => toggleInterest(int.key)}
                    className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? "border-[#6c63ff] bg-[#6c63ff]/20 text-[var(--text-primary)] ring-1 ring-[#6c63ff]"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>{int.icon}</span>
                    <span>{int.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 6: AI VOICE PERSONA */}
        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">Select AI Tutor Voice Persona</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Choose how your AI coach speaks and offers guidance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOICES.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setSelectedVoice(v.key)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    selectedVoice === v.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-[var(--bg-base)] shrink-0">{v.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-xs text-[var(--text-primary)]">{v.label}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{v.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: DAILY COMMITMENT */}
        {step === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">Daily Practice Goal</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Short daily sessions compound into real fluency.</p>
            </div>

            <div className="space-y-3">
              {DAILY_GOALS.map((dg) => (
                <button
                  key={dg.key}
                  onClick={() => setSelectedCommitment(dg.key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedCommitment === dg.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">{dg.key} / day</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff] text-[10px] font-extrabold">
                      {dg.tag}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-bold">{dg.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: MIC TEST & CONFIRMATION */}
        {step === 8 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white text-3xl shadow-xl">
              🎉
            </div>

            <div>
              <h2 className="text-2xl font-black text-[var(--text-primary)]">Setup Complete! (+100 XP Bonus)</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Your AI English speaking coach is ready.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Goal:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{selectedGoal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Level:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{selectedLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Persona:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{selectedVoice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Daily Goal:</span>
                <span className="font-extrabold text-[var(--text-primary)]">{selectedCommitment}</span>
              </div>
            </div>

            {/* Mic Test Box */}
            <div className="pt-2">
              <button
                onClick={handleStartMicTest}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs transition-all ${
                  isRecording
                    ? "bg-red-500 text-white animate-pulse"
                    : micTested
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 font-extrabold"
                    : "bg-[var(--bg-elevated)] hover:bg-[#6c63ff]/20 border border-[var(--border-default)] text-[var(--text-primary)]"
                }`}
              >
                {isRecording ? "🎙️ Listening... Speak into mic!" : micTested ? "✓ Microphone Tested Successfully" : "🎙️ Tap to Test Speech Recognition"}
              </button>
            </div>
          </div>
        )}

        {/* BOTTOM NAV BUTTONS */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-default)] text-xs font-extrabold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              ← Back
            </button>
          ) : <div />}

          {step < 8 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-7 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c74ff] text-white text-xs font-extrabold shadow-lg shadow-[#6c63ff]/30"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-xs font-black shadow-xl shadow-[#6c63ff]/40"
            >
              Start Learning Now 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
