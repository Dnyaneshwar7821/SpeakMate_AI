import { useEffect, useRef } from 'react';
import { AVATAR_PARAMS } from '../config/AvatarConfig';

/**
 * useLipSync Custom Hook
 * Connects a boolean isSpeaking state to Live2D model ParamMouthOpenY with synthetic sine wave lip sync.
 */
export function useLipSync(model, isSpeaking) {
  const rafRef = useRef(null);

  useEffect(() => {
    if (!model || !model.internalModel || !model.internalModel.coreModel) return;

    const updateLipSync = () => {
      const coreModel = model.internalModel.coreModel;
      let amplitude = 0;

      if (isSpeaking) {
        // Synthetic vocal modulation simulation
        const time = performance.now() / 100;
        const baseWave = Math.abs(Math.sin(time * 0.8) * Math.cos(time * 0.3));
        amplitude = 0.2 + (baseWave * 0.7);
      }

      try {
        // Cubism 4 API
        if (typeof coreModel.setParameterValueById === 'function') {
          coreModel.setParameterValueById(AVATAR_PARAMS.MOUTH_OPEN_Y, amplitude);
        }
        // Cubism 2 API
        else if (typeof coreModel.setParamFloat === 'function') {
          coreModel.setParamFloat(AVATAR_PARAMS.MOUTH_OPEN_Y, amplitude);
        }
      } catch (e) {
        // ignore
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
