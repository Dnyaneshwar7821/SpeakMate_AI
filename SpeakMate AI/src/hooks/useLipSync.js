import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';
import { getPrimaryVisemeForWord } from '../utils/PhoneticVisemeEngine';

/**
 * Universal Parameter Applier for Cubism 2 (Chitose) and Cubism 4 (Haru)
 * Safely applies parameters directly to the CoreModel buffers every frame.
 */
function applyMouthParameters(model, yVal, formVal, isSpeaking = false) {
  if (!model || !model.internalModel) return;
  
  const im = model.internalModel;
  const cm = im.coreModel;
  if (!cm) return;

  const t = performance.now() * 0.001;
  const vocalHeadY = isSpeaking ? Math.sin(t * 2.4) * 2.8 : 0;
  const vocalHeadZ = isSpeaking ? Math.cos(t * 1.5) * 1.8 : 0;
  const vocalBodyX = isSpeaking ? Math.sin(t * 1.1) * 1.4 : 0;

  // 1. Cubism 4 (Haru)
  if (typeof cm.setParameterValueById === 'function') {
    try { cm.setParameterValueById('ParamMouthOpenY', Math.max(0, Math.min(1.0, yVal))); } catch (_) {}
    try { cm.setParameterValueById('ParamMouthForm', Math.max(-1.0, Math.min(1.0, formVal))); } catch (_) {}
    if (isSpeaking) {
      try { cm.setParameterValueById('ParamAngleY', vocalHeadY); } catch (_) {}
      try { cm.setParameterValueById('ParamAngleZ', vocalHeadZ); } catch (_) {}
      try { cm.setParameterValueById('ParamBodyAngleX', vocalBodyX); } catch (_) {}
    }
  }
  
  // 2. Cubism 2 (Chitose)
  if (typeof cm.setParamFloat === 'function') {
    try { cm.setParamFloat('PARAM_MOUTH_OPEN_Y', Math.max(0, Math.min(1.0, yVal))); } catch (_) {}
    try { cm.setParamFloat('PARAM_MOUTH_FORM', Math.max(-1.0, Math.min(1.0, formVal))); } catch (_) {}
    if (isSpeaking) {
      try { cm.setParamFloat('PARAM_ANGLE_Y', vocalHeadY); } catch (_) {}
      try { cm.setParamFloat('PARAM_ANGLE_Z', vocalHeadZ); } catch (_) {}
      try { cm.setParamFloat('PARAM_BODY_ANGLE_X', vocalBodyX); } catch (_) {}
    }
  }
}

/**
 * useLipSync Custom Hook
 * Connects SpeechSynthesis & EventBus to Live2D avatars for perfect phonetic viseme sync.
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

  // Animation calculation loop (Continuous 60 FPS)
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
        const phoneticY = targetMouthYRef.current > 0 ? targetMouthYRef.current : 0.9;
        const phoneticForm = targetMouthFormRef.current || 0.2;

        const timeSinceWord = now - lastWordTimeRef.current;
        let envelope = 0;

        // Word-Boundary Envelope (Attack, Sustain, Decay)
        if (timeSinceWord < 90) {
          envelope = timeSinceWord / 90; // Attack
        } else if (timeSinceWord < 240) {
          envelope = 1.0; // Sustain
        } else if (timeSinceWord < 380) {
          envelope = 1.0 - ((timeSinceWord - 240) / 140); // Decay
        } else {
          // Robust universal multi-frequency speech cadence fallback
          const harmonicCadence = Math.abs(Math.sin(t * 11.5)) * 0.45 + Math.abs(Math.sin(t * 17.2)) * 0.35 + 0.2;
          envelope = Math.min(1.0, Math.max(0.25, harmonicCadence));
        }

        const microTremor = envelope > 0.1 ? Math.sin(t * 8.0 * Math.PI) * 0.04 : 0;
        targetMouthY = Math.min(1.0, Math.max(0.0, (phoneticY * envelope) + microTremor));
        targetMouthForm = phoneticForm;
      }

      const lerpSpeed = isSpeaking ? 0.40 : 0.20;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      // Apply directly to model core on every frame
      if (model) {
        applyMouthParameters(model, currentMouthY.current, currentMouthForm.current, isSpeaking);
      }

      rafRef.current = requestAnimationFrame(updateStateLoop);
    };

    rafRef.current = requestAnimationFrame(updateStateLoop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [model, isSpeakingProp]);

  // Hook motionManager update to guarantee mouth parameter overrides motion curves
  useEffect(() => {
    if (!model || !model.internalModel || !model.internalModel.motionManager) return;

    const motionManager = model.internalModel.motionManager;
    const originalMotionUpdate = motionManager.update ? motionManager.update.bind(motionManager) : null;

    if (originalMotionUpdate) {
      motionManager.update = function (coreModel, now) {
        originalMotionUpdate(coreModel, now);

        const currentTime = performance.now();
        const isGlobalLock = typeof window !== 'undefined' && Boolean(window._speakmate_ai_is_speaking);
        const isWithinDeadline = currentTime < speechDeadline.current;
        const isSynthesizing = typeof window !== 'undefined' && Boolean(
          (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending))
        );
        const isSpeaking = Boolean(isGlobalLock || activeSpeaking.current || isSpeakingProp || isSynthesizing || isWithinDeadline);

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
