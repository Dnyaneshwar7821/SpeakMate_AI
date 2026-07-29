// src/utils/speechHelper.js

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

    // Distinct pitch & cadence profiles for ALL 8 profiles
    if (profile.code === "US Male") {
      pitch = 0.95;
      baseRate = 1.0;
    } else if (profile.code === "US Female") {
      pitch = 1.12;
      baseRate = 1.0;
    } else if (profile.code === "UK Male") {
      pitch = 0.78; // Deep deliberate British male tone
      baseRate = 0.92; // Deliberate British cadence
    } else if (profile.code === "UK Female") {
      pitch = 1.18; // Refined British female pitch
      baseRate = 0.94; // Deliberate British female cadence
    } else if (profile.code === "AU Male") {
      pitch = 1.08; // Brisk, higher-pitched energetic Australian male
      baseRate = 1.12; // Fast upbeat Aussie cadence
    } else if (profile.code === "AU Female") {
      pitch = 1.02; // Crisp Australian female pitch
      baseRate = 1.10; // Brisk upbeat Aussie female cadence
    } else if (profile.code === "IN Male") {
      pitch = 0.70; // Ultra-deep resonant Indian male tone
      baseRate = 0.95;
    } else if (profile.code === "IN Female") {
      pitch = 1.32; // High warm feminine Indian tone
      baseRate = 0.88;
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
    const IN_FEMALE = ["neerja", "veena", "heera", "in female", "indian", "en-in", "hindi", "kalpana", "ananya"];

    const MALE_NAMES = ["guy", "david", "mark", "alex", "tom", "chris", "george", "james", "ryan", "oliver", "daniel", "william", "russell", "prabhat", "rishi", "ravi", "male"];
    const FEMALE_NAMES = ["jenny", "zira", "samantha", "victoria", "karen", "susan", "sonia", "hazel", "fiona", "kate", "serena", "natasha", "catherine", "neerja", "veena", "heera", "female"];

    // Profile-driven targeted voice matching
    if (settings.voiceCode === "UK Female") {
      targetVoice = voices.find((v) =>
        v.lang.toLowerCase().includes("gb") && FEMALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      ) || voices.find((v) => UK_FEMALE.some((k) => v.name.toLowerCase().includes(k)));
    } else if (settings.voiceCode === "AU Female") {
      targetVoice = voices.find((v) =>
        AU_FEMALE.some((k) => v.name.toLowerCase().includes(k) || v.lang.toLowerCase().includes("au"))
      );
      if (!targetVoice) {
        // Fallback to non-GB female voice (e.g. Victoria / Zira / Samantha) so it NEVER duplicates UK Female (Sonia/Hazel)!
        targetVoice = voices.find((v) => (v.lang.toLowerCase().includes("us") || v.lang.toLowerCase().includes("en")) && !v.lang.toLowerCase().includes("gb") && FEMALE_NAMES.some((k) => v.name.toLowerCase().includes(k)));
      }
    } else if (settings.voiceCode === "UK Male") {
      targetVoice = voices.find((v) =>
        v.lang.toLowerCase().includes("gb") && MALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      ) || voices.find((v) => UK_MALE.some((k) => v.name.toLowerCase().includes(k)));
    } else if (settings.voiceCode === "AU Male") {
      targetVoice = voices.find((v) =>
        AU_MALE.some((k) => v.name.toLowerCase().includes(k) || v.lang.toLowerCase().includes("au"))
      );
      if (!targetVoice) {
        targetVoice = voices.find((v) => v.name.toLowerCase().includes("mark") || v.name.toLowerCase().includes("george") || v.name.toLowerCase().includes("chris") || v.name.toLowerCase().includes("alex")) ||
                      voices.find((v) => MALE_NAMES.some((k) => v.name.toLowerCase().includes(k)));
      }
    } else if (settings.voiceCode === "US Male") {
      targetVoice = voices.find((v) =>
        v.lang.toLowerCase().includes("us") && (v.name.toLowerCase().includes("guy") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("male"))
      ) || voices.find((v) => US_MALE.some((k) => v.name.toLowerCase().includes(k)));
    } else if (settings.voiceCode === "IN Male") {
      targetVoice = voices.find((v) =>
        (v.lang.toLowerCase().includes("in") || v.name.toLowerCase().includes("indian") || v.name.toLowerCase().includes("rishi") || v.name.toLowerCase().includes("prabhat")) &&
        !FEMALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      );
      if (!targetVoice) {
        targetVoice = voices.find((v) => MALE_NAMES.some((k) => v.name.toLowerCase().includes(k)));
      }
    } else if (settings.voiceCode === "IN Female") {
      targetVoice = voices.find((v) =>
        (v.lang.toLowerCase().includes("in") || v.name.toLowerCase().includes("indian") || v.name.toLowerCase().includes("veena") || v.name.toLowerCase().includes("neerja") || v.name.toLowerCase().includes("heera")) &&
        !MALE_NAMES.some((k) => v.name.toLowerCase().includes(k))
      );
      if (!targetVoice) {
        targetVoice = voices.find((v) => FEMALE_NAMES.some((k) => v.name.toLowerCase().includes(k)));
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

      // Fine-tune pitch for clarity if fallback voice doesn't match gender
      const voiceIsFemale = FEMALE_NAMES.some((k) => targetVoice.name.toLowerCase().includes(k));
      const voiceIsMale = MALE_NAMES.some((k) => targetVoice.name.toLowerCase().includes(k));
      if (isMale && voiceIsFemale) {
        utterance.pitch = 0.78; // Deep pitch-shift down for masculine depth
      } else if (!isMale && voiceIsMale) {
        utterance.pitch = 1.25; // Bright pitch-shift up for feminine clarity
      }
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
