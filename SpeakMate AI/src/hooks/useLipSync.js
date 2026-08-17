import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * Phonetic Viseme Table
 * Maps English sound units to Live2D vertical openness (openY: 0.0 to 1.0)
 * and horizontal shaping (form: -1.0 to 1.0, -1.0 = round 'OO', +1.0 = wide 'EE').
 */
const VISEME_MAP = {
  SIL: { openY: 0.0,  form: 0.0 },   // Silence
  MBP: { openY: 0.05, form: 0.0 },   // M, B, P (Closed lips)
  FV:  { openY: 0.32, form: 0.25 },  // F, V
  TH:  { openY: 0.40, form: 0.15 },  // TH
  SZ:  { openY: 0.28, form: 0.80 },  // S, Z, C (Teeth together, wide smile)
  SH:  { openY: 0.52, form: -0.50 }, // SH, CH, J (Protruded lips)
  TDN: { openY: 0.48, form: 0.35 },  // T, D, N, L
  KG:  { openY: 0.60, form: 0.20 },  // K, G, R, H
  EE:  { openY: 0.80, form: 0.95 },  // EE, EA, I, Y, AY (Wide smile)
  EH:  { openY: 0.90, form: 0.60 },  // E, EH, AE (Medium-wide)
  AA:  { openY: 1.00, form: 0.30 },  // A, AH, AW (Maximum jaw drop)
  OH:  { openY: 0.92, form: -0.80 }, // O, OH, OW, OA (Large round)
  OO:  { openY: 0.65, form: -0.95 }, // OO, U, UW, W (Tight round whistle)
};

/**
 * Converts FULL English text into an exhaustive, sequential phonetic viseme timeline
 */
function textToFullPhonemeSequence(text = '', speedMultiplier = 1.0) {
  if (!text) return [];

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);
  const sequence = [];

  // Duration per phoneme in ms (~75ms base, scaled by speech speed)
  const baseDuration = 75 / Math.max(0.5, speedMultiplier);

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const word = words[wIdx];
    let i = 0;

    while (i < word.length) {
      const two = word.slice(i, i + 2);
      const three = word.slice(i, i + 3);

      if (three === 'igh') {
        sequence.push({ viseme: 'EE', dur: baseDuration * 1.3, wIdx });
        i += 3;
      } else if (two === 'th') {
        sequence.push({ viseme: 'TH', dur: baseDuration * 0.9, wIdx });
        i += 2;
      } else if (two === 'sh' || two === 'ch') {
        sequence.push({ viseme: 'SH', dur: baseDuration * 1.1, wIdx });
        i += 2;
      } else if (two === 'ph') {
        sequence.push({ viseme: 'FV', dur: baseDuration * 0.9, wIdx });
        i += 2;
      } else if (two === 'ee' || two === 'ea' || two === 'ai' || two === 'ay') {
        sequence.push({ viseme: 'EE', dur: baseDuration * 1.4, wIdx });
        i += 2;
      } else if (two === 'oo') {
        sequence.push({ viseme: 'OO', dur: baseDuration * 1.4, wIdx });
        i += 2;
      } else if (two === 'ou' || two === 'ow' || two === 'oa' || two === 'aw') {
        sequence.push({ viseme: 'OH', dur: baseDuration * 1.3, wIdx });
        i += 2;
      } else {
        const ch = word[i];
        if (ch === 'm' || ch === 'b' || ch === 'p') {
          sequence.push({ viseme: 'MBP', dur: baseDuration * 0.85, wIdx });
        } else if (ch === 'f' || ch === 'v') {
          sequence.push({ viseme: 'FV', dur: baseDuration * 0.9, wIdx });
        } else if (ch === 's' || ch === 'z' || ch === 'c') {
          sequence.push({ viseme: 'SZ', dur: baseDuration * 0.95, wIdx });
        } else if (ch === 't' || ch === 'd' || ch === 'n' || ch === 'l') {
          sequence.push({ viseme: 'TDN', dur: baseDuration * 0.9, wIdx });
        } else if (ch === 'k' || ch === 'g' || ch === 'h' || ch === 'r' || ch === 'j') {
          sequence.push({ viseme: 'KG', dur: baseDuration * 0.9, wIdx });
        } else if (ch === 'w') {
          sequence.push({ viseme: 'OO', dur: baseDuration * 1.0, wIdx });
        } else if (ch === 'y') {
          sequence.push({ viseme: 'EE', dur: baseDuration * 1.0, wIdx });
        } else if (ch === 'a') {
          sequence.push({ viseme: 'AA', dur: baseDuration * 1.3, wIdx });
        } else if (ch === 'e') {
          sequence.push({ viseme: 'EH', dur: baseDuration * 1.2, wIdx });
        } else if (ch === 'i') {
          sequence.push({ viseme: 'EE', dur: baseDuration * 1.2, wIdx });
        } else if (ch === 'o') {
          sequence.push({ viseme: 'OH', dur: baseDuration * 1.3, wIdx });
        } else if (ch === 'u') {
          sequence.push({ viseme: 'OO', dur: baseDuration * 1.2, wIdx });
        }
        i++;
      }
    }

    // Inter-word pause
    sequence.push({ viseme: 'TDN', dur: 40 / Math.max(0.5, speedMultiplier), wIdx });
  }

  return sequence;
}

/**
 * Universal Parameter Applier for Cubism 2 (Chitose) and Cubism 4 (Haru)
 */
