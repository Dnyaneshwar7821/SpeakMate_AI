import { useEffect, useRef } from 'react';
import { calculateNormalizedCursorPosition, lerp } from '../utils/Interpolation';
import { AVATAR_PARAMS, DEFAULT_AVATAR_CONFIG } from '../config/AvatarConfig';

/**
 * useMouseTracking Custom Hook
 * Tracks mouse/touch position and applies lerp smoothed head angles to Live2D model.
 */
export function useMouseTracking(model, containerRef) {
  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (!model) return;

    const handlePointerMove = (e) => {
      const rect = containerRef?.current
        ? containerRef.current.getBoundingClientRect()
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      targetPosRef.current = calculateNormalizedCursorPosition(clientX, clientY, rect);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    const updateHeadAngle = () => {
      if (model.internalModel) {
        const lerpFactor = DEFAULT_AVATAR_CONFIG.tracking.lerpFactor;

        currentPosRef.current.x = lerp(currentPosRef.current.x, targetPosRef.current.x, lerpFactor);
        currentPosRef.current.y = lerp(currentPosRef.current.y, targetPosRef.current.y, lerpFactor);

        const angleX = currentPosRef.current.x * DEFAULT_AVATAR_CONFIG.tracking.maxAngleX;
        const angleY = -currentPosRef.current.y * DEFAULT_AVATAR_CONFIG.tracking.maxAngleY;
        const angleZ = currentPosRef.current.x * DEFAULT_AVATAR_CONFIG.tracking.maxAngleZ;

        try {
          const coreModel = model.internalModel.coreModel;
          if (coreModel && typeof coreModel.setParamFloat === 'function') {
            coreModel.setParamFloat(AVATAR_PARAMS.ANGLE_X, angleX);
            coreModel.setParamFloat(AVATAR_PARAMS.ANGLE_Y, angleY);
            coreModel.setParamFloat(AVATAR_PARAMS.ANGLE_Z, angleZ);
          }
        } catch (e) {
          // ignore
        }
      }

      rafRef.current = requestAnimationFrame(updateHeadAngle);
    };

    rafRef.current = requestAnimationFrame(updateHeadAngle);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [model, containerRef]);
}
