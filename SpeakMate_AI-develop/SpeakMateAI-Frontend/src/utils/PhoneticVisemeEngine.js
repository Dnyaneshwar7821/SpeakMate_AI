/**
 * PhoneticVisemeEngine.js
 * Advanced English Text-to-Viseme & Phonetic Mouth Shaping Engine.
 * Converts text and word tokens into high-fidelity viseme parameters 
 * (mouthOpenY, mouthForm) and timing frames for Live2D, 3D, and 2D avatars.
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
  REST: { yVal: 0.0, formVal: 0.0 },
  MBP: { yVal: 0.25, formVal: 0.0 },   // Slight lip contact, not fully closed mid-sentence
  AA: { yVal: 0.95, formVal: 0.25 },
  EE: { yVal: 0.60, formVal: 0.85 },
  IH: { yVal: 0.65, formVal: 0.30 },
  OO: { yVal: 0.70, formVal: -0.75 },
  OH: { yVal: 0.90, formVal: -0.35 },
  FV: { yVal: 0.45, formVal: -0.15 },
  LNT: { yVal: 0.55, formVal: 0.15 },
};

/**
 * Maps a single word to its dominant phonetic viseme sequence & target shapes
 * @param {string} rawWord 
 * @returns {Array<{ viseme: string, yVal: number, formVal: number, durationWeight: number }>}
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

    // Check multi-letter phonemes first
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
      // Single letter mapping
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
        // Fallback consonants (k, g, h, j, q, x, y)
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
 * Returns primary dominant viseme for a word
 * @param {string} word 
 * @returns {{ viseme: string, yVal: number, formVal: number }}
 */
export function getPrimaryVisemeForWord(word) {
  const sequence = getWordVisemeSequence(word);
  // Pick the vowel frame or highest opening frame in sequence
  let best = sequence[0];
  for (const item of sequence) {
    if (item.yVal > best.yVal) {
      best = item;
    }
  }
  return best;
}

/**
 * Analyzes full sentence text and detects punctuation pause positions
 * @param {string} text 
 * @returns {Array<{ word: string, isPause: boolean, pauseMs: number }>}
 */
export function parseSentencePhoneticStructure(text) {
  if (!text) return [];

  // Split tokens keeping punctuation attached
  const tokens = text.trim().split(/\s+/);
  const result = [];

  for (const token of tokens) {
    const cleanWord = token.replace(/[^a-zA-Z]/g, '');
    const hasPunctuationPause = /[.,!?;:]$/.test(token);

    if (cleanWord) {
      result.push({
        word: cleanWord,
        isPause: false,
        pauseMs: 0,
      });
    }

    if (hasPunctuationPause) {
      const pauseDuration = /[.!?]/.test(token) ? 350 : 200;
      result.push({
        word: '',
        isPause: true,
        pauseMs: pauseDuration,
      });
    }
  }

  return result;
}

export default {
  VISEME_TYPES,
  VISEME_PARAMETERS,
  getWordVisemeSequence,
  getPrimaryVisemeForWord,
  parseSentencePhoneticStructure,
};
