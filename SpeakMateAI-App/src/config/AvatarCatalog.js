/**
 * SpeakMate AI Master Avatar Catalog (Mobile React Native)
 * Shared registry for all unique AI speaking tutor avatars.
 */

export const AVATAR_CATALOG = {
  // ── 1. Adult & Professional Human Coaches ──
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
    modelPath: 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json',
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
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-chitose@1.0.5/assets/chitose.model.json',
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
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json',
  },

  // ── 2. Kids & Students Cartoon Avatars (Unique Models) ──
  robopaws: {
    id: 'robopaws',
    name: 'Robo-Paws',
    gender: 'robopaws',
    category: 'cartoon',
    badge: 'Cartoon Mascot',
    emoji: '🤖',
    subtitle: 'Cute Robot Cat / Doraemon-Style Mascot',
    description: 'High-energy 2.5D mascot with 3D red nose & golden bell for fun, stress-free practice.',
    voiceProfile: 'Robo-Paws',
    voiceLabel: 'Cute Cartoon Voice',
    defaultPitch: 1.35,
    type: 'puppet',
    modelPath: null,
  },
  koharu: {
    id: 'koharu',
    name: 'Koharu',
    gender: 'female',
    category: 'cartoon',
    badge: 'Cartoon Schoolgirl',
    emoji: '🎀',
    subtitle: 'Cheerful schoolgirl with twin hair buns',
    description: 'Loves celebrating streaks, storytelling, and building everyday speaking confidence.',
    voiceProfile: 'Default',
    voiceLabel: 'Youth Female Voice',
    defaultPitch: 1.28,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
  },
  haruto: {
    id: 'haruto',
    name: 'Haruto',
    gender: 'male',
    category: 'cartoon',
    badge: 'Cartoon Explorer',
    emoji: '🧢',
    subtitle: 'Friendly schoolboy with cap and backpack',
    description: 'Casual chats, school dialogues, sports, gaming, and interactive vocabulary games.',
    voiceProfile: 'US Male',
    voiceLabel: 'Youth Male Voice',
    defaultPitch: 1.25,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-haruto@1.0.5/assets/haruto.model.json',
  },
  mao: {
    id: 'mao',
    name: 'Mao',
    gender: 'female',
    category: 'cartoon',
    badge: 'Chibi Junior',
    emoji: '👧',
    subtitle: 'Playful chibi tutor with big animated ribbons',
    description: 'Great for primary school learners with repetitive phonics drills and nursery rhymes.',
    voiceProfile: 'Default',
    voiceLabel: 'Cute Chibi Voice',
    defaultPitch: 1.32,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-unitychan@1.0.5/assets/unitychan.model.json',
  },
  nico: {
    id: 'nico',
    name: 'Nico',
    gender: 'male',
    category: 'cartoon',
    badge: 'Smart Glasses Kid',
    emoji: '👓',
    subtitle: 'Clever, curious boy genius with round glasses',
    description: 'Brain teasers, word puzzles, science roleplays, and "Guess the Word" challenges.',
    voiceProfile: 'US Male',
    voiceLabel: 'Smart Kid Voice',
    defaultPitch: 1.22,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-nico@1.0.5/assets/nico.model.json',
  },
  hibiki: {
    id: 'hibiki',
    name: 'Hibiki',
    gender: 'male',
    category: 'cartoon',
    badge: 'Hero Kid',
    emoji: '⚡',
    subtitle: 'Energetic superhero kid in dynamic outfit',
    description: 'High-energy speech sprint drills, level unlocks, and motivational coaching.',
    voiceProfile: 'US Male',
    voiceLabel: 'Hero Kid Voice',
    defaultPitch: 1.30,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-hibiki@1.0.5/assets/hibiki.model.json',
  },
  nito: {
    id: 'nito',
    name: 'Nito',
    gender: 'male',
    category: 'cartoon',
    badge: 'Music & Beats Kid',
    emoji: '🎧',
    subtitle: 'Cool student practicing with studio headphones',
    description: 'Rhythm, pronunciation accents, tongue twisters, and conversational flow.',
    voiceProfile: 'US Male',
    voiceLabel: 'Youth Male Voice',
    defaultPitch: 1.24,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-nito@1.0.5/assets/nito.model.json',
  },
};

export const AVATAR_LIST = Object.values(AVATAR_CATALOG);

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
  if (key.includes('nico') || key.includes('dexter')) {
    return AVATAR_CATALOG.nico;
  }
  if (key.includes('hibiki') || key.includes('sparky')) {
    return AVATAR_CATALOG.hibiki;
  }
  if (key.includes('nito')) {
    return AVATAR_CATALOG.nito;
  }
  return AVATAR_CATALOG[key] || AVATAR_CATALOG.haru;
}
