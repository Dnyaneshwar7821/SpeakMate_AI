import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * Universal Parameter Applier for Cubism 2 (Chitose) and Cubism 4 (Haru)
 */
function applyMouthParameters(model, yVal, formVal) {
  if (!model || !model.internalModel) return;
  const im = model.internalModel;
  const cm = im.coreModel;

  // 1. CoreModel direct setters
  if (cm) {
    // Cubism 4 API (Haru)
    if (typeof cm.setParameterValueById === 'function') {
      try { cm.setParameterValueById('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('ParamMouthForm', formVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
    }
    // Cubism 2 API (Chitose)
    if (typeof cm.setParamFloat === 'function') {
      try { cm.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthForm', formVal, 1.0); } catch (_) {}
    }
  }

  // 2. InternalModel level setters
  if (typeof im.setParameterValueById === 'function') {
    try { im.setParameterValueById('ParamMouthOpenY', yVal); } catch (_) {}
    try { im.setParameterValueById('ParamMouthForm', formVal); } catch (_) {}
    try { im.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal); } catch (_) {}
    try { im.setParameterValueById('PARAM_MOUTH_FORM', formVal); } catch (_) {}
  }
}

/**
 * useLipSync Custom Hook
 * Rock-solid, continuous, wide-mouth Live2D lip synchronization.
 * Uses monotonic continuous time to eliminate any possibility of mid-speech freezing or stalling.
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);
  const activeSpeaking = useRef(isSpeakingProp);

  // Sync prop changes
  useEffect(() => {
    activeSpeaking.current = isSpeakingProp;
  }, [isSpeakingProp]);

  // Subscribe to SpeechSynthesis EventBus lifecycle
  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => {
      activeSpeaking.current = true;
    });

    const unsubWord = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, () => {
      activeSpeaking.current = true;
    });

    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      activeSpeaking.current = false;
    });

    return () => {
      unsubStart();
      unsubWord();
      unsubEnd();
    };
  }, []);

  // Post-Motion Engine Hook: Wrap internalModel.update to ensure mouth parameters win over idle animations
  useEffect(() => {
    if (!model || !model.internalModel) return;

    const internalModel = model.internalModel;
    const originalUpdate = internalModel.update ? internalModel.update.bind(internalModel) : null;

    if (originalUpdate) {
      internalModel.update = function (delta, now) {
        // 1. Evaluate motions, physics, expressions first
        originalUpdate(delta, now);

        // 2. Force mouth parameters directly afterwards
        applyMouthParameters(model, currentMouthY.current, currentMouthForm.current);
      };
    }

    return () => {
      if (originalUpdate && internalModel) {
        internalModel.update = originalUpdate;
      }
    };
  }, [model]);

  // High-precision animation loop with monotonic time base
  useEffect(() => {
    const updateLipSync = () => {
      const isSynthesizing = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking);
      const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

      let targetMouthY = 0;
      let targetMouthForm = 0;

      if (isSpeaking) {
        // Monotonic time in seconds (cannot be reset or corrupted by events)
        const t = performance.now() * 0.001;

        // Primary speech carrier: ~4.6 syllables per second
        const carrier = Math.abs(Math.sin(t * 4.6 * Math.PI));
        // Non-linear power curve: mouth stays open wide during spoken syllables
        const flap = Math.pow(carrier, 0.6);

        // Vocal fold vibration & harmonic modulation
        const microTremor = Math.sin(t * 14.5 * Math.PI) * 0.1;
        const formPulse = Math.sin(t * 3.2 * Math.PI) * 0.65;

        // Big, prominent mouth opening (peaks at 1.0, dips to 0.15 between syllables)
        targetMouthY = Math.min(1.0, Math.max(0.15, (flap * 0.9 + 0.15 + microTremor)));
        targetMouthForm = formPulse;
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Fast, snappy attack (0.85) and smooth natural release (0.35)
      const lerpSpeed = isSpeaking ? 0.85 : 0.35;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      // Apply continuously in RAF
      applyMouthParameters(model, currentMouthY.current, currentMouthForm.current);

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
