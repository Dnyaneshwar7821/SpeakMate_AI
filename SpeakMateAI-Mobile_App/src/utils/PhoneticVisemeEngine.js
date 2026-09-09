/**
 * PhoneticVisemeEngine.js
 * Advanced English Text-to-Viseme & Phonetic Mouth Shaping Engine for SpeakMate Mobile.
 * Converts text and word tokens into high-fidelity viseme parameters 
 * (mouthOpenY, mouthForm) and timing frames for native 2.5D and 3D avatars.
 */

export const VISEME_TYPES = {
  REST: 'REST',   // Closed mouth
  MBP: 'MBP',     // Bilabials (M, B, P) - Lips touching
  AA: 'AA',       // Open vowels (A, AH, AA) - Wide open
  EE: 'EE',       // Wide smile vowels (E, EE, I, EA) - Horizontal stretch
  IH: 'IH',       // Short vowels (I, IH) - Neutral open
  OO: 'OO',       // Pursed lips (O, OO, U, W) - Rounded narrow
  OH: 'OH',       // Tall open (O, OH, AU, AW) - Oval opening
  FV: 'FV',       // Labiodentals (F, V) - Teeth on lip
  LNT: 'LNT',     // Alveolars/Dentals (L, N, T, D, S, Z, R) - Slight open
};

export const VISEME_PARAMETERS = {
  REST: { yVal: 0.0, formVal: 0.0, name: 'REST' },
  MBP:  { yVal: 0.20, formVal: 0.0, name: 'MBP' },
  AA:   { yVal: 0.95, formVal: 0.25, name: 'AA' },
  EE:   { yVal: 0.60, formVal: 0.85, name: 'EE' },
  IH:   { yVal: 0.65, formVal: 0.30, name: 'IH' },
  OO:   { yVal: 0.80, formVal: -0.75, name: 'OO' },
  OH:   { yVal: 0.90, formVal: -0.35, name: 'OH' },
  FV:   { yVal: 0.45, formVal: -0.15, name: 'FV' },
  LNT:  { yVal: 0.55, formVal: 0.15, name: 'LNT' },
};

/**
 * Maps a single word to its dominant phonetic viseme sequence & target shapes
 */
