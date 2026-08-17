import { useEffect, useRef } from 'react';
import { AVATAR_PARAMS, DEFAULT_AVATAR_CONFIG } from '../config/AvatarConfig';

/**
 * useBlink Custom Hook
 * Handles randomized automatic eye blinking for natural avatar posture.
 */
export function useBlink(model) {
  const timeoutRef = useRef(null);
  const isBlinkingRef = useRef(false);

  useEffect(() => {
    if (!model) return;

    const triggerBlink = () => {
      if (!model.internalModel) return;

      isBlinkingRef.current = true;
      const durationMs = DEFAULT_AVATAR_CONFIG.blinking.durationMs;

      // Close eyes
      try {
        const coreModel = model.internalModel?.coreModel;
        const internal = model.internalModel;
        if (coreModel) {
          if (typeof coreModel.setParameterValueById === 'function') {
            coreModel.setParameterValueById('ParamEyeLOpen', 0);
            coreModel.setParameterValueById('ParamEyeROpen', 0);
            coreModel.setParameterValueById('PARAM_EYE_L_OPEN', 0);
            coreModel.setParameterValueById('PARAM_EYE_R_OPEN', 0);
          }
          if (typeof coreModel.setParamFloat === 'function') {
            coreModel.setParamFloat('PARAM_EYE_L_OPEN', 0);
            coreModel.setParamFloat('PARAM_EYE_R_OPEN', 0);
            coreModel.setParamFloat('ParamEyeLOpen', 0);
            coreModel.setParamFloat('ParamEyeROpen', 0);
          }
        }
        if (internal && typeof internal.setParamFloat === 'function') {
          internal.setParamFloat('PARAM_EYE_L_OPEN', 0);
          internal.setParamFloat('PARAM_EYE_R_OPEN', 0);
          internal.setParamFloat('ParamEyeLOpen', 0);
          internal.setParamFloat('ParamEyeROpen', 0);
        }
      } catch (e) {
        // ignore
      }

      // Reopen eyes after durationMs
      setTimeout(() => {
        if (!model.internalModel) return;
        try {
          const coreModel = model.internalModel.coreModel;
          const internal = model.internalModel;
          if (coreModel) {
            if (typeof coreModel.setParameterValueById === 'function') {
              coreModel.setParameterValueById('ParamEyeLOpen', 1.0);
              coreModel.setParameterValueById('ParamEyeROpen', 1.0);
              coreModel.setParameterValueById('PARAM_EYE_L_OPEN', 1.0);
              coreModel.setParameterValueById('PARAM_EYE_R_OPEN', 1.0);
            }
            if (typeof coreModel.setParamFloat === 'function') {
              coreModel.setParamFloat('PARAM_EYE_L_OPEN', 1.0);
              coreModel.setParamFloat('PARAM_EYE_R_OPEN', 1.0);
              coreModel.setParamFloat('ParamEyeLOpen', 1.0);
              coreModel.setParamFloat('ParamEyeROpen', 1.0);
            }
          }
          if (internal && typeof internal.setParamFloat === 'function') {
            internal.setParamFloat('PARAM_EYE_L_OPEN', 1.0);
            internal.setParamFloat('PARAM_EYE_R_OPEN', 1.0);
            internal.setParamFloat('ParamEyeLOpen', 1.0);
            internal.setParamFloat('ParamEyeROpen', 1.0);
          }
        } catch (e) {
          // ignore
        }
        isBlinkingRef.current = false;
        scheduleNextBlink();
      }, durationMs);
    };

    const scheduleNextBlink = () => {
      const { minIntervalMs, maxIntervalMs } = DEFAULT_AVATAR_CONFIG.blinking;
      const interval = Math.random() * (maxIntervalMs - minIntervalMs) + minIntervalMs;
      timeoutRef.current = setTimeout(triggerBlink, interval);
    };

    scheduleNextBlink();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [model]);
}
