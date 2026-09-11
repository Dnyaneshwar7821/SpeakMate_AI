import { useState, useEffect, useRef } from 'react';
import { SpeechService } from '../services/speech/SpeechService';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * useSpeech Custom Hook
 * Provides reactive speech state management & speech controls.
 */
export function useSpeech(configOptions = {}) {
  const speechServiceRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!speechServiceRef.current) {
    speechServiceRef.current = new SpeechService(configOptions);
  }

  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, () => {
      setIsSpeaking(true);
    });

    const unsubFinish = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      setIsSpeaking(false);
    });

    return () => {
      unsubStart();
      unsubFinish();
    };
  }, []);

  const speak = (text, options) => {
    return speechServiceRef.current.speak(text, options);
  };

  const stop = () => {
    speechServiceRef.current.stop();
  };

  return {
    speechService: speechServiceRef.current,
    isSpeaking,
    speak,
    stop,
  };
}
