/**
 * Speech Synthesis & Audio Configuration
 */

export const SPEECH_PROVIDERS = {
  WEB_SPEECH: 'web_speech',
  OPENAI_TTS: 'openai_tts',
  CUSTOM_BACKEND: 'custom_backend',
};

export const DEFAULT_SPEECH_CONFIG = {
  provider: SPEECH_PROVIDERS.WEB_SPEECH,
  voiceName: 'Google US English', // Default voice preference fallback
  lang: 'en-US',
  pitch: 1.0,
  rate: 1.0,
  volume: 1.0,

  // Audio Cache settings
  cacheAudio: true,
  maxCacheEntries: 50,

  // OpenAI TTS Defaults (if enabled)
  openai: {
    model: 'tts-1',
    voice: 'alloy', // alloy, echo, fable, onyx, nova, shimmer
  },
};
