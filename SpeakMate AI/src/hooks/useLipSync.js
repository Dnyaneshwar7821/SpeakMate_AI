import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * Phoneme Target Extractor
 * Maps English word sounds to Live2D vertical openness (Y: 0.0-1.0) and horizontal shaping (Form: -1.0 to 1.0)
 */
function analyzeWordPhoneme(word = '') {
  const clean = word.toLowerCase().trim();
  if (!clean) return { openY: 0.95, form: 0.0 };

  // Bilabial consonants (closed lips: m, p, b)
  if (/^[mpb]/.test(clean) || /[mpb]$/.test(clean)) {
    return { openY: 0.2, form: 0.0 };
  }

  // Open round vowels (o, u, ow, oo, aw)
  if (/[ou]|ow|oo|aw/.test(clean)) {
    return { openY: 1.0, form: -0.75 };
  }

  // Wide spread vowels (e, i, ee, ea, ay)
  if (/[ei]|ee|ea|ay|ai/.test(clean)) {
    return { openY: 0.92, form: 0.85 };
  }

  // Open central vowels (a, ah)
  if (/a|ah/.test(clean)) {
    return { openY: 1.0, form: 0.4 };
  }

  // Default natural vowel opening
  return { openY: 0.95, form: 0.1 };
}

/**
 * useLipSync Custom Hook
 * Near-perfect, high-amplitude, organic Live2D lip synchronization for Haru & Chitose.
 * Overrides Live2D internalModel.update pipeline post-motion to guarantee parameters
 * are never flattened or overwritten by idle animations or physics.
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);

  const activeSpeaking = useRef(isSpeakingProp);
  const targetPhoneme = useRef({ openY: 0.95, form: 0.0 });
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
      activeSpeaking.current = true;
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

  // Post-Motion Engine Hook: Overrides internalModel.update directly
  useEffect(() => {
    if (!model || !model.internalModel) return;

    const internalModel = model.internalModel;
    const originalUpdate = internalModel.update ? internalModel.update.bind(internalModel) : null;

    if (originalUpdate) {
      internalModel.update = function (delta, now) {
        originalUpdate(delta, now);

        // Apply our mouth parameters immediately AFTER motion & physics evaluations
        const isSynthesizing = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking && !window.speechSynthesis?.paused);
        const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

        const yVal = currentMouthY.current;
        const formVal = currentMouthForm.current;
        const coreModel = internalModel.coreModel;

        if (coreModel && (isSpeaking || yVal > 0.001)) {
          try {
            // Cubism 4 (Haru)
            if (typeof coreModel.setParameterValueById === 'function') {
              coreModel.setParameterValueById('ParamMouthOpenY', yVal, 1.0);
              coreModel.setParameterValueById('ParamMouthForm', formVal, 1.0);
              coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal, 1.0);
              coreModel.setParameterValueById('PARAM_MOUTH_FORM', formVal, 1.0);
            }
            // Cubism 2 (Chitose)
            if (typeof coreModel.setParamFloat === 'function') {
              coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal, 1.0);
              coreModel.setParamFloat('PARAM_MOUTH_FORM', formVal, 1.0);
              coreModel.setParamFloat('ParamMouthOpenY', yVal, 1.0);
              coreModel.setParamFloat('ParamMouthForm', formVal, 1.0);
            }
          } catch (e) {
            // ignore
          }
        }
      };
    }

    return () => {
      if (originalUpdate && internalModel) {
        internalModel.update = originalUpdate;
      }
    };
  }, [model, isSpeakingProp]);

  // Main high-precision animation loop for calculating dynamic mouth values
  useEffect(() => {
    let targetMouthY = 0;
    let targetMouthForm = 0;

    const updateLipSync = () => {
      const now = performance.now();
      const isSynthesizing = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking && !window.speechSynthesis?.paused);
      const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

      if (isSpeaking) {
        if (speechStartTime.current === 0) speechStartTime.current = now;
        const elapsed = (now - speechStartTime.current) * 0.001;

        // 1. Dynamic Syllable Rhythmic Pulse (~5.4 syllables per second with non-linear sharp opening)
        const carrier = Math.abs(Math.sin(elapsed * 5.4 * Math.PI));
        const flap = Math.pow(carrier, 0.7); // Non-linear curve: keeps mouth wide longer during vowels
        const microTremor = Math.sin(elapsed * 13.5 * Math.PI) * 0.12;

        // 2. Phoneme Multiplier
        const phonemeOpen = targetPhoneme.current.openY || 0.95;
        const phonemeForm = targetPhoneme.current.form || 0.0;

        // Big, prominent mouth opening calculation (peaks at 1.0, baseline 0.3)
        const rawOpen = Math.min(1.0, Math.max(0.2, (flap * 0.95 + 0.15 + microTremor) * phonemeOpen));
        targetMouthY = rawOpen;

        // Dynamic horizontal vowel width
        const dynamicForm = phonemeForm + Math.sin(elapsed * 3.6 * Math.PI) * 0.3;
        targetMouthForm = Math.max(-0.85, Math.min(0.85, dynamicForm));
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Punchy attack (0.75) and smooth release (0.4)
      const lerpSpeed = isSpeaking ? 0.75 : 0.4;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      // Also apply directly in RAF loop as fallback
      if (model?.internalModel?.coreModel) {
        const coreModel = model.internalModel.coreModel;
        const yVal = currentMouthY.current;
        const formVal = currentMouthForm.current;

        try {
          if (typeof coreModel.setParameterValueById === 'function') {
            coreModel.setParameterValueById('ParamMouthOpenY', yVal, 1.0);
            coreModel.setParameterValueById('ParamMouthForm', formVal, 1.0);
          }
          if (typeof coreModel.setParamFloat === 'function') {
            coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal, 1.0);
            coreModel.setParamFloat('PARAM_MOUTH_FORM', formVal, 1.0);
          }
        } catch (e) {}
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
