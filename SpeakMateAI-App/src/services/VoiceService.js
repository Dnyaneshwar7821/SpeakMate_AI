import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingVoiceService } from './OnboardingVoiceService';

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

// --- Direct Explicit Lookup for Google TTS Voices (Android Local & Network) ---
const DIRECT_VOICE_GENDERS = {
  'en-us-x-sfg-local': 'female',
  'en-us-x-sfg-network': 'female',
  'en-us-x-tpf-local': 'female',
  'en-us-x-tpf-network': 'female',
  'en-us-x-iol-local': 'female',
  'en-us-x-iol-network': 'female',
  'en-us-x-rgf-local': 'female',
  'en-us-x-rgf-network': 'female',
  'en-us-x-iom-local': 'male',
  'en-us-x-iom-network': 'male',
  'en-us-x-iog-local': 'male',
  'en-us-x-iog-network': 'male',
  'en-us-x-tpc-local': 'male',
  'en-us-x-tpc-network': 'male',
  
  'en-gb-x-gba-local': 'female',
  'en-gb-x-gba-network': 'female',
  'en-gb-x-gbb-local': 'female',
  'en-gb-x-gbb-network': 'female',
  'en-gb-x-gbc-local': 'male',
  'en-gb-x-gbc-network': 'male',
  'en-gb-x-gbd-local': 'male',
  'en-gb-x-gbd-network': 'male',
  'en-gb-x-gbf-local': 'female',
  'en-gb-x-gbf-network': 'female',
  'en-gb-x-gbg-local': 'female',
  'en-gb-x-gbg-network': 'female',
  'en-gb-x-rjs-local': 'male',
  'en-gb-x-rjs-network': 'male',
  'en-gb-x-fis-local': 'female',
  'en-gb-x-fis-network': 'female',

  'en-au-x-aud-local': 'female',
  'en-au-x-aud-network': 'female',
  'en-au-x-auf-local': 'female',
  'en-au-x-auf-network': 'female',
  'en-au-x-aug-local': 'female',
  'en-au-x-aug-network': 'female',
  'en-au-x-aum-local': 'male',
  'en-au-x-aum-network': 'male',
  'en-au-x-aub-local': 'male',
  'en-au-x-aub-network': 'male',
  'en-au-x-auc-local': 'male',
  'en-au-x-auc-network': 'male',
  'en-au-x-cta-local': 'female',
  'en-au-x-cta-network': 'female',
  'en-au-x-ctb-local': 'male',
  'en-au-x-ctb-network': 'male',
  'en-au-x-ctc-local': 'female',
  'en-au-x-ctc-network': 'female',
  'en-au-x-ctd-local': 'male',
  'en-au-x-ctd-network': 'male',

  'en-in-x-ind-local': 'female',
  'en-in-x-ind-network': 'female',
  'en-in-x-inf-local': 'female',
  'en-in-x-inf-network': 'female',
  'en-in-x-ing-local': 'female',
  'en-in-x-ing-network': 'female',
  'en-in-x-inm-local': 'male',
  'en-in-x-inm-network': 'male',
  'en-in-x-inb-local': 'male',
  'en-in-x-inb-network': 'male',
  'en-in-x-inc-local': 'male',
  'en-in-x-inc-network': 'male',

  'en-ca-x-caa-local': 'female',
  'en-ca-x-caa-network': 'female',
  'en-ca-x-cab-local': 'male',
  'en-ca-x-cab-network': 'male',
  'en-ca-x-cac-local': 'male',
  'en-ca-x-cac-network': 'male',
  'en-ca-x-cad-local': 'female',
  'en-ca-x-cad-network': 'female',
};

