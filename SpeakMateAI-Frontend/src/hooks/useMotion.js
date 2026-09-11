import { useState, useEffect, useRef } from 'react';
import { MotionManager } from '../services/live2d/MotionManager';
import { MOTIONS } from '../config/MotionConfig';

/**
 * useMotion Custom Hook
 * Provides motion controls (Idle, Wave, Greeting, Thinking, Listening, Speaking).
 */
export function useMotion(model) {
  const managerRef = useRef(new MotionManager());
  const [currentMotion, setCurrentMotion] = useState(MOTIONS.IDLE);

  useEffect(() => {
    if (model) {
      managerRef.current.setModel(model);
    }
  }, [model]);

  const playMotion = async (group, index = 0, priority) => {
    const success = await managerRef.current.playMotion(group, index, priority);
    if (success) {
      setCurrentMotion(group);
    }
    return success;
  };

  const playIdle = () => {
    return playMotion(MOTIONS.IDLE, 0);
  };

  return {
    currentMotion,
    playMotion,
    playIdle,
    MOTIONS,
  };
}
