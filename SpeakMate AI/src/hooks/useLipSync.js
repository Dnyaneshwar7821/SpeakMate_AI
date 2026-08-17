import { useEffect, useRef } from 'react';
import { EventBus, AVATAR_EVENTS } from '../services/live2d/EventBus';

/**
 * Phonetic Viseme Table
 * Maps English phonetic sounds to exact Live2D mouth opening (openY: 0.0 to 1.0)
 * and horizontal mouth shape (form: -1.0 to 1.0, where -1.0 is round 'OO' and +1.0 is wide 'EE').
 */
const VISEME_MAP = {
  SIL: { openY: 0.0, form: 0.0, weight: 1.0 },   // Silence / Rest
  MBP: { openY: 0.02, form: 0.0, weight: 1.2 },  // M, B, P (Closed lips)
  FV:  { openY: 0.28, form: 0.3, weight: 1.0 },  // F, V, PH (Teeth on lower lip)
  TH:  { openY: 0.38, form: 0.15, weight: 1.0 }, // TH (Tongue between teeth)
  SZ:  { openY: 0.24, form: 0.75, weight: 1.0 }, // S, Z, C (Teeth clenched, wide smile)
  SH:  { openY: 0.48, form: -0.45, weight: 1.1 },// SH, CH, J, ZH (Protruded lips)
  TDN: { openY: 0.45, form: 0.35, weight: 1.0 }, // T, D, N, L (Alveolar semi-open)
  KG:  { openY: 0.58, form: 0.2, weight: 1.0 },  // K, G, NG, H, R (Throat / velar)
  EE:  { openY: 0.75, form: 0.92, weight: 1.2 }, // EE, EA, I, Y, AY (Wide open smile)
  EH:  { openY: 0.88, form: 0.55, weight: 1.2 }, // E, EH, AE, bed, cat (Medium-wide open)
  AA:  { openY: 1.0,  form: 0.25, weight: 1.3 }, // A, AH, AW, father, talk (Maximum jaw drop)
  OH:  { openY: 0.90, form: -0.75, weight: 1.2 },// O, OH, OW, OA, go, home (Large round mouth)
  OO:  { openY: 0.60, form: -0.95, weight: 1.3 },// OO, U, UW, W, you, boot (Tight round lips)
};

/**
 * Converts English text into a sequence of timed phonetic visemes
 */
