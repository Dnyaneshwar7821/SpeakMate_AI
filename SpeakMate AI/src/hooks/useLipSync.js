import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';
import { getPrimaryVisemeForWord } from '../utils/PhoneticVisemeEngine';

/**
 * Universal Parameter Applier for Cubism 2 (Chitose) and Cubism 4 (Haru)
 * This safely applies parameters directly to the CoreModel buffers.
 */
function applyMouthParameters(model, yVal, formVal, isSpeaking = false) {
  if (!model || !model.internalModel) return;
  
  const im = model.internalModel;
  const cm = im.coreModel;
  if (!cm) return;

  const t = performance.now() * 0.001;
  const vocalHeadY = isSpeaking ? Math.sin(t * 2.2) * 2.5 : 0;
  const vocalHeadZ = isSpeaking ? Math.sin(t * 1.4) * 1.5 : 0;
  const vocalBodyX = isSpeaking ? Math.sin(t * 1.0) * 1.2 : 0;

  // 1. Cubism 4 (Haru)
  if (typeof cm.setParameterValueById === 'function') {
    try { cm.setParameterValueById('ParamMouthOpenY', yVal); } catch (_) {}
    try { cm.setParameterValueById('ParamMouthForm', formVal); } catch (_) {}
    if (isSpeaking) {
      try { cm.setParameterValueById('ParamAngleY', vocalHeadY); } catch (_) {}
      try { cm.setParameterValueById('ParamAngleZ', vocalHeadZ); } catch (_) {}
      try { cm.setParameterValueById('ParamBodyAngleX', vocalBodyX); } catch (_) {}
    }
  }
  
  // 2. Cubism 2 (Chitose)
  if (typeof cm.setParamFloat === 'function') {
    try { cm.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal); } catch (_) {}
    try { cm.setParamFloat('PARAM_MOUTH_FORM', formVal); } catch (_) {}
    if (isSpeaking) {
      try { cm.setParamFloat('PARAM_ANGLE_Y', vocalHeadY); } catch (_) {}
      try { cm.setParamFloat('PARAM_ANGLE_Z', vocalHeadZ); } catch (_) {}
      try { cm.setParamFloat('PARAM_BODY_ANGLE_X', vocalBodyX); } catch (_) {}
    }
  }
}

/**
 * useLipSync Custom Hook
 * Overrides motionManager.update to guarantee 100% mouth visibility.
 */
