/**
 * AI Provider Configurations for SpeakMate AI
 */

export const AI_PROVIDERS = {
  SPEAKMATE_BACKEND: 'speakmate_backend',
  OPENAI_DIRECT: 'openai_direct',
  MOCK: 'mock',
};

export const DEFAULT_AI_CONFIG = {
  provider: AI_PROVIDERS.SPEAKMATE_BACKEND,
  apiBaseUrl: '/api/v1',
  chatEndpoint: '/chat/completions',
  timeoutMs: 15000,
  systemPrompt: `You are SpeakMate AI, an empathetic, engaging, and friendly AI language practice partner. Keep your answers conversational, supportive, and concise (2-4 sentences max per reply so spoken feedback stays natural).`,
};
