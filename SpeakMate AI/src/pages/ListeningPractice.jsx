import { useState, useEffect, useRef } from "react";
import { stopAllSpeech } from "../hooks/useSpeechCleanup";

const LISTENING_DRILLS = [
  {
    id: "1",
    title: "Daily Morning Routine in London",
    category: "Daily Life",
    level: "A2",
    duration: "2 mins",
    speaker: "Emma (UK Accent)",
    accent: "en-GB",
    transcript: "Every morning, I wake up at 7 AM, brew a cup of fresh coffee, and read the news headlines before heading to the train station.",
    dictationSentence: "I wake up at seven AM and brew coffee.",
    quiz: {
      question: "What time does the speaker wake up every morning?",
      options: ["6:00 AM", "7:00 AM", "8:00 AM", "7:30 AM"],
      correctIndex: 1,
      explanation: "The speaker explicitly mentions waking up at 7 AM before brewing coffee.",
    },
  },
  {
    id: "2",
    title: "Business Product Pitch & Strategy",
    category: "Business",
    level: "B2",
    duration: "3 mins",
    speaker: "David (US Accent)",
    accent: "en-US",
    transcript: "Our strategy focuses on accelerating user engagement by integrating interactive voice feedback and personalized daily milestones.",
    dictationSentence: "Our strategy focuses on user engagement.",
    quiz: {
      question: "What is the primary focus of the proposed strategy?",
      options: ["Reducing software costs", "Accelerating user engagement", "Hiring new staff", "Changing brand logo"],
      correctIndex: 1,
      explanation: "The speaker highlights 'accelerating user engagement' as the primary core strategy.",
    },
  },
  {
    id: "3",
    title: "IELTS Academic Economy Discussion",
    category: "Academic",
    level: "C1",
    duration: "4 mins",
    speaker: "Prof. Arthur (UK Accent)",
    accent: "en-GB",
    transcript: "Although economic indicators suggest mild inflation, the underlying fiscal policies remain robust enough to maintain market equilibrium.",
    dictationSentence: "Fiscal policies remain robust enough.",
    quiz: {
      question: "What do economic indicators suggest in the passage?",
      options: ["High unemployment", "Mild inflation", "Severe recession", "Rapid growth"],
      correctIndex: 1,
      explanation: "The text states 'economic indicators suggest mild inflation'.",
    },
  },
  {
    id: "4",
    title: "Airport Check-in & Gate Guidance",
    category: "Travel",
    level: "B1",
    duration: "2 mins",
    speaker: "Sarah (Australian Accent)",
    accent: "en-AU",
    transcript: "Attention passengers on flight QF402 to Sydney: Boarding will commence at Gate 14 in approximately ten minutes. Please have your passport ready.",
    dictationSentence: "Boarding will commence at Gate 14.",
    quiz: {
      question: "At which gate will boarding commence?",
      options: ["Gate 4", "Gate 14", "Gate 40", "Gate 24"],
      correctIndex: 1,
      explanation: "The announcement directs passengers to Gate 14.",
    },
  },
];

const ACCENTS = [
  { label: "US English 🇺🇸", code: "en-US" },
  { label: "UK English 🇬🇧", code: "en-GB" },
  { label: "Australian 🇦🇺", code: "en-AU" },
  { label: "Indian 🇮🇳", code: "en-IN" },
];