export function getWordVisemeSequence(rawWord) {
  if (!rawWord) return [{ viseme: VISEME_TYPES.REST, ...VISEME_PARAMETERS.REST, durationWeight: 1 }];

  const word = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!word) return [{ viseme: VISEME_TYPES.REST, ...VISEME_PARAMETERS.REST, durationWeight: 1 }];

  const sequence = [];
  let i = 0;

  while (i < word.length) {
    const char = word[i];
    const nextChar = word[i + 1] || '';
    const pair = char + nextChar;

    if (pair === 'oo' || pair === 'ou' || pair === 'ow') {
      sequence.push({ viseme: VISEME_TYPES.OO, ...VISEME_PARAMETERS.OO, durationWeight: 1.2 });
      i += 2;
    } else if (pair === 'ee' || pair === 'ea' || pair === 'ie' || pair === 'ei') {
      sequence.push({ viseme: VISEME_TYPES.EE, ...VISEME_PARAMETERS.EE, durationWeight: 1.2 });
      i += 2;
    } else if (pair === 'ai' || pair === 'ay' || pair === 'ae') {
      sequence.push({ viseme: VISEME_TYPES.EE, ...VISEME_PARAMETERS.EE, durationWeight: 1.0 });
      i += 2;
    } else if (pair === 'oa' || pair === 'oh' || pair === 'aw' || pair === 'au') {
      sequence.push({ viseme: VISEME_TYPES.OH, ...VISEME_PARAMETERS.OH, durationWeight: 1.2 });
      i += 2;
    } else if (pair === 'th' || pair === 'sh' || pair === 'ch') {
      sequence.push({ viseme: VISEME_TYPES.LNT, ...VISEME_PARAMETERS.LNT, durationWeight: 0.9 });
      i += 2;
    } else if (pair === 'mb' || pair === 'mp') {
      sequence.push({ viseme: VISEME_TYPES.MBP, ...VISEME_PARAMETERS.MBP, durationWeight: 0.8 });
      i += 2;
    } else {
      if (char === 'm' || char === 'b' || char === 'p') {
        sequence.push({ viseme: VISEME_TYPES.MBP, ...VISEME_PARAMETERS.MBP, durationWeight: 0.7 });
      } else if (char === 'f' || char === 'v') {
        sequence.push({ viseme: VISEME_TYPES.FV, ...VISEME_PARAMETERS.FV, durationWeight: 0.8 });
      } else if (char === 'a') {
        sequence.push({ viseme: VISEME_TYPES.AA, ...VISEME_PARAMETERS.AA, durationWeight: 1.0 });
      } else if (char === 'e' || char === 'i') {
        sequence.push({ viseme: VISEME_TYPES.EE, ...VISEME_PARAMETERS.EE, durationWeight: 0.9 });
      } else if (char === 'o') {
        sequence.push({ viseme: VISEME_TYPES.OH, ...VISEME_PARAMETERS.OH, durationWeight: 1.0 });
      } else if (char === 'u' || char === 'w') {
        sequence.push({ viseme: VISEME_TYPES.OO, ...VISEME_PARAMETERS.OO, durationWeight: 0.9 });
      } else if (char === 'l' || char === 'n' || char === 't' || char === 'd' || char === 's' || char === 'z' || char === 'r') {
        sequence.push({ viseme: VISEME_TYPES.LNT, ...VISEME_PARAMETERS.LNT, durationWeight: 0.7 });
      } else {
        sequence.push({ viseme: VISEME_TYPES.IH, ...VISEME_PARAMETERS.IH, durationWeight: 0.6 });
      }
      i++;
    }
  }

  return sequence.length > 0
    ? sequence
    : [{ viseme: VISEME_TYPES.IH, ...VISEME_PARAMETERS.IH, durationWeight: 1 }];
}

/**
 * Analyzes full sentence text and builds timed mouth schedule
 */
export function generateSpeechSchedule(text, speechSpeed = 1.0) {
  if (!text) return [];

  const tokens = String(text).trim().split(/\s+/);
  const schedule = [];
  let cumulativeTime = 0;
  const speedFactor = Math.max(0.6, Math.min(1.8, Number(speechSpeed) || 1.0));

  for (const token of tokens) {
    const cleanWord = token.replace(/[^a-zA-Z]/g, '');
    const hasPunctuation = /[.,!?;:]$/.test(token);

    if (cleanWord) {
      const visemes = getWordVisemeSequence(cleanWord);
      const totalWeight = visemes.reduce((sum, v) => sum + v.durationWeight, 0);
      const baseWordDuration = Math.max(140, Math.min(500, cleanWord.length * 60)) / speedFactor;

      for (const item of visemes) {
        const frameDuration = (item.durationWeight / totalWeight) * baseWordDuration;
        schedule.push({
          start: cumulativeTime,
          end: cumulativeTime + frameDuration,
          yVal: item.yVal,
          formVal: item.formVal,
          viseme: item.viseme,
          isPause: false,
        });
        cumulativeTime += frameDuration;
      }

      // Inter-word micro pause
      const wordGap = (hasPunctuation ? 220 : 50) / speedFactor;
      schedule.push({
        start: cumulativeTime,
        end: cumulativeTime + wordGap,
        yVal: 0.05,
        formVal: 0.0,
        viseme: 'REST',
        isPause: true,
      });
      cumulativeTime += wordGap;
    }
  }

  return schedule;
}

export default {
  VISEME_TYPES,
  VISEME_PARAMETERS,
  getWordVisemeSequence,
  generateSpeechSchedule,
};
