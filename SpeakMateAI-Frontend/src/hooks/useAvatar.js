import { useState, useEffect } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * useAvatar Custom Hook
 * Tracks avatar loading state, errors, and current active Live2D model instance.
 */
export function useAvatar() {
  const [model, setModel] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubLoaded = EventBus.on(AVATAR_EVENTS.MODEL_LOADED, ({ model }) => {
      setModel(model);
      setIsLoaded(true);
      setError(null);
    });

    const unsubError = EventBus.on(AVATAR_EVENTS.MODEL_ERROR, ({ error }) => {
      setError(error);
      setIsLoaded(false);
    });

    return () => {
      unsubLoaded();
      unsubError();
    };
  }, []);

  return { model, isLoaded, error };
}
