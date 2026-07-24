import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

export function Settings() {
  const { isDark, toggleTheme } = useTheme();

  const [accent, setAccent] = useState("US");
  const [speechRate, setSpeechRate] = useState("1.0");
  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">App Settings & Preferences</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Customize audio voices, notification reminders, and display themes.</p>
      </div>

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center">
          ✓ Settings saved successfully!
        </div>
      )}

      {/* Theme & Appearance */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-[var(--text-primary)]">Appearance & Theme</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)]">Dark Mode Theme</p>
            <p className="text-xs text-[var(--text-secondary)]">Toggle dark or light theme interface.</p>
          </div>

          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              isDark
                ? "bg-[#6c63ff] border-[#6c63ff] text-white"
                : "bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-primary)]"
            }`}
          >
            {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>
        </div>
      </div>

      {/* Audio & AI Speech Preferences */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-[var(--text-primary)]">AI Voice & Audio Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Target English Accent</label>
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold focus:outline-none focus:border-[#6c63ff]"
            >
              <option value="US">American English (US)</option>
              <option value="UK">British English (UK)</option>
              <option value="AU">Australian English (AU)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">Default Audio Speed ({speechRate}x)</label>
            <input
              type="range"
              min="0.75"
              max="1.5"
              step="0.05"
              value={speechRate}
              onChange={(e) => setSpeechRate(e.target.value)}
              className="w-full accent-[#6c63ff]"
            />
          </div>
        </div>
      </div>

      {/* Notifications Preferences */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-[var(--text-primary)]">Notification Reminders</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Daily Practice Reminders</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Receive reminders to complete your daily target.</p>
            </div>
            <input
              type="checkbox"
              checked={reminders}
              onChange={(e) => setReminders(e.target.checked)}
              className="h-4 w-4 accent-[#6c63ff]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)]">Streak Saver Alerts</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Alerts before your daily streak expires.</p>
            </div>
            <input
              type="checkbox"
              checked={streakAlerts}
              onChange={(e) => setStreakAlerts(e.target.checked)}
              className="h-4 w-4 accent-[#6c63ff]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#6c63ff] hover:bg-[#8b85ff] text-white text-xs font-extrabold shadow-md"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}

export default Settings;
