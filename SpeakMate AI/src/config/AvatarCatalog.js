/**
 * SpeakMate AI Master Avatar Catalog
 * Central registry for all AI speaking tutor avatars across Web and Mobile.
 */

export const AVATAR_CATALOG = {
  // ── Human Coaches ──
  haru: {
    id: 'haru',
    name: 'Haru',
    gender: 'female',
    category: 'human',
    badge: 'Anime Coach',
    emoji: '👩',
    subtitle: 'Warm, clear, and encouraging female coach',
    description: 'Calm, patient guidance for daily conversation and foundational fluency.',
    voiceProfile: 'Default',
    voiceLabel: 'System Default Voice',
    defaultPitch: 1.05,
    type: 'live2d',
    modelPath: '/models/avatar/haru/haru_greeter_t03.model3.json',
    scaleMultiplier: 1.18,
    yOffsetRatio: 0.08,
  },
  chitose: {
    id: 'chitose',
    name: 'Chitose',
    gender: 'male',
    category: 'human',
    badge: 'Pro & Business',
    emoji: '👨',
    subtitle: 'Confident, articulate, and supportive male coach',
    description: 'Structured English for professional interviews, presentations, and workplace chats.',
    voiceProfile: 'US Male',
    voiceLabel: 'American Male Voice',
    defaultPitch: 0.98,
    type: 'live2d',
    modelPath: '/models/avatar/chitose/chitose.model.json',
    scaleMultiplier: 1.18,
    yOffsetRatio: 0.08,
  },
  shizuku: {
    id: 'shizuku',
    name: 'Shizuku',
    gender: 'female',
    category: 'human',
    badge: 'Academic Mentor',
    emoji: '🌸',
    subtitle: 'Gentle, thoughtful, and analytical mentor',
    description: 'Specializes in grammar explanations, vocabulary enrichment, and CEFR lesson drills.',
    voiceProfile: 'Default',
    voiceLabel: 'Soft Female Voice',
    defaultPitch: 1.02,
    type: 'live2d',
    modelPath: '/models/avatar/shizuku/shizuku.model.json',
    scaleMultiplier: 1.18,
    yOffsetRatio: 0.08,
  },

  // ── Kids & Students Cartoon Avatars ──
  robopaws: {
    id: 'robopaws',
    name: 'Robo-Paws',
    gender: 'robopaws',
    category: 'cartoon',
    badge: 'Cartoon Buddy',
    emoji: '🤖',
    subtitle: 'Cute Robot Cat / Doraemon-Style Mascot',
    description: 'High-energy 2.5D mascot with 3D red nose & golden bell for fun, stress-free practice.',
    voiceProfile: 'Robo-Paws',
    voiceLabel: 'Cute Cartoon Voice',
    defaultPitch: 1.35,
    type: 'puppet', // Volumetric 2.5D shader rig
    modelPath: null,
    scaleMultiplier: 1.0,
    yOffsetRatio: 0.50,
  },
  koharu: {
    id: 'koharu',
    name: 'Koharu',
    gender: 'female',
    category: 'cartoon',
    badge: 'Cartoon Schoolgirl',
    emoji: '🎀',
    subtitle: 'Cheerful, sweet, and enthusiastic companion',
    description: 'Loves celebrating streaks, storytelling, and building everyday speaking confidence.',
    voiceProfile: 'Default',
    voiceLabel: 'Youth Female Voice',
    defaultPitch: 1.28,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
  haruto: {
    id: 'haruto',
    name: 'Haruto',
    gender: 'male',
    category: 'cartoon',
    badge: 'Cartoon Explorer',
    emoji: '🧢',
    subtitle: 'Friendly, casual classmate and peer buddy',
    description: 'Casual chats, school dialogues, sports, gaming, and interactive vocabulary games.',
    voiceProfile: 'US Male',
    voiceLabel: 'Youth Male Voice',
    defaultPitch: 1.25,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
  mao: {
    id: 'mao',
    name: 'Mao',
    gender: 'female',
    category: 'cartoon',
    badge: 'Chibi Junior',
    emoji: '👧',
    subtitle: 'Playful chibi tutor with big animated eyes',
    description: 'Great for primary school learners with repetitive phonics drills and nursery rhymes.',
    voiceProfile: 'Default',
    voiceLabel: 'Cute Chibi Voice',
    defaultPitch: 1.32,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-unitychan@1.0.5/assets/unitychan.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
  dexter: {
    id: 'dexter',
    name: 'Dexter',
    gender: 'male',
    category: 'cartoon',
    badge: 'Cartoon Inventor',
    emoji: '🧪',
    subtitle: 'Clever science kid with round forehead goggles',
    description: 'Brain teasers, word puzzles, science roleplays, and "Guess the Word" challenges.',
    voiceProfile: 'US Male',
    voiceLabel: 'Smart Kid Voice',
    defaultPitch: 1.22,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
  sparky: {
    id: 'sparky',
    name: 'Sparky',
    gender: 'male',
    category: 'cartoon',
    badge: 'Superhero Kid',
    emoji: '⚡',
    subtitle: 'Dynamic superhero kid with lightning hoodie',
    description: 'High-energy speech sprint drills, level unlocks, and motivational coaching.',
    voiceProfile: 'US Male',
    voiceLabel: 'Hero Kid Voice',
    defaultPitch: 1.30,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
};

export const AVATAR_LIST = Object.values(AVATAR_CATALOG);

/**
 * Get catalog entry by ID with safe fallback to Haru
 */
export function getAvatarById(id) {
  if (!id) return AVATAR_CATALOG.haru;
  const key = String(id).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key.includes('robo') || key.includes('paws') || key.includes('doraemon')) {
    return AVATAR_CATALOG.robopaws;
  }
  if (key.includes('chitose') || key === 'male') {
    return AVATAR_CATALOG.chitose;
  }
  if (key.includes('shizuku')) {
    return AVATAR_CATALOG.shizuku;
  }
  if (key.includes('koharu')) {
    return AVATAR_CATALOG.koharu;
  }
  if (key.includes('haruto')) {
    return AVATAR_CATALOG.haruto;
  }
  if (key.includes('mao') || key.includes('unity')) {
    return AVATAR_CATALOG.mao;
  }
  if (key.includes('dexter')) {
    return AVATAR_CATALOG.dexter;
  }
  if (key.includes('sparky')) {
    return AVATAR_CATALOG.sparky;
  }
  return AVATAR_CATALOG[key] || AVATAR_CATALOG.haru;
}
