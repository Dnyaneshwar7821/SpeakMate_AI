/**
 * SpeechService
 * Unified Speech Synthesis Engine with Web Audio API integration for real-time lip sync.
 */

import { EventBus, AVATAR_EVENTS } from '../live2d/EventBus';
import { DEFAULT_SPEECH_CONFIG, SPEECH_PROVIDERS } from '../../config/SpeechConfig';
import { AudioAnalyzer } from '../../utils/AudioAnalyzer';

export class SpeechService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_SPEECH_CONFIG, ...config };
    this.audioAnalyzer = new AudioAnalyzer();
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.audioElement = null;
    this.isSpeaking = false;
    this.audioCache = new Map();
  }

  /**
   * Speak text string using configured provider
   * @param {string} text 
   * @param {object} options Override speech options (voice, pitch, rate)
   */
  async speak(text, options = {}) {
    if (!text || text.trim().length === 0) return;

    // Cancel existing speech
    this.stop();

    const provider = options.provider || this.config.provider;

    EventBus.emit(AVATAR_EVENTS.SPEECH_STARTED, { text, provider });
    this.isSpeaking = true;

    if (provider === SPEECH_PROVIDERS.WEB_SPEECH && this.synth) {
      return this._speakWebSpeech(text, options);
    } else if (provider === SPEECH_PROVIDERS.OPENAI_TTS || provider === SPEECH_PROVIDERS.CUSTOM_BACKEND) {
      return this._speakAudioUrl(text, options);
    } else {
      // Fallback to Web Speech API
      return this._speakWebSpeech(text, options);
    }
  }

  /**
   * Internal implementation for Web Speech API
   */
  _speakWebSpeech(text, options) {
    return new Promise((resolve) => {
      if (!this.synth) {
        console.warn('[SpeechService] Web Speech API is not supported in this browser.');
        this._onSpeechEnded();
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.rate || this.config.rate;
      utterance.pitch = options.pitch || this.config.pitch;
      utterance.volume = options.volume || this.config.volume;
      utterance.lang = options.lang || this.config.lang;

      // Select voice if available
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => v.name.includes(this.config.voiceName) || v.lang === utterance.lang) || voices[0];
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        this._onSpeechEnded();
        resolve();
      };

      utterance.onerror = (err) => {
        console.warn('[SpeechService] Speech synthesis error:', err);
        this._onSpeechEnded();
        resolve();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  /**
   * Internal implementation for playing Audio buffer/URL (OpenAI TTS / Custom backend)
   */
  async _speakAudioUrl(text, options) {
    return new Promise((resolve) => {
      const audioUrl = options.audioUrl;
      if (!audioUrl) {
        // Fallback to Web Speech if no URL provided
        return resolve(this._speakWebSpeech(text, options));
      }

      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = 'anonymous';
      }

      this.audioElement.src = audioUrl;

      // Attach AudioAnalyzer for amplitude estimation
      this.audioAnalyzer.attachSource(this.audioElement);

      this.audioElement.onended = () => {
        this.audioAnalyzer.detachSource();
        this._onSpeechEnded();
        resolve();
      };

      this.audioElement.onerror = (err) => {
        console.warn('[SpeechService] Audio element playback error:', err);
        this.audioAnalyzer.detachSource();
        this._onSpeechEnded();
        resolve();
      };

      this.audioElement.play().catch(err => {
        console.warn('[SpeechService] Autoplay blocked or failed:', err);
        this._onSpeechEnded();
        resolve();
      });
    });
  }

  /**
   * Get current amplitude for lip sync (0.0 to 1.0)
   */
  getAmplitude() {
    if (!this.isSpeaking) return 0;

    // For Web Speech API (where media stream source is synthetic), simulate smooth pitch modulation
    if (this.synth && this.synth.speaking && !this.audioElement) {
      // Synthetic vocal modulation simulation
      const time = performance.now() / 100;
      const baseWave = Math.abs(Math.sin(time * 0.8) * Math.cos(time * 0.3));
      return 0.2 + (baseWave * 0.7);
    }

    return this.audioAnalyzer.getAmplitude();
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioAnalyzer.detachSource();
    }
    this._onSpeechEnded();
  }

  _onSpeechEnded() {
    if (this.isSpeaking) {
      this.isSpeaking = false;
      EventBus.emit(AVATAR_EVENTS.SPEECH_FINISHED, {});
    }
  }

  destroy() {
    this.stop();
    if (this.audioAnalyzer) {
      this.audioAnalyzer.destroy();
    }
    this.audioCache.clear();
  }
}
