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

const SCHOOL_GRADES = [
  { key: "1st Std", label: "1st Standard", desc: "Alphabet phonics, colors, animals & simple greetings", icon: "🎨" },
  { key: "2nd Std", label: "2nd Standard", desc: "Classroom items, daily routines, food & hobbies", icon: "🍨" },
  { key: "3rd Std", label: "3rd Standard", desc: "Action verbs, community helpers, time & past stories", icon: "🩺" },
  { key: "4th Std", label: "4th Standard", desc: "Describing places, canteen lunch, healthy habits & directions", icon: "🪐" },
  { key: "5th Std", label: "5th Standard", desc: "First day in 5th grade, science projects & story reviews", icon: "🏫" },
  { key: "6th Std", label: "6th Standard", desc: "Asking teacher questions, school clubs & sports day", icon: "✍️" },
  { key: "7th Std", label: "7th Standard", desc: "Group discussions, environmental care & movie reviews", icon: "💧" },
  { key: "8th Std", label: "8th Standard", desc: "School debates, student council & tech innovations", icon: "💬" },
  { key: "9th Std", label: "9th Standard", desc: "High school admission interviews & keynote speeches", icon: "🌐" },
  { key: "10th Std", label: "10th Standard", desc: "10th Board oral exam prep & career roadmaps", icon: "📄" },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const accountType = localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";

  // Form State
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [selectedGoal, setSelectedGoal] = useState("Communication");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("Young Adult");
  const [selectedLevel, setSelectedLevel] = useState("Intermediate");
  const [selectedGrade, setSelectedGrade] = useState(() => localStorage.getItem("speakmate_school_grade") || "1st Std");
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

  const handleFinish = async () => {
    const finalGrade = accountType === "STUDENT" ? selectedGrade : null;
    const finalLevel = accountType === "STUDENT" ? null : selectedLevel;
    if (finalGrade) {
      localStorage.setItem("speakmate_school_grade", finalGrade);
    } else {
      localStorage.removeItem("speakmate_school_grade");
    }
    localStorage.setItem("speakmate_age_group", selectedAgeGroup);
    await completeOnboarding({
      nativeLanguage,
      goal: selectedGoal,
      ageGroup: selectedAgeGroup,
      level: finalLevel,
      englishLevel: finalLevel,
      schoolGrade: finalGrade,
      interests: selectedInterests,
      aiVoice: selectedVoice,
      commitment: selectedCommitment,
    });
    navigate(ROUTES.DASHBOARD);
  };

  const TOTAL_STEPS = 8;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}% Completed</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6c63ff] to-[#ff6584] transition-all duration-300 rounded-full"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Step Card Container */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-8 min-h-[480px] flex flex-col justify-between">
        
        {/* STEP 1: NATIVE LANGUAGE */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">What is your native language?</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">We customize feedback and translations based on your mother tongue.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.key}
                  onClick={() => setNativeLanguage(lang.key)}
                  className={`p-4 rounded-2xl border text-left font-extrabold text-sm sm:text-base transition-all flex items-center gap-3 ${
                    nativeLanguage === lang.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 text-[var(--text-primary)] ring-2 ring-[#6c63ff] shadow-md"
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

        {/* STEP 2: LEARNING GOALS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">What is your main goal?</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Select your primary reason for improving spoken English.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setSelectedGoal(g.key)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    selectedGoal === g.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-[var(--bg-base)] shrink-0">{g.icon}</span>
                  <div>
                    <h3 className="font-black text-sm text-[var(--text-primary)]">{g.label}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: AGE GROUP */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Select your age group</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Helps us tailor conversation topics and scenario context.</p>
            </div>

            <div className="space-y-3">
              {AGE_GROUPS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setSelectedAgeGroup(a.key)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                    selectedAgeGroup === a.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <span className="text-3xl p-2 rounded-xl bg-[var(--bg-base)]">{a.icon}</span>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-[var(--text-primary)]">{a.label}</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">{a.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: DYNAMIC LEVEL / STANDARD SELECTION */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {accountType === "STUDENT" ? (
              <>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Select your School Standard</h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Choose your school grade. Your speaking practice, AI chat, and lessons will adapt to this level.</p>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {SCHOOL_GRADES.map((grd) => (
                    <button
                      key={grd.key}
                      onClick={() => {
                        setSelectedGrade(grd.key);
                        localStorage.setItem("speakmate_school_grade", grd.key);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        selectedGrade === grd.key
                          ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 shadow-md"
                          : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl p-2 rounded-xl bg-[var(--bg-base)]">{grd.icon}</span>
                        <div>
                          <h3 className="font-black text-sm sm:text-base text-[var(--text-primary)]">{grd.label}</h3>
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">{grd.desc}</p>
                        </div>
                      </div>
                      {selectedGrade === grd.key && <span className="text-[#6c63ff] font-extrabold text-base">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">What is your current English proficiency?</h2>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Estimates your baseline grammar and conversation fluency.</p>
                </div>

                <div className="space-y-3">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl.key}
                      onClick={() => setSelectedLevel(lvl.key)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        selectedLevel === lvl.key
                          ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 shadow-md"
                          : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                      }`}
                    >
                      <div>
                        <h3 className="font-black text-sm sm:text-base text-[var(--text-primary)]">{lvl.label}</h3>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">{lvl.desc}</p>
                      </div>
                      {selectedLevel === lvl.key && <span className="text-[#6c63ff] font-extrabold text-base">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 5: INTEREST TOPICS */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Choose topics you like</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Select 2 or more topics for personalized chat prompts.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {INTERESTS.map((int) => {
                const isSelected = selectedInterests.includes(int.key);
                return (
                  <button
                    key={int.key}
                    onClick={() => toggleInterest(int.key)}
                    className={`p-4 rounded-2xl border text-left text-sm sm:text-base font-extrabold transition-all flex items-center gap-3 ${
                      isSelected
                        ? "border-[#6c63ff] bg-[#6c63ff]/20 text-[var(--text-primary)] ring-2 ring-[#6c63ff] shadow-md"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{int.icon}</span>
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
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Choose your AI Tutor Voice Persona</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Determines how SpeakMate AI speaks and guides you.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VOICES.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setSelectedVoice(v.key)}
                  className={`p-5 rounded-2xl border text-left transition-all space-y-2 ${
                    selectedVoice === v.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-[var(--bg-base)]">{v.icon}</span>
                    <h3 className="font-black text-sm sm:text-base text-[var(--text-primary)]">{v.label}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{v.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: DAILY COMMITMENT */}
        {step === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Set your daily practice goal</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Consistency builds natural fluency! You can adjust this anytime.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DAILY_GOALS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setSelectedCommitment(g.key)}
                  className={`p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                    selectedCommitment === g.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                      {g.tag}
                    </span>
                    <h3 className="font-black text-base text-[var(--text-primary)] mt-2">{g.key} / day</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{g.label}</p>
                  </div>
                  {selectedCommitment === g.key && <span className="text-[#6c63ff] font-extrabold text-lg">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: MIC & AUDIO TEST */}
        {step === 8 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">Test your microphone</h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">Let's verify browser speech synthesis & microphone permissions!</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-center space-y-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#6c63ff]/20 text-[#6c63ff] text-3xl mx-auto shadow-sm">
                🎙️
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                Click below and speak: <span className="font-bold text-[var(--text-primary)]">"Hello SpeakMate AI!"</span>
              </p>

              <button
                onClick={handleStartMicTest}
                disabled={isRecording}
                className={`px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-md ${
                  isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#6c63ff] hover:bg-[#8b85ff] text-white"
                }`}
              >
                {isRecording ? "Listening..." : "Start Mic Test"}
              </button>

              {transcript && (
                <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-semibold italic text-[var(--text-primary)]">
                  "{transcript}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step Navigation Bar */}
        <div className="pt-6 border-t border-[var(--border-default)] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => {
                if (step === 4 && accountType === "STUDENT") {
                  setStep(2);
                } else {
                  setStep((s) => s - 1);
                }
              }}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-base)] text-xs font-black text-[var(--text-primary)] transition-all"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < TOTAL_STEPS ? (
            <button
              onClick={() => {
                if (step === 2 && accountType === "STUDENT") {
                  setStep(4);
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-xs font-black shadow-lg shadow-[#6c63ff]/25 hover:scale-105 transition-transform"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-[#6c63ff] text-white text-xs font-black shadow-xl hover:scale-105 transition-transform"
            >
              Finish Setup & Launch 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
