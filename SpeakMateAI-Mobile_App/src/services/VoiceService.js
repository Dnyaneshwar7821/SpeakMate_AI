import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingVoiceService } from './OnboardingVoiceService';
import { getAvatarById, getCachedAvatarModel } from '../config/AvatarCatalog';

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

/**
 * SpeakMate Centralized Avatar Voice Profiles
 * Provides tailored, natural acoustic differentiation (pitch, rate, locale, preferred voices)
 * ensuring all avatars sound distinct without unnatural distortion.
 */
export const AVATAR_VOICE_PROFILES = {
  haru: {
    avatarId: 'haru',
    name: 'Haru',
    category: 'human',
    intendedGender: 'female',
    voiceCode: 'US Female',
    targetLocale: 'en-US',
    basePitch: 1.00,
    baseRate: 1.00,
    preferredVoices: ['sfg', 'iol', 'rgf', 'samantha', 'victoria', 'karen', 'female'],
  },
  chitose: {
    avatarId: 'chitose',
    name: 'Chitose',
    category: 'human',
    intendedGender: 'male',
    voiceCode: 'US Male',
    targetLocale: 'en-US',
    basePitch: 0.94,
    baseRate: 0.98,
    preferredVoices: ['tpf', 'tpc', 'iog', 'david', 'alex', 'george', 'male'],
  },
  robopaws: {
    avatarId: 'robopaws',
    name: 'Robo-Paws',
    category: 'cartoon',
    intendedGender: 'female',
    voiceCode: 'Robo-Paws',
    targetLocale: 'en-IN',
    basePitch: 1.24,
    baseRate: 1.04,
    preferredVoices: ['cbf', 'inf', 'ena', 'iol', 'sfg', 'rgf', 'tessa', 'samantha', 'female'],
  },
  motu: {
    avatarId: 'motu',
    name: 'Motu',
    category: 'cartoon',
    intendedGender: 'male',
    voiceCode: 'Motu',
    targetLocale: 'en-IN',
    basePitch: 1.10,
    baseRate: 0.96,
    preferredVoices: ['ind', 'inc', 'inb', 'end', 'rishi', 'ravi', 'prabhat', 'tpc', 'tpf', 'male'],
  },
  sparky: {
    avatarId: 'sparky',
    name: 'Sparky',
    category: 'cartoon',
    intendedGender: 'male',
    voiceCode: 'Sparky',
    targetLocale: 'en-US',
    basePitch: 1.06,
    baseRate: 1.05,
    preferredVoices: ['tpf', 'tpc', 'iog', 'alex', 'david', 'daniel', 'male'],
  },
  wanko: {
    avatarId: 'wanko',
    name: 'Wanko',
    category: 'cartoon',
    intendedGender: 'cartoon',
    voiceCode: 'Wanko',
    targetLocale: 'en-US',
    basePitch: 1.32,
    baseRate: 1.04,
    preferredVoices: ['rgf', 'iol', 'sfg', 'karen', 'samantha', 'female'],
  },
  koharu: {
    avatarId: 'koharu',
    name: 'Koharu',
    category: 'cartoon',
    intendedGender: 'male',
    voiceCode: 'Koharu',
    targetLocale: 'en-US',
    basePitch: 1.20,
    baseRate: 1.03,
    preferredVoices: ['tpc', 'iog', 'tpf', 'alex', 'daniel', 'male'],
  },
  haruto: {
    avatarId: 'haruto',
    name: 'Haruto',
    category: 'cartoon',
    intendedGender: 'male',
    voiceCode: 'Haruto',
    targetLocale: 'en-US',
    basePitch: 1.25,
    baseRate: 1.05,
    preferredVoices: ['tpc', 'iog', 'daniel', 'alex', 'oliver', 'fred', 'tpf', 'male'],
  },
  tororo: {
    avatarId: 'tororo',
    name: 'Tororo',
    category: 'cartoon',
    intendedGender: 'female',
    voiceCode: 'Tororo',
    targetLocale: 'en-GB',
    basePitch: 1.36,
    baseRate: 0.96,
    preferredVoices: ['gba', 'gbb', 'fis', 'serena', 'iol', 'sfg', 'female'],
  },
  rexy: {
    avatarId: 'rexy',
    name: 'Rexy',
    category: 'cartoon',
    intendedGender: 'cartoon',
    voiceCode: 'Rexy',
    targetLocale: 'en-US',
    basePitch: 1.26,
    baseRate: 1.05,
    preferredVoices: ['rgf', 'iol', 'sfg', 'samantha', 'female'],
  },
};

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
    'richard', 'robert', 'stephen', 'william', 'russell', 'neel', 'lee', 'male', 'man',
    'tpf', 'iog', 'tpc', 'gbc', 'gbd', 'rjs', 'aud', 'ctb', 'ctd', 'ind', 'inc', 'inb', 'end', 'ene', 'enf'
  ];
  if (maleKeywords.some(k => combined.includes(k))) {
    return false;
  }

  // Explicit female indicator substrings
  const femaleKeywords = [
    'samantha', 'victoria', 'karen', 'tessa', 'moira', 'fiona', 'catherine', 'cathy',
    'kate', 'serena', 'nicky', 'alice', 'allison', 'joanna', 'ivy', 'kendra', 'kimberly',
    'salli', 'emma', 'amy', 'jessa', 'claire', 'vicki', 'lekha', 'veena', 'heera', 'zira',
    'hazel', 'zosia', 'zoe', 'susan', 'aria', 'jenny', 'natasha', 'female', 'woman',
    'sfg', 'iom', 'iol', 'rgf', 'gba', 'gbb', 'gbf', 'gbg', 'fis', 'aub', 'auc', 'auf', 'aug', 'aum',
    'cta', 'ctc', 'inf', 'ing', 'inm', 'cbf', 'ena', 'enc'
  ];
  if (femaleKeywords.some(k => combined.includes(k))) {
    return true;
  }

  // Indian locale voices default to female if not explicitly male
  if (combined.includes('en-in') || combined.includes('en_in') || combined.includes('india')) {
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
  getAvatarVoiceProfile: (avatarOrVoice) => {
    if (!avatarOrVoice) return AVATAR_VOICE_PROFILES.haru;
    const key = String(avatarOrVoice).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key.includes('motu') || key.includes('patlu')) return AVATAR_VOICE_PROFILES.motu;
    if (key.includes('robo') || key.includes('paws') || key.includes('doraemon')) return AVATAR_VOICE_PROFILES.robopaws;
    if (key.includes('sparky') || key.includes('hero')) return AVATAR_VOICE_PROFILES.sparky;
    if (key.includes('chitose') || key === 'male') return AVATAR_VOICE_PROFILES.chitose;
    if (key.includes('wanko') || key.includes('dog') || key.includes('puppy') || key.includes('shiba')) return AVATAR_VOICE_PROFILES.wanko;
    if (key.includes('koharu') || key.includes('ribbon') || key.includes('shizuku') || key.includes('mao')) return AVATAR_VOICE_PROFILES.koharu;
    if (key.includes('haruto') || key.includes('explorer') || key.includes('cap')) return AVATAR_VOICE_PROFILES.haruto;
    if (key.includes('tororo') || key.includes('kitty') || key.includes('cat') || key.includes('sakura')) return AVATAR_VOICE_PROFILES.tororo;
    if (key.includes('rexy') || key.includes('dino') || key.includes('trex')) return AVATAR_VOICE_PROFILES.rexy;
    if (key.includes('haru')) return AVATAR_VOICE_PROFILES.haru;
    return AVATAR_VOICE_PROFILES[key] || AVATAR_VOICE_PROFILES.haru;
  },

  selectSystemVoiceForAvatar: (availableVoices, avatarProfile, userSelectedAccent = null) => {
    if (!availableVoices || availableVoices.length === 0) return null;

    const isCartoon = avatarProfile.category === 'cartoon';

    // If user explicitly configured an accent in Settings, only override if it's a human coach
    // (cartoon avatars preserve their cute cartoon voice unless explicitly forced)
    if (!isCartoon && userSelectedAccent && userSelectedAccent !== 'Default' && !userSelectedAccent.toLowerCase().includes('friendly')) {
      const accentVoice = VoiceService.selectSystemVoice(availableVoices, userSelectedAccent);
      if (accentVoice) return accentVoice;
    }

    const targetLoc = (avatarProfile.targetLocale || 'en-US').toLowerCase();
    const wantsMale = avatarProfile.intendedGender === 'male';
    const wantsFemale = avatarProfile.intendedGender === 'female';

    // 1. Try matching preferred voice substrings for this specific avatar within the target locale
    if (avatarProfile.preferredVoices && avatarProfile.preferredVoices.length > 0) {
      for (const pref of avatarProfile.preferredVoices) {
        const found = availableVoices.find(v => {
          const id = (v.identifier || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          const lang = (v.language || '').toLowerCase().replace('_', '-');
          const matchesPref = id.includes(pref) || name.includes(pref);
          if (!matchesPref) return false;

          // Never pick deep mature woman voice (iol) for Haruto little boy voice
          if (avatarProfile.avatarId === 'haruto' && (id.includes('iol') || name.includes('iol'))) {
            return false;
          }

          const isFemale = isFemalePattern(id, name, v.gender);
          if (wantsMale && isFemale) return false;
          if (wantsFemale && !isFemale) return false;

          return lang.startsWith(targetLoc) || lang.startsWith('en');
        });
        if (found) return found.identifier;
      }
    }

    // 2. Target locale voices matching requested gender
    const locVoices = availableVoices.filter(v => (v.language || '').toLowerCase().replace('_', '-').startsWith(targetLoc));
    if (locVoices.length > 0) {
      if (wantsMale) {
        const maleVoice = locVoices.find(v => {
          const id = (v.identifier || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return !isFemalePattern(id, name, v.gender);
        });
        if (maleVoice) return maleVoice.identifier;
      } else if (wantsFemale) {
        const femaleVoice = locVoices.find(v => {
          const id = (v.identifier || '').toLowerCase();
          const name = (v.name || '').toLowerCase();
          return isFemalePattern(id, name, v.gender);
        });
        if (femaleVoice) return femaleVoice.identifier;
      }
    }

    // 3. Fallback across all English voices respecting requested gender
    if (wantsMale) {
      const anyMale = availableVoices.find(v => {
        const id = (v.identifier || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const lang = (v.language || '').toLowerCase();
        return lang.startsWith('en') && !isFemalePattern(id, name, v.gender);
      });
      if (anyMale) return anyMale.identifier;
    } else if (wantsFemale || isCartoon) {
      const anyFemale = availableVoices.find(v => {
        const id = (v.identifier || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const lang = (v.language || '').toLowerCase();
        return lang.startsWith('en') && isFemalePattern(id, name, v.gender);
      });
      if (anyFemale) return anyFemale.identifier;
    }

    // 4. Best voice general fallback
    const targetGender = wantsMale ? 'male' : 'female';
    const best = VoiceService.findBestVoice(availableVoices, targetLoc, targetGender);
    if (best && best.voice) {
      const bestId = (best.voice.identifier || '').toLowerCase();
      if (avatarProfile.avatarId === 'haruto' && bestId.includes('iol')) {
        const nonIol = availableVoices.find(v => {
          const vid = (v.identifier || '').toLowerCase();
          return !vid.includes('iol') && (v.language || '').toLowerCase().startsWith('en');
        });
        if (nonIol) return nonIol.identifier;
      }
      return best.voice.identifier;
    }

    return VoiceService.selectSystemVoice(availableVoices, targetGender === 'male' ? 'US Male' : 'Default');
  },

  getVoiceProfile: (voiceCode) => {
    return VOICE_PROFILES.find((profile) => profile.code === voiceCode) || null;
  },

  resolveVoiceType: (voiceCode, onboardingVoiceStyle = 'Friendly') => {
    if (OnboardingVoiceService.isSystemDefault(voiceCode)) {
      return onboardingVoiceStyle || 'Friendly';
    }
    return voiceCode || 'Friendly';
  },

  getAvatarGender: (voiceType, onboardingVoiceStyle = 'Friendly') => {
    if (!voiceType) return 'female';
    const vt = String(voiceType).toLowerCase();
    if (vt === 'robopaws' || vt === 'robocat' || vt === 'robot') return 'robopaws';
    if (vt === 'chitose') return 'male';
    if (vt === 'haru') return 'female';
    if (vt === 'male') return 'male';
    if (vt === 'female') return 'female';
    if (vt.includes('male') && !vt.includes('female')) return 'male';
    if (vt.includes('female')) return 'female';
    const avatar = getAvatarById(voiceType);
    if (avatar && avatar.gender) return avatar.gender;
    if (OnboardingVoiceService.isSystemDefault(voiceType)) {
      const style = (onboardingVoiceStyle || 'Friendly').toLowerCase();
      if (style.includes('male') && !style.includes('female')) return 'male';
      return 'female';
    }
    return 'female';
  },

  getAvatarModel: (avatarOrVoice) => {
    if (!avatarOrVoice) return 'haru';
    return getAvatarById(avatarOrVoice).id;
  },

  getEffectiveGender: (resolvedVoice) => {
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
            !isFemalePattern(id, name, v.gender);
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

      // If female requested and locale has voices, return first locale voice
      if (targetGender === 'female') {
        return { voice: localeVoices[0], isFallback: true, fallbackReason: 'Locale default' };
      }
    }

    // Step 2: Match gender across any English locale (Guarantees Male voice when requested)
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

  // ── Dedicated System Default / Onboarding Tutor Voice Resolution ────────
  resolveSystemDefaultVoice: (availableVoices) => {
    if (!availableVoices || availableVoices.length === 0) return null;

    const MALE_IDENTIFIERS = [
      'iol', 'iom', 'iog', 'tpf', 'tpc', 'gbc', 'gbd', 'rjs',
      'ind', 'inc', 'inb', 'end', 'david', 'george', 'daniel',
      'alex', 'guy', 'male'
    ];

    const isExcludedMale = (v) => {
      const id = (v.identifier || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      const gender = (v.gender || '').toLowerCase();
      if (gender === 'male') return true;
      return MALE_IDENTIFIERS.some(m => id.includes(m) || name.includes(m));
    };

    // 1. Google TTS US standard female tutor voice 'sfg' (Voice I) - highest priority
    const sfg = availableVoices.find(v => {
      const id = (v.identifier || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      return (id.includes('sfg') || name.includes('sfg')) && !isExcludedMale(v);
    });
    if (sfg) return sfg.identifier;

    // 2. Known female voices across Android / iOS
    const knownFemale = availableVoices.find(v => {
      const id = (v.identifier || '').toLowerCase();
      const name = (v.name || '').toLowerCase();
      const hasFemaleId = id.includes('rgf') || id.includes('cbf') ||
                          id.includes('samantha') || id.includes('victoria') ||
                          id.includes('karen') || id.includes('zira') ||
                          name.includes('female') || id.includes('female');
      return hasFemaleId && !isExcludedMale(v);
    });
    if (knownFemale) return knownFemale.identifier;

    // 3. Any English voice with explicit gender === 'female' and not in male list
    const explicitFemale = availableVoices.find(v => {
      const lang = (v.language || '').toLowerCase().replace('_', '-');
      const g = (v.gender || '').toLowerCase();
      return lang.startsWith('en') && g === 'female' && !isExcludedMale(v);
    });
    if (explicitFemale) return explicitFemale.identifier;

    // 4. Any English voice that is NOT male
    const anyNonMaleEn = availableVoices.find(v => {
      const lang = (v.language || '').toLowerCase().replace('_', '-');
      return lang.startsWith('en') && !isExcludedMale(v);
    });
    if (anyNonMaleEn) return anyNonMaleEn.identifier;

    return null;
  },

  selectSystemVoice: (availableVoices, voiceCode) => {
    if (!availableVoices || availableVoices.length === 0) return null;

    const directMatch = availableVoices.find(v => v.identifier === voiceCode);
    if (directMatch) return directMatch.identifier;

    // ── Dedicated System Default / Onboarding Tutor Voice Resolution ────────
    if (OnboardingVoiceService.isSystemDefault(voiceCode)) {
      return VoiceService.resolveSystemDefaultVoice(availableVoices);
    }

    const gs = (voiceCode || '').toLowerCase();
    const isBritish = gs.includes('uk') || gs.includes('gb') || gs.includes('british');
    const isIndian = gs.includes('in') || gs.includes('indian');
    const isMale = gs.includes('male') && !gs.includes('female');

    // For IN Male specifically:
    if (isIndian && isMale) {
      // 1. Look for explicit Indian male voice
      const indianMale = availableVoices.find(v => {
        const id = (v.identifier || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        const lang = (v.language || '').toLowerCase().replace('_', '-');
        const isMaleVoice = !isFemalePattern(id, name, v.gender);
        return (lang.startsWith('en-in') || name.includes('india')) && isMaleVoice;
      });
      if (indianMale) return indianMale.identifier;

      // 2. If no Indian male voice installed, select confirmed English male voice (never a female voice)
      const confirmedEnglishMale = availableVoices.find(v => {
        const id = (v.identifier || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        return !isFemalePattern(id, name, v.gender);
      });
      if (confirmedEnglishMale) return confirmedEnglishMale.identifier;
    }

    let targetGender = 'female';
    if (isMale) {
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
          const anyFemale = availableVoices.find(v => {
            const vid = (v.identifier || '').toLowerCase();
            const vname = (v.name || '').toLowerCase();
            return isFemalePattern(vid, vname, v.gender);
          });
          if (anyFemale) selected = anyFemale.identifier;
        } else if (targetGender === 'male' && isFemale) {
          const anyMale = availableVoices.find(v => {
            const vid = (v.identifier || '').toLowerCase();
            const vname = (v.name || '').toLowerCase();
            return !isFemalePattern(vid, vname, v.gender);
          });
          if (anyMale) selected = anyMale.identifier;
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
    avatarId       = null,
    voiceType      = null,
    speechSpeed    = null,
    availableVoices = [],
    pitch          = null,
    rate           = null,
    onStart,
    onDone,
    onError,
  } = {}) => {
    if (isMuted) return;

    const cleanedText = VoiceService.sanitizeTextForSpeech(text);
    if (!cleanedText) return;

    // 1. Resolve active avatar model (explicit param -> voiceType if avatar -> cached model -> AsyncStorage)
    let effectiveAvatarId = avatarId;
    if (!effectiveAvatarId && voiceType && AVATAR_VOICE_PROFILES[String(voiceType).toLowerCase()]) {
      effectiveAvatarId = voiceType;
    }
    if (!effectiveAvatarId) {
      try {
        const cached = typeof getCachedAvatarModel === 'function' ? getCachedAvatarModel() : null;
        const saved = cached || (await AsyncStorage.getItem('speakmate_avatar_model'));
        if (saved) effectiveAvatarId = saved;
      } catch (_) {}
    }
    const avatarProfile = VoiceService.getAvatarVoiceProfile(effectiveAvatarId);

    // 2. Load saved speech speed from AsyncStorage if not provided explicitly
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

    // ── 3. Resolve user settings accent preference ───────────────────────────
    let resolvedVoice = voiceType || avatarProfile.voiceCode;
    const isSysDefault = OnboardingVoiceService.isSystemDefault(resolvedVoice);
    let voiceConfig = null;

    if (isSysDefault) {
      voiceConfig = await OnboardingVoiceService.load();
      resolvedVoice = voiceConfig?.style || 'Friendly';
    }

    // ── 4. Ensure we have system voices ───────────────────────────────────────
    let voices = availableVoices;
    if (!voices || voices.length === 0) {
      try {
        const sysVoices = await Speech.getAvailableVoicesAsync();
        voices = sysVoices.filter(v => (v.language || '').toLowerCase().startsWith('en'));
      } catch (e) {
        console.warn('[VoiceService] Auto-fetch voices failed inside speak:', e);
      }
    }

    // ── 5. Pitch & rate based on centralized avatar profile ───────────────────
    const speedMultiplier = Number(effectiveSpeed) || 1.0;
    let effectivePitch = pitch !== null && pitch !== undefined ? Number(pitch) : avatarProfile.basePitch;
    let effectiveRate  = rate !== null && rate !== undefined ? Number(rate) : (avatarProfile.baseRate * speedMultiplier);

    // ── 6. Select system voice for avatar ─────────────────────────────────────
    let systemVoiceId = VoiceService.selectSystemVoiceForAvatar(voices, avatarProfile, isSysDefault ? null : resolvedVoice);
    if (!systemVoiceId && isSysDefault) {
      systemVoiceId = VoiceService.resolveSystemDefaultVoice(voices);
    }
    if (!systemVoiceId) {
      systemVoiceId = VoiceService.selectSystemVoice(voices, resolvedVoice);
    }

    // ── 7. Male / Female fallback pitch safety (Human coaches only) ─────────
    if (avatarProfile.category !== 'cartoon') {
      const targetGender = avatarProfile.intendedGender === 'male' ? 'male' : 'female';
      if (systemVoiceId && voices && voices.length > 0) {
        const voiceObj = voices.find(v => v.identifier === systemVoiceId);
        if (voiceObj) {
          const vid = (voiceObj.identifier || '').toLowerCase();
          const vname = (voiceObj.name || '').toLowerCase();
          const isActuallyFemale = isFemalePattern(vid, vname, voiceObj.gender);

          if (targetGender === 'male' && isActuallyFemale) {
            effectivePitch = Math.min(effectivePitch, 0.88); // Shift pitch down for male coach on female voice
          } else if (targetGender === 'female' && !isActuallyFemale) {
            effectivePitch = Math.max(effectivePitch, 1.15); // Shift pitch up for female coach on male voice
          }
        }
      }
    }

    // ── 8. Build TTS options ──────────────────────────────────────────────────
    const targetLocale = avatarProfile.targetLocale || 'en-US';
    const options = {
      rate: effectiveRate,
      pitch: effectivePitch,
      language: targetLocale,
      onStart,
      onDone,
      onError: (err) => {
        console.warn('[VoiceService] TTS playback error:', err);
        if (onError) onError(err);
      },
    };

    if (systemVoiceId) {
      options.voice = systemVoiceId;
    }

    // ── 9. Speak ──────────────────────────────────────────────────────────────
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
