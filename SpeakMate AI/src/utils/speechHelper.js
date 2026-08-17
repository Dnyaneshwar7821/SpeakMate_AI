// src/utils/speechHelper.js
import { EventBus, AVATAR_EVENTS } from "../services/live2d/EventBus";

export const VOICE_PROFILES = [
  { code: 'US Male', accent: 'American', locale: 'en-US', gender: 'male', label: 'American - Male', previewText: 'Hello, I am your American Male English tutor.' },
  { code: 'US Female', accent: 'American', locale: 'en-US', gender: 'female', label: 'American - Female', previewText: 'Hello, I am your American Female English tutor.' },
  { code: 'UK Male', accent: 'British', locale: 'en-GB', gender: 'male', label: 'British - Male', previewText: 'Hello, I am your British Male English tutor.' },
  { code: 'UK Female', accent: 'British', locale: 'en-GB', gender: 'female', label: 'British - Female', previewText: 'Hello, I am your British Female English tutor.' },
  { code: 'AU Male', accent: 'Australian', locale: 'en-AU', gender: 'male', label: 'Australian - Male', previewText: 'Hello, I am your Australian Male English tutor.' },
  { code: 'AU Female', accent: 'Australian', locale: 'en-AU', gender: 'female', label: 'Australian - Female', previewText: 'Hello, I am your Australian Female English tutor.' },
  { code: 'IN Male', accent: 'Indian', locale: 'en-IN', gender: 'male', label: 'Indian - Male', previewText: 'Hello, I am your Indian Male English tutor.' },
  { code: 'IN Female', accent: 'Indian', locale: 'en-IN', gender: 'female', label: 'Indian - Female', previewText: 'Hello, I am your Indian Female English tutor.' },
  { code: 'Default', accent: 'System Default', locale: 'en-US', gender: 'female', label: 'System Default', previewText: 'Hello, I am your System Default English tutor.' },
];

export const ACCENT_LIST = [
  { code: 'US', label: 'American English (US)', flag: '🇺🇸' },
  { code: 'UK', label: 'British English (UK)', flag: '🇬🇧' },
  { code: 'AU', label: 'Australian English (AU)', flag: '🇦🇺' },
  { code: 'IN', label: 'Indian English (IN)', flag: '🇮🇳' },
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
    previewText: "Hello, I am your Friendly Persona English tutor.",
  },
  {
    key: "Professional",
    label: "Professional Executive",
    icon: "💼",
    desc: "Formal, polished business tone",
    pitch: 0.9,
    rate: 0.9,
    gender: "male",
    previewText: "Hello, I am your Professional Executive English tutor.",
  },
  {
    key: "Energetic",
    label: "Energetic Coach",
    icon: "⚡",
    desc: "High energy, fast-paced practice",
    pitch: 1.15,
    rate: 1.2,
    gender: "female",
    previewText: "Hello, I am your Energetic Coach English tutor.",
  },
  {
    key: "Calm",
    label: "Calm Tutor",
    icon: "🌧️",
    desc: "Relaxed, patient guidance and soft pace",
    pitch: 0.95,
    rate: 0.85,
    gender: "male",
    previewText: "Hello, I am your Calm Tutor English tutor.",
  },
  {
    key: "Teacher",
    label: "Patient Teacher",
    icon: "🏫",
    desc: "Detailed corrections and step-by-step guidance",
    pitch: 1.05,
    rate: 0.95,
    gender: "female",
    previewText: "Hello, I am your Patient Teacher English tutor.",
  },
  {
    key: "Native Speaker",
    label: "Native Speaker",
    icon: "🌐",
    desc: "Natural, fluent conversational flow",
    pitch: 1.0,
    rate: 1.05,
    gender: "male",
    previewText: "Hello, I am your Native Speaker English tutor.",
  },
];

