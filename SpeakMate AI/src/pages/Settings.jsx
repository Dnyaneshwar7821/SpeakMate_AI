import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const AGE_GROUPS = [
  { key: "Kids", label: "Kids (6-12)", icon: "🎈", desc: "Simple words, fun stories & high encouragement" },
  { key: "Teens", label: "Teens (13-17)", icon: "⚡", desc: "School life, gaming, pop culture & casual chatter" },
  { key: "Young Adult", label: "Young Adults (18-24)", icon: "🎓", desc: "Campus life, travel & interview prep" },
  { key: "Professional", label: "Professionals (25-50)", icon: "💼", desc: "Business English, executive tone & presentations" },
  { key: "Senior", label: "Seniors (50+)", icon: "☕", desc: "Relaxed conversation, culture & life stories" },
];

const VOICE_PERSONAS = [
  {
    key: "Friendly",
    label: "Friendly Persona",
    icon: "💬",
    desc: "Warm, supportive, and encouraging tone",
    pitch: 1.15,
    rate: 1.0,
    previewText: "Hello there! I am your friendly AI English tutor. I'm excited to practice English with you!",
  },
  {
    key: "Professional",
    label: "Professional Executive",
    icon: "💼",
    desc: "Formal, polished business tone",
    pitch: 0.9,
    rate: 0.9,
    previewText: "Hello. I am your professional AI tutor. Let's work together to polish your English communication skills.",
  },
  {
    key: "Energetic",
    label: "Energetic Coach",
    icon: "⚡",
    desc: "High energy, fast-paced practice",
    pitch: 1.15,
    rate: 1.2,
    previewText: "Hey! Ready to level up your English? Let's get started and have some fun speaking!",
  },
  {
    key: "Calm",
    label: "Calm Tutor",
    icon: "🌧️",
    desc: "Relaxed, patient guidance and soft pace",
    pitch: 0.95,
    rate: 0.85,
    previewText: "Welcome. I am your calm AI tutor. We will practice English step by step at your own pace.",
  },
  {
    key: "Teacher",
    label: "Patient Teacher",
    icon: "🏫",
    desc: "Detailed corrections and step-by-step guidance",
    pitch: 1.05,
    rate: 0.95,
    previewText: "Hello. I am your English teacher. Today we will focus on building your confidence in speaking.",
  },
  {
    key: "Native Speaker",
    label: "Native Speaker",
    icon: "🌐",
    desc: "Natural, fluent conversational flow",
    pitch: 1.0,
    rate: 1.05,
    previewText: "Hey friend! I'm your native speaker tutor. Let's practice speaking naturally and fluently.",
  },
];

const COMMITMENTS = [
  { key: "5 min", label: "Casual Learner", value: 5 },
  { key: "15 min", label: "Regular Learner", value: 15 },
  { key: "30 min", label: "Serious Learner", value: 30 },
  { key: "45 min", label: "Super Learner", value: 45 },
];

