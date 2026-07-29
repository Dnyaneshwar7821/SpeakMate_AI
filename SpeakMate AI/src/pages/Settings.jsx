import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { speakGlobalText, VOICE_PROFILES, ACCENT_LIST } from "../utils/speechHelper";

export function Settings() {
  const toast = useToast();
  const { user, updateUser, completeOnboarding } = useAuth();

  // Currently persisted settings in localStorage / User context
  const savedAccent = localStorage.getItem("speakmate_voice_accent") || "US";
  const savedVoice = localStorage.getItem("speakmate_ai_voice") || "Default";
  const savedAgeGroup = localStorage.getItem("speakmate_age_group") || user?.ageGroup || "Professional";
  const savedDailyGoal = localStorage.getItem("speakmate_daily_goal") || "15 min";

  // DRAFT STATES (Selections update local draft state, ONLY applied globally when 'Save All Settings' is clicked)
  const [accent, setAccent] = useState(savedAccent);
  const [selectedVoice, setSelectedVoice] = useState(savedVoice);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(savedAgeGroup);
  const [dailyGoal, setDailyGoal] = useState(savedDailyGoal);

  // Modal State for Voice Selection Popup
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(null);

  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Onboarding voice style fallback
  const onboardingVoiceStyle =
    localStorage.getItem("speakmate_onboarding_voice") ||
    localStorage.getItem("speakmate_voice_persona") ||
    user?.preferredVoice ||
    "Friendly";

  // Active voice label helper
  const activeVoiceLabel = (() => {
    if (selectedVoice === "Default" || !selectedVoice) {
      return `System Default (${onboardingVoiceStyle})`;
    }
    const profile = VOICE_PROFILES.find((p) => p.code === selectedVoice);
    return profile ? profile.label : selectedVoice;
  })();

  const playVoicePreview = (voiceCode, previewMsg) => {
    let textToSpeak = previewMsg;
    if (voiceCode === "Default") {
      textToSpeak = `Hello! I am your System Default English tutor using the ${onboardingVoiceStyle} voice selected during onboarding.`;
    } else if (!textToSpeak) {
      const p = VOICE_PROFILES.find((vp) => vp.code === voiceCode);
      textToSpeak = p ? p.previewText : `Hello! I am your AI speaking tutor using the ${voiceCode} voice. I'm excited to practice English with you!`;
    }
    setPlayingVoice(voiceCode);
    speakGlobalText(textToSpeak, 1.0, {
      onend: () => setPlayingVoice(null),
      onerror: () => setPlayingVoice(null),
    });
  };

  // Automatic test AI voice on option click in modal
  const handleSelectVoiceCode = (voiceCode, previewText) => {
    setSelectedVoice(voiceCode);
    playVoicePreview(voiceCode, previewText);
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      localStorage.setItem("speakmate_ai_voice", selectedVoice);
      localStorage.setItem("speakmate_voice_accent", accent);
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
        updateUser({
          preferredVoice: selectedVoice,
          preferredAccent: accent,
          ageGroup: selectedAgeGroup,
        });
      }

      setSaved(true);
      toast.success("Settings saved successfully! Voice preferences applied globally across all AI modules.");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const isDraftChanged =
    accent !== savedAccent ||
    selectedVoice !== savedVoice ||
    selectedAgeGroup !== savedAgeGroup ||
    dailyGoal !== savedDailyGoal;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#6c63ff] via-[#4f46e5] to-[#312e81] text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black">AI Voice & Application Settings ⚙️</h1>
          <p className="text-xs sm:text-sm font-medium opacity-90 mt-1">
            Customize target accents, AI tutor voice pitch profiles, learning pace, and notifications.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-white text-[#6c63ff] hover:bg-white/90 disabled:opacity-50 text-xs sm:text-sm font-black shadow-lg transition-all shrink-0 flex items-center gap-2"
        >
          <span>{saving ? "Saving..." : "💾 Save All Settings"}</span>
        </button>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
          ✓ All application settings saved and applied globally across all learning modules!
        </div>
      )}

      {isDraftChanged && !saved && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs sm:text-sm font-black text-center flex items-center justify-between gap-4">
          <span>⚠️ You have unsaved changes in your settings draft. Click "Save All Settings" to apply.</span>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-black shrink-0"
          >
            Save Now
          </button>
        </div>
      )}

      {/* SECTION 1: TARGET ACCENT & VOICE SELECTION POPUP CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Target English Accent Profile</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              Select your primary target accent region for AI speaking practice.
            </p>
          </div>

          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
          >
            {ACCENT_LIST.map((acc) => (
              <option key={acc.code} value={acc.code}>
                {acc.flag} {acc.label}
              </option>
            ))}
          </select>
        </div>

        {/* VOICE SELECTION CARD WITH POPUP TRIGGER */}
        <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#6c63ff] to-[#ff6584] text-white grid place-items-center text-3xl shadow-lg shrink-0">
              🎙️
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#6c63ff] tracking-wider px-2.5 py-0.5 rounded-full bg-[#6c63ff]/15">
                Active Selected AI Voice
              </span>
              <h3 className="text-xl font-black text-[var(--text-primary)] mt-1">{activeVoiceLabel}</h3>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                Click below to open the Voice Popup with 9 unique AI voices & automatic audio playback.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => playVoicePreview(selectedVoice)}
              className="px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-black text-[#6c63ff] hover:bg-[#6c63ff] hover:text-white transition-all shrink-0"
            >
              {playingVoice === selectedVoice ? "🔊 Playing Audio..." : "▶ Test Audio"}
            </button>
            <button
              onClick={() => setShowVoiceModal(true)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 text-white text-xs font-black shadow-lg shadow-[#6c63ff]/25 transition-all flex items-center justify-center gap-2"
            >
              <span>🎙️ Choose / Change AI Voice (9 Options)</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: LEARNING GOALS & AGE GROUP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)]">Daily Practice Goal</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Set target daily speaking time</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["10 min", "15 min", "30 min"].map((goal) => (
              <button
                key={goal}
                onClick={() => setDailyGoal(goal)}
                className={`py-3 rounded-2xl text-xs font-black transition-all border ${
                  dailyGoal === goal
                    ? "bg-[#6c63ff] text-white border-[#6c63ff] shadow-md"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#6c63ff]/50"
                }`}
              >
                ⏱️ {goal}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)]">Target Age Group</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Tutor vocabulary & scenario style</p>
          </div>

          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="w-full px-4 py-3.5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] focus:outline-none focus:border-[#6c63ff]"
          >
            <option value="Kids (6-12)">👶 Kids (6-12 years)</option>
            <option value="Teenager (13-17)">👦 Teenager (13-17 years)</option>
            <option value="Young Adult (18-24)">🧑 Young Adult (18-24 years)</option>
            <option value="Professional (25+)">💼 Professional (25+ years)</option>
          </select>
        </div>
      </div>

      {/* SECTION 3: NOTIFICATION PREFERENCES */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl space-y-4">
        <div>
          <h2 className="text-base font-black text-[var(--text-primary)]">Notification Preferences</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Daily practice reminders & alerts</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div>
              <p className="text-xs font-black text-[var(--text-primary)]">Daily Practice Reminders</p>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">Receive notifications to maintain your daily streak</p>
            </div>
            <button
              onClick={() => setReminders(!reminders)}
              className={`w-12 h-6 rounded-full transition-all relative ${reminders ? "bg-[#6c63ff]" : "bg-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${reminders ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div>
              <p className="text-xs font-black text-[var(--text-primary)]">Streak Saver Alerts</p>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">Alert before midnight if daily practice is incomplete</p>
            </div>
            <button
              onClick={() => setStreakAlerts(!streakAlerts)}
              className={`w-12 h-6 rounded-full transition-all relative ${streakAlerts ? "bg-[#6c63ff]" : "bg-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${streakAlerts ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON FOOTER */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-xl flex items-center justify-between gap-4">
        <span className="text-xs font-black text-[var(--text-secondary)]">
          {isDraftChanged ? "⚠️ Unsaved draft changes" : "✓ All settings up to date"}
        </span>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] hover:opacity-90 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6c63ff]/25 transition-all"
        >
          {saving ? "Saving Settings..." : "💾 Save All Settings"}
        </button>
      </div>

      {/* ── 9 VOICE OPTIONS POPUP MODAL (AUTOMATIC TEST VOICE ON CLICK) ── */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-4xl w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-[var(--border-default)] space-y-6 max-h-[90vh] overflow-y-auto bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-4">
              <div>
                <h3 className="font-black text-xl text-[var(--text-primary)]">Select AI Tutor Voice 🎙️</h3>
                <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                  Click any of the 9 voice options below — audio preview will <strong>automatically play</strong> out loud for testing!
                </p>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] hover:bg-rose-500 hover:text-white transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* 9 VOICE OPTIONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* OPTION 1: SYSTEM DEFAULT */}
              <div
                onClick={() => handleSelectVoiceCode("Default")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                  selectedVoice === "Default" || !selectedVoice
                    ? "border-[#6c63ff] bg-[#6c63ff]/15 shadow-xl scale-102"
                    : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/50"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">✨</span>
                    <div className="flex items-center gap-1.5">
                      {playingVoice === "Default" && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase animate-pulse">
                          🔊 Playing...
                        </span>
                      )}
                      {(selectedVoice === "Default" || !selectedVoice) && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#6c63ff] text-white text-[10px] font-black uppercase">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="font-black text-base text-[var(--text-primary)]">1. System Default</h4>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Uses your onboarding voice persona (<strong>{onboardingVoiceStyle}</strong>) with natural system speech.
                  </p>
                </div>
              </div>

              {/* OPTIONS 2 to 9: VOICE PROFILES */}
              {VOICE_PROFILES.filter((vp) => vp.code !== "Default").map((profile, idx) => {
                const isSelected = selectedVoice === profile.code;
                return (
                  <div
                    key={profile.code}
                    onClick={() => handleSelectVoiceCode(profile.code, profile.previewText)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#6c63ff] bg-[#6c63ff]/15 shadow-xl scale-102"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6c63ff]/50"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{profile.gender === "female" ? "👩‍🏫" : "👨‍🏫"}</span>
                        <div className="flex items-center gap-1.5">
                          {playingVoice === profile.code && (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase animate-pulse">
                              🔊 Playing...
                            </span>
                          )}
                          {isSelected && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#6c63ff] text-white text-[10px] font-black uppercase">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-black text-base text-[var(--text-primary)]">
                          {idx + 2}. {profile.label}
                        </h4>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                          {profile.accent}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium">
                        Custom pitch tuned for {profile.accent} {profile.gender} tutor.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[var(--border-default)] flex justify-end">
              <button
                onClick={() => setShowVoiceModal(false)}
                className="py-3 px-8 rounded-2xl bg-gradient-to-r from-[#6c63ff] to-[#4f46e5] text-white text-xs font-black shadow-lg shadow-[#6c63ff]/25"
              >
                ✓ Done / Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