export const getSavedVoiceSettings = (overrideVoiceCode = null) => {
  const aiVoice = overrideVoiceCode || localStorage.getItem("speakmate_ai_voice") || "Default";
  const onboardingVoice = localStorage.getItem("speakmate_onboarding_voice") || localStorage.getItem("speakmate_voice_persona") || "Friendly";
  const accent = localStorage.getItem("speakmate_voice_accent") || "US";
  const selectedVoiceName = localStorage.getItem("speakmate_voice_name") || "";
  const customPitch = localStorage.getItem("speakmate_voice_pitch");
  const customRate = localStorage.getItem("speakmate_speech_rate") || "1.0";

  const isDefault = aiVoice === "Default" || !aiVoice;
  const effectiveVoiceCode = isDefault ? onboardingVoice : aiVoice;

  // Check if effectiveVoiceCode matches a VOICE_PROFILE or VOICE_PERSONA
  const profile = VOICE_PROFILES.find((p) => p.code === effectiveVoiceCode);
  const personaObj = VOICE_PERSONAS.find((p) => p.key === effectiveVoiceCode) || VOICE_PERSONAS[0];

  let targetLang = accent === "UK" ? "en-GB" : accent === "AU" ? "en-AU" : accent === "IN" ? "en-IN" : "en-US";
  let gender = personaObj ? personaObj.gender : "female";
  let pitch = customPitch ? parseFloat(customPitch) : (personaObj ? personaObj.pitch : 1.0);
  let baseRate = personaObj ? personaObj.rate : 1.0;

  if (profile) {
    if (profile.locale) targetLang = profile.locale;
    if (profile.gender) gender = profile.gender;

    // Smooth, natural human speech rates & warm pitch profiles (Normal speed)
    if (profile.code === "US Male") {
      pitch = 0.98;
      baseRate = 1.05;
    } else if (profile.code === "US Female") {
      pitch = 1.08;
      baseRate = 1.05;
    } else if (profile.code === "UK Male") {
      pitch = 0.92;
      baseRate = 1.02;
    } else if (profile.code === "UK Female") {
      pitch = 1.08;
      baseRate = 1.02;
    } else if (profile.code === "AU Male") {
      pitch = 1.02;
      baseRate = 1.05;
    } else if (profile.code === "AU Female") {
      pitch = 1.15; // Bright distinct Australian female pitch
      baseRate = 1.04; // Fluent Australian female cadence
    } else if (profile.code === "IN Male") {
      pitch = 0.95;
      baseRate = 1.02;
    } else if (profile.code === "IN Female") {
      pitch = 1.12;
      baseRate = 1.02;
    }
  }

  return {
    aiVoice,
    onboardingVoice,
    effectiveVoiceCode,
    isDefault,
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

export const applyGlobalVoiceSettings = (utterance, speedMultiplier = 1.0, overrideVoiceCode = null) => {
  if (!utterance || typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const settings = getSavedVoiceSettings(overrideVoiceCode);
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

    const isMale = settings.gender === "male";
    const targetLangPrefix = settings.lang.toLowerCase(); // e.g. "en-us", "en-gb", "en-au", "en-in"
    const langBase = settings.lang.split("-")[0].toLowerCase(); // "en"

    // Profile-specific voice lists
    const US_MALE = ["guy", "david", "mark", "alex", "us male", "en-us"];
    const US_FEMALE = ["jenny", "zira", "samantha", "us female", "en-us"];
    const UK_MALE = ["ryan", "george", "oliver", "daniel", "malcolm", "uk male", "british", "en-gb"];
    const UK_FEMALE = ["sonia", "hazel", "fiona", "kate", "serena", "uk female", "british", "en-gb"];
    const AU_MALE = ["william", "russell", "au male", "australian", "en-au"];
    const AU_FEMALE = ["natasha", "catherine", "karen", "au female", "australian", "en-au"];
    const IN_MALE = ["prabhat", "rishi", "ravi", "in male", "indian", "en-in"];
    const IN_FEMALE = ["neerja", "veena", "heera", "kalpana", "ananya", "in female", "indian", "en-in", "hindi"];

    const MALE_NAMES = ["guy", "david", "mark", "alex", "tom", "chris", "george", "james", "ryan", "oliver", "daniel", "william", "russell", "prabhat", "rishi", "ravi", "male"];
    const FEMALE_NAMES = ["jenny", "zira", "samantha", "victoria", "karen", "susan", "sonia", "hazel", "fiona", "kate", "serena", "natasha", "catherine", "neerja", "veena", "heera", "female"];

    // Profile-driven targeted voice matching for AU Female (Explicitly excludes Indian & US female voices)
    if (settings.effectiveVoiceCode === "AU Female") {
      const EXCLUDE_IN_FEMALES = ["neerja", "veena", "heera", "kalpana", "ananya", "indian", "in-in", "zira", "jenny"];
      targetVoice = voices.find((v) =>
        (v.lang.toLowerCase().includes("au") || v.name.toLowerCase().includes("australia") || v.name.toLowerCase().includes("natasha") || v.name.toLowerCase().includes("catherine") || v.name.toLowerCase().includes("karen")) &&
        !MALE_NAMES.some((k) => v.name.toLowerCase().includes(k)) &&
        !EXCLUDE_IN_FEMALES.some((k) => v.name.toLowerCase().includes(k))
      );
      if (!targetVoice) {
        targetVoice = voices.find((v) =>
          (v.name.toLowerCase().includes("natasha") || v.name.toLowerCase().includes("catherine") || v.name.toLowerCase().includes("karen") || v.name.toLowerCase().includes("hazel") || v.name.toLowerCase().includes("fiona") || v.name.toLowerCase().includes("serena")) &&
          !MALE_NAMES.some((k) => v.name.toLowerCase().includes(k)) &&
          !EXCLUDE_IN_FEMALES.some((k) => v.name.toLowerCase().includes(k))
        );
      }
      if (!targetVoice) {
        targetVoice = voices.find((v) =>
          !MALE_NAMES.some((k) => v.name.toLowerCase().includes(k)) &&
          !EXCLUDE_IN_FEMALES.some((k) => v.name.toLowerCase().includes(k))
        );
      }
    } else if (settings.effectiveVoiceCode === "IN Female") {
      targetVoice = voices.find((v) =>
        (v.lang.toLowerCase().includes("in") || v.name.toLowerCase().includes("indian") || v.name.toLowerCase().includes("veena") || v.name.toLowerCase().includes("neerja") || v.name.toLowerCase().includes("heera")) &&
        !MALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      );
      if (!targetVoice) {
        targetVoice = voices.find((v) => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("jenny")) ||
                      voices.find((v) => FEMALE_NAMES.some((k) => v.name.toLowerCase().includes(k)));
      }
    } else if (settings.effectiveVoiceCode === "UK Female") {
      targetVoice = voices.find((v) =>
        v.lang.toLowerCase().includes("gb") && FEMALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      ) || voices.find((v) => UK_FEMALE.some((k) => v.name.toLowerCase().includes(k)));
    } else if (settings.effectiveVoiceCode === "UK Male") {
      targetVoice = voices.find((v) =>
        v.lang.toLowerCase().includes("gb") && MALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      ) || voices.find((v) => UK_MALE.some((k) => v.name.toLowerCase().includes(k)));
    } else if (settings.effectiveVoiceCode === "AU Male") {
      targetVoice = voices.find((v) =>
        AU_MALE.some((k) => v.name.toLowerCase().includes(k) || v.lang.toLowerCase().includes("au"))
      );
      if (!targetVoice) {
        targetVoice = voices.find((v) => v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("george") || v.name.toLowerCase().includes("chris") || v.name.toLowerCase().includes("alex")) ||
                      voices.find((v) => MALE_NAMES.some((k) => v.name.toLowerCase().includes(k)));
      }
    } else if (settings.effectiveVoiceCode === "US Male") {
      targetVoice = voices.find((v) =>
        v.lang.toLowerCase().includes("us") && (v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("male"))
      ) || voices.find((v) => US_MALE.some((k) => v.name.toLowerCase().includes(k)));
    } else if (settings.effectiveVoiceCode === "IN Male") {
      targetVoice = voices.find((v) =>
        (v.lang.toLowerCase().includes("in") || v.name.toLowerCase().includes("indian") || v.name.toLowerCase().includes("rishi") || v.name.toLowerCase().includes("prabhat")) &&
        !FEMALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      );
      if (!targetVoice) {
        targetVoice = voices.find((v) => MALE_NAMES.some((k) => v.name.toLowerCase().includes(k)));
      }
    }

    // Generic fallbacks if targetVoice not matched above
    if (!targetVoice) {
      const preferredKeywords = isMale ? MALE_NAMES : FEMALE_NAMES;
      const excludedKeywords = isMale ? FEMALE_NAMES : MALE_NAMES;

      const matchesGender = (v) => {
        const vName = v.name.toLowerCase();
        const hasPreferred = preferredKeywords.some((k) => vName.includes(k));
        const hasExcluded = excludedKeywords.some((k) => vName.includes(k));
        if (hasPreferred && !hasExcluded) return true;
        if (isMale && (vName.includes("david") || vName.includes("guy") || vName.includes("george") || vName.includes("male"))) return true;
        if (!isMale && (vName.includes("zira") || vName.includes("jenny") || vName.includes("samantha") || vName.includes("female"))) return true;
        return false;
      };

      targetVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().replace("_", "-") === targetLangPrefix &&
          (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("online") || v.name.toLowerCase().includes("google")) &&
          matchesGender(v)
      );

      if (!targetVoice) {
        targetVoice = voices.find(
          (v) => v.lang.toLowerCase().replace("_", "-") === targetLangPrefix && matchesGender(v)
        );
      }

      if (!targetVoice) {
        targetVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().replace("_", "-") === targetLangPrefix &&
            (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("online") || v.name.toLowerCase().includes("google"))
        );
      }

      if (!targetVoice) {
        targetVoice = voices.find((v) => v.lang.toLowerCase().replace("_", "-") === targetLangPrefix);
      }

      if (!targetVoice) {
        targetVoice = voices.find(
          (v) => v.lang.toLowerCase().startsWith(langBase) && matchesGender(v)
        );
      }
    }

    // Ultimate fallback
    if (!targetVoice && voices.length > 0) {
      targetVoice = voices[0];
    }

    if (targetVoice) {
      utterance.voice = targetVoice;

      // Fine-tune pitch for smooth natural clarity if fallback voice doesn't match gender
      const voiceIsFemale = FEMALE_NAMES.some((k) => targetVoice.name.toLowerCase().includes(k));
      const voiceIsMale = MALE_NAMES.some((k) => targetVoice.name.toLowerCase().includes(k));
      if (isMale && voiceIsFemale) {
        utterance.pitch = 0.88; // Subtle pitch-shift down for masculine depth
      } else if (!isMale && voiceIsMale) {
        utterance.pitch = 1.12; // Subtle pitch-shift up for feminine clarity
      }
    }
  }
};

