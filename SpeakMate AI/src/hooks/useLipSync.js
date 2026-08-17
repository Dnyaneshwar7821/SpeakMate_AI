import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * Universal Parameter Applier for Cubism 2 (Chitose) and Cubism 4 (Haru)
 * Directly updates parameter memory slots on both coreModel and internalModel,
 * adding realistic vocal head-nods and posture dynamics during continuous speech.
 */
function applyMouthParameters(model, yVal, formVal, isSpeaking = false) {
  if (!model || !model.internalModel) return;
  const im = model.internalModel;
  const cm = im.coreModel;

  const t = performance.now() * 0.001;
  const vocalHeadY = isSpeaking ? Math.sin(t * 4.2) * 2.8 : 0;
  const vocalHeadZ = isSpeaking ? Math.sin(t * 1.8) * 1.5 : 0;

  if (cm) {
    // Cubism 4 (Haru)
    if (typeof cm.setParameterValueById === 'function') {
      try { cm.setParameterValueById('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('ParamMouthForm', formVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
      if (isSpeaking) {
        try { cm.setParameterValueById('ParamAngleY', vocalHeadY, 0.4); } catch (_) {}
        try { cm.setParameterValueById('ParamAngleZ', vocalHeadZ, 0.4); } catch (_) {}
      }
    }
    // Cubism 2 (Chitose)
    if (typeof cm.setParamFloat === 'function') {
      try { cm.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthForm', formVal, 1.0); } catch (_) {}
      if (isSpeaking) {
        try { cm.setParamFloat('PARAM_ANGLE_Y', vocalHeadY, 0.4); } catch (_) {}
        try { cm.setParamFloat('PARAM_ANGLE_Z', vocalHeadZ, 0.4); } catch (_) {}
      }
    }
  }

  if (typeof im.setParameterValueById === 'function') {
    try { im.setParameterValueById('ParamMouthOpenY', yVal); } catch (_) {}
    try { im.setParameterValueById('ParamMouthForm', formVal); } catch (_) {}
    try { im.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal); } catch (_) {}
    try { im.setParameterValueById('PARAM_MOUTH_FORM', formVal); } catch (_) {}
  }
}

/**
 * useLipSync Custom Hook
 * Realistic Whole-Sentence Live2D Lip Syncing & Vocal Posture for Haru and Chitose.
 * Guarantees prominent, continuous, human-like speech articulation throughout the entire AI talk.
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);
  const activeSpeaking = useRef(isSpeakingProp);

  // Keep ref updated with prop
  useEffect(() => {
    activeSpeaking.current = isSpeakingProp;
  }, [isSpeakingProp]);

  // Subscribe to EventBus avatar events
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

  // Wrap internalModel.update to ensure mouth parameters override idle animations
  useEffect(() => {
    if (!model || !model.internalModel) return;

    const internalModel = model.internalModel;
    const originalUpdate = internalModel.update ? internalModel.update.bind(internalModel) : null;

    if (originalUpdate) {
      internalModel.update = function (delta, now) {
        originalUpdate(delta, now);

        const isSynthesizing = typeof window !== 'undefined' && Boolean(
          (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
        );
        const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

        applyMouthParameters(model, currentMouthY.current, currentMouthForm.current, isSpeaking);
      };
    }

    return () => {
      if (originalUpdate && internalModel) {
        internalModel.update = originalUpdate;
      }
    };
  }, [model, isSpeakingProp]);

  // 60 FPS Continuous Lip Sync Loop
  useEffect(() => {
    const updateLipSync = () => {
      const isSynthesizing = typeof window !== 'undefined' && Boolean(
        (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
      );

      const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

      let targetMouthY = 0;
      let targetMouthForm = 0;

      if (isSpeaking) {
        // Continuous monotonic time base
        const t = performance.now() * 0.001;

        // Primary speech carrier oscillator (~5.0 Hz natural vocal frequency)
        const carrier = Math.abs(Math.sin(t * 5.0 * Math.PI));
        // Non-linear power curve for wide open vowel peaks
        const flap = Math.pow(carrier, 0.6);

        // Vocal vibration micro-tremor
        const microTremor = Math.sin(t * 13.5 * Math.PI) * 0.12;

        // Big, prominent mouth opening calculation (Range: 0.25 to 1.0 max opening!)
        targetMouthY = Math.min(1.0, Math.max(0.25, flap * 0.9 + 0.15 + microTremor));

        // Horizontal mouth shape modulation (-0.75 to +0.75)
        targetMouthForm = Math.sin(t * 3.0 * Math.PI) * 0.75;
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Fast, snappy attack (0.85) and smooth natural release (0.4)
      const lerpSpeed = isSpeaking ? 0.85 : 0.4;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      applyMouthParameters(model, currentMouthY.current, currentMouthForm.current, isSpeaking);

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
