import { useState } from "react";

const ACCENTS = [
  { id: "us", name: "American English", flag: "🇺🇸", code: "en-US" },
  { id: "uk", name: "British English", flag: "🇬🇧", code: "en-GB" },
  { id: "au", name: "Australian English", flag: "🇦🇺", code: "en-AU" },
  { id: "in", name: "Indian English", flag: "🇮🇳", code: "en-IN" },
];

const DRILLS = [
  {
    id: "1",
    title: "Ordering Coffee in London",
    level: "A2 Elementary",
    accent: "British English",
    text: "Can I get a large cappuccino with oat milk and a blueberry muffin to go please?",
  },
  {
    id: "2",
    title: "Tech Startup Job Interview",
    level: "B2 Upper Intermediate",
    accent: "American English",
    text: "Could you walk me through your previous experience optimizing database queries and scaling web applications?",
  },
  {
    id: "3",
    title: "Airport Check-In & Boarding",
    level: "B1 Intermediate",
    accent: "Australian English",
    text: "Please make sure your window shade is open and your seatbelt is securely fastened for our descent into Sydney.",
  },
];

export function ListeningPractice() {
  const [selectedAccent, setSelectedAccent] = useState(ACCENTS[0]);
  const [activeDrill, setActiveDrill] = useState(DRILLS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [userDictation, setUserDictation] = useState("");
  const [dictationChecked, setDictationChecked] = useState(false);

  const handlePlayAudio = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeDrill.text);
    utterance.rate = speechRate;
    utterance.lang = selectedAccent.code;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)]">Listening Comprehension</h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1.5 font-medium">
            Train your ear with multi-accent AI audio playback, playback speed controls, and dictation drills.
          </p>
        </div>
      </div>

      {/* 2-Column Desktop Widescreen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Accent Selector & Audio Controller */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-black text-[var(--text-primary)]">Accent & Speed Settings</h2>

            {/* Accent Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {ACCENTS.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccent(acc)}
                  className={`p-4 rounded-2xl border text-left font-extrabold text-xs sm:text-sm transition-all flex items-center gap-3 ${
                    selectedAccent.id === acc.id
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30 text-[var(--text-primary)]"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-2xl">{acc.flag}</span>
                  <span className="truncate">{acc.name}</span>
                </button>
              ))}
            </div>

            {/* Speed Control Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs sm:text-sm font-extrabold text-[var(--text-primary)]">
                <span>Playback Speed:</span>
                <span className="text-[#6c63ff]">{speechRate}x</span>
              </div>
              <div className="flex items-center gap-2">
                {[0.75, 1.0, 1.25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold border ${
                      speechRate === rate
                        ? "bg-[#6c63ff] text-white border-[#6c63ff]"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drill Selector Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h2 className="text-xl font-black text-[var(--text-primary)]">Available Drills</h2>

            <div className="space-y-3">
              {DRILLS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveDrill(d);
                    setDictationChecked(false);
                    setUserDictation("");
                  }}
                  className={`w-full p-4 rounded-2xl border text-left transition-all space-y-1 ${
                    activeDrill.id === d.id
                      ? "border-[#6c63ff] bg-[#6c63ff]/20 ring-2 ring-[#6c63ff]/30"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-[var(--text-primary)]">{d.title}</h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#6c63ff]/20 text-[#6c63ff]">
                      {d.level}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Player & Dictation Practice Workspace */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <span className="text-xs font-black text-[#6c63ff] uppercase tracking-wider">
                  Active Audio Drill
                </span>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mt-1">{activeDrill.title}</h2>
              </div>

              <button
                onClick={handlePlayAudio}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white text-sm font-extrabold shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <span>{isPlaying ? "🔊 Playing Audio..." : "▶️ Play Audio Sample"}</span>
              </button>
            </div>

            {/* Dictation Box */}
            <div className="space-y-4 pt-2">
              <label className="block text-sm sm:text-base font-black text-[var(--text-primary)]">
                Dictation Challenge (Type what you hear):
              </label>

              <textarea
                rows={4}
                placeholder="Listen to the audio sample above and type the exact sentence here..."
                value={userDictation}
                onChange={(e) => setUserDictation(e.target.value)}
                className="w-full p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm sm:text-base font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDictationChecked(true)}
                  disabled={!userDictation.trim()}
                  className="px-6 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#7c74ff] text-white text-xs sm:text-sm font-extrabold shadow-md disabled:opacity-50"
                >
                  Verify Dictation Accuracy
                </button>
              </div>

              {dictationChecked && (
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] space-y-3 animate-in fade-in duration-200">
                  <span className="font-extrabold text-xs text-emerald-500 uppercase">Correct Audio Script:</span>
                  <p className="font-bold text-sm sm:text-base text-[var(--text-primary)]">"{activeDrill.text}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListeningPractice;