export const warmupSpeechAutoplay = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.resume();
    const dummy = new SpeechSynthesisUtterance(" ");
    dummy.volume = 0.01;
    dummy.rate = 10;
    window.speechSynthesis.speak(dummy);
  } catch (_) {}
};

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  const unlockAudio = () => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (_) {}
  };
  window.addEventListener("click", unlockAudio, { passive: true });
  window.addEventListener("touchstart", unlockAudio, { passive: true });
}

export const speakGlobalText = (text, speedMultiplier = 1.0, options = {}) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return null;

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (e) {}

  const cleanText = text.replace(/[*_#`~]/g, "");
  const utterance = new SpeechSynthesisUtterance(cleanText);

  // Prevent Chromium garbage-collection bug that kills long speech
  window._activeUtterance = utterance;

  let keepAliveInterval = null;

  const cleanupKeepAlive = () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    window._activeUtterance = null;
  };

  utterance.onstart = (e) => {
    EventBus.emit(AVATAR_EVENTS.SPEECH_STARTED, { text: cleanText, speed: speedMultiplier });

    // Chrome keep-alive heartbeat (safely resumes without stopping speech)
    keepAliveInterval = setInterval(() => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 2500);

    if (options.onstart) options.onstart(e);
  };

  utterance.onboundary = (e) => {
    if (e.name === "word" || e.charIndex !== undefined) {
      const remaining = cleanText.substring(e.charIndex, e.charIndex + (e.charLength || 8));
      const word = remaining.split(/\s+/)[0] || "";
      EventBus.emit(AVATAR_EVENTS.LIP_SYNC_UPDATE, { word });
    }
    if (options.onboundary) options.onboundary(e);
  };

  utterance.onend = (e) => {
    cleanupKeepAlive();
    EventBus.emit(AVATAR_EVENTS.SPEECH_FINISHED);
    if (options.onend) options.onend(e);
  };

  utterance.onerror = (e) => {
    cleanupKeepAlive();
    EventBus.emit(AVATAR_EVENTS.SPEECH_FINISHED);
    if (options.onerror) options.onerror(e);
  };

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      applyGlobalVoiceSettings(utterance, speedMultiplier, options.overrideVoiceCode);
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
    setTimeout(doSpeak, 250);
  } else {
    doSpeak();
    setTimeout(() => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 150);
  }

  return utterance;
};

export function getCurrentVoiceGender() {
  if (typeof window === 'undefined') return 'female';
  try {
    const directGender = localStorage.getItem('speakmate_voice_gender');
    if (directGender === 'male' || directGender === 'female') return directGender;

    const savedVoice =
      localStorage.getItem('speakmate_ai_voice') ||
      localStorage.getItem('speakmate_voice_code') ||
      localStorage.getItem('speakmate_voice') ||
      localStorage.getItem('speakmate_voice_persona');

    if (savedVoice) {
      const match = VOICE_PROFILES.find((p) => p.code === savedVoice || p.label === savedVoice);
      if (match?.gender) return match.gender;

      const personaMatch = VOICE_PERSONAS.find((p) => p.key === savedVoice || p.label === savedVoice);
      if (personaMatch?.gender) return personaMatch.gender;

      const lower = savedVoice.toLowerCase();
      if (lower.includes('male') && !lower.includes('female')) return 'male';
      if (lower === 'professional' || lower === 'calm') return 'male';
    }
  } catch (e) {}
  return 'female';
}
