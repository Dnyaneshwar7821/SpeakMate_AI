import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * useLipSync Custom Hook
 * Near-perfect, continuous, high-amplitude Live2D lip synchronization for Haru & Chitose.
 * 
 * Features:
 * - Autonomous multi-syllable speech envelope engine (~4.2 syllables/sec).
 * - Asymmetrical vowel articulation (fast attack, sustained resonance, smooth closure).
 * - Per-syllable pseudo-random height variation (0.65 to 1.0 max opening).
 * - Immune to browser speech synthesis GC stalls or boundary event drops.
 * - Post-motion internalModel.update pipeline override (immune to idle motion resets).
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);

  const activeSpeaking = useRef(isSpeakingProp);
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
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => {
      activeSpeaking.current = true;
      speechStartTime.current = performance.now();
    });

    const unsubWord = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, () => {
      activeSpeaking.current = true;
      if (speechStartTime.current === 0) {
        speechStartTime.current = performance.now();
      }
    });

    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      activeSpeaking.current = false;
      speechStartTime.current = 0;
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
        // 1. Evaluate internal motions, physics, and expressions
        originalUpdate(delta, now);

        // 2. Force mouth parameters IMMEDIATELY after motions to guarantee visibility
        const isSynthesizing = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking);
        const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

        const yVal = currentMouthY.current;
        const formVal = currentMouthForm.current;
        const coreModel = internalModel.coreModel;

        if (coreModel && (isSpeaking || yVal > 0.005)) {
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
      const isSynthesizing = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking);
      const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

      if (isSpeaking) {
        if (speechStartTime.current === 0) speechStartTime.current = now;
        const elapsed = (now - speechStartTime.current) * 0.001;

        // Syllable Cadence Engine: ~4.2 syllables per second (238ms per syllable)
        const syllableRate = 4.2;
        const phase = (elapsed * syllableRate) % 1.0;

        // Asymmetrical Natural Speech Curve:
        // 0.00 - 0.35: Rapid Vowel Attack (opens widely)
        // 0.35 - 0.60: Vowel Resonance Sustain (holds open)
        // 0.60 - 1.00: Smooth Consonant Closure (dips closed)
        let openAmount = 0;
        if (phase < 0.35) {
          openAmount = Math.sin((phase / 0.35) * (Math.PI / 2));
        } else if (phase < 0.6) {
          openAmount = 1.0 - (phase - 0.35) * 0.3;
        } else {
          const closePhase = (phase - 0.6) / 0.4;
          openAmount = 0.77 * Math.cos(closePhase * (Math.PI / 2));
        }

        // Pseudo-random peak opening variation per syllable (0.75 to 1.0)
        const syllableIndex = Math.floor(elapsed * syllableRate);
        const pseudoRandom = Math.sin(syllableIndex * 719.3) * 0.5 + 0.5;
        const peakHeight = 0.75 + 0.25 * pseudoRandom;

        // Micro-tremor vibration during vocal resonance
        const microTremor = Math.sin(elapsed * 15.0 * Math.PI) * 0.08;

        // Final calculated target opening (continuous oscillation, no dead spots!)
        targetMouthY = Math.max(0.1, Math.min(1.0, (openAmount * peakHeight) + microTremor));

        // Horizontal mouth shape transition (-0.65 to +0.65)
        targetMouthForm = Math.sin(elapsed * 2.8 * Math.PI) * 0.65;
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Responsive lerping: attack 0.8, release 0.4
      const lerpSpeed = isSpeaking ? 0.8 : 0.4;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      // Also apply directly in RAF as immediate fallback
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
