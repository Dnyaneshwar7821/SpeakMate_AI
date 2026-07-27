import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const VOICE_PERSONAS = [
  { key: "Friendly", label: "Friendly Persona", icon: "💬", desc: "Warm, supportive, and encouraging tone" },
  { key: "Professional", label: "Professional Executive", icon: "💼", desc: "Formal, polished business tone" },
  { key: "Energetic", label: "Energetic Coach", icon: "⚡", desc: "High energy, fast-paced practice" },
  { key: "Teacher", label: "Patient Teacher", icon: "🏫", desc: "Detailed corrections and step-by-step guidance" },
];

const COMMITMENTS = [
  { key: "5 min", label: "Casual Learner", value: 5 },
  { key: "15 min", label: "Regular Learner", value: 15 },
  { key: "30 min", label: "Serious Learner", value: 30 },
  { key: "45 min", label: "Super Learner", value: 45 },
];

export function Settings() {
  const { isDark, toggleTheme } = useTheme();

  const [accent, setAccent] = useState("US");
  const [speechRate, setSpeechRate] = useState("1.0");
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem("speakmate_voice_persona") || "Friendly"
  );
  const [dailyGoal, setDailyGoal] = useState(
    localStorage.getItem("speakmate_daily_goal") || "15 min"
  );

  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem("speakmate_voice_persona", selectedVoice);
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
            Customize audio voices, notification reminders, daily practice goals, and display themes.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
          ✓ All application settings saved successfully!
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
        <h2 className="text-lg font-black text-[var(--text-primary)]">AI Voice & Speech Synthesizer</h2>

        <div className="space-y-5">
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
            <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-3">AI Tutor Voice Persona</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VOICE_PERSONAS.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setSelectedVoice(v.key)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    selectedVoice === v.key
                      ? "border-[#6c63ff] bg-[#6c63ff]/15 ring-2 ring-[#6c63ff]/30 shadow-md"
                      : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                  }`}
                >
                  <span className="text-2xl p-2 rounded-xl bg-[var(--bg-surface)] shrink-0">{v.icon}</span>
                  <div>
                    <h3 className="font-black text-sm text-[var(--text-primary)]">{v.label}</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{v.desc}</p>
                  </div>
                </button>
              ))}
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
