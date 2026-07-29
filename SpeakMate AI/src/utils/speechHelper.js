// src/utils/speechHelper.js

export const VOICE_PROFILES = [
  { code: 'US Male', accent: 'American', locale: 'en-US', gender: 'male', label: 'American - Male' },
  { code: 'US Female', accent: 'American', locale: 'en-US', gender: 'female', label: 'American - Female' },
  { code: 'UK Male', accent: 'British', locale: 'en-GB', gender: 'male', label: 'British - Male' },
  { code: 'UK Female', accent: 'British', locale: 'en-GB', gender: 'female', label: 'British - Female' },
  { code: 'AU Male', accent: 'Australian', locale: 'en-AU', gender: 'male', label: 'Australian - Male' },
  { code: 'AU Female', accent: 'Australian', locale: 'en-AU', gender: 'female', label: 'Australian - Female' },
  { code: 'IN Male', accent: 'Indian', locale: 'en-IN', gender: 'male', label: 'Indian - Male' },
  { code: 'IN Female', accent: 'Indian', locale: 'en-IN', gender: 'female', label: 'Indian - Female' },
  { code: 'Default', accent: 'System Default', locale: 'en-US', gender: 'female', label: 'System Default' },
];

export const VOICE_PERSONAS = [
  {
    key: "Friendly",
    label: "Friendly Persona",
    icon: "💬",
    desc: "Warm, supportive, and encouraging tone",
    pitch: 1.15,
    rate: 1.0,
    gender: "female",
    previewText: "Hello there! I am your friendly AI English tutor. I'm excited to practice English with you!",
  },
  {
    key: "Professional",
    label: "Professional Executive",
    icon: "💼",
    desc: "Formal, polished business tone",
    pitch: 0.9,
    rate: 0.9,
    gender: "male",
    previewText: "Hello. I am your professional AI tutor. Let's work together to polish your English communication skills.",
  },
  {
    key: "Energetic",
    label: "Energetic Coach",
    icon: "⚡",
    desc: "High energy, fast-paced practice",
    pitch: 1.15,
    rate: 1.2,
    gender: "female",
    previewText: "Hey! Ready to level up your English? Let's get started and have some fun speaking!",
  },
  {
    key: "Calm",
    label: "Calm Tutor",
    icon: "🌧️",
    desc: "Relaxed, patient guidance and soft pace",
    pitch: 0.95,
    rate: 0.85,
    gender: "male",
    previewText: "Welcome. I am your calm AI tutor. We will practice English step by step at your own pace.",
  },
  {
    key: "Teacher",
    label: "Patient Teacher",
    icon: "🏫",
    desc: "Detailed corrections and step-by-step guidance",
    pitch: 1.05,
    rate: 0.95,
    gender: "female",
    previewText: "Hello. I am your English teacher. Today we will focus on building your confidence in speaking.",
  },
  {
    key: "Native Speaker",
    label: "Native Speaker",
    icon: "🌐",
    desc: "Natural, fluent conversational flow",
    pitch: 1.0,
    rate: 1.05,
    gender: "male",
    previewText: "Hey friend! I'm your native speaker tutor. Let's practice speaking naturally and fluently.",
  },
];

export const getSavedVoiceSettings = () => {
  const voiceCode = localStorage.getItem("speakmate_ai_voice") || localStorage.getItem("speakmate_voice_persona") || "Friendly";
  const accent = localStorage.getItem("speakmate_voice_accent") || "US";
  const selectedVoiceName = localStorage.getItem("speakmate_voice_name") || "";
  const customPitch = localStorage.getItem("speakmate_voice_pitch");
  const customRate = localStorage.getItem("speakmate_speech_rate") || "1.0";

  // Check if voiceCode matches a VOICE_PROFILE
  const profile = VOICE_PROFILES.find((p) => p.code === voiceCode);
  const personaObj = VOICE_PERSONAS.find((p) => p.key === voiceCode) || VOICE_PERSONAS[0];

  let targetLang = accent === "UK" ? "en-GB" : accent === "AU" ? "en-AU" : accent === "IN" ? "en-IN" : "en-US";
  let gender = personaObj.gender;
  let pitch = customPitch ? parseFloat(customPitch) : personaObj.pitch;
  let baseRate = personaObj.rate;

  if (profile) {
    if (profile.locale) targetLang = profile.locale;
    if (profile.gender) gender = profile.gender;
    if (profile.code.includes("Male")) {
      pitch = 0.9;
    } else if (profile.code.includes("Female")) {
      pitch = 1.1;
    }
  }

  return {
    voiceCode,
    profile,
    personaObj,
    accent,
    gender,
    selectedVoiceName,
    pitch,
    rateMultiplier: parseFloat(customRate),
    lang: targetLang,
    baseRate,
  };
};

export const applyGlobalVoiceSettings = (utterance, speedMultiplier = 1.0) => {
  if (!utterance || typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const settings = getSavedVoiceSettings();
  utterance.lang = settings.lang;
  utterance.pitch = settings.pitch;
  utterance.rate = settings.baseRate * settings.rateMultiplier * speedMultiplier;

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    let targetVoice = null;

    // 1. Explicit user selection by voice name
    if (settings.selectedVoiceName) {
      targetVoice = voices.find((v) => v.name === settings.selectedVoiceName);
    }

    // 2. Matching language & gender preference (Male/Female)
    if (!targetVoice) {
      const targetLangPrefix = settings.lang.toLowerCase();
      const isMale = settings.gender === "male";
      
      // Match exact locale (e.g., en-US, en-GB, en-AU, en-IN) and gender
      targetVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-") === targetLangPrefix &&
          (isMale
            ? v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("george") || v.name.toLowerCase().includes("james") || v.name.toLowerCase().includes("rishi")
            : v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("susan") || v.name.toLowerCase().includes("samantha") || v.name.toLowerCase().includes("veena"))
      );
    }

    // 3. Fallback matching language prefix and gender
    if (!targetVoice) {
      const langPrefix = settings.lang.split("-")[0].toLowerCase();
      const isMale = settings.gender === "male";
      targetVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) &&
          (isMale
            ? v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("george") || v.name.toLowerCase().includes("james")
            : v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("susan") || v.name.toLowerCase().includes("samantha"))
      );
    }

    // 4. Fallback matching any voice of the language
    if (!targetVoice) {
      targetVoice = voices.find((v) => v.lang.toLowerCase().startsWith(settings.lang.split("-")[0].toLowerCase()));
    }

    // 5. Ultimate fallback
    if (!targetVoice && voices.length > 0) {
      targetVoice = voices[0];
    }

    if (targetVoice) {
      utterance.voice = targetVoice;
    }
  }
};

export const speakGlobalText = (text, speedMultiplier = 1.0, options = {}) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return null;

  try {
    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
  } catch (e) {}

  const cleanText = text.replace(/[*_#`~]/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);

  if (options.onstart) utterance.onstart = options.onstart;
  if (options.onboundary) utterance.onboundary = options.onboundary;
  if (options.onend) utterance.onend = options.onend;
  if (options.onerror) utterance.onerror = options.onerror;

  const doSpeak = () => {
    try {
      window.speechSynthesis.resume();
      applyGlobalVoiceSettings(utterance, speedMultiplier);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis execution error:", e);
    }
  };

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
    };
    setTimeout(doSpeak, 350);
  } else {
    doSpeak();
  }

  return utterance;
};
