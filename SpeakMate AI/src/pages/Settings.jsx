import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { VOICE_PERSONAS, VOICE_PROFILES, speakGlobalText, getSavedVoiceSettings } from "../utils/speechHelper";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const AGE_GROUPS = [
  { key: "Kids", label: "Kids (6-12)", icon: "🎈", desc: "Simple words, fun stories & high encouragement" },
  { key: "Teens", label: "Teens (13-17)", icon: "⚡", desc: "School life, gaming, pop culture & casual chatter" },
  { key: "Young Adult", label: "Young Adults (18-24)", icon: "🎓", desc: "Campus life, travel & interview prep" },
  { key: "Professional", label: "Professionals (25-50)", icon: "💼", desc: "Business English, executive tone & presentations" },
  { key: "Senior", label: "Seniors (50+)", icon: "☕", desc: "Relaxed conversation, culture & life stories" },
];

const COMMITMENTS = [
  { key: "5 min", label: "Casual Learner", value: 5 },
  { key: "15 min", label: "Regular Learner", value: 15 },
  { key: "30 min", label: "Serious Learner", value: 30 },
  { key: "45 min", label: "Super Learner", value: 45 },
];

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();
  const { user, updateUser, completeOnboarding } = useAuth();

  const accountType = localStorage.getItem("speakmate_account_type") || "INDIVIDUAL_USER";

  const [accent, setAccent] = useState(
    localStorage.getItem("speakmate_voice_accent") || "US"
  );
  const [speechRate, setSpeechRate] = useState(
    localStorage.getItem("speakmate_speech_rate") || "1.0"
  );
  const [selectedVoice, setSelectedVoice] = useState(
    localStorage.getItem("speakmate_ai_voice") || localStorage.getItem("speakmate_voice_persona") || "Friendly"
  );
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(
    localStorage.getItem("speakmate_age_group") || user?.ageGroup || "Professional"
  );
  const [dailyGoal, setDailyGoal] = useState(
    localStorage.getItem("speakmate_daily_goal") || "15 min"
  );

  const [playingVoice, setPlayingVoice] = useState(null);
  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  // Active voice label resolver (Matches Mobile App Status Header)
  const activeVoiceLabel = (() => {
    const profile = VOICE_PROFILES.find((p) => p.code === selectedVoice);
    if (profile) return profile.label;
    const persona = VOICE_PERSONAS.find((p) => p.key === selectedVoice);
    if (persona) return persona.label;
    return selectedVoice;
  })();

  const playVoicePreview = (voiceCode, previewMsg) => {
    const textToSpeak = previewMsg || `Hello! I am your AI speaking tutor using the ${activeVoiceLabel} voice. I'm excited to practice English with you!`;
    setPlayingVoice(voiceCode);
    speakGlobalText(textToSpeak, 1.0, {
      onend: () => setPlayingVoice(null),
      onerror: () => setPlayingVoice(null),
    });
  };

  const handleSelectVoiceCode = (voiceCode, labelName, previewText) => {
    setSelectedVoice(voiceCode);
    localStorage.setItem("speakmate_ai_voice", voiceCode);
    localStorage.setItem("speakmate_voice_persona", voiceCode);
    
    // Sync backend & auth context
    updateUser({ preferredVoice: voiceCode });

    toast.success(`AI Speaking Voice changed to "${labelName}" globally!`);
    playVoicePreview(voiceCode, previewText);
  };

  const handleAccentChange = (val) => {
    setAccent(val);
    localStorage.setItem("speakmate_voice_accent", val);
  };

  const handleRateChange = (val) => {
    setSpeechRate(val);
    localStorage.setItem("speakmate_speech_rate", val);
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    localStorage.setItem("speakmate_ai_voice", selectedVoice);
    localStorage.setItem("speakmate_voice_persona", selectedVoice);
    localStorage.setItem("speakmate_voice_accent", accent);
    localStorage.setItem("speakmate_speech_rate", speechRate);
    localStorage.setItem("speakmate_age_group", selectedAgeGroup);
    localStorage.setItem("speakmate_daily_goal", dailyGoal);

    try {
      await completeOnboarding({
        preferredVoice: selectedVoice,
        preferredAccent: accent,
        dailyGoalMinutes: parseInt(dailyGoal, 10) || 15,
        ageGroup: selectedAgeGroup,
      });
    } catch (err) {
      updateUser({ preferredVoice: selectedVoice, preferredAccent: accent, ageGroup: selectedAgeGroup });
    }

    setSaved(true);
    toast.success("All application settings saved successfully across all modules!");
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black">App Settings & Voice Configuration ⚙️</h1>
          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
            Customize target age group, AI tutor speaking voice profiles, audio playback speed, and global preferences.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
          ✓ All application settings saved successfully!
        </div>
      )}

      {/* ── ACTIVE SPEAKING TUTOR STATUS CARD (Matches Mobile App Layout) ── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#312e81] text-white shadow-2xl border border-[#6c63ff]/40 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[#6c63ff]/20 border border-[#6c63ff]/50 grid place-items-center text-3xl shadow-inner shrink-0">
            🎙️
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#a5b4fc]">ACTIVE SPEAKING TUTOR VOICE</span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">{activeVoiceLabel}</h2>
            <p className="text-xs text-indigo-200 font-medium mt-1">
              Playback Speed: <strong>{speechRate}x</strong> • Target Accent: <strong>{accent}</strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => playVoicePreview(selectedVoice)}
          className="px-5 py-3 rounded-2xl bg-[#6c63ff] hover:bg-[#5b52e0] text-white text-xs font-black shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <span>{playingVoice === selectedVoice ? "🔊 Speaking Sample..." : "▶ Test Current Voice"}</span>
        </button>
      </div>

      {/* Target Age Group */}
      <div className={`p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6 ${accountType === "STUDENT" ? "opacity-50 pointer-events-none select-none" : ""}`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-[var(--text-primary)]">Target Age Group</h2>
            {accountType === "STUDENT" && (
              <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">
                🔒 Locked in Student Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
            {accountType === "STUDENT"
              ? "Auto-configured based on your selected school standard grade."
              : "Personalizes conversation scenarios, AI chat context, and topic recommendations across all modules."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGE_GROUPS.map((a) => {
            const isSelected = selectedAgeGroup === a.key;
            return (
              <button
                key={a.key}
                type="button"
                disabled={accountType === "STUDENT"}
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

      {/* ── AI VOICE PROFILES & PERSONAS (Global App-Wide Voice Selection) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-black text-[var(--text-primary)]">AI Speaking Tutor Voice (Global App-Wide)</h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 font-medium">
            Changing the AI Voice here updates how the tutor speaks across <strong>Speaking Practice, AI Chat, Lessons, Vocabulary, and Grammar</strong> modules.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs sm:text-sm font-black text-[var(--text-primary)] mb-2">Target English Accent</label>
              <select
                value={accent}
                onChange={(e) => handleAccentChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
              >
                <option value="US">American English (US)</option>
                <option value="UK">British English (UK)</option>
                <option value="AU">Australian English (AU)</option>
                <option value="IN">Indian English (IN)</option>
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
                onChange={(e) => handleRateChange(e.target.value)}
                className="w-full accent-[#6c63ff] mt-2 cursor-pointer"
              />
            </div>
          </div>

          {/* 1. Regional Accent Voice Profiles (Same as Mobile App) */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider text-[#6c63ff]">
              🌐 Accent Voice Profiles (Mobile Parity)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VOICE_PROFILES.map((profile) => {
                const isSelected = selectedVoice === profile.code;
                const isPlayingThis = playingVoice === profile.code;
                return (
                  <div
                    key={profile.code}
                    onClick={() => handleSelectVoiceCode(profile.code, profile.label, profile.previewText)}
                    className={`p-4.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? "border-[#6c63ff] bg-[#6c63ff]/15 ring-2 ring-[#6c63ff]/30 shadow-md"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#6c63ff]/15 text-[#6c63ff]">
                          {profile.accent}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#6c63ff] text-white">
                            Active Voice
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-sm text-[var(--text-primary)]">{profile.label}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                        {profile.gender === "male" ? "👨 Male Native Accent" : "👩 Female Native Accent"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVoiceCode(profile.code, profile.label, profile.previewText);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                        isPlayingThis
                          ? "bg-amber-500 text-white animate-pulse"
                          : isSelected
                          ? "bg-[#6c63ff] text-white"
                          : "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[#6c63ff]/20"
                      }`}
                    >
                      <span>{isPlayingThis ? "🔊 Speaking..." : "▶ Select & Preview"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Persona Voice Options */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-default)]">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider text-[#6c63ff]">
              💬 Persona Voice Styles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {VOICE_PERSONAS.map((v) => {
                const isSelected = selectedVoice === v.key;
                const isPlayingThis = playingVoice === v.key;
                return (
                  <div
                    key={v.key}
                    onClick={() => handleSelectVoiceCode(v.key, v.label, v.previewText)}
                    className={`p-4.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 relative ${
                      isSelected
                        ? "border-[#6c63ff] bg-[#6c63ff]/15 ring-2 ring-[#6c63ff]/30 shadow-md"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/40"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl p-2 rounded-xl bg-[var(--bg-surface)] shrink-0">{v.icon}</span>
                        {isSelected && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#6c63ff] text-white">
                            Active Voice
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-sm text-[var(--text-primary)]">{v.label}</h4>
                      <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">{v.desc}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectVoiceCode(v.key, v.label, v.previewText);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                        isPlayingThis
                          ? "bg-amber-500 text-white animate-pulse"
                          : isSelected
                          ? "bg-[#6c63ff] text-white"
                          : "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[#6c63ff]/20"
                      }`}
                    >
                      <span>{isPlayingThis ? "🔊 Speaking..." : "▶ Select & Preview"}</span>
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
