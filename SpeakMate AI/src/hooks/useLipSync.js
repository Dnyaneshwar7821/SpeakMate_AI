import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * Phoneme Target Extractor
 * Maps English word sounds to Live2D vertical openness (Y: 0.0-1.0) and horizontal shaping (Form: -1.0 to 1.0)
 */
function analyzeWordPhoneme(word = '') {
  const clean = word.toLowerCase().trim();
  if (!clean) return { openY: 0.45, form: 0.0 };

  // Bilabial consonants (closed lips: m, p, b)
  if (/^[mpb]/.test(clean) || /[mpb]$/.test(clean)) {
    return { openY: 0.2, form: 0.0 };
  }

  // Open round vowels (o, u, ow, oo, aw)
  if (/[ou]|ow|oo|aw/.test(clean)) {
    return { openY: 0.85, form: -0.65 };
  }

  // Wide spread vowels (e, i, ee, ea, ay)
  if (/[ei]|ee|ea|ay|ai/.test(clean)) {
    return { openY: 0.65, form: 0.8 };
  }

  // Open central vowels (a, ah)
  if (/a|ah/.test(clean)) {
    return { openY: 0.92, form: 0.35 };
  }

  // Default natural vowel opening
  return { openY: 0.7, form: 0.1 };
}

/**
 * useLipSync Custom Hook
 * Near-perfect organic Live2D lip synchronization for both Haru (Cubism 4) and Chitose (Cubism 2).
 * Integrates SpeechSynthesis word boundaries with multi-frequency vowel oscillation and exponential smoothing.
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);

  const activeSpeaking = useRef(isSpeakingProp);
  const targetPhoneme = useRef({ openY: 0.5, form: 0.0 });
  const speechStartTime = useRef(0);

  // Sync prop changes
  useEffect(() => {
    activeSpeaking.current = isSpeakingProp;
    if (isSpeakingProp && speechStartTime.current === 0) {
      speechStartTime.current = performance.now();
    } else if (!isSpeakingProp) {
      speechStartTime.current = 0;
    }
  }, [isSpeakingProp]);

  // Subscribe to SpeechSynthesis EventBus lifecycle
  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, (data) => {
      activeSpeaking.current = true;
      speechStartTime.current = performance.now();
      if (data?.text) {
        const firstWord = data.text.trim().split(/\s+/)[0] || '';
        targetPhoneme.current = analyzeWordPhoneme(firstWord);
      }
    });

    const unsubWord = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, (data) => {
      if (data?.word) {
        targetPhoneme.current = analyzeWordPhoneme(data.word);
      }
    });

    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      activeSpeaking.current = false;
      speechStartTime.current = 0;
      targetPhoneme.current = { openY: 0, form: 0 };
    });

    return () => {
      unsubStart();
      unsubWord();
      unsubEnd();
    };
  }, []);

  // Main high-precision animation loop
  useEffect(() => {
    if (!model || !model.internalModel) return;

    let targetMouthY = 0;
    let targetMouthForm = 0;

    const updateLipSync = () => {
      const coreModel = model.internalModel?.coreModel;
      if (!coreModel) {
        rafRef.current = requestAnimationFrame(updateLipSync);
        return;
      }

      const now = performance.now();
      const isSpeaking = activeSpeaking.current || isSpeakingProp;

      if (isSpeaking) {
        if (speechStartTime.current === 0) speechStartTime.current = now;
        const elapsed = (now - speechStartTime.current) * 0.001;

        // 1. Primary Speech Cadence (4.8 - 5.5 syllables per second)
        const syllableCarrier = Math.abs(Math.sin(elapsed * 5.0 * Math.PI));

        // 2. Secondary Harmonic Vibration (vocal fold oscillation)
        const microModulation = Math.sin(elapsed * 12.0 * Math.PI) * 0.18;
        const consonantDip = Math.sin(elapsed * 2.5 * Math.PI) * 0.15;

        // 3. Blend with Active Phoneme Target
        const phonemeOpen = targetPhoneme.current.openY || 0.7;
        const phonemeForm = targetPhoneme.current.form || 0.0;

        const rawOpen = (syllableCarrier * 0.85 + microModulation + consonantDip) * phonemeOpen;
        targetMouthY = Math.max(0.1, Math.min(0.98, rawOpen * 1.25));

        const rawForm = phonemeForm + Math.sin(elapsed * 3.2 * Math.PI) * 0.25;
        targetMouthForm = Math.max(-0.85, Math.min(0.85, rawForm));
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Fast responsive attack (0.45), natural release (0.3)
      const lerpSpeed = isSpeaking ? 0.45 : 0.3;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      const yVal = currentMouthY.current;
      const formVal = currentMouthForm.current;

      try {
        // ── Haru (Cubism 4 API) ──
        if (typeof coreModel.setParameterValueById === 'function') {
          coreModel.setParameterValueById('ParamMouthOpenY', yVal);
          coreModel.setParameterValueById('ParamMouthForm', formVal);
          coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal);
          coreModel.setParameterValueById('PARAM_MOUTH_FORM', formVal);
        }

        // ── Chitose (Cubism 2 setParamFloat API) ──
        if (typeof coreModel.setParamFloat === 'function') {
          coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal);
          coreModel.setParamFloat('PARAM_MOUTH_FORM', formVal);
          coreModel.setParamFloat('ParamMouthOpenY', yVal);
          coreModel.setParamFloat('ParamMouthForm', formVal);
        }
      } catch (e) {
        // ignore parameter discrepancies
      }

      rafRef.current = requestAnimationFrame(updateLipSync);
    };

    rafRef.current = requestAnimationFrame(updateLipSync);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [model, isSpeakingProp]);
}

export default useLipSync;