function applyMouthParameters(model, yVal, formVal) {
  if (!model || !model.internalModel) return;
  const im = model.internalModel;
  const cm = im.coreModel;

  if (cm) {
    if (typeof cm.setParameterValueById === 'function') {
      try { cm.setParameterValueById('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('ParamMouthForm', formVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
    }
    if (typeof cm.setParamFloat === 'function') {
      try { cm.setParamFloat('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParamFloat('ParamMouthForm', formVal, 1.0); } catch (_) {}
    }
  }

  if (typeof im.setParameterValueById === 'function') {
    try { im.setParameterValueById('ParamMouthOpenY', yVal); } catch (_) {}
    try { im.setParameterValueById('ParamMouthForm', formVal); } catch (_) {}
    try { im.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal); } catch (_) {}
    try { im.setParameterValueById('PARAM_MOUTH_FORM', formVal); } catch (_) {}
  }
}

/**
 * useLipSync Custom Hook
 * Flawless real-time speech lip syncing.
 * Parses the FULL sentence text so lip sync NEVER runs out of visemes or stops mid-sentence.
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);

  const activeSpeaking = useRef(isSpeakingProp);
  const fullSentenceQueue = useRef([]);
  const visemeIndex = useRef(0);
  const visemeStartTime = useRef(0);

  // Sync prop changes
  useEffect(() => {
    activeSpeaking.current = isSpeakingProp;
  }, [isSpeakingProp]);

  // Subscribe to SpeechSynthesis EventBus lifecycle
  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, (data) => {
      activeSpeaking.current = true;
      if (data?.text) {
        fullSentenceQueue.current = textToFullPhonemeSequence(data.text, data.speed || 1.0);
        visemeIndex.current = 0;
        visemeStartTime.current = performance.now();
      }
    });

    const unsubWord = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, (data) => {
      activeSpeaking.current = true;
      // Optional calibration on boundary
      if (data?.word && fullSentenceQueue.current.length > 0) {
        const wordClean = data.word.toLowerCase().replace(/[^a-z]/g, '');
        const queue = fullSentenceQueue.current;
        // Adjust cursor index if boundary is within nearby window
        for (let idx = visemeIndex.current; idx < Math.min(queue.length, visemeIndex.current + 15); idx++) {
          if (queue[idx]) {
            visemeIndex.current = idx;
            break;
          }
        }
      }
    });

    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      activeSpeaking.current = false;
      fullSentenceQueue.current = [];
      visemeIndex.current = 0;
    });

    return () => {
      unsubStart();
      unsubWord();
      unsubEnd();
    };
  }, []);

  // Post-Motion Engine Hook: Overrides model.internalModel.update
  useEffect(() => {
    if (!model || !model.internalModel) return;

    const internalModel = model.internalModel;
    const originalUpdate = internalModel.update ? internalModel.update.bind(internalModel) : null;

    if (originalUpdate) {
      internalModel.update = function (delta, now) {
        originalUpdate(delta, now);
        applyMouthParameters(model, currentMouthY.current, currentMouthForm.current);
      };
    }

    return () => {
      if (originalUpdate && internalModel) {
        internalModel.update = originalUpdate;
      }
    };
  }, [model]);

  // 60 FPS Real-time Pronunciation & Vowel Shape Animator
  useEffect(() => {
    const updateLipSync = () => {
      const isSynthesizing = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking);
      const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

      let targetMouthY = 0;
      let targetMouthForm = 0;

      if (isSpeaking) {
        const now = performance.now();
        const t = now * 0.001;
        const queue = fullSentenceQueue.current;

        if (queue && queue.length > 0) {
          // Continuous loop through full sentence viseme sequence until speech ends
          let curr = queue[visemeIndex.current];
          if (curr) {
            const elapsed = now - visemeStartTime.current;
            if (elapsed >= curr.dur) {
              visemeIndex.current = (visemeIndex.current + 1) % queue.length;
              visemeStartTime.current = now;
              curr = queue[visemeIndex.current];
            }
          }

          const vKey = curr ? curr.viseme : 'AA';
          const vData = VISEME_MAP[vKey] || VISEME_MAP.AA;

          // Syllable Carrier Oscillation (~4.8 Hz natural speech frequency)
          const carrier = Math.abs(Math.sin(t * 4.8 * Math.PI));
          const flap = Math.pow(carrier, 0.65); // Non-linear opening curve

          // Blend current viseme target with dynamic speech flap
          targetMouthY = Math.min(1.0, Math.max(0.18, flap * vData.openY + 0.12));
          targetMouthForm = vData.form + Math.sin(t * 2.8 * Math.PI) * 0.15;
        } else {
          // Fallback carrier wave if no text queue is loaded
          const carrier = Math.abs(Math.sin(t * 4.8 * Math.PI));
          const flap = Math.pow(carrier, 0.65);
          targetMouthY = Math.min(1.0, Math.max(0.18, flap * 0.9 + 0.12));
          targetMouthForm = Math.sin(t * 2.8 * Math.PI) * 0.5;
        }
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Fast attack (0.85) and smooth release (0.45)
      const lerpSpeed = isSpeaking ? 0.85 : 0.45;
      currentMouthY.current += (targetMouthY - currentMouthY.current) * lerpSpeed;
      currentMouthForm.current += (targetMouthForm - currentMouthForm.current) * lerpSpeed;

      if (!isSpeaking && currentMouthY.current < 0.01) {
        currentMouthY.current = 0;
        currentMouthForm.current = 0;
      }

      applyMouthParameters(model, currentMouthY.current, currentMouthForm.current);

      rafRef.current = requestAnimationFrame(updateLipSync);
    };

    rafRef.current = requestAnimationFrame(updateLipSync);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [model, isSpeakingProp]);
}

export default useLipSync;
