import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AvatarCanvas } from '../components/avatar/AvatarCanvas';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

export function AvatarEmbed() {
  const [searchParams] = useSearchParams();
  const initialModel = searchParams.get('model') || 'haru';
  const initialFraming = searchParams.get('framing') || 'faceToChest';

  const [activeModel, setActiveModel] = useState(initialModel);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [state, setState] = useState('idle');
  const [mood, setMood] = useState('neutral');

  // Enforce transparent body & html for clean React Native WebView embed
  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';

    const handleMessage = (event) => {
      try {
        const raw = event.data;
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'SPEAK') {
          setIsSpeaking(Boolean(data.isSpeaking));
          if (data.text) setSpokenText(data.text);
          if (data.speed) setSpeechSpeed(data.speed);
        } else if (data.type === 'STATE') {
          setState(data.state || 'idle');
          setIsSpeaking(Boolean(data.isSpeaking || data.state === 'speaking'));
          if (data.text) setSpokenText(data.text);
          if (data.speed) setSpeechSpeed(data.speed);
        } else if (data.type === 'MOOD') {
          setMood(data.mood || 'neutral');
        } else if (data.type === 'MODEL') {
          if (data.model) {
            setActiveModel(data.model);
            EventBus.emit(AVATAR_EVENTS.GENDER_CHANGED, { model: data.model });
          }
        }
      } catch (err) {
        // ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleModelLoaded = (model) => {
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'READY' }));
    }
  };

  const handleModelError = (error) => {
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'ERROR', message: error?.message || 'Failed to load model' })
      );
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'transparent',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <AvatarCanvas
        key={activeModel}
        framing={initialFraming}
        isSpeaking={isSpeaking}
        onModelLoaded={handleModelLoaded}
        onError={handleModelError}
        className="w-full h-full min-h-0"
      />
    </div>
  );
}

export default AvatarEmbed;