// --- Classifier to detect if a voice is female ---
const isFemalePattern = (id, name, voiceGender) => {
  if (voiceGender) {
    const g = voiceGender.toLowerCase();
    if (g === 'female') return true;
    if (g === 'male') return false;
  }

  const normId = id.replace(/^.*:/, ''); // removes service prefix
  if (DIRECT_VOICE_GENDERS[normId]) {
    return DIRECT_VOICE_GENDERS[normId] === 'female';
  }

  const combined = `${name} ${id}`;

  // Wavenet / Standard suffix letter check (A/C/E = Female, B/D/F = Male)
  const wavenetMatch = name.match(/(wavenet|standard|neural2)[-_]([a-f])/i);
  if (wavenetMatch) {
    const letter = wavenetMatch[2].toLowerCase();
    return ['a', 'c', 'e'].includes(letter);
  }

  const generalMatch = name.match(/[-_ ]([a-f])([-_ ]|$|\()/i);
  if (generalMatch) {
    const letter = generalMatch[1].toLowerCase();
    return ['a', 'c', 'e'].includes(letter);
  }

  // Siri Voice specific gender handling
  if (combined.includes('siri')) {
    if (combined.includes('voice 1') || combined.includes('voice 3') || combined.includes('voice_1') || combined.includes('voice_3')) {
      return false;
    }
    if (combined.includes('voice 2') || combined.includes('voice 4') || combined.includes('voice_2') || combined.includes('voice_4')) {
      return true;
    }
    return !id.includes('en-au');
  }

  // Name string indicators
  const femaleNames = [
    'samantha', 'victoria', 'karen', 'tessa', 'moira', 'fiona', 'catherine', 'cathy',
    'kate', 'serena', 'nicky', 'alice', 'allison', 'joanna', 'ivy', 'kendra', 'kimberly',
    'salli', 'emma', 'amy', 'jessa', 'claire', 'vicki', 'lekha', 'veena', 'zira', 'hazel',
    'zosia', 'zoe', 'susan', 'aria', 'female'
  ];
  if (femaleNames.some(n => combined.includes(n))) return true;

  const maleNames = [
    'david', 'daniel', 'george', 'alex', 'bruce', 'tom', 'fred', 'oliver', 'rishi',
    'aaron', 'guy', 'mister', 'mike', 'james', 'mark', 'paul', 'richard', 'robert',
    'stephen', 'william', 'neel', 'lee', 'diego', 'carlos', 'jorge', 'male'
  ];
  if (maleNames.some(n => combined.includes(n))) return false;

  // Suffix character heuristics fallback
  const matchX = id.match(/[-_]x[-_]([a-z0-9]+)/);
  if (matchX) {
    const code = matchX[1];
    const lastChar = code.charAt(code.length - 1);
    if (['f', 'd', 'e', 'h', 'j', 'g'].includes(lastChar)) {
      return code !== 'iog';
    }
  }

  return false; // Default fallback to male/unknown
};

const sortVoices = (voices) =>
  [...voices].sort((a, b) => {
    const qA = (a.quality || '').toLowerCase();
    const qB = (b.quality || '').toLowerCase();
    const rank = (q) => q.includes('enhanced') ? 2 : q.includes('default') ? 1 : 0;
    if (rank(qB) !== rank(qA)) return rank(qB) - rank(qA);
    return (a.identifier || '').localeCompare(b.identifier || '');
  });

export const VoiceService = {
  getVoiceProfile: (voiceCode) => {
    return VOICE_PROFILES.find((profile) => profile.code === voiceCode) || null;
  },

  resolveVoiceType: (voiceCode, onboardingVoiceStyle = 'Friendly') => {
    if (OnboardingVoiceService.isSystemDefault(voiceCode)) {
      return onboardingVoiceStyle || 'Friendly';
    }
    return voiceCode;
  },

  getAvatarGender: (voiceCode, onboardingVoiceStyle = 'Friendly') => {
    const resolvedVoice = VoiceService.resolveVoiceType(voiceCode, onboardingVoiceStyle);
    const profile = VoiceService.getVoiceProfile(resolvedVoice);
    if (profile?.gender) return profile.gender;

    const normalized = (resolvedVoice || '').toLowerCase();
    if (normalized.includes('female')) return 'female';
    if (normalized.includes('male')) return 'male';

    return 'female';
  },

  getAvailableEnglishVoices: async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const enVoices = voices.filter(v => (v.language || '').toLowerCase().startsWith('en'));
      return enVoices;
    } catch (e) {
      console.warn('[VoiceService] Failed to get available voices:', e);
      return [];
    }
  },

  findBestVoice: (availableVoices, targetLocale, targetGender) => {
    if (!availableVoices || availableVoices.length === 0) {
      return { voice: null, isFallback: true };
    }

    const loc = targetLocale.toLowerCase().replace('_', '-');
    const getLoc = (v) => (v.language || '').toLowerCase().replace('_', '-');

    const localeVoices = sortVoices(
      availableVoices.filter(v => getLoc(v).startsWith(loc))
    );

    if (localeVoices.length > 0) {
      // Step 1: Match target gender
      const exact = localeVoices.find(v => {
        const id = (v.identifier || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const isFemale = isFemalePattern(id, name, v.gender);
        return targetGender === 'female' ? isFemale : !isFemale;
      });
      if (exact) return { voice: exact, isFallback: false };

      // Step 2: Fallback for female target: find first locale voice that is NOT explicitly male
      if (targetGender === 'female') {
        const notExplicitlyMale = localeVoices.find(v => {
          const id = (v.identifier || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          const isMale = (v.gender && v.gender.toLowerCase() === 'male') ||
            name.includes('male') || id.includes('male') ||
            id.includes('iom') || id.includes('iog') || id.includes('rjs');
          return !isMale;
        });
        if (notExplicitlyMale) return { voice: notExplicitlyMale, isFallback: true };
      }

      // Fallback: Use first locale voice
      return { voice: localeVoices[0], isFallback: true, fallbackReason: 'Locale default' };
    }

    // Step 2: Match gender across any English locale
    const allEn = sortVoices(availableVoices.filter(v => getLoc(v).startsWith('en')));
    const sameGender = allEn.find(v => {
      const id = (v.identifier || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      const isFemale = isFemalePattern(id, name, v.gender);
      return targetGender === 'female' ? isFemale : !isFemale;
    });
    if (sameGender) return { voice: sameGender, isFallback: true, fallbackReason: 'Any English same-gender' };

    return { voice: availableVoices[0], isFallback: true, fallbackReason: 'System fallback' };
  },

  selectSystemVoice: (availableVoices, voiceCode) => {
    if (!availableVoices || availableVoices.length === 0) return null;

    const directMatch = availableVoices.find(v => v.identifier === voiceCode);
    if (directMatch) return directMatch.identifier;

    const gs = (voiceCode || '').toLowerCase();

    const isDefaultOrOnboarding = gs.includes('default') || 
                                  gs.includes('friendly') || 
                                  gs.includes('professional') || 
                                  gs.includes('calm') || 
                                  gs.includes('teacher') || 
                                  gs.includes('energetic') || 
                                  gs.includes('native');

    const isBritish = gs.includes('uk') || gs.includes('british') || gs.includes('gb');
    let targetGender = 'female';
    if (!isDefaultOrOnboarding) {
      if (gs.includes('female')) {
        targetGender = isBritish ? 'female' : 'male';
      } else if (gs.includes('male')) {
        targetGender = isBritish ? 'male' : 'female';
      }
    }

    let targetLocale = 'en-us';
    if      (gs.includes('us') || gs.includes('american'))   targetLocale = 'en-us';
    else if (gs.includes('uk') || gs.includes('gb') || gs.includes('british')) targetLocale = 'en-gb';
    else if (gs.includes('in') || gs.includes('indian'))     targetLocale = 'en-in';
    else if (gs.includes('au') || gs.includes('australian')) targetLocale = 'en-au';
    else if (gs.includes('ca') || gs.includes('canadian'))   targetLocale = 'en-ca';

    const mapping = VoiceService.findBestVoice(availableVoices, targetLocale, targetGender);
    let selected = mapping && mapping.voice ? mapping.voice.identifier : null;

    // Safety validation override: If a female voice is requested, but the matcher resolved
    // to a male voice (e.g. by locale default fallback), override and select a female voice.
    if (targetGender === 'female' && selected) {
      const selectedVoiceObj = availableVoices.find(v => v.identifier === selected);
      if (selectedVoiceObj) {
        const id = (selectedVoiceObj.identifier || '').toLowerCase();
        const name = (selectedVoiceObj.name || '').toLowerCase();
        const isFemale = isFemalePattern(id, name, selectedVoiceObj.gender);
        if (!isFemale) {
          // Scan for any confirmed female voice in the available voice pool
          const anyFemale = availableVoices.find(v => {
            const vid = (v.identifier || '').toLowerCase();
            const vname = (v.name || '').toLowerCase();
            return isFemalePattern(vid, vname, v.gender);
          });
          if (anyFemale) {
            selected = anyFemale.identifier;
          }
        }
      }
    }

    return selected;
  },

  speak: async (text, {
    isMuted        = false,
    voiceType      = 'Friendly',
    speechSpeed    = null,
    availableVoices = [],
    onStart,
    onDone,
    onError,
  } = {}) => {
    if (isMuted) return;

    // Load saved speech speed from AsyncStorage if not provided explicitly
    let effectiveSpeed = speechSpeed;
    if (effectiveSpeed === null || effectiveSpeed === undefined || isNaN(effectiveSpeed)) {
      try {
        const savedSpeed = await AsyncStorage.getItem('speakmate_voice_speed');
        if (savedSpeed) {
          effectiveSpeed = parseFloat(savedSpeed);
        }
      } catch (e) {
        // Fallback
      }
    }
    if (!effectiveSpeed || isNaN(effectiveSpeed)) {
      effectiveSpeed = 1.0;
    }

    // ── 1. Resolve System Default → onboarding-selected voice config ──────────
    let voiceConfig = null; // full config from OnboardingVoiceService
    let resolvedVoice = voiceType;

    if (OnboardingVoiceService.isSystemDefault(voiceType)) {
      voiceConfig = await OnboardingVoiceService.load();
      resolvedVoice = voiceConfig.style;
    }

    // ── 2. Ensure we have system voices ───────────────────────────────────────
    let voices = availableVoices;
    if (!voices || voices.length === 0) {
      try {
        const sysVoices = await Speech.getAvailableVoicesAsync();
        voices = sysVoices.filter(v => (v.language || '').toLowerCase().startsWith('en'));
      } catch (e) {
        console.warn('[VoiceService] Auto-fetch voices failed inside speak:', e);
      }
    }

    const gs = (resolvedVoice || '').toLowerCase();

    // ── 3. Locale resolution ──────────────────────────────────────────────────
    let targetLocale = voiceConfig?.locale?.toLowerCase().replace('_', '-') || 'en-us';
    if (!voiceConfig) {
      if      (gs.includes('uk') || gs.includes('british') || gs.includes('gb')) targetLocale = 'en-gb';
      else if (gs.includes('in') || gs.includes('indian'))                        targetLocale = 'en-in';
      else if (gs.includes('au') || gs.includes('australian'))                    targetLocale = 'en-au';
      else if (gs.includes('ca') || gs.includes('canadian'))                      targetLocale = 'en-ca';
    }

    // ── 4. Gender & swap logic ────────────────────────────────────────────────
    // Onboarding voices are always female — skip swap logic for them.
    let targetGender = voiceConfig?.gender || 'female';
    if (!voiceConfig) {
      const isBritish = gs.includes('uk') || gs.includes('british') || gs.includes('gb');
      if (gs.includes('female')) {
        targetGender = isBritish ? 'female' : 'male';
      } else if (gs.includes('male')) {
        targetGender = isBritish ? 'male' : 'female';
      }
    }

    // ── 5. Pitch & rate ───────────────────────────────────────────────────────
    let pitch = 1.0;
    let rate  = Number(effectiveSpeed) || 1.0;

    // ── 6. Build TTS options ──────────────────────────────────────────────────
    const options = {
      rate,
      pitch,
      language: 'en-US',
      onStart,
      onDone,
      onError: (err) => {
        console.warn('[VoiceService] TTS playback error:', err);
        if (onError) onError(err);
      },
    };

    if      (targetLocale === 'en-gb') options.language = 'en-GB';
    else if (targetLocale === 'en-in') options.language = 'en-IN';
    else if (targetLocale === 'en-au') options.language = 'en-AU';
    else if (targetLocale === 'en-ca') options.language = 'en-CA';
    else                               options.language = 'en-US';

    // Use the saved device voice identifier directly if available (onboarding config),
    // otherwise resolve via the normal system voice matching.
    const pinnedVoiceId = voiceConfig?.voiceIdentifier || null;
    const systemVoiceId = pinnedVoiceId || VoiceService.selectSystemVoice(voices, resolvedVoice);
    if (systemVoiceId) {
      options.voice = systemVoiceId;
    }

    // ── 7. Speak ──────────────────────────────────────────────────────────────
    try {
      Speech.stop();
      Speech.speak(text, options);
    } catch (e) {
      console.warn('[VoiceService] Speech.speak failed:', e);
      if (onError) onError(e);
    }
  },

  stop: () => {
    try {
      Speech.stop();
    } catch (e) {
      console.warn('[VoiceService] Speech.stop failed:', e);
    }
  },
};