export function ListeningPractice() {
  const [selectedDrill, setSelectedDrill] = useState(LISTENING_DRILLS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedAccent, setSelectedAccent] = useState("en-US");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [mode, setMode] = useState("quiz"); // 'quiz' or 'dictation'

  // Quiz State
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Dictation State
  const [typedText, setTypedText] = useState("");
  const [dictationSubmitted, setDictationSubmitted] = useState(false);
  const [accuracyScore, setAccuracyScore] = useState(0);

  useEffect(() => {
    return () => {
      stopAllSpeech();
    };
  }, []);

  const handlePlayAudio = () => {
    if ("speechSynthesis" in window) {
      stopAllSpeech();
      const utterance = new SpeechSynthesisUtterance(selectedDrill.transcript);
      utterance.rate = playbackSpeed;
      utterance.lang = selectedAccent;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopAudio = () => {
    stopAllSpeech();
    setIsPlaying(false);
  };

  const handleSelectDrill = (drill) => {
    handleStopAudio();
    setSelectedDrill(drill);
    setShowTranscript(false);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setTypedText("");
    setDictationSubmitted(false);
  };

  const handleCheckDictation = () => {
    if (!typedText.trim()) return;
    setDictationSubmitted(true);

    const targetWords = selectedDrill.dictationSentence.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ");
    const userWords = typedText.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ");

    let matches = 0;
    userWords.forEach((w) => {
      if (targetWords.includes(w)) matches++;
    });

    const score = Math.min(100, Math.round((matches / Math.max(1, targetWords.length)) * 100));
    setAccuracyScore(score);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Listening Comprehension Coach</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Train your ears with native speed audio clips, multi-accent pronunciation, dictation drills, and quizzes.
        </p>
      </div>

      {/* Drill Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LISTENING_DRILLS.map((d) => (
          <button
            key={d.id}
            onClick={() => handleSelectDrill(d)}
            className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between ${
              selectedDrill.id === d.id
                ? "border-[#6c63ff] bg-[#6c63ff]/10 ring-2 ring-[#6c63ff]/30 shadow-md"
                : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[#6c63ff]/50"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                  {d.level}
                </span>
                <span className="text-[10px] font-bold text-[var(--text-secondary)]">{d.category}</span>
              </div>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)] leading-snug">{d.title}</h3>
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] mt-3">🎙️ {d.speaker}</p>
          </button>
        ))}
      </div>

      {/* Main Interactive Audio Player Console */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        {/* Top Meta Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#6c63ff]">{selectedDrill.category} ({selectedDrill.level})</span>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{selectedDrill.title}</h2>
          </div>

          {/* Accent & Speed Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Accent Dropdown */}
            <select
              value={selectedAccent}
              onChange={(e) => setSelectedAccent(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
            >
              {ACCENTS.map((acc) => (
                <option key={acc.code} value={acc.code}>
                  {acc.label}
                </option>
              ))}
            </select>

            {/* Speed Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
              {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    playbackSpeed === speed
                      ? "bg-[#6c63ff] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Visualizer & Player Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {!isPlaying ? (
              <button
                onClick={handlePlayAudio}
                className="grid h-16 w-16 place-items-center rounded-full bg-[#6c63ff] hover:bg-[#8b85ff] text-white shadow-lg shadow-[#6c63ff]/40 hover:scale-105 transition-all"
              >
                <svg className="w-7 h-7 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleStopAudio}
                className="grid h-16 w-16 place-items-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/40 animate-pulse"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-extrabold text-base">{isPlaying ? "Playing Speech Audio..." : "Click Play to Listen"}</p>
                {isPlaying && (
                  <div className="flex items-end gap-1 h-4">
                    <div className="w-1 bg-amber-400 animate-bounce h-4" />
                    <div className="w-1 bg-amber-400 animate-bounce h-2 delay-100" />
                    <div className="w-1 bg-amber-400 animate-bounce h-5 delay-200" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#A5B4FC]">
                Rate: {playbackSpeed}x • Speaker: {selectedDrill.speaker}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-extrabold transition-all shrink-0"
          >
            {showTranscript ? "Hide Transcript 👁️" : "Show Transcript 👁️"}
          </button>
        </div>

        {/* Collapsible Transcript */}
        {showTranscript && (
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-xs space-y-2 animate-in fade-in duration-200">
            <span className="font-extrabold text-[#6c63ff] uppercase tracking-wider text-[10px]">📖 Native Audio Transcript</span>
            <p className="font-semibold text-[var(--text-primary)] leading-relaxed italic">
              "{selectedDrill.transcript}"
            </p>
          </div>
        )}

        {/* Practice Mode Tabs */}
        <div className="pt-4 border-t border-[var(--border-default)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] max-w-xs">
              <button
                onClick={() => setMode("quiz")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "quiz" ? "bg-[#6c63ff] text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                Comprehension Quiz
              </button>
              <button
                onClick={() => setMode("dictation")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === "dictation" ? "bg-[#6c63ff] text-white" : "text-[var(--text-secondary)]"
                }`}
              >
                Listen & Type Drill
              </button>
            </div>

            {xpEarned > 0 && <span className="text-xs font-extrabold text-amber-500">⚡ +{xpEarned} XP Earned</span>}
          </div>

          {/* MODE 1: COMPREHENSION QUIZ */}
          {mode === "quiz" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-[var(--text-secondary)]">{selectedDrill.quiz.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedDrill.quiz.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === selectedDrill.quiz.correctIndex;

                  let style = "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]";
                  if (quizSubmitted) {
                    if (isCorrect) style = "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-extrabold";
                    else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-500 font-extrabold";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizSubmitted}
                      onClick={() => {
                        setSelectedOption(idx);
                        setQuizSubmitted(true);
                        if (isCorrect) setXpEarned(20);
                      }}
                      className={`p-4 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${style}`}
                    >
                      <span>{opt}</span>
                      {quizSubmitted && isCorrect && <span className="text-emerald-500 font-extrabold">✓ Correct</span>}
                      {quizSubmitted && isSelected && !isCorrect && <span className="text-red-500 font-extrabold">✗ Wrong</span>}
                    </button>
                  );
                })}
              </div>

              {quizSubmitted && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold space-y-1 animate-in fade-in duration-200 ${
                    selectedOption === selectedDrill.quiz.correctIndex
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-red-500/10 border-red-500/30 text-red-500"
                  }`}
                >
                  <p className="font-extrabold">
                    {selectedOption === selectedDrill.quiz.correctIndex ? "🎉 Correct Answer! (+20 XP)" : "❌ Incorrect."}
                  </p>
                  <p className="font-semibold text-[var(--text-primary)]">{selectedDrill.quiz.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: LISTEN & TYPE DICTATION DRILL */}
          {mode === "dictation" && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-[var(--text-secondary)]">Listen to the clip and type the sentence you hear:</p>

              <textarea
                rows={3}
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type the sentence here..."
                className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleCheckDictation}
                  disabled={!typedText.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] disabled:opacity-50 text-white text-xs font-extrabold shadow-md"
                >
                  Check Dictation Accuracy
                </button>
              </div>

              {dictationSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-500">Dictation Accuracy Score</span>
                    <span className="text-base font-extrabold text-emerald-500">{accuracyScore}%</span>
                  </div>
                  <p className="text-[var(--text-primary)] font-semibold">
                    Target: "{selectedDrill.dictationSentence}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListeningPractice;
