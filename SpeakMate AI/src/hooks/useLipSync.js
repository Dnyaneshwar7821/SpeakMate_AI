import { useEffect, useRef, useState } from 'react';
import { AVATAR_PARAMS } from '../config/AvatarConfig';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * useLipSync Custom Hook
 * Provides continuous, text-cadence matched, hyper-smooth Live2D lip syncing.
 * Combines multi-frequency syllable envelope generators, phoneme shapes (ParamMouthForm),
 * word boundary pulses from SpeechSynthesis, and EventBus listener support.
 */
export function useLipSync(model, isSpeaking) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);
  const boundaryPulse = useRef(0);
  const [eventBusSpeaking, setEventBusSpeaking] = useState(false);

  // EventBus listener for global speech events
  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => {
      setEventBusSpeaking(true);
    });

    const unsubFinish = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      setEventBusSpeaking(false);
      boundaryPulse.current = 0;
    });

    const unsubBoundary = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, () => {
      // Trigger a mouth articulation pulse on word boundaries
      boundaryPulse.current = 0.85;
    });

    return () => {
      unsubStart();
      unsubFinish();
      unsubBoundary();
    };
  }, []);

  useEffect(() => {
    if (!model || !model.internalModel || !model.internalModel.coreModel) return;

    // Resolve speaking state across boolean, SpeechService instance, or EventBus
    const isService = typeof isSpeaking === 'object' && isSpeaking !== null && 'isSpeaking' in isSpeaking;
    const isDirectSpeaking = typeof isSpeaking === 'boolean' ? isSpeaking : false;
    const isServiceSpeaking = isService ? isSpeaking.isSpeaking : false;

    const activeSpeaking = isDirectSpeaking || isServiceSpeaking || eventBusSpeaking;

    let targetMouthY = 0;
    let targetMouthForm = 0;

    const applyParameters = () => {
      const coreModel = model?.internalModel?.coreModel;
      const internalModel = model?.internalModel;
      if (!coreModel && !internalModel) return;

      const yVal = currentMouthY.current;
      const formVal = currentMouthForm.current;

      try {
        if (coreModel) {
          // Cubism 4 setter
          if (typeof coreModel.setParameterValueById === 'function') {
            coreModel.setParameterValueById('ParamMouthOpenY', yVal);
            coreModel.setParameterValueById('ParamMouthForm', formVal);
            coreModel.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal);
            coreModel.setParameterValueById('PARAM_MOUTH_FORM', formVal);
          }
          // Cubism 2 & 4 setParamFloat setter
          if (typeof coreModel.setParamFloat === 'function') {
            coreModel.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal);
            coreModel.setParamFloat('PARAM_MOUTH_FORM', formVal);
            coreModel.setParamFloat('ParamMouthOpenY', yVal);
            coreModel.setParamFloat('ParamMouthForm', formVal);
          }
        }
        // Direct internal model parameter helper
        if (internalModel && typeof internalModel.setParamFloat === 'function') {
          internalModel.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal);
          internalModel.setParamFloat('PARAM_MOUTH_FORM', formVal);
          internalModel.setParamFloat('ParamMouthOpenY', yVal);
          internalModel.setParamFloat('ParamMouthForm', formVal);
        }
      } catch (e) {
        // ignore
      }
    };

    // Attach to internalModel beforeModelUpdate hook so parameter values are flushed to mesh
    const internalModel = model.internalModel;
    if (internalModel && typeof internalModel.on === 'function') {
      internalModel.on('beforeModelUpdate', applyParameters);
    }

    const updateLipSync = () => {
      if (activeSpeaking) {
        // High-precision time cadence matching natural human speech rate (~5.5 syllables/sec)
        const time = performance.now() * 0.011;

        // Syllable Envelope (Main wave + harmonic vowels/consonants modulation)
        const wave1 = Math.abs(Math.sin(time * 0.9));
        const wave2 = Math.abs(Math.sin(time * 2.1)) * 0.4;
        const wave3 = Math.cos(time * 0.45) * 0.2;

        let rawOpen = (wave1 + wave2 + wave3) * 0.75;

        // Blend with word boundary pulse if active
        if (boundaryPulse.current > 0) {
          rawOpen = Math.max(rawOpen, boundaryPulse.current);
          boundaryPulse.current *= 0.85; // Decay pulse
          if (boundaryPulse.current < 0.05) boundaryPulse.current = 0;
        }

        // Clamp between natural open boundaries (0.15 to 0.95)
        targetMouthY = Math.max(0.15, Math.min(0.95, rawOpen));

        // Dynamic Mouth Shaping (ParamMouthForm: -1.0 narrow 'OO/EE' to +1.0 wide 'AA/OH')
        const formWave = Math.sin(time * 1.3);
        targetMouthForm = formWave * 0.5;
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
        boundaryPulse.current = 0;
      }

      // Smooth exponential lerp filter (prevents mechanical jittering)
      const lerpSpeed = activeSpeaking ? 0.35 : 0.25;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      // Close completely if below small threshold
      if (!activeSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      applyParameters();
      rafRef.current = requestAnimationFrame(updateLipSync);
    };

    rafRef.current = requestAnimationFrame(updateLipSync);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (internalModel && typeof internalModel.off === 'function') {
        internalModel.off('beforeModelUpdate', applyParameters);
      }
    };
  }, [model, isSpeaking, eventBusSpeaking]);
}
