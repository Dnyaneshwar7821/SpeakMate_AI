import { useEffect, useRef } from 'react';

/**
 * useLipSync Custom Hook
 * Provides continuous, organic, speech-cadence matched Live2D lip syncing.
 * Supports both Cubism 2 (Chitose) and Cubism 4 (Haru).
 * Features:
 * - Multi-octave syllable rhythm generator (~4-6 syllables/sec)
 * - Phonetic vowel/consonant mouth shaping (ParamMouthForm & PARAM_MOUTH_FORM)
 * - Micro vocal-bobbing dynamics during active speech
 * - Smooth exponential decay to closed mouth on pause/stop
 */
export function useLipSync(model, isSpeaking) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);
  const speechStartTime = useRef(0);

  useEffect(() => {
    if (!model || !model.internalModel) return;

    if (isSpeaking && speechStartTime.current === 0) {
      speechStartTime.current = performance.now();
    } else if (!isSpeaking) {
      speechStartTime.current = 0;
    }

    let targetMouthY = 0;
    let targetMouthForm = 0;

    const updateLipSync = () => {
      const coreModel = model.internalModel.coreModel;
      if (!coreModel) return;

      const now = performance.now();

      if (isSpeaking) {
        // Time elapsed since speaking started (in seconds)
        const elapsed = (now - (speechStartTime.current || now)) * 0.001;

        // Primary speech carrier rhythm (5.2 syllables per second)
        const carrier = Math.sin(elapsed * 5.2 * Math.PI);
        // Secondary harmonic modulation (vowel transition rhythm)
        const harmonic1 = Math.sin(elapsed * 2.8 * Math.PI) * 0.35;
        const harmonic2 = Math.sin(elapsed * 8.4 * Math.PI) * 0.2;

        // Combine waves and rectify (mouth opening is positive)
        const rawPulse = Math.abs(carrier) * 0.75 + harmonic1 + harmonic2;

        // Organic syllable envelope (dynamic speech variation)
        const syllableNoise = Math.sin(elapsed * 1.4) * 0.15;
        const finalOpen = Math.max(0, Math.min(1.0, rawPulse + syllableNoise));

        // Set target opening (range: 0.15 to 0.95 during vocalization)
        targetMouthY = finalOpen > 0.08 ? Math.min(0.95, finalOpen * 1.15) : 0.05;

        // Dynamic Mouth Shaping (-1.0 narrow 'OO/EE' to +1.0 wide 'AA/OH')
        const formPulse = Math.sin(elapsed * 3.6 * Math.PI);
        targetMouthForm = Math.max(-0.8, Math.min(0.8, formPulse * 0.6));
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Smooth exponential easing (fast attack 0.42, natural release 0.28)
      const lerpSpeed = isSpeaking ? 0.42 : 0.28;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      // Snap to absolute zero if below silence threshold
      if (!isSpeaking && currentMouthY.current < 0.015) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      const yVal = currentMouthY.current;
      const formVal = currentMouthForm.current;

      try {
        // ── 1. Cubism 4 Core API (Haru / modern models) ──
        if (typeof coreModel.setParameterValueById === 'function') {
          coreModel.setParameterValueById('ParamMouthOpenY', yVal);
          coreModel.setParameterValueById('ParamMouthForm', formVal);
          coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal);
          coreModel.setParameterValueById('PARAM_MOUTH_FORM', formVal);
        }

        // ── 2. Cubism 2 / Universal setParamFloat API (Chitose) ──
        if (typeof coreModel.setParamFloat === 'function') {
          coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal);
          coreModel.setParamFloat('PARAM_MOUTH_FORM', formVal);
          coreModel.setParamFloat('ParamMouthOpenY', yVal);
          coreModel.setParamFloat('ParamMouthForm', formVal);
        }
      } catch (e) {
        // suppress parameter mismatch logs
      }

      rafRef.current = requestAnimationFrame(updateLipSync);
    };

    rafRef.current = requestAnimationFrame(updateLipSync);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [model, isSpeaking]);
}

export default useLipSync;
