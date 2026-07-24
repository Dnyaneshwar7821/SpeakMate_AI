import { useState } from "react";

const LISTENING_DRILLS = [
  {
    id: "1",
    title: "Daily Morning Routine in London",
    category: "Daily Life",
    level: "A2",
    duration: "2 mins",
    transcript: "Every morning, I wake up at 7 AM, brew a cup of fresh coffee, and read the news headlines before heading to the train station.",
    quiz: {
      question: "What time does the speaker wake up every morning?",
      options: ["6:00 AM", "7:00 AM", "8:00 AM", "7:30 AM"],
      correctIndex: 1,
    },
  },
  {
    id: "2",
    title: "Business Meeting Pitch & Proposal",
    category: "Business",
    level: "B2",
    duration: "3 mins",
    transcript: "Our strategy focuses on accelerating user engagement by integrating interactive voice feedback and personalized daily milestones.",
    quiz: {
      question: "What is the primary focus of the proposed strategy?",
      options: ["Reducing software costs", "Accelerating user engagement", "Hiring new staff", "Changing brand logo"],
      correctIndex: 1,
    },
  },
  {
    id: "3",
    title: "IELTS Academic Conversation",
    category: "Academic",
    level: "C1",
    duration: "4 mins",
    transcript: "Although economic indicators suggest mild inflation, the underlying fiscal policies remain robust enough to maintain market equilibrium.",
    quiz: {
      question: "What do economic indicators suggest in the passage?",
      options: ["High unemployment", "Mild inflation", "Severe recession", "Rapid growth"],
      correctIndex: 1,
    },
  },
];

export function ListeningPractice() {
  const [selectedDrill, setSelectedDrill] = useState(LISTENING_DRILLS[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const handlePlayAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedDrill.transcript);
      utterance.rate = playbackSpeed;
      utterance.lang = "en-US";
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleSelectDrill = (drill) => {
    handleStopAudio();
    setSelectedDrill(drill);
    setShowTranscript(false);
    setSelectedOption(null);
    setQuizSubmitted(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">Listening Comprehension Practice</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Train your ears with native speed audio clips, transcript controls, and comprehension quizzes.
        </p>
      </div>

      {/* Drill Selection List */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LISTENING_DRILLS.map((d) => (
          <button
            key={d.id}
            onClick={() => handleSelectDrill(d)}
            className={`p-5 rounded-3xl border text-left transition-all flex flex-col justify-between ${
              selectedDrill.id === d.id
                ? "border-[#6c63ff] bg-[#6c63ff]/10 ring-2 ring-[#6c63ff]/30 shadow-md"
                : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-subtle)]"
            }`}
          >
            <div>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                {d.level} • {d.category}
              </span>
              <h3 className="font-extrabold text-sm text-[var(--text-primary)] mt-2 leading-snug">{d.title}</h3>
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] mt-4 block">⏱️ {d.duration}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Audio Player */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#6c63ff]">{selectedDrill.category} ({selectedDrill.level})</span>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)] mt-1">{selectedDrill.title}</h2>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] px-2">Speed:</span>
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

        {/* Player Controls Bar */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6c63ff]/10 via-[#6c63ff]/5 to-transparent border border-[#6c63ff]/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={handlePlayAudio}
                className="grid h-14 w-14 place-items-center rounded-full bg-[#6c63ff] hover:bg-[#8b85ff] text-white shadow-lg shadow-[#6c63ff]/30"
              >
                <svg className="w-6 h-6 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleStopAudio}
                className="grid h-14 w-14 place-items-center rounded-full bg-red-500 text-white shadow-lg animate-pulse"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            )}

            <div>
              <p className="font-extrabold text-sm text-[var(--text-primary)]">
                {isPlaying ? "Playing Audio Clip..." : "Ready to Play"}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">Speech Rate: {playbackSpeed}x Speed</p>
            </div>
          </div>

          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="px-4 py-2 rounded-xl border border-[var(--border-default)] text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
          >
            {showTranscript ? "Hide Transcript 👁️" : "Show Transcript 👁️"}
          </button>
        </div>

        {/* Audio Transcript Collapsible */}
        {showTranscript && (
          <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] animate-in fade-in duration-200">
            <span className="text-xs font-bold text-[#6c63ff] uppercase tracking-wider">Audio Transcript</span>
            <p className="text-sm font-semibold text-[var(--text-primary)] mt-1 italic">
              "{selectedDrill.transcript}"
            </p>
          </div>
        )}

        {/* Comprehension Quiz */}
        <div className="pt-4 border-t border-[var(--border-default)] space-y-4">
          <h3 className="text-base font-extrabold text-[var(--text-primary)]">Comprehension Quiz</h3>
          <p className="text-xs font-bold text-[var(--text-secondary)]">{selectedDrill.quiz.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {selectedDrill.quiz.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === selectedDrill.quiz.correctIndex;
              let style = "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]";

              if (quizSubmitted) {
                if (isCorrect) style = "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold";
                else if (isSelected) style = "border-red-500 bg-red-500/10 text-red-500 font-bold";
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedOption(idx);
                    setQuizSubmitted(true);
                  }}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all ${style}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListeningPractice;
