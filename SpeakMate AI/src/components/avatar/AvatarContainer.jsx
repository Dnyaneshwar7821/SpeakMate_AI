import React, { useState, useRef, useEffect } from 'react';
import { AvatarCanvas } from './AvatarCanvas';
import { ExpressionPicker } from './ExpressionPicker';
import { AvatarStatusBadge } from './AvatarStatusBadge';
import { useMouseTracking } from '../../hooks/useMouseTracking';
import { useBlink } from '../../hooks/useBlink';
import { useLipSync } from '../../hooks/useLipSync';
import { useExpressions } from '../../hooks/useExpressions';
import { useMotion } from '../../hooks/useMotion';
import { useSpeech } from '../../hooks/useSpeech';
import { AIService } from '../../services/ai/AIService';

export function AvatarContainer({
  modelPath,
  showControls = true,
  className = '',
  onSpeechComplete,
}) {
  const containerRef = useRef(null);
  const [model, setModel] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [aiInput, setAiInput] = useState('');
  const [lastResponse, setLastResponse] = useState('');

  // Reusable Hooks & Services
  const { speechService, isSpeaking, speak, stop } = useSpeech();
  const { currentExpression, setExpression } = useExpressions(model);
  const { playMotion, playIdle, MOTIONS } = useMotion(model);

  const aiServiceRef = useRef(new AIService());

  // Attach continuous posture dynamics
  useMouseTracking(model, containerRef);
  useBlink(model);
  useLipSync(model, speechService);

  // Synchronize state badge when speaking state changes
  useEffect(() => {
    if (isSpeaking) {
      setStatus('Speaking');
      setExpression('happy');
    } else if (status === 'Speaking') {
      setStatus('Idle');
      playIdle();
      if (onSpeechComplete) onSpeechComplete();
    }
  }, [isSpeaking]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!aiInput.trim()) return;

    const userMessage = aiInput;
    setAiInput('');
    setStatus('Thinking');
    setExpression('thinking');
    playMotion(MOTIONS.THINKING);

    try {
      const aiReply = await aiServiceRef.current.generateResponse(userMessage);
      setLastResponse(aiReply);

      // Trigger Speech & Real-time LipSync
      speak(aiReply);
    } catch (err) {
      console.error('[AvatarContainer] AI generation error:', err);
      setStatus('Idle');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-between w-full h-full min-h-[500px] p-4 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ${className}`}
    >
      {/* Top Status Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <AvatarStatusBadge status={status} />
      </div>

      {/* Main PixiJS Live2D Canvas */}
      <div className="w-full h-full flex-1 flex items-center justify-center relative">
        <AvatarCanvas
          modelPath={modelPath}
          framing="faceToChest"
          onModelLoaded={(loadedModel) => {
            setModel(loadedModel);
            playIdle();
          }}
          onError={(err) => console.warn('[AvatarContainer] Model canvas error:', err)}
        />
      </div>

      {/* Interactive AI Response Overlay & Controls */}
      <div className="w-full z-10 flex flex-col items-center gap-3 max-w-xl">
        {lastResponse && (
          <div className="w-full p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg text-slate-200 text-sm animate-fade-in">
            <span className="font-semibold text-indigo-400 mr-2">SpeakMate AI:</span>
            {lastResponse}
          </div>
        )}

        {/* Expression Controls */}
        {showControls && (
          <ExpressionPicker
            currentExpression={currentExpression}
            onSelectExpression={(exp) => setExpression(exp)}
          />
        )}

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Type a message to talk with SpeakMate AI..."
            className="flex-1 px-4 py-3 bg-slate-800/80 backdrop-blur-md text-white text-sm rounded-2xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!aiInput.trim() || status === 'Thinking'}
            className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm rounded-2xl shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 transition-all"
          >
            Talk
          </button>
        </form>
      </div>
    </div>
  );
}