function textToPhonemeSequence(text = '', speedMultiplier = 1.0) {
  if (!text) return [];

  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean);
  const sequence = [];

  // Base phoneme duration in ms (~65ms to 120ms per phonetic sound at normal 1.0x speed)
  const baseDuration = 85 / Math.max(0.5, speedMultiplier);

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const word = words[wIdx];
    let i = 0;

    while (i < word.length) {
      const two = word.slice(i, i + 2);
      const three = word.slice(i, i + 3);

      // Tri-graphs
      if (three === 'igh') {
        sequence.push({ viseme: 'EE', dur: baseDuration * 1.3, wordIdx: wIdx });
        i += 3;
      }
      // Di-graphs
      else if (two === 'th') {
        sequence.push({ viseme: 'TH', dur: baseDuration * 0.9, wordIdx: wIdx });
        i += 2;
      } else if (two === 'sh' || two === 'ch') {
        sequence.push({ viseme: 'SH', dur: baseDuration * 1.1, wordIdx: wIdx });
        i += 2;
      } else if (two === 'ph') {
        sequence.push({ viseme: 'FV', dur: baseDuration * 0.9, wordIdx: wIdx });
        i += 2;
      } else if (two === 'wh') {
        sequence.push({ viseme: 'OO', dur: baseDuration * 1.0, wordIdx: wIdx });
        i += 2;
      } else if (two === 'ee' || two === 'ea' || two === 'ai' || two === 'ay') {
        sequence.push({ viseme: 'EE', dur: baseDuration * 1.4, wordIdx: wIdx });
        i += 2;
      } else if (two === 'oo') {
        sequence.push({ viseme: 'OO', dur: baseDuration * 1.4, wordIdx: wIdx });
        i += 2;
      } else if (two === 'ou' || two === 'ow') {
        sequence.push({ viseme: 'OH', dur: baseDuration * 1.3, wordIdx: wIdx });
        sequence.push({ viseme: 'OO', dur: baseDuration * 0.9, wordIdx: wIdx });
        i += 2;
      } else if (two === 'oa' || two === 'aw') {
        sequence.push({ viseme: 'OH', dur: baseDuration * 1.4, wordIdx: wIdx });
        i += 2;
      } else if (two === 'oi' || two === 'oy') {
        sequence.push({ viseme: 'OH', dur: baseDuration * 1.1, wordIdx: wIdx });
        sequence.push({ viseme: 'EE', dur: baseDuration * 1.0, wordIdx: wIdx });
        i += 2;
      }
      // Single letters
      else {
        const ch = word[i];
        if (ch === 'm' || ch === 'b' || ch === 'p') {
          sequence.push({ viseme: 'MBP', dur: baseDuration * 0.85, wordIdx: wIdx });
        } else if (ch === 'f' || ch === 'v') {
          sequence.push({ viseme: 'FV', dur: baseDuration * 0.9, wordIdx: wIdx });
        } else if (ch === 's' || ch === 'z' || ch === 'c') {
          sequence.push({ viseme: 'SZ', dur: baseDuration * 0.95, wordIdx: wIdx });
        } else if (ch === 't' || ch === 'd' || ch === 'n' || ch === 'l') {
          sequence.push({ viseme: 'TDN', dur: baseDuration * 0.9, wordIdx: wIdx });
        } else if (ch === 'k' || ch === 'g' || ch === 'h' || ch === 'r' || ch === 'j' || ch === 'q' || ch === 'x') {
          sequence.push({ viseme: 'KG', dur: baseDuration * 0.9, wordIdx: wIdx });
        } else if (ch === 'w') {
          sequence.push({ viseme: 'OO', dur: baseDuration * 1.0, wordIdx: wIdx });
        } else if (ch === 'y') {
          sequence.push({ viseme: 'EE', dur: baseDuration * 1.0, wordIdx: wIdx });
        } else if (ch === 'a') {
          sequence.push({ viseme: 'AA', dur: baseDuration * 1.3, wordIdx: wIdx });
        } else if (ch === 'e') {
          sequence.push({ viseme: 'EH', dur: baseDuration * 1.2, wordIdx: wIdx });
        } else if (ch === 'i') {
          sequence.push({ viseme: 'EE', dur: baseDuration * 1.2, wordIdx: wIdx });
        } else if (ch === 'o') {
          sequence.push({ viseme: 'OH', dur: baseDuration * 1.3, wordIdx: wIdx });
        } else if (ch === 'u') {
          sequence.push({ viseme: 'OO', dur: baseDuration * 1.2, wordIdx: wIdx });
        }
        i++;
      }
    }

    // Natural inter-word micro pause (35ms)
    sequence.push({ viseme: 'TDN', dur: 35 / Math.max(0.5, speedMultiplier), wordIdx: wIdx });
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
    // Cubism 4 (Haru)
    if (typeof cm.setParameterValueById === 'function') {
      try { cm.setParameterValueById('ParamMouthOpenY', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('ParamMouthForm', formVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_OPEN_Y', yVal, 1.0); } catch (_) {}
      try { cm.setParameterValueById('PARAM_MOUTH_FORM', formVal, 1.0); } catch (_) {}
    }
    // Cubism 2 (Chitose)
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
 * Frame-accurate Text-to-Viseme pronunciation synchronized lip syncing.
 * Deconstructs spoken English text into exact phonetic visemes (vowel shapes, closed bilabials, wide smiles, round shapes).
 */
export function useLipSync(model, isSpeakingProp = false) {
  const rafRef = useRef(null);
  const currentMouthY = useRef(0);
  const currentMouthForm = useRef(0);

  const activeSpeaking = useRef(isSpeakingProp);
  const phonemeQueue = useRef([]);
  const phonemeIndex = useRef(0);
  const phonemeStartTime = useRef(0);

  // Sync prop changes
  useEffect(() => {
    activeSpeaking.current = isSpeakingProp;
    if (!isSpeakingProp) {
      phonemeQueue.current = [];
      phonemeIndex.current = 0;
    }
  }, [isSpeakingProp]);

  // Subscribe to SpeechSynthesis EventBus lifecycle
  useEffect(() => {
    const unsubStart = EventBus.on(AVATAR_EVENTS.SPEECH_STARTED, (data) => {
      activeSpeaking.current = true;
      if (data?.text) {
        phonemeQueue.current = textToPhonemeSequence(data.text, data.speed || 1.0);
        phonemeIndex.current = 0;
        phonemeStartTime.current = performance.now();
      }
    });

    const unsubWord = EventBus.on(AVATAR_EVENTS.LIP_SYNC_UPDATE, (data) => {
      activeSpeaking.current = true;
      // Resynchronize queue cursor to matching word index if needed
      if (data?.word && phonemeQueue.current.length > 0) {
        const queue = phonemeQueue.current;
        const currentIdx = phonemeIndex.current;
        // Search forward for boundary match
        for (let i = currentIdx; i < Math.min(queue.length, currentIdx + 12); i++) {
          if (queue[i]) {
            phonemeIndex.current = i;
            phonemeStartTime.current = performance.now();
            break;
          }
        }
      }
    });

    const unsubEnd = EventBus.on(AVATAR_EVENTS.SPEECH_FINISHED, () => {
      activeSpeaking.current = false;
      phonemeQueue.current = [];
      phonemeIndex.current = 0;
    });

    return () => {
      unsubStart();
      unsubWord();
      unsubEnd();
    };
  }, []);

  // Post-Motion Engine Hook: Override model.internalModel.update to ensure parameter priority
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

  // High-precision 60 FPS animation loop with phonetic timeline progression
  useEffect(() => {
    const updateLipSync = () => {
      const isSynthesizing = typeof window !== 'undefined' && Boolean(window.speechSynthesis?.speaking);
      const isSpeaking = Boolean(activeSpeaking.current || isSpeakingProp || isSynthesizing);

      let targetMouthY = 0;
      let targetMouthForm = 0;

      if (isSpeaking) {
        const now = performance.now();
        const queue = phonemeQueue.current;

        if (queue.length > 0) {
          // Progress through text-derived phonetic visemes
          let currentPhoneme = queue[phonemeIndex.current];
          if (currentPhoneme) {
            const elapsedPhoneme = now - phonemeStartTime.current;
            if (elapsedPhoneme >= currentPhoneme.dur) {
              phonemeIndex.current = (phonemeIndex.current + 1) % queue.length;
              phonemeStartTime.current = now;
              currentPhoneme = queue[phonemeIndex.current];
            }
          }

          const targetVisemeKey = currentPhoneme ? currentPhoneme.viseme : 'AA';
          const visemeData = VISEME_MAP[targetVisemeKey] || VISEME_MAP.AA;

          // Non-linear pulse wave inside the phoneme for organic vocal resonance
          const elapsed = (now - phonemeStartTime.current) * 0.001;
          const tremor = Math.sin(elapsed * 18.0 * Math.PI) * 0.06;

          targetMouthY = Math.min(1.0, Math.max(0.05, visemeData.openY + tremor));
          targetMouthForm = visemeData.form;
        } else {
          // Fallback continuous natural speech wave if no text was provided
          const t = now * 0.001;
          const carrier = Math.abs(Math.sin(t * 4.8 * Math.PI));
          const flap = Math.pow(carrier, 0.65);
          targetMouthY = Math.min(1.0, Math.max(0.15, flap * 0.92 + 0.15));
          targetMouthForm = Math.sin(t * 3.2 * Math.PI) * 0.65;
        }
      } else {
        targetMouthY = 0;
        targetMouthForm = 0;
      }

      // Fast, snappy attack (0.85) and smooth release (0.45)
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
