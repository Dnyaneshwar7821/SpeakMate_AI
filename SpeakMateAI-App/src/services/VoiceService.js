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

// --- Direct Explicit Lookup for Google TTS & System Voices (Android & iOS) ---
const DIRECT_VOICE_GENDERS = {
  // US (American)
  // Female
  'en-us-x-sfg-local': 'female',
  'en-us-x-sfg-network': 'female',
  'en-us-x-iom-local': 'female',
  'en-us-x-iom-network': 'female',
  'en-us-x-iol-local': 'female',
  'en-us-x-iol-network': 'female',
  'en-us-x-rgf-local': 'female',
  'en-us-x-rgf-network': 'female',
  // Male
  'en-us-x-tpf-local': 'male',
  'en-us-x-tpf-network': 'male',
  'en-us-x-iog-local': 'male',
  'en-us-x-iog-network': 'male',
  'en-us-x-tpc-local': 'male',
  'en-us-x-tpc-network': 'male',
  
  // UK (British)
  // Female
  'en-gb-x-gba-local': 'female',
  'en-gb-x-gba-network': 'female',
  'en-gb-x-gbb-local': 'female',
  'en-gb-x-gbb-network': 'female',
  'en-gb-x-gbf-local': 'female',
  'en-gb-x-gbf-network': 'female',
  'en-gb-x-gbg-local': 'female',
  'en-gb-x-gbg-network': 'female',
  'en-gb-x-fis-local': 'female',
  'en-gb-x-fis-network': 'female',
  // Male
  'en-gb-x-gbc-local': 'male',
  'en-gb-x-gbc-network': 'male',
  'en-gb-x-gbd-local': 'male',
  'en-gb-x-gbd-network': 'male',
  'en-gb-x-rjs-local': 'male',
  'en-gb-x-rjs-network': 'male',

  // AU (Australian)
  // Female
  'en-au-x-aub-local': 'female',
  'en-au-x-aub-network': 'female',
  'en-au-x-auc-local': 'female',
  'en-au-x-auc-network': 'female',
  'en-au-x-auf-local': 'female',
  'en-au-x-auf-network': 'female',
  'en-au-x-aug-local': 'female',
  'en-au-x-aug-network': 'female',
  'en-au-x-aum-local': 'female',
  'en-au-x-aum-network': 'female',
  'en-au-x-cta-local': 'female',
  'en-au-x-cta-network': 'female',
  'en-au-x-ctc-local': 'female',
  'en-au-x-ctc-network': 'female',
  // Male
  'en-au-x-aud-local': 'male',
  'en-au-x-aud-network': 'male',
  'en-au-x-ctb-local': 'male',
  'en-au-x-ctb-network': 'male',
  'en-au-x-ctd-local': 'male',
  'en-au-x-ctd-network': 'male',

  // IN (Indian)
  // Female
  'en-in-x-inf-local': 'female',
  'en-in-x-inf-network': 'female',
  'en-in-x-ing-local': 'female',
  'en-in-x-ing-network': 'female',
  'en-in-x-inm-local': 'female',
  'en-in-x-inm-network': 'female',
  'en-in-x-cbf-local': 'female',
  'en-in-x-cbf-network': 'female',
  'en-in-x-ena-local': 'female',
  'en-in-x-ena-network': 'female',
  'en-in-x-enc-local': 'female',
  'en-in-x-enc-network': 'female',
  // Male
  'en-in-x-ind-local': 'male',
  'en-in-x-ind-network': 'male',
  'en-in-x-inb-local': 'male',
  'en-in-x-inb-network': 'male',
  'en-in-x-inc-local': 'male',
  'en-in-x-inc-network': 'male',
  'en-in-x-end-local': 'male',
  'en-in-x-end-network': 'male',

  // CA (Canadian)
  // Female
  'en-ca-x-caa-local': 'female',
  'en-ca-x-caa-network': 'female',
  'en-ca-x-cad-local': 'female',
  'en-ca-x-cad-network': 'female',
  // Male
  'en-ca-x-cab-local': 'male',
  'en-ca-x-cab-network': 'male',
  'en-ca-x-cac-local': 'male',
  'en-ca-x-cac-network': 'male',
};

