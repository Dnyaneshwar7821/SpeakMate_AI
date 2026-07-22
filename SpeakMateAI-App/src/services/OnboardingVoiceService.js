/**
 * OnboardingVoiceService
 *
 * Single source of truth for the System Default voice.
 * Saves the complete voice configuration when a user picks a voice in
 * Onboarding and provides helpers to load it anywhere in the app.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'speakmate_onboarding_voice_config';

/**
 * Full voice configs for each onboarding style.
 * gender is always 'female' — these are onboarding tutor voices.
 */
const ONBOARDING_VOICE_CONFIGS = {
  Friendly: {
    style:    'Friendly',
    label:    'Friendly',
    gender:   'female',
    locale:   'en-US',
    accent:   'American',
    pitch:    1.15,
    rate:     1.0,
    provider: 'system',
    previewText: "Hello there! I am your friendly AI English tutor. I'm excited to practice English with you!",
  },
  Professional: {
    style:    'Professional',
    label:    'Professional',
    gender:   'female',
    locale:   'en-US',
    accent:   'American',
    pitch:    1.05,
    rate:     0.95,
    provider: 'system',
    previewText: "Hello. I am your professional AI tutor. Let's work together to polish your English communication skills.",
  },
  Energetic: {
    style:    'Energetic',
    label:    'Energetic',
    gender:   'female',
    locale:   'en-US',
    accent:   'American',
    pitch:    1.15,
    rate:     1.2,
    provider: 'system',
    previewText: "Hey! Ready to level up your English? Let's get started and have some fun!",
  },
  Calm: {
    style:    'Calm',
    label:    'Calm',
    gender:   'female',
    locale:   'en-US',
    accent:   'American',
    pitch:    1.05,
    rate:     0.90,
    provider: 'system',
    previewText: "Welcome. I am your calm AI tutor. We will practice English step by step at your own pace.",
  },
  Teacher: {
    style:    'Teacher',
    label:    'Teacher',
    gender:   'female',
    locale:   'en-US',
    accent:   'American',
    pitch:    1.05,
    rate:     0.95,
    provider: 'system',
    previewText: "Hello. I am your English teacher. Today we will focus on building your confidence in speaking.",
  },
  'Native Speaker': {
    style:    'Native Speaker',
    label:    'Native Speaker',
    gender:   'female',
    locale:   'en-US',
    accent:   'American',
    pitch:    1.05,
    rate:     1.05,
    provider: 'system',
    previewText: "Hey friend! I'm your native speaker tutor. Let's practice speaking naturally and fluently.",
  },
};

const DEFAULT_CONFIG = ONBOARDING_VOICE_CONFIGS['Friendly'];

const OnboardingVoiceService = {
  /**
   * Save the full config for the selected onboarding voice style.
   * Call this whenever the user picks a voice — both during onboarding and later.
   *
   * @param {string} style           - One of the VOICES keys, e.g. 'Professional'
   * @param {string} [voiceIdentifier] - The actual system TTS voice ID (e.g. 'en-us-x-sfg-local')
   *                                    Pass this so System Default plays the exact same device voice.
   */
  save: async (style, voiceIdentifier = null) => {
    const base = ONBOARDING_VOICE_CONFIGS[style] || DEFAULT_CONFIG;
    const config = {
      ...base,
      // Store the actual device voice identifier so we can pin the exact voice
      voiceIdentifier: voiceIdentifier || null,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      // Also keep the legacy simple key for backward compatibility
      await AsyncStorage.setItem('speakmate_onboarding_voice', style);
    } catch (e) {
      console.warn('[OnboardingVoiceService] Failed to save voice config:', e);
    }
  },

  /**
   * Load the full voice config from storage.
   * Returns the saved config, or Friendly as a fallback.
   *
   * @returns {Promise<object>} The voice config object
   */
  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Validate it has the required fields
        if (parsed && parsed.style && parsed.gender) return parsed;
      }
      // Fallback: check legacy simple key
      const legacyStyle = await AsyncStorage.getItem('speakmate_onboarding_voice');
      if (legacyStyle && ONBOARDING_VOICE_CONFIGS[legacyStyle]) {
        // Migrate to full config
        const config = ONBOARDING_VOICE_CONFIGS[legacyStyle];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config)).catch(() => {});
        return config;
      }
    } catch (e) {
      console.warn('[OnboardingVoiceService] Failed to load voice config:', e);
    }
    return DEFAULT_CONFIG;
  },

  /**
   * Get the config synchronously from the constant map (for inline use).
   * @param {string} style
   * @returns {object}
   */
  getConfig: (style) => {
    return ONBOARDING_VOICE_CONFIGS[style] || DEFAULT_CONFIG;
  },

  /**
   * Returns all available onboarding voice style names.
   */
  getStyles: () => Object.keys(ONBOARDING_VOICE_CONFIGS),

  /**
   * Checks if a voiceCode is a "system default" type that should
   * resolve to the onboarding voice.
   */
  isSystemDefault: (voiceCode) => {
    if (!voiceCode) return true;
    const v = String(voiceCode).toLowerCase().trim();
    return v === 'default' || v === 'default ⚙️' || v === 'female' || v === 'male';
  },
};

export { OnboardingVoiceService, ONBOARDING_VOICE_CONFIGS };
