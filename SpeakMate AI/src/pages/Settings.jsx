import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { speakGlobalText, VOICE_PROFILES, ACCENT_LIST } from "../utils/speechHelper";
import { EventBus, AVATAR_EVENTS } from "../services/live2d/EventBus";
import { settingsService, onboardingService } from "../services/appServices";

const LANGUAGE_OPTIONS = [
  { code: "English", label: "English", native: "English", flag: "🇺🇸" },
  { code: "Spanish", label: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "French", label: "French", native: "Français", flag: "🇫🇷" },
  { code: "German", label: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "Japanese", label: "Japanese", native: "日本語", flag: "🇯🇵" },
  { code: "Chinese", label: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "Italian", label: "Italian", native: "Italiano", flag: "🇮🇹" },
  { code: "Portuguese", label: "Portuguese", native: "Português", flag: "🇵🇹" },
  { code: "Russian", label: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "Korean", label: "Korean", native: "한국어", flag: "🇰🇷" },
  { code: "Hindi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "Arabic", label: "Arabic", native: "العربية", flag: "🇦🇪" },
  { code: "Dutch", label: "Dutch", native: "Nederlands", flag: "🇳🇱" },
  { code: "Turkish", label: "Turkish", native: "Türkçe", flag: "🇹🇷" },
  { code: "Vietnamese", label: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
  { code: "Swedish", label: "Swedish", native: "Svenska", flag: "🇸🇪" },
  { code: "Polish", label: "Polish", native: "Polski", flag: "🇵🇱" },
];

const AGE_OPTIONS = [
  { code: "Kids", label: "Kids (6-12) 🎈", desc: "Simple words, fun stories & high encouragement" },
  { code: "Teens", label: "Teens (13-17) ⚡", desc: "School life, pop culture & casual chatter" },
  { code: "Young Adult", label: "Young Adults (18-24) 🎓", desc: "Campus life, travel & interview prep" },
  { code: "Professional", label: "Professionals (25-50) 💼", desc: "Business English, executive tone & presentations" },
  { code: "Senior", label: "Seniors (50+) ☕", desc: "Relaxed conversation, culture & life stories" },
];

const normalizeAgeGroup = (rawAge) => {
  if (!rawAge) return "Professional";
  const s = String(rawAge).toLowerCase();
  if (s.includes("kid")) return "Kids";
  if (s.includes("teen")) return "Teens";
  if (s.includes("young")) return "Young Adult";
  if (s.includes("senior")) return "Senior";
  if (s.includes("prof")) return "Professional";
  return "Professional";
};

export function Settings() {
  const toast = useToast();
  const { isDark, setTheme } = useTheme();
  const { user, updateUser, completeOnboarding } = useAuth();

  const savedAccent = localStorage.getItem("speakmate_voice_accent") || "US";
  const savedVoice = localStorage.getItem("speakmate_ai_voice") || "Default";
  const savedAgeGroup = normalizeAgeGroup(localStorage.getItem("speakmate_age_group") || user?.ageGroup || "Professional");
  const savedDailyGoal = localStorage.getItem("speakmate_daily_goal") || "15 min";
  const savedLang = localStorage.getItem("speakmate_app_language") || "English";
  const savedSpeed = parseFloat(localStorage.getItem("speakmate_voice_speed") || "1.0");

  const [accent, setAccent] = useState(savedAccent);
  const [selectedVoice, setSelectedVoice] = useState(savedVoice);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(savedAgeGroup);
  const [dailyGoal, setDailyGoal] = useState(savedDailyGoal);
  const [selectedLang, setSelectedLang] = useState(savedLang);
  const [speechSpeed, setSpeechSpeed] = useState(savedSpeed);

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [langSearch, setLangSearch] = useState("");
  const [playingVoice, setPlayingVoice] = useState(null);

  const [reminders, setReminders] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);
  const [soundEffects, setSoundEffects] = useState(() => localStorage.getItem("speakmate_sound_effects") !== "false");
  const [autoPlayAudio, setAutoPlayAudio] = useState(() => localStorage.getItem("speakmate_autoplay_audio") === "true");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleVisualTheme = () => {
    const nextMode = isDark ? "light" : "dark";
    setTheme(nextMode);
    settingsService.update({ darkMode: nextMode === "dark" }).catch(() => {});
  };

  const onboardingVoiceStyle =
    localStorage.getItem("speakmate_onboarding_voice") ||
    localStorage.getItem("speakmate_voice_persona") ||
    user?.preferredVoice ||
    "Friendly";

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
    speakGlobalText(textToSpeak, speechSpeed, {
      overrideVoiceCode: voiceCode,
      onend: () => setPlayingVoice(null),
      onerror: () => setPlayingVoice(null),
    });
  };

  const handleSelectVoiceCode = (voiceCode, previewText) => {
    setSelectedVoice(voiceCode);
    playVoicePreview(voiceCode, previewText);
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);

    try {
      const profile = VOICE_PROFILES.find((p) => p.code === selectedVoice);
      const gender = profile?.gender || (selectedVoice.toLowerCase().includes("male") && !selectedVoice.toLowerCase().includes("female") ? "male" : "female");

      // 1. Persist voice, language, audio and learning preferences to localStorage
      localStorage.setItem("speakmate_ai_voice", selectedVoice);
      localStorage.setItem("speakmate_voice_code", selectedVoice);
      localStorage.setItem("speakmate_voice_gender", gender);
      localStorage.setItem("speakmate_voice_accent", accent);
      localStorage.setItem("speakmate_age_group", selectedAgeGroup);
      localStorage.setItem("speakmate_daily_goal", dailyGoal);
      localStorage.setItem("speakmate_app_language", selectedLang);
      localStorage.setItem("speakmate_voice_speed", String(speechSpeed));
      localStorage.setItem("speakmate_sound_effects", String(soundEffects));
      localStorage.setItem("speakmate_autoplay_audio", String(autoPlayAudio));

      EventBus.emit(AVATAR_EVENTS.GENDER_CHANGED, { gender });

      // 2. Sync preferences to backend services
      await settingsService.update({
        darkMode: isDark,
        aiVoice: selectedVoice,
        language: selectedLang,
        soundEffects,
        autoPlayAudio,
        dailyReminder: reminders,
        notificationsEnabled: reminders,
      }).catch(() => {});

      await onboardingService.update({
        ageGroup: selectedAgeGroup,
        preferredVoice: selectedVoice,
        preferredAccent: accent,
        dailyGoalMinutes: parseInt(dailyGoal, 10) || 15,
      }).catch(() => {});

      try {
        await completeOnboarding({
          preferredVoice: selectedVoice,
          preferredAccent: accent,
          dailyGoalMinutes: parseInt(dailyGoal, 10) || 15,
          ageGroup: selectedAgeGroup,
        });
      } catch {
        if (updateUser) {
          updateUser({
            preferredVoice: selectedVoice,
            preferredAccent: accent,
            ageGroup: selectedAgeGroup,
          });
        }
      }

      window.dispatchEvent(new CustomEvent("speakmate_settings_updated", { detail: { ageGroup: selectedAgeGroup } }));
      window.dispatchEvent(new CustomEvent("speakmate_age_group_changed", { detail: { ageGroup: selectedAgeGroup } }));
      window.dispatchEvent(new Event("speakmate_progress_updated"));

      setSaved(true);
      toast.success("Preferences Saved ✓");
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save settings error:", err);
      toast.error("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem("speakmate_cached_dashboard");
    toast.success("Local learning cache cleared successfully! 🧹");
    setShowResetModal(false);
  };

  const filteredLanguages = LANGUAGE_OPTIONS.filter((l) =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) || l.native.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 px-2 sm:px-4 lg:px-6 py-2">
      {/* Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#6C63FF] via-[#4F46E5] to-[#312E81] text-white shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-white/10">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-amber-300">
            ⚙️ System & Voice Preferences
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Application Settings</h1>
          <p className="text-xs sm:text-sm font-medium text-indigo-100 leading-relaxed">
            Customize target accents, AI tutor voice pitch profiles, themes, pace, and notifications.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs sm:text-sm font-black text-center animate-in fade-in duration-200">
          ✓ Preferences Saved and synced across all AI modules!
        </div>
      )}

      {/* SECTION 1: THEME & DISPLAY PREFERENCES (REAL-TIME PREVIEW) */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
        <h2 className="text-base font-black text-[var(--text-primary)]">🎨 Display & Appearance</h2>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <div className="space-y-0.5">
            <p className="text-xs font-black text-[var(--text-primary)]">Night Theme Mode</p>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Toggle dark mode visual layout (Previews immediately in real-time)
            </p>
          </div>
          <button
            type="button"
            onClick={toggleVisualTheme}
            className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 cursor-pointer ${
              isDark ? "bg-[#6C63FF] justify-end" : "bg-gray-400 justify-start"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center text-[10px]">
              {isDark ? "🌙" : "☀️"}
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 2: TARGET ACCENT & VOICE SELECTION */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Target English Accent Profile</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              Select your primary target accent region for AI speaking practice.
            </p>
          </div>

          <select
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF]"
          >
            {ACCENT_LIST.map((acc) => (
              <option key={acc.code} value={acc.code}>
                {acc.flag} {acc.label}
              </option>
            ))}
          </select>
        </div>

        {/* VOICE SELECTION CARD WITH POPUP TRIGGER */}
        <div className="p-6 rounded-3xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-inner flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#FF6584] text-white grid place-items-center text-3xl shadow-lg shrink-0">
              🎙️
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#6C63FF] tracking-wider px-2.5 py-0.5 rounded-full bg-[#6C63FF]/15">
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
              className="px-4 py-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] text-xs font-black text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white transition-all shrink-0 active:scale-95 shadow-sm"
            >
              {playingVoice === selectedVoice ? "🔊 Playing Audio..." : "▶ Test Audio"}
            </button>
            <button
              onClick={() => setShowVoiceModal(true)}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#6C63FF]/25 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>🎙️ Choose AI Voice (9 Options)</span>
            </button>
          </div>
        </div>

        {/* SPEECH SPEED SELECTOR */}
        <div className="p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black text-[var(--text-primary)]">Tutor Speech Speed</p>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">Control how fast your AI tutor talks</p>
          </div>

          <div className="flex items-center gap-2">
            {[0.75, 1.0, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeechSpeed(spd)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                  speechSpeed === spd
                    ? "bg-[#6C63FF] text-white border-[#6C63FF] shadow-sm"
                    : "bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)]"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: LEARNING GOALS & APP LANGUAGE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)]">Daily Practice Goal</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Set target daily speaking time</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["10 min", "15 min", "30 min"].map((goal) => (
              <button
                key={goal}
                onClick={() => setDailyGoal(goal)}
                className={`py-3 rounded-2xl text-xs font-black transition-all border active:scale-95 ${
                  dailyGoal === goal
                    ? "bg-[#6C63FF] text-white border-[#6C63FF] shadow-md"
                    : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#6C63FF]/50"
                }`}
              >
                ⏱️ {goal}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">App Translation Language</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">Currently: {selectedLang}</p>
            </div>
            <button
              onClick={() => setShowLangModal(true)}
              className="px-4 py-2 rounded-xl bg-[#6C63FF]/15 text-[#6C63FF] text-xs font-black hover:bg-[#6C63FF]/25"
            >
              Change Language 🌐
            </button>
          </div>

          <div>
            <h2 className="text-base font-black text-[var(--text-primary)] mt-2">Target Persona Age Group</h2>
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="w-full mt-2 px-4 py-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] focus:outline-none focus:border-[#6C63FF]"
            >
              {AGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.label} - {opt.desc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: NOTIFICATIONS & SOUND TOGGLES */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
        <h2 className="text-base font-black text-[var(--text-primary)]">🔔 Notifications & Audio Playback</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <div>
              <p className="text-xs font-black text-[var(--text-primary)]">Daily Practice Reminders</p>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">Receive notifications to maintain your daily streak</p>
            </div>
            <button
              onClick={() => setReminders(!reminders)}
              className={`w-12 h-6 rounded-full transition-all relative ${reminders ? "bg-[#6C63FF]" : "bg-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${reminders ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <div>
              <p className="text-xs font-black text-[var(--text-primary)]">Sound Effects & Chimes</p>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">Play celebratory chimes upon quiz completion and XP awards</p>
            </div>
            <button
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-12 h-6 rounded-full transition-all relative ${soundEffects ? "bg-[#6C63FF]" : "bg-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${soundEffects ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
            <div>
              <p className="text-xs font-black text-[var(--text-primary)]">Auto-Play Spoken Audio</p>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">Automatically speak tutor responses in AI chat sessions</p>
            </div>
            <button
              onClick={() => setAutoPlayAudio(!autoPlayAudio)}
              className={`w-12 h-6 rounded-full transition-all relative ${autoPlayAudio ? "bg-[#6C63FF]" : "bg-gray-400"}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${autoPlayAudio ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 5: DATA MANAGEMENT */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-[var(--border-default)] shadow-xl space-y-4">
        <h2 className="text-base font-black text-[var(--text-primary)]">🧹 Data & Storage</h2>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <div>
            <p className="text-xs font-black text-[var(--text-primary)]">Clear Local Learning Cache</p>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">Refresh cached dashboard and lesson data</p>
          </div>
          <button
            onClick={() => setShowResetModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-black transition-all"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* SAVE BUTTON FOOTER */}
      <div className="glass-card p-6 rounded-3xl border border-[var(--border-default)] shadow-xl flex items-center justify-end gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] hover:opacity-95 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-xl shadow-[#6C63FF]/25 transition-all active:scale-95"
        >
          {saving ? "Saving Settings..." : "💾 Save All Settings"}
        </button>
      </div>

      {/* ── 9 VOICE OPTIONS POPUP MODAL ── */}
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
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)] hover:bg-rose-500 hover:text-white transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* 9 VOICE OPTIONS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                onClick={() => handleSelectVoiceCode("Default")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                  selectedVoice === "Default" || !selectedVoice
                    ? "border-[#6C63FF] bg-[#6C63FF]/15 shadow-xl scale-102"
                    : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6C63FF]/50"
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
                        <span className="px-2.5 py-0.5 rounded-full bg-[#6C63FF] text-white text-[10px] font-black uppercase">
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

              {VOICE_PROFILES.filter((vp) => vp.code !== "Default").map((profile, idx) => {
                const isSelected = selectedVoice === profile.code;
                return (
                  <div
                    key={profile.code}
                    onClick={() => handleSelectVoiceCode(profile.code, profile.previewText)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                      isSelected
                        ? "border-[#6C63FF] bg-[#6C63FF]/15 shadow-xl scale-102"
                        : "border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[#6C63FF]/50"
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
                            <span className="px-2.5 py-0.5 rounded-full bg-[#6C63FF] text-white text-[10px] font-black uppercase">
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
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-[#6C63FF] to-[#8B5CF6] text-white text-xs font-black shadow-lg shadow-[#6C63FF]/25 active:scale-95"
              >
                ✓ Done / Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 17 APP LANGUAGES MODAL ── */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-2xl w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-[var(--border-default)] space-y-4 max-h-[85vh] overflow-y-auto bg-[var(--bg-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-3">
              <h3 className="font-black text-lg text-[var(--text-primary)]">Select App Language 🌐</h3>
              <button
                onClick={() => setShowLangModal(false)}
                className="px-3 py-1 rounded-xl bg-[var(--bg-elevated)] text-xs font-black text-[var(--text-primary)]"
              >
                ✕ Close
              </button>
            </div>

            <input
              type="text"
              placeholder="Search language..."
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] text-xs font-semibold text-[var(--text-primary)]"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangModal(false);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    selectedLang === lang.code
                      ? "bg-[#6C63FF] text-white border-[#6C63FF]"
                      : "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#6C63FF]/50"
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div>
                    <p className="text-xs font-black leading-tight">{lang.label}</p>
                    <p className="text-[10px] opacity-75">{lang.native}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RESET CACHE CONFIRM MODAL ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full glass-card p-6 sm:p-8 rounded-3xl shadow-2xl border border-[var(--border-default)] space-y-4 bg-[var(--bg-surface)]">
            <h3 className="font-black text-lg text-[var(--text-primary)]">Clear Learning Cache? 🧹</h3>
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              This will refresh all temporarily cached dashboard statistics and force fresh synchronization with the backend server.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-secondary)]"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCache}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white text-xs font-black shadow-md"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