export function Settings() {
  const { isDark, toggleTheme } = useTheme();

  const accountType = localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";

  const [accent, setAccent] = useState("US");
  const [speechRate, setSpeechRate] = useState("1.0");
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem("speakmate_voice_persona") || "Friendly"
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(
    localStorage.getItem("speakmate_age_group") || "Professional"
  );
  const [dailyGoal, setDailyGoal] = useState(
    localStorage.getItem("speakmate_daily_goal") || "15 min"
  );

  const [playingVoice, setPlayingVoice] = useState(null);
  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const playVoicePreview = (persona) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    setPlayingVoice(persona.key);
    const utterance = new SpeechSynthesisUtterance(persona.previewText);
    utterance.pitch = persona.pitch;
    utterance.rate = persona.rate * parseFloat(speechRate);
    utterance.lang = accent === "UK" ? "en-GB" : accent === "AU" ? "en-AU" : "en-US";

    const voices = window.speechSynthesis.getVoices();
    const targetVoice =
      voices.find((v) => v.lang.startsWith(utterance.lang) && v.name.includes("Natural")) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (targetVoice) utterance.voice = targetVoice;

    utterance.onend = () => setPlayingVoice(null);
    utterance.onerror = () => setPlayingVoice(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectVoice = (persona) => {
    setSelectedVoice(persona.key);
    localStorage.setItem("speakmate_voice_persona", persona.key);
    playVoicePreview(persona);
  };

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem("speakmate_voice_persona", selectedVoice);
    localStorage.setItem("speakmate_age_group", selectedAgeGroup);
    localStorage.setItem("speakmate_daily_goal", dailyGoal);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">App Settings & Preferences ⚙️</h1>
          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
            Customize target age group, AI tutor voice personas, audio playback speed, and notification reminders.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
          ✓ All application settings saved successfully!
        </div>
      )}

      {/* Target Age Group (For Individual Users) */}
      {accountType === "INDIVIDUAL_USER" && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Target Age Group</h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
              Personalizes conversation scenarios, AI chat context, and topic recommendations across all modules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGE_GROUPS.map((a) => {
              const isSelected = selectedAgeGroup === a.key;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => {
                    setSelectedAgeGroup(a.key);
                    localStorage.setItem("speakmate_age_group", a.key);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-[var(--bg-surface)] shrink-0">{a.icon}</span>
                  <div>
                    <h3 className="font-black text-sm text-[var(--text-primary)]">{a.label}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">{a.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Theme & Appearance */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <h2 className="text-lg font-black text-[var(--text-primary)]">Appearance & Interface Theme</h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <div>
            <p className="text-sm font-black text-[var(--text-primary)]">Dark Mode Theme</p>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Toggle dark or light theme interface.</p>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border shadow-sm ${
              isDark
                ? "bg-[#6c63ff] border-[#6c63ff] text-white shadow-[#6c63ff]/30"
                : "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)]"
            }`}
          >
            {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
      </div>

      {/* AI Voice & Audio Preferences */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-black text-[var(--text-primary)]">AI Voice & Speech Synthesizer</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
            Selecting an AI Voice Persona changes how the tutor speaks across the entire application.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Target English Accent</label>
              <select
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              >
                <option value="US">American English (US)</option>
                <option value="UK">British English (UK)</option>
                <option value="AU">Australian English (AU)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Default Audio Speed ({speechRate}x)</label>
              <input
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(e.target.value)}
                className="w-full accent-[#6c63ff] mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-3">
              AI Tutor Voice Persona (Same 6 Options as Mobile App)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VOICE_PERSONAS.map((v) => {
                const isSelected = selectedVoice === v.key;
                const isPlayingThis = playingVoice === v.key;
                return (
                  <div
                    key={v.key}
                    onClick={() => handleSelectVoice(v)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? "border-[#6c63ff] bg-[#6c63ff]/15 ring-2 ring-[#6c63ff]/30 shadow-md"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl p-2 rounded-xl bg-[var(--bg-surface)] shrink-0">{v.icon}</span>
                        {isSelected && (
                          <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#6c63ff] text-white">
                            Active Voice
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-sm text-[var(--text-primary)]">{v.label}</h3>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{v.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVoice(v);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                        isPlayingThis
                          ? "bg-amber-500 text-white animate-pulse"
                          : isSelected
                          ? "bg-[#6c63ff] text-white"
                          : "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[#6c63ff]/20"
                      }`}
                    >
                      <span>{isPlayingThis ? "🔊 Speaking..." : "▶ Test Sample"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Commitment Goal */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <h2 className="text-lg font-black text-[var(--text-primary)]">Daily Learning Commitment</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COMMITMENTS.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setDailyGoal(c.key)}
              className={`p-4 rounded-2xl border text-center transition-all ${
                dailyGoal === c.key
                  ? "border-[#6c63ff] bg-[#6c63ff]/15 text-[#6c63ff] ring-2 ring-[#6c63ff]/30 shadow-md"
                  : "border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <h3 className="font-black text-base">{c.key} / day</h3>
              <p className="text-xs font-semibold mt-1">{c.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Reminders */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <h2 className="text-lg font-black text-[var(--text-primary)]">Notification Reminders</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <div>
              <p className="text-sm font-black text-[var(--text-primary)]">Daily Practice Reminders</p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Receive reminders to complete your daily target.</p>
            </div>
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
              className="h-5 w-5 accent-[#6c63ff] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <div>
              <p className="text-sm font-black text-[var(--text-primary)]">Streak Saver Alerts</p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Alerts before your daily streak expires.</p>
            </div>
            <input
              type="checkbox"
              checked={streakAlerts}
              onChange={(e) => setStreakAlerts(e.target.checked)}
              className="h-5 w-5 accent-[#6c63ff] cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6c63ff]/25 transition-all"
          >
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
