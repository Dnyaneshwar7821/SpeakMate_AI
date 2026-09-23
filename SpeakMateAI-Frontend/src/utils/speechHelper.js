// src/utils/speechHelper.js
import { EventBus, AVATAR_EVENTS } from "../services/live2d/EventBus";
import { getPrimaryVisemeForWord } from "./PhoneticVisemeEngine";
import { getAvatarById } from "../config/AvatarCatalog";

export const VOICE_PROFILES = [
  { code: 'US Male', accent: 'American', locale: 'en-US', gender: 'male', label: 'American - Male', previewText: 'Hello! I am your American English coach. Great to meet you!' },
  { code: 'US Female', accent: 'American', locale: 'en-US', gender: 'female', label: 'American - Female', previewText: "Hi there! I am your American English coach. Let's practice speaking together!" },
  { code: 'UK Male', accent: 'British', locale: 'en-GB', gender: 'male', label: 'British - Male', previewText: 'Good day! I am your British English tutor. Shall we practice speaking together?' },
  { code: 'UK Female', accent: 'British', locale: 'en-GB', gender: 'female', label: 'British - Female', previewText: 'Hello! I am your British English tutor. It is lovely to practice English with you.' },
  { code: 'AU Male', accent: 'Australian', locale: 'en-AU', gender: 'male', label: 'Australian - Male', previewText: "G'day! I am your Australian English tutor. Ready to practice speaking together mate?" },
  { code: 'AU Female', accent: 'Australian', locale: 'en-AU', gender: 'female', label: 'Australian - Female', previewText: "G'day! I am your Australian English tutor. Let's have a wonderful speaking session today!" },
  { code: 'IN Male', accent: 'Indian', locale: 'en-IN', gender: 'male', label: 'Indian - Male', previewText: 'Namaste! I am your Indian English tutor. Let us practice English conversation together.' },
  { code: 'IN Female', accent: 'Indian', locale: 'en-IN', gender: 'female', label: 'Indian - Female', previewText: 'Namaste! I am your Indian English tutor. I am delighted to help you master English speaking.' },
  { code: 'Haru', accent: 'Anime Coach', locale: 'en-US', gender: 'female', label: 'Haru (Anime Coach)', previewText: "Hello! I'm Haru, your AI speaking coach. Let's practice speaking English together!" },
  { code: 'Shizuku', accent: 'Academic Mentor', locale: 'en-US', gender: 'female', label: 'Shizuku (Academic Mentor)', previewText: 'Hello, I am Shizuku. Together we will master English grammar and conversational fluency step by step.' },
  { code: 'Robo-Paws', accent: 'Cute Mascot', locale: 'en-US', gender: 'cartoon', label: 'Robo-Paws (Cute Robot Cat)', previewText: 'Beep-boop! Hello superstar! I am Robo-Paws, your friendly robot cat English buddy!' },
  { code: 'Motu', accent: 'Jolly Friend', locale: 'en-IN', gender: 'cartoon', label: 'Motu (Cartoon Friend)', previewText: 'Arey wah, dost! I am Motu from Furfuri Nagar! Let us practice English with lots of fun and laughter!' },
  { code: 'Sparky', accent: 'Superhero Kid', locale: 'en-US', gender: 'kid', label: 'Sparky (Superhero Kid)', previewText: 'Power up! I am Sparky, your superhero English training partner! Let us conquer our daily goal!' },
  { code: 'Koharu', accent: 'Schoolgirl', locale: 'en-US', gender: 'female', label: 'Koharu (Cartoon Schoolgirl)', previewText: 'Yay! Hello! I am Koharu! Let us practice speaking English happily together today!' },
  { code: 'Haruto', accent: 'Explorer Kid', locale: 'en-US', gender: 'kid', label: 'Haruto (Cartoon Explorer)', previewText: 'Hey there explorer! I am Haruto! Grab your backpack and let us practice cool English words!' },
  { code: 'Mao', accent: 'Chibi Junior', locale: 'en-US', gender: 'female', label: 'Mao (Cute Chibi)', previewText: 'Hi! I am Mao! Let us learn fun new English words and speaking drills together!' },
  { code: 'Puppy', accent: 'Playful Pup', locale: 'en-US', gender: 'cartoon', label: 'Puppy (Playful Pup)', previewText: 'Woof! Hello best friend! I am your puppy pal! Let us play and speak cheerful English every day!' },
  { code: 'Wanko', accent: 'Playful Pup', locale: 'en-US', gender: 'cartoon', label: 'Puppy (Playful Pup)', previewText: 'Woof! Hello best friend! I am your puppy pal! Let us play and speak cheerful English every day!' },
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

export const isMaleVoiceCode = (code) => {
  const c = String(code || '').toLowerCase().trim();
  return c.includes('male') && !c.includes('female');
};

export const isFemaleVoiceCode = (code) => {
  const c = String(code || '').toLowerCase().trim();
  return c.includes('female') || c === 'haru' || c === 'shizuku';
};

export const getSavedVoiceSettings = (overrideVoiceCode = null) => {
  const currentAvatarModel = (localStorage.getItem("speakmate_avatar_model") || "haru").toLowerCase();
  const avatar = getAvatarById(currentAvatarModel);
  let aiVoice = overrideVoiceCode || localStorage.getItem("speakmate_ai_voice") || "Default";
  const onboardingVoice = localStorage.getItem("speakmate_onboarding_voice") || localStorage.getItem("speakmate_voice_persona") || "Friendly";
  const accent = localStorage.getItem("speakmate_voice_accent") || "US";
  const selectedVoiceName = localStorage.getItem("speakmate_voice_name") || "";
  const customPitch = localStorage.getItem("speakmate_voice_pitch");
  const customRate = localStorage.getItem("speakmate_speech_rate") || "1.0";

  // Automatic Avatar-Intrinsic Voice Resolution:
  // Cute cartoon & kid avatars have intrinsic voice personalities calibrated to their character design.
  // Adult human coaches (Haru & Chitose) default to their signature coach voices or respect user settings.
  if (!overrideVoiceCode) {
    if (avatar.category === "cartoon") {
      aiVoice = avatar.voiceProfile;
    } else if (avatar.id === "shizuku") {
      aiVoice = "Shizuku";
    } else if (avatar.id === "haru") {
      // If no valid voice or a male voice was stored, fallback to Haru
      if (aiVoice === "Default" || !aiVoice || isMaleVoiceCode(aiVoice)) {
        aiVoice = "Haru";
      }
    } else if (avatar.id === "chitose") {
      // If no valid voice or a female voice was stored, fallback to US Male
      if (aiVoice === "Default" || !aiVoice || isFemaleVoiceCode(aiVoice)) {
        aiVoice = "US Male";
      }
    }
  }

  const isDefault = aiVoice === "Default" || !aiVoice;
  const effectiveVoiceCode = isDefault ? onboardingVoice : aiVoice;

  // Check if effectiveVoiceCode matches a VOICE_PROFILE or VOICE_PERSONA
  const profile = VOICE_PROFILES.find((p) => p.code.toLowerCase() === effectiveVoiceCode.toLowerCase());
  const personaObj = VOICE_PERSONAS.find((p) => p.key === effectiveVoiceCode) || VOICE_PERSONAS[0];

  let targetLang = accent === "UK" ? "en-GB" : accent === "AU" ? "en-AU" : accent === "IN" ? "en-IN" : "en-US";
  let gender = personaObj ? personaObj.gender : "female";
  let pitch = customPitch ? parseFloat(customPitch) : (personaObj ? personaObj.pitch : 1.0);
  let baseRate = personaObj ? personaObj.rate : 1.0;

  if (profile) {
    if (profile.locale) targetLang = profile.locale;
    if (profile.gender) gender = profile.gender;

    // Dedicated sound profiles calibrated precisely for each regional voice:
    if (profile.code === "US Male") {
      pitch = 0.94;
      baseRate = 1.00;
    } else if (profile.code === "US Female") {
      pitch = 1.05;
      baseRate = 1.01;
    } else if (profile.code === "UK Male") {
      pitch = 0.88; // Deep, polished British tone
      baseRate = 0.94; // Measured British pacing
    } else if (profile.code === "UK Female") {
      pitch = 1.15; // Crisp, articulate British tone
      baseRate = 0.95; // Articulate British cadence
    } else if (profile.code === "AU Male") {
      pitch = 1.04; // Casual Aussie lilt
      baseRate = 1.05; // Upbeat tempo
    } else if (profile.code === "AU Female") {
      pitch = 1.22; // Bright Australian rising inflection
      baseRate = 1.04; // Lively tempo
    } else if (profile.code === "IN Male") {
      pitch = 0.97; // Resonant Indian English tone
      baseRate = 0.98; // Steady syllable-timed pacing
    } else if (profile.code === "IN Female") {
      pitch = 1.14; // Melodic Indian English cadence
      baseRate = 0.98; // Precise syllable timing
    } else if (profile.code === "Haru") {
      pitch = 1.16; // Warm, sweet anime coach
      baseRate = 1.02;
    } else if (profile.code === "Shizuku") {
      pitch = 1.06; // Calm, articulate academic mentor
      baseRate = 0.98;
    } else if (profile.code === "Robo-Paws") {
      pitch = 1.54; // Bright, joyful, high-energy robot cat mascot
      baseRate = 1.05;
    } else if (profile.code === "Motu") {
      pitch = 1.22; // Jolly, enthusiastic Indian cartoon friend
      baseRate = 1.04;
    } else if (profile.code === "Sparky") {
      pitch = 1.42; // Spirited superhero kid
      baseRate = 1.08;
    } else if (profile.code === "Koharu") {
      pitch = 1.40; // Cheerful cartoon schoolgirl
      baseRate = 1.04;
    } else if (profile.code === "Haruto") {
      pitch = 1.35; // Bright, adventurous schoolboy explorer
      baseRate = 1.05;
    } else if (profile.code === "Mao") {
      pitch = 1.52; // Adorable, high-spirited chibi tutor
      baseRate = 1.04;
    } else if (profile.code === "Wanko" || profile.code === "Puppy") {
      pitch = 1.46; // Playful, cute, lively puppy
      baseRate = 1.06;
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
  if (!voices || voices.length === 0) return;

  // 1. Explicit user selection by voice name (if saved in settings)
  if (settings.selectedVoiceName) {
    const exactVoice = voices.find((v) => v.name === settings.selectedVoiceName);
    if (exactVoice) {
      utterance.voice = exactVoice;
      return;
    }
  }

  const voiceCode = (settings.effectiveVoiceCode || "").trim();
  const lowerCode = voiceCode.toLowerCase();

  // Determine character archetype:
  const isCuteCartoonOrKid = [
    "robo-paws", "robopaws", "sparky", "koharu", "haruto", "mao", "puppy", "wanko"
  ].includes(lowerCode);
  const isMotu = lowerCode === "motu";
  const isShizuku = lowerCode === "shizuku";

  const MALE_NAMES = [
    "guy", "david", "mark", "alex", "tom", "chris", "george", "james",
    "ryan", "oliver", "daniel", "william", "russell", "prabhat", "rishi",
    "ravi", "richard", "sean", "fred", "eric", "steffan", "thomas",
    "alfie", "arthur", "harry", "ken", "jack", "madhav", "aravind",
    "karan", "rohan", "amit", "brian", "mike", "stephen", "andrew"
  ];

  const FEMALE_NAMES = [
    "jenny", "zira", "samantha", "victoria", "karen", "susan", "sonia",
    "hazel", "fiona", "kate", "serena", "natasha", "catherine", "libby",
    "mia", "annette", "neerja", "veena", "heera", "aria", "ana",
    "ava", "allison", "stephanie", "tessa", "moira", "flo", "ananya",
    "priya", "swara", "kalpana", "geeta", "sangeeta", "michelle", "alice",
    "clara", "julie", "laura", "emma", "olivia", "sophia", "chloe"
  ];

  const CUTE_CHILD_NAMES = ["ana", "child", "kid", "junior", "flo", "sweet", "youth"];
  const INDIAN_VOICE_NAMES = ["neerja", "heera", "veena", "kalpana", "ananya", "prabhat", "rishi", "ravi", "indian", "hindi"];

  const isMaleVoice = (v) => {
    if (!v) return false;
    const n = (v.name || "").toLowerCase();
    if (/\bfemale\b/i.test(n)) return false;
    if (/\bmale\b/i.test(n)) return true;
    return MALE_NAMES.some((k) => n.includes(k)) && !FEMALE_NAMES.some((k) => n.includes(k));
  };

  const isFemaleVoice = (v) => {
    if (!v) return false;
    const n = (v.name || "").toLowerCase();
    if (/\bfemale\b/i.test(n)) return true;
    if (/\bmale\b/i.test(n)) return false;
    return FEMALE_NAMES.some((k) => n.includes(k)) && !MALE_NAMES.some((k) => n.includes(k));
  };

  let targetVoice = null;

  // ─────────────────────────────────────────────────────────────
  // ARCHETYPE 1: CUTE CARTOON & KID AVATARS
  // ─────────────────────────────────────────────────────────────
  if (isCuteCartoonOrKid) {
    targetVoice = voices.find((v) =>
      CUTE_CHILD_NAMES.some((k) => (v.name || "").toLowerCase().includes(k)) &&
      !isMaleVoice(v)
    );

    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        return (
          (n.includes("jenny") || n.includes("aria") || n.includes("google us english") || n.includes("samantha") || n.includes("zira")) &&
          !isMaleVoice(v)
        );
      });
    }

    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        const l = (v.lang || "").toLowerCase();
        return l.startsWith("en") && isFemaleVoice(v) && (n.includes("natural") || n.includes("online") || n.includes("google"));
      });
    }

    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase();
        return l.startsWith("en") && isFemaleVoice(v);
      });
    }

    if (!targetVoice || isMaleVoice(targetVoice)) {
      if (!targetVoice && voices.length > 0) targetVoice = voices[0];
      utterance.pitch = Math.max(1.50, settings.pitch * 1.15);
      utterance.rate = Math.min(1.22, utterance.rate * 1.08);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ARCHETYPE 2: JOLLY INDIAN CARTOON FRIEND (Motu)
  // ─────────────────────────────────────────────────────────────
  else if (isMotu) {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (
        l.includes("in") ||
        n.includes("indian") ||
        n.includes("hindi") ||
        INDIAN_VOICE_NAMES.some((k) => n.includes(k))
      );
    });

    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        return n.includes("jenny") || n.includes("samantha") || n.includes("google us english") || n.includes("zira");
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ARCHETYPE 3: ACADEMIC MENTOR (Shizuku)
  // ─────────────────────────────────────────────────────────────
  else if (isShizuku) {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      return (
        (n.includes("jenny") || n.includes("sonia") || n.includes("samantha") || n.includes("google us english") || n.includes("zira")) &&
        !isMaleVoice(v)
      );
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase();
        return l.startsWith("en") && isFemaleVoice(v);
      });
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 1: US MALE (American Male / Chitose) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "us male" || lowerCode === "chitose") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l === "en-us" || l === "en_us") && isMaleVoice(v) &&
        (n.includes("guy") || n.includes("david") || n.includes("mark") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase();
        return (l === "en-us" || l === "en_us") && isMaleVoice(v);
      });
    }
    if (!targetVoice) {
      targetVoice = voices.find((v) => (v.lang || "").toLowerCase().startsWith("en") && isMaleVoice(v));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 2: US FEMALE (American Female / Haru) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "us female" || lowerCode === "haru") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l === "en-us" || l === "en_us") && isFemaleVoice(v) &&
        (n.includes("jenny") || n.includes("aria") || n.includes("zira") || n.includes("samantha") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase();
        return (l === "en-us" || l === "en_us") && isFemaleVoice(v);
      });
    }
    if (!targetVoice) {
      targetVoice = voices.find((v) => (v.lang || "").toLowerCase().startsWith("en") && isFemaleVoice(v));
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 3: UK MALE (British Male) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "uk male") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l.includes("gb") || l.includes("uk") || n.includes("british") || n.includes("united kingdom")) && isMaleVoice(v) &&
        (n.includes("george") || n.includes("ryan") || n.includes("oliver") || n.includes("daniel") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        const l = (v.lang || "").toLowerCase();
        return (l.includes("gb") || l.includes("uk") || n.includes("british") || n.includes("united kingdom")) && isMaleVoice(v);
      });
    }
    if (!targetVoice) {
      // Fallback: Use male voice with explicit British acoustic tuning
      targetVoice = voices.find((v) => isMaleVoice(v) && (v.lang || "").toLowerCase().startsWith("en"));
      utterance.pitch = 0.88;
      utterance.rate = 0.94 * speedMultiplier;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 4: UK FEMALE (British Female) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "uk female") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l.includes("gb") || l.includes("uk") || n.includes("british") || n.includes("united kingdom")) && isFemaleVoice(v) &&
        (n.includes("sonia") || n.includes("hazel") || n.includes("susan") || n.includes("libby") || n.includes("mia") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        const l = (v.lang || "").toLowerCase();
        return (l.includes("gb") || l.includes("uk") || n.includes("british") || n.includes("united kingdom")) && isFemaleVoice(v);
      });
    }
    if (!targetVoice) {
      // Fallback: Use female voice with explicit British acoustic tuning
      targetVoice = voices.find((v) => isFemaleVoice(v) && (v.lang || "").toLowerCase().startsWith("en"));
      utterance.pitch = 1.15;
      utterance.rate = 0.95 * speedMultiplier;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 5: AU MALE (Australian Male) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "au male") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l.includes("au") || n.includes("australia") || n.includes("australian")) && isMaleVoice(v) &&
        (n.includes("james") || n.includes("william") || n.includes("russell") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        const l = (v.lang || "").toLowerCase();
        return (l.includes("au") || n.includes("australia") || n.includes("australian")) && isMaleVoice(v);
      });
    }
    if (!targetVoice) {
      // Fallback: Use male voice with explicit Australian acoustic tuning
      targetVoice = voices.find((v) => isMaleVoice(v) && (v.lang || "").toLowerCase().startsWith("en"));
      utterance.pitch = 1.04;
      utterance.rate = 1.05 * speedMultiplier;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 6: AU FEMALE (Australian Female) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "au female") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l.includes("au") || n.includes("australia") || n.includes("australian")) && isFemaleVoice(v) &&
        (n.includes("catherine") || n.includes("natasha") || n.includes("annette") || n.includes("karen") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        const l = (v.lang || "").toLowerCase();
        return (l.includes("au") || n.includes("australia") || n.includes("australian")) && isFemaleVoice(v);
      });
    }
    if (!targetVoice) {
      // Fallback: Use female voice with explicit Australian acoustic tuning
      targetVoice = voices.find((v) => isFemaleVoice(v) && (v.lang || "").toLowerCase().startsWith("en"));
      utterance.pitch = 1.22;
      utterance.rate = 1.04 * speedMultiplier;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 7: IN MALE (Indian Male) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "in male") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l.includes("in") || n.includes("indian") || n.includes("hindi") || INDIAN_VOICE_NAMES.some((k) => n.includes(k))) && isMaleVoice(v) &&
        (n.includes("prabhat") || n.includes("ravi") || n.includes("rishi") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        const l = (v.lang || "").toLowerCase();
        return (l.includes("in") || n.includes("indian") || n.includes("hindi") || INDIAN_VOICE_NAMES.some((k) => n.includes(k))) && isMaleVoice(v);
      });
    }
    if (!targetVoice) {
      // Fallback: Use male voice with explicit Indian acoustic tuning
      targetVoice = voices.find((v) => isMaleVoice(v) && (v.lang || "").toLowerCase().startsWith("en"));
      utterance.pitch = 0.97;
      utterance.rate = 0.98 * speedMultiplier;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ── REGIONAL VOICE 8: IN FEMALE (Indian Female) ──
  // ─────────────────────────────────────────────────────────────
  else if (lowerCode === "in female") {
    targetVoice = voices.find((v) => {
      const n = (v.name || "").toLowerCase();
      const l = (v.lang || "").toLowerCase();
      return (l.includes("in") || n.includes("indian") || n.includes("hindi") || INDIAN_VOICE_NAMES.some((k) => n.includes(k))) && isFemaleVoice(v) &&
        (n.includes("neerja") || n.includes("heera") || n.includes("veena") || n.includes("ananya") || n.includes("natural") || n.includes("online") || n.includes("google"));
    });
    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const n = (v.name || "").toLowerCase();
        const l = (v.lang || "").toLowerCase();
        return (l.includes("in") || n.includes("indian") || n.includes("hindi") || INDIAN_VOICE_NAMES.some((k) => n.includes(k))) && isFemaleVoice(v);
      });
    }
    if (!targetVoice) {
      // Fallback: Use female voice with explicit Indian acoustic tuning
      targetVoice = voices.find((v) => isFemaleVoice(v) && (v.lang || "").toLowerCase().startsWith("en"));
      utterance.pitch = 1.14;
      utterance.rate = 0.98 * speedMultiplier;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GENERIC FALLBACKS
  // ─────────────────────────────────────────────────────────────
  if (!targetVoice) {
    const isTargetMale = settings.gender === "male";
    const targetLangPrefix = (settings.lang || "en-US").toLowerCase().replace("_", "-");
    const langBase = targetLangPrefix.split("-")[0];

    targetVoice = voices.find((v) => {
      const l = (v.lang || "").toLowerCase().replace("_", "-");
      const matchG = isTargetMale ? isMaleVoice(v) : isFemaleVoice(v);
      return l === targetLangPrefix && matchG;
    });

    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase().replace("_", "-");
        return l === targetLangPrefix;
      });
    }

    if (!targetVoice) {
      targetVoice = voices.find((v) => {
        const l = (v.lang || "").toLowerCase();
        const matchG = isTargetMale ? isMaleVoice(v) : isFemaleVoice(v);
        return l.startsWith(langBase) && matchG;
      });
    }

    if (!targetVoice && voices.length > 0) {
      if (!isTargetMale) {
        targetVoice = voices.find((v) => isFemaleVoice(v)) || voices[0];
      } else {
        targetVoice = voices.find((v) => isMaleVoice(v)) || voices[0];
      }
    }
  }

  if (targetVoice) {
    utterance.voice = targetVoice;

    // Safety pitch adjustment ONLY if target voice gender mismatches character:
    const voiceIsActuallyMale = isMaleVoice(targetVoice);
    const charIsMale = settings.gender === "male";

    if (isCuteCartoonOrKid) {
      if (voiceIsActuallyMale) {
        utterance.pitch = Math.max(1.48, utterance.pitch * 1.15);
      }
    } else if (!charIsMale && voiceIsActuallyMale) {
      utterance.pitch = Math.max(1.30, utterance.pitch * 1.15);
    } else if (charIsMale && !voiceIsActuallyMale) {
      utterance.pitch = Math.min(0.85, utterance.pitch * 0.90);
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

  const cleanText = text.replace(/[*_#`~]/g, "").trim();
  if (!cleanText) return null;

  // Global Speech Lock flag
  window._speakmate_ai_is_speaking = true;

  let keepAliveInterval = null;
  let wordTickerInterval = null;

  const startWordTicker = () => {
    if (wordTickerInterval) return;
    const words = cleanText.split(/\s+/).filter(Boolean);
    if (!words.length) return;
    let wordIdx = 0;
    const intervalMs = Math.max(180, Math.min(340, Math.round(230 / (speedMultiplier || 1.0))));

    // Emit initial word viseme immediately
    const firstWord = words[wordIdx++];
    const firstViseme = getPrimaryVisemeForWord(firstWord);
    EventBus.emit(AVATAR_EVENTS.LIP_SYNC_UPDATE, {
      word: firstWord,
      viseme: firstViseme.viseme,
      yVal: firstViseme.yVal,
      formVal: firstViseme.formVal,
    });

    wordTickerInterval = setInterval(() => {
      if (wordIdx < words.length && window._speakmate_ai_is_speaking) {
        const word = words[wordIdx++];
        const visemeObj = getPrimaryVisemeForWord(word);
        EventBus.emit(AVATAR_EVENTS.LIP_SYNC_UPDATE, {
          word,
          viseme: visemeObj.viseme,
          yVal: visemeObj.yVal,
          formVal: visemeObj.formVal,
        });
      } else {
        if (wordTickerInterval) {
          clearInterval(wordTickerInterval);
          wordTickerInterval = null;
        }
      }
    }, intervalMs);
  };

  EventBus.emit(AVATAR_EVENTS.SPEECH_STARTED, { text: cleanText, speed: speedMultiplier });

  // Chrome keep-alive heartbeat (safely resumes without interrupting speech)
  keepAliveInterval = setInterval(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }
  }, 1000);

  const cleanupKeepAlive = () => {
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }
    if (wordTickerInterval) {
      clearInterval(wordTickerInterval);
      wordTickerInterval = null;
    }
    window._activeUtterance = null;
  };

  const utterance = new SpeechSynthesisUtterance(cleanText);
  window._activeUtterance = utterance;

  utterance.onstart = (e) => {
    window._speakmate_ai_is_speaking = true;
    EventBus.emit(AVATAR_EVENTS.SPEECH_STARTED, { text: cleanText, speed: speedMultiplier });
    startWordTicker();
    if (options.onstart) options.onstart(e);
  };

  utterance.onboundary = (e) => {
    window._speakmate_ai_is_speaking = true;
    if (e.name === "word" || e.charIndex !== undefined) {
      const remaining = cleanText.substring(e.charIndex, e.charIndex + (e.charLength || 8));
      const word = remaining.split(/\s+/)[0] || "";
      const visemeObj = getPrimaryVisemeForWord(word);
      EventBus.emit(AVATAR_EVENTS.LIP_SYNC_UPDATE, {
        word,
        viseme: visemeObj.viseme,
        yVal: visemeObj.yVal,
        formVal: visemeObj.formVal,
      });
    }
    if (options.onboundary) options.onboundary(e);
  };

  const handleFinish = () => {
    cleanupKeepAlive();
    setTimeout(() => {
      if (!window.speechSynthesis?.speaking && !window.speechSynthesis?.pending) {
        window._speakmate_ai_is_speaking = false;
      }
      EventBus.emit(AVATAR_EVENTS.SPEECH_FINISHED);
      if (options.onend) options.onend();
    }, 200);
  };

  utterance.onend = () => {
    handleFinish();
  };

  utterance.onerror = (err) => {
    console.warn("[speechHelper] Speech playback warning/interrupted:", err);
    handleFinish();
  };

  const doSpeak = () => {
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      window.speechSynthesis.resume();
      applyGlobalVoiceSettings(utterance, speedMultiplier, options.overrideVoiceCode);
      window.speechSynthesis.speak(utterance);
      setTimeout(() => {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }, 60);
    } catch (e) {
      console.warn("[speechHelper] Speech execution error:", e);
      handleFinish();
    }
  };

  const voices = window.speechSynthesis.getVoices();
  let hasSpoken = false;
  if (!voices || voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      if (!hasSpoken) {
        hasSpoken = true;
        doSpeak();
      }
    };
    setTimeout(() => {
      if (!hasSpoken) {
        hasSpoken = true;
        doSpeak();
      }
    }, 150);
  } else {
    hasSpoken = true;
    doSpeak();
  }

  return utterance;
};

