import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * Universal Parameter Applier for Cubism 2 (Chitose) and Cubism 4 (Haru)
 * Updates parameter memory slots directly on coreModel and internalModel,
 * adding realistic vocal head tilts and body posture dynamics during continuous speech.
 */
function applyMouthParameters(model, yVal, formVal, isSpeaking = false) {
  if (!model || !model.internalModel) return;
  const im = model.internalModel;
  const cm = im.coreModel;

  const t = performance.now() * 0.001;
  const vocalHeadY = isSpeaking ? Math.sin(t * 3.8) * 3.5 : 0;
  const vocalHeadZ = isSpeaking ? Math.sin(t * 2.0) * 2.2 : 0;
  const vocalBodyX = isSpeaking ? Math.sin(t * 1.5) * 1.5 : 0;

  if (cm) {
    // Cubism 4 (Haru)
    if (typeof cm.setParameterValueById === 'function') {
      try { cm.setParameterValueById('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('ParamMouthForm', formVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
      if (isSpeaking) {
        try { cm.setParameterValueById('ParamAngleY', vocalHeadY, 0.45); } catch (_) {}
        try { cm.setParameterValueById('ParamAngleZ', vocalHeadZ, 0.45); } catch (_) {}
        try { cm.setParameterValueById('ParamBodyAngleX', vocalBodyX, 0.35); } catch (_) {}
      }
    }
    // Cubism 2 (Chitose)
    if (typeof cm.setParamFloat === 'function') {
      try { cm.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthForm', formVal, 1.0); } catch (_) {}
      if (isSpeaking) {
        try { cm.setParamFloat('PARAM_ANGLE_Y', vocalHeadY, 0.45); } catch (_) {}
        try { cm.setParamFloat('PARAM_ANGLE_Z', vocalHeadZ, 0.45); } catch (_) {}
        try { cm.setParamFloat('PARAM_BODY_ANGLE_X', vocalBodyX, 0.35); } catch (_) {}
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
 * State-of-the-Art Whole-Sentence Live2D Lip Syncing & Vocal Posture for Haru and Chitose.
 * Features 3-layer harmonic speech wave generator, dual-axis mouth shaping, and sentence duration guarantee.
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);
  const activeSpeaking = useRef(isSpeakingProp);
  const speechDeadline = useRef(0);

  // Keep ref updated with prop
  useEffect(() => {
    activeSpeaking.current = isSpeakingProp;
    if (isSpeakingProp) {
      speechDeadline.current = Math.max(speechDeadline.current, performance.now() + 4500);
    }
  }, [isSpeakingProp]);

  // Subscribe to EventBus avatar events
  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, (data) => {
      activeSpeaking.current = true;
      const text = data?.text || '';
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length || 10;
      const speed = data?.speed || 1.0;
      // Sentence duration guarantee (e.g. 15 words = ~8.5 seconds)
      const durationMs = Math.max(3800, ((wordCount / (2.0 * speed)) * 1000) + 2400);
      speechDeadline.current = performance.now() + durationMs;
    });

    const unsubWord = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, () => {
      activeSpeaking.current = true;
      speechDeadline.current = Math.max(speechDeadline.current, performance.now() + 2000);
    });

    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      activeSpeaking.current = false;
      speechDeadline.current = 0;
    });

    return () => {
      unsubStart();
      unsubWord();
      unsubEnd();
    };
  }, []);

  // Post-Motion Engine Hook: Wrap internalModel.update
  useEffect(() => {
    if (!model || !model.internalModel) return;

    const internalModel = model.internalModel;
    const originalUpdate = internalModel.update ? internalModel.update.bind(internalModel) : null;

    if (originalUpdate) {
      internalModel.update = function (delta, now) {
        originalUpdate(delta, now);

        const currentTime = performance.now();
        const isWithinDeadline = currentTime < speechDeadline.current;
        const isSynthesizing = typeof window !== 'undefined' && Boolean(
          (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
        );
        const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing || isWithinDeadline);

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
      const now = performance.now();
      const isWithinDeadline = now < speechDeadline.current;
      const isSynthesizing = typeof window !== 'undefined' && Boolean(
        (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
      );

      const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing || isWithinDeadline);

      let targetMouthY = 0;
      let targetMouthForm = 0;

      if (isSpeaking) {
        const t = now * 0.001;

        // Multi-Layer Harmonic Speech Engine
        const carrier1 = Math.abs(Math.sin(t * 4.8 * Math.PI));
        const carrier2 = Math.abs(Math.sin(t * 2.1 * Math.PI)) * 0.25;
        const flap = Math.pow(carrier1 + carrier2, 0.55);

        // Vocal vibration micro-tremor
        const microTremor = Math.sin(t * 15.0 * Math.PI) * 0.1;

        // Big, expressive mouth opening calculation (0.22 to 1.0 max opening)
        targetMouthY = Math.min(1.0, Math.max(0.22, flap * 0.95 + 0.15 + microTremor));

        // Horizontal mouth shape formant modulation (-0.8 to +0.8)
        targetMouthForm = Math.sin(t * 3.4 * Math.PI) * 0.8;
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Fast attack (0.85) and smooth release (0.4)
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
