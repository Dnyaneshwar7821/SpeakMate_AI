/**
 * AudioAnalyzer Utility
 * Uses Web Audio API AnalyserNode to calculate real-time decibels/amplitude
 * for driving Live2D lip sync (ParamMouthOpenY).
 */

export class AudioAnalyzer {
  constructor(options = {}) {
    this.fftSize = options.fftSize || 512;
    this.smoothingFactor = options.smoothingFactor ?? 0.7;
    this.amplitudeMultiplier = options.amplitudeMultiplier ?? 2.2;
    this.minThreshold = options.minThreshold ?? 0.03;

    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
    this.sourceNode = null;
    this.smoothAmplitude = 0;
    this.isActive = false;
  }

  /**
   * Initialize AudioContext and AnalyserNode
   */
  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    if (this.audioCtx && !this.analyser) {
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.4;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    return this.audioCtx;
  }

  /**
   * Attach an HTMLAudioElement or MediaStream to the analyzer
   */
  attachSource(audioElement) {
    this.initContext();
    if (!this.audioCtx || !this.analyser) return;

    try {
      if (this.sourceNode) {
        try { this.sourceNode.disconnect(); } catch (e) { /* ignore */ }
      }
      this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.isActive = true;
    } catch (err) {
      console.warn('[AudioAnalyzer] Could not attach audio source node:', err);
    }
  }

  /**
   * Disconnect current source node
   */
  detachSource() {
    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (e) {
        // ignore
      }
      this.sourceNode = null;
    }
    this.isActive = false;
    this.smoothAmplitude = 0;
  }

  /**
   * Get current normalized amplitude value (0.0 to 1.0) with exponential smoothing
   */
  getAmplitude() {
    if (!this.analyser || !this.dataArray || !this.isActive) {
      this.smoothAmplitude = this.smoothAmplitude * 0.8;
      return Math.max(0, this.smoothAmplitude);
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    // Sum frequencies in voice range (approx 80Hz - 4kHz)
    let sum = 0;
    const len = this.dataArray.length;
    for (let i = 0; i < len; i++) {
      sum += this.dataArray[i];
    }

    const average = sum / len;
    let rawNormalized = average / 255.0; // 0.0 .. 1.0

    // Apply Noise Gate Threshold
    if (rawNormalized < this.minThreshold) {
      rawNormalized = 0;
    }

    // Apply Gain Multiplier
    let scaled = rawNormalized * this.amplitudeMultiplier;
    scaled = Math.min(1.0, Math.max(0.0, scaled));

    // Exponential Moving Average Smoothing
    this.smoothAmplitude = (this.smoothAmplitude * this.smoothingFactor) + (scaled * (1 - this.smoothingFactor));

    return this.smoothAmplitude;
  }

  /**
   * Destroy and release Web Audio resources
   */
  destroy() {
    this.detachSource();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch (e) {
        // ignore
      }
    }
    this.audioCtx = null;
    this.analyser = null;
    this.dataArray = null;
  }
}