export async function speakGlobalSequential(segments = [], speedMultiplier = 1.0, pauseMs = 400, options = {}) {
  if (!segments || segments.length === 0) return;
  const cleanSegments = segments.map((s) => (typeof s === "string" ? s.trim() : "")).filter(Boolean);
  if (cleanSegments.length === 0) return;

  for (let i = 0; i < cleanSegments.length; i++) {
    const seg = cleanSegments[i];
    await new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      const timer = setTimeout(done, 12000);
      speakGlobalText(seg, speedMultiplier, {
        ...options,
        onend: () => {
          clearTimeout(timer);
          done();
        },
      });
    });

    if (i < cleanSegments.length - 1) {
      await new Promise((r) => setTimeout(r, pauseMs));
    }
  }
}

export function getCurrentVoiceGender() {
  if (typeof window === 'undefined') return 'female';
  try {
    const model = localStorage.getItem('speakmate_avatar_model');
    if (model) {
      const av = getAvatarById(model);
      if (av?.id) return av.id;
    }

    const directGender = localStorage.getItem('speakmate_voice_gender');
    if (directGender) return directGender;

    const savedVoice =
      localStorage.getItem('speakmate_ai_voice') ||
      localStorage.getItem('speakmate_voice_code') ||
      localStorage.getItem('speakmate_voice') ||
      localStorage.getItem('speakmate_voice_persona');

    if (savedVoice) {
      if (savedVoice === 'robopaws' || savedVoice === 'Robo-Paws' || savedVoice.toLowerCase().includes('robo')) {
        return 'robopaws';
      }
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