// --- Classifier to detect if a voice is female ---
const isFemalePattern = (id, name, voiceGender) => {
  if (voiceGender) {
    const g = String(voiceGender).toLowerCase();
    if (g === 'female') return true;
    if (g === 'male') return false;
  }

  const normId = String(id || '').toLowerCase().replace(/^.*:/, '');
  if (DIRECT_VOICE_GENDERS[normId]) {
    return DIRECT_VOICE_GENDERS[normId] === 'female';
  }

  const combined = `${name || ''} ${id || ''}`.toLowerCase();

  // Explicit male indicator substrings (checked first)
  const maleKeywords = [
    'david', 'daniel', 'george', 'alex', 'bruce', 'tom', 'fred', 'oliver', 'rishi',
    'ravi', 'prabhat', 'aaron', 'guy', 'mister', 'mike', 'james', 'mark', 'paul',
    'richard', 'robert', 'stephen', 'william', 'russell', 'neel', 'lee', 'male', 'man'
  ];
  if (maleKeywords.some(k => combined.includes(k))) {
    return false;
  }

  // Explicit female indicator substrings
  const femaleKeywords = [
    'samantha', 'victoria', 'karen', 'tessa', 'moira', 'fiona', 'catherine', 'cathy',
    'kate', 'serena', 'nicky', 'alice', 'allison', 'joanna', 'ivy', 'kendra', 'kimberly',
    'salli', 'emma', 'amy', 'jessa', 'claire', 'vicki', 'lekha', 'veena', 'heera', 'zira',
    'hazel', 'zosia', 'zoe', 'susan', 'aria', 'jenny', 'natasha', 'female', 'woman'
  ];
  if (femaleKeywords.some(k => combined.includes(k))) {
    return true;
  }

  // Wavenet / Neural / Standard letter check (A/C/E/G = Female, B/D/F = Male)
  const wavenetMatch = combined.match(/(wavenet|standard|neural2|journey)[-_ ]([a-g])/i);
  if (wavenetMatch) {
    const letter = wavenetMatch[2].toLowerCase();
    return ['a', 'c', 'e', 'g'].includes(letter);
  }

  // Siri Voice specific gender handling
  if (combined.includes('siri')) {
    if (combined.includes('voice 1') || combined.includes('voice 3') || combined.includes('voice_1') || combined.includes('voice_3')) {
      return false;
    }
    if (combined.includes('voice 2') || combined.includes('voice 4') || combined.includes('voice_2') || combined.includes('voice_4')) {
      return true;
    }
  }

  return false; // Default fallback to male
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
    if (normalized.includes('male') && !normalized.includes('female')) return 'male';
    if (normalized.includes('female')) return 'female';

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

      // Step 3: Fallback for male target: find first locale voice that is NOT explicitly female
      if (targetGender === 'male') {
        const notExplicitlyFemale = localeVoices.find(v => {
          const id = (v.identifier || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          const isFemale = isFemalePattern(id, name, v.gender);
          return !isFemale;
        });
        if (notExplicitlyFemale) return { voice: notExplicitlyFemale, isFallback: true };
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
    const isBritish = gs.includes('uk') || gs.includes('gb') || gs.includes('british');
    const isIndian = gs.includes('in') || gs.includes('indian');

    let targetGender = 'female';
    if (gs.includes('male') && !gs.includes('female')) {
      targetGender = (isBritish || isIndian) ? 'male' : 'female';
    } else if (gs.includes('female')) {
      targetGender = (isBritish || isIndian) ? 'female' : 'male';
    }

    let targetLocale = 'en-us';
    if      (isBritish)                                      targetLocale = 'en-gb';
    else if (isIndian)                                       targetLocale = 'en-in';
    else if (gs.includes('au') || gs.includes('australian')) targetLocale = 'en-au';
    else if (gs.includes('ca') || gs.includes('canadian'))   targetLocale = 'en-ca';

    const mapping = VoiceService.findBestVoice(availableVoices, targetLocale, targetGender);
    let selected = mapping && mapping.voice ? mapping.voice.identifier : null;

    // Safety validation override: ensure gender matches targetGender
    if (selected) {
      const selectedVoiceObj = availableVoices.find(v => v.identifier === selected);
      if (selectedVoiceObj) {
        const id = (selectedVoiceObj.identifier || '').toLowerCase();
        const name = (selectedVoiceObj.name || '').toLowerCase();
        const isFemale = isFemalePattern(id, name, selectedVoiceObj.gender);

        if (targetGender === 'female' && !isFemale) {
          // Scan for any confirmed female voice in the available voice pool
          const anyFemale = availableVoices.find(v => {
            const vid = (v.identifier || '').toLowerCase();
            const vname = (v.name || '').toLowerCase();
            return isFemalePattern(vid, vname, v.gender);
          });
          if (anyFemale) {
            selected = anyFemale.identifier;
          }
        } else if (targetGender === 'male' && isFemale) {
          // Scan for any confirmed male voice in the available voice pool (prefer Indian male if isIndian)
          let anyMale = isIndian ? availableVoices.find(v => {
            const vid = (v.identifier || '').toLowerCase();
            const vname = (v.name || '').toLowerCase();
            const vlang = (v.language || '').toLowerCase();
            return vlang.includes('in') && !isFemalePattern(vid, vname, v.gender);
          }) : null;

          if (!anyMale) {
            anyMale = availableVoices.find(v => {
              const vid = (v.identifier || '').toLowerCase();
              const vname = (v.name || '').toLowerCase();
              return !isFemalePattern(vid, vname, v.gender);
            });
          }

          if (anyMale) {
            selected = anyMale.identifier;
          }
        }
      }
    }

    return selected;
  },

  sanitizeTextForSpeech: (rawText) => {
    if (!rawText) return '';
    let t = String(rawText);

    // 0. Filter out reasoning / chain-of-thought blocks
    if (t.includes('Analyze User Input:') || t.includes('Identify Key Constraints:') || t.includes('Context:')) {
      const idx = t.lastIndexOf('\n\n');
      if (idx !== -1 && idx < t.length - 1) {
        t = t.substring(idx).trim();
      } else {
        t = '';
      }
    }

    // 1. If JSON, extract message or aiReply
    if (t.includes('{') && t.includes('}')) {
      try {
        const s = t.indexOf('{');
        const e = t.lastIndexOf('}');
        const parsed = JSON.parse(t.substring(s, e + 1));
        if (parsed.aiReply) t = parsed.aiReply;
        else if (parsed.message) t = parsed.message;
        else if (parsed.response) t = parsed.response;
      } catch (_) {}
    }

    // 2. Remove all bracketed tags e.g. [article], [grammar], [better_sentence], [vocabulary], etc.
    t = t.replace(/\[[^\]]*\]/g, '');

    // 3. Remove literal "dot dot dot", ellipses "...", "…", ".."
    t = t.replace(/\bdot\s*dot\s*dot\b/gi, '');
    t = t.replace(/\.{2,}/g, '');
    t = t.replace(/…/g, '');

    // 4. Remove Markdown markers & code fences
    t = t.replace(/```[\s\S]*?```/g, '');
    t = t.replace(/`([^`]+)`/g, '$1');
    t = t.replace(/[*#_~]/g, '');

    // 5. Remove stage directions / parentheticals e.g. (laughs), (smiling), (1-2 sentences)
    t = t.replace(/\([^)]{1,40}\)/g, '');

    // 6. Remove Emojis & special symbols
    t = t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');

    // 7. Clean up quotes, slashes, whitespace
    t = t.replace(/\\"/g, '"').replace(/\s+/g, ' ').trim();

    return t;
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

    const cleanedText = VoiceService.sanitizeTextForSpeech(text);
    if (!cleanedText) return;

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
    const isBritish = gs.includes('uk') || gs.includes('british') || gs.includes('gb');
    const isIndian = gs.includes('in') || gs.includes('indian');

    // ── 3. Locale resolution ──────────────────────────────────────────────────
    let targetLocale = voiceConfig?.locale?.toLowerCase().replace('_', '-') || 'en-us';
    if (!voiceConfig) {
      if      (isBritish)                                  targetLocale = 'en-gb';
      else if (isIndian)                                   targetLocale = 'en-in';
      else if (gs.includes('au') || gs.includes('australian')) targetLocale = 'en-au';
      else if (gs.includes('ca') || gs.includes('canadian')) targetLocale = 'en-ca';
    }

    // ── 4. Gender logic ──────────────────────────────────────────────────────
    let targetGender = voiceConfig?.gender || 'female';
    if (!voiceConfig) {
      if (gs.includes('male') && !gs.includes('female')) {
        targetGender = (isBritish || isIndian) ? 'male' : 'female';
      } else if (gs.includes('female')) {
        targetGender = (isBritish || isIndian) ? 'female' : 'male';
      }
    }

    // ── 5. Pitch & rate ───────────────────────────────────────────────────────
    let pitch = 1.0;
    let rate  = Number(effectiveSpeed) || 1.0;

    // Align with Web App Voice Profiles
    if (gs.includes('in') && gs.includes('male') && !gs.includes('female')) {
      pitch = 0.95; // Exact Web App Indian Male pitch
      rate  = 1.02 * (Number(effectiveSpeed) || 1.0);
    } else if (gs.includes('in') && gs.includes('female')) {
      pitch = 1.12; // Exact Web App Indian Female pitch
      rate  = 1.02 * (Number(effectiveSpeed) || 1.0);
    }

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
      
      // If resolving male requested voice to a female voice fallback, apply Web App pitch-shift
      const voiceObj = voices.find(v => v.identifier === systemVoiceId);
      if (voiceObj && gs.includes('male') && !gs.includes('female')) {
        const vid = (voiceObj.identifier || '').toLowerCase();
        const vname = (voiceObj.name || '').toLowerCase();
        if (isFemalePattern(vid, vname, voiceObj.gender)) {
          options.pitch = 0.88; // Match Web App fallback male pitch
        }
      }
    }

    // ── 7. Speak ──────────────────────────────────────────────────────────────
    try {
      Speech.stop();
      Speech.speak(cleanedText, options);
    } catch (e) {
      console.warn('[VoiceService] Speech.speak failed:', e);
      if (onError) onError(e);
    }
  },

  speakSequential: async (segments = [], options = {}, pauseMs = 400) => {
    if (!segments || segments.length === 0) return;
    if (options.isMuted) return;

    try {
      Speech.stop();
    } catch {}

    const cleanSegments = segments
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);

    if (cleanSegments.length === 0) return;

    for (let i = 0; i < cleanSegments.length; i++) {
      const seg = cleanSegments[i];
      await new Promise((resolve) => {
        let finished = false;
        const done = () => {
          if (!finished) {
            finished = true;
            resolve();
          }
        };

        // Safety fallback timeout in case TTS onDone event fails on some Android devices
        const timeout = setTimeout(done, 12000);

        VoiceService.speak(seg, {
          ...options,
          onDone: () => {
            clearTimeout(timeout);
            done();
          },
          onError: () => {
            clearTimeout(timeout);
            done();
          },
        });
      });

      if (i < cleanSegments.length - 1) {
        await new Promise((r) => setTimeout(r, pauseMs));
      }
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