export function useLipSync(model, isSpeakingProp = false) {
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);
  const targetMouthYRef = useRef(1.0);
  const targetMouthFormRef = useRef(0.2);
  const activeSpeaking = useRef(isSpeakingProp);
  const speechDeadline = useRef(0);
  const rafRef = useRef(null);
  const lastWordTimeRef = useRef(0);

  useEffect(() => {
    activeSpeaking.current = isSpeakingProp;
    if (isSpeakingProp) {
      speechDeadline.current = Math.max(speechDeadline.current, performance.now() + 15000);
    }
  }, [isSpeakingProp]);

  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, (data) => {
      activeSpeaking.current = true;
      if (typeof window !== 'undefined') window._speakmate_ai_is_speaking = true;

      const text = data?.text || '';
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length || 10;
      const speed = data?.speed || 1.0;
      const durationMs = Math.max(12000, ((wordCount / (1.0 * speed)) * 1000) + 8000);
      
      speechDeadline.current = performance.now() + durationMs;
      targetMouthYRef.current = 1.0;
      targetMouthFormRef.current = 0.2;
      lastWordTimeRef.current = performance.now();
    });

    const unsubWord = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, (data) => {
      activeSpeaking.current = true;
      if (typeof window !== 'undefined') window._speakmate_ai_is_speaking = true;
      speechDeadline.current = Math.max(speechDeadline.current, performance.now() + 6000);
      
      // Crucial: Update the timestamp for the perfect sync envelope!
      lastWordTimeRef.current = performance.now();

      const word = data?.word || '';
      if (word) {
        const visemeObj = (data?.yVal !== undefined && data?.formVal !== undefined)
          ? { yVal: data.yVal, formVal: data.formVal }
          : getPrimaryVisemeForWord(word);

        targetMouthYRef.current = Math.max(0.75, visemeObj.yVal || 1.0);
        targetMouthFormRef.current = visemeObj.formVal || 0.2;
      }
    });

    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      const isSynthesizing = typeof window !== 'undefined' && Boolean(
        window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)
      );
      if (!isSynthesizing) {
        if (typeof window !== 'undefined') window._speakmate_ai_is_speaking = false;
        activeSpeaking.current = false;
        speechDeadline.current = performance.now() + 800;
      }
    });

    return () => {
      if (typeof unsubStart === 'function') unsubStart();
      if (typeof unsubWord === 'function') unsubWord();
      if (typeof unsubEnd === 'function') unsubEnd();
    };
  }, []);

  // Animation calculation loop
  useEffect(() => {
    const updateStateLoop = () => {
      const now = performance.now();
      const isGlobalLock = typeof window !== 'undefined' && Boolean(window._speakmate_ai_is_speaking);
      const isWithinDeadline = now < speechDeadline.current;
      const isSynthesizing = typeof window !== 'undefined' && Boolean(
        (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
      );
      const isSpeaking = Boolean(isGlobalLock || activeSpeaking.current || isSpeakingProp || isSynthesizing || isWithinDeadline);

      let targetMouthY = 0;
      let targetMouthForm = 0;

      if (isSpeaking) {
        const t = now * 0.001;
        const phoneticY = targetMouthYRef.current > 0 ? targetMouthYRef.current : 1.0;
        const phoneticForm = targetMouthFormRef.current || 0.2;

        const timeSinceWord = now - lastWordTimeRef.current;
        let envelope = 0;

        // Perfect Word-Boundary Envelope (Attack, Sustain, Decay)
        if (timeSinceWord < 80) {
          envelope = timeSinceWord / 80; // Attack
        } else if (timeSinceWord < 220) {
          envelope = 1.0; // Sustain
        } else if (timeSinceWord < 350) {
          envelope = 1.0 - ((timeSinceWord - 220) / 130); // Decay
        } else {
          envelope = 0; // Fully closed between words
        }

        const microTremor = envelope > 0.1 ? Math.sin(t * 7.0 * Math.PI) * 0.05 : 0;
        targetMouthY = Math.min(1.0, Math.max(0.0, (phoneticY * envelope) + microTremor));
        targetMouthForm = phoneticForm;
      }

      const lerpSpeed = isSpeaking ? 0.35 : 0.15;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      rafRef.current = requestAnimationFrame(updateStateLoop);
    };

    rafRef.current = requestAnimationFrame(updateStateLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isSpeakingProp]);

  // The Bulletproof Engine Hook
  useEffect(() => {
    if (!model || !model.internalModel || !model.internalModel.motionManager) return;

    const motionManager = model.internalModel.motionManager;
    const originalMotionUpdate = motionManager.update ? motionManager.update.bind(motionManager) : null;

    if (originalMotionUpdate) {
      motionManager.update = function (coreModel, now) {
        // Run standard motions first
        originalMotionUpdate(coreModel, now);

        // Calculate current speech status
        const currentTime = performance.now();
        const isGlobalLock = typeof window !== 'undefined' && Boolean(window._speakmate_ai_is_speaking);
        const isWithinDeadline = currentTime < speechDeadline.current;
        const isSynthesizing = typeof window !== 'undefined' && Boolean(
          (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
        );
        const isSpeaking = Boolean(isGlobalLock || activeSpeaking.current || isSpeakingProp || isSynthesizing || isWithinDeadline);

        // Apply our mouth parameters FORCEFULLY overriding any idle/speech curves
        applyMouthParameters(model, currentMouthY.current, currentMouthForm.current, isSpeaking);
      };
    }

    return () => {
      if (originalMotionUpdate && model && model.internalModel && model.internalModel.motionManager) {
        model.internalModel.motionManager.update = originalMotionUpdate;
      }
    };
  }, [model, isSpeakingProp]);
}

export default useLipSync;
