/**
 * SpeakMate AI Master Avatar Catalog
 * Central registry for all verified, high-quality AI speaking tutor avatars across Web and Mobile.
 * Every avatar has its own unique, fully animated Live2D or 2.5D character model.
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
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-shizuku@1.0.5/assets/shizuku.model.json',
    scaleMultiplier: 1.22,
    yOffsetRatio: 0.06,
  },

  // ── 2. Kids & Students Cartoon Avatars (Unique Live2D & 2D Models) ──
  robopaws: {
    id: 'robopaws',
    name: 'Robo-Paws',
    gender: 'robopaws',
    category: 'cartoon',
    badge: 'Doraemon Buddy',
    emoji: '🤖',
    subtitle: 'Cute Robot Cat / Doraemon-Style Mascot',
    description: 'High-energy 2D mascot with red nose & golden bell for fun, stress-free practice.',
    voiceProfile: 'Robo-Paws',
    voiceLabel: 'Cute Cartoon Voice',
    defaultPitch: 1.35,
    type: 'puppet',
    puppetType: 'doraemon',
    modelPath: null,
    scaleMultiplier: 1.0,
    yOffsetRatio: 0.50,
  },
  motu: {
    id: 'motu',
    name: 'Motu',
    gender: 'male',
    category: 'cartoon',
    badge: 'Motu Patlu',
    emoji: '🥟',
    subtitle: 'Jolly samosa-loving cartoon friend from Furfuri Nagar',
    description: 'Enthusiastic and funny friend! Builds everyday confidence through storytelling, laughter, and dialogues.',
    voiceProfile: 'US Male',
    voiceLabel: 'Jolly Motu Voice',
    defaultPitch: 1.15,
    type: 'puppet',
    puppetType: 'motu',
    modelPath: null,
    scaleMultiplier: 1.0,
    yOffsetRatio: 0.50,
  },
  sparky: {
    id: 'sparky',
    name: 'Sparky',
    gender: 'male',
    category: 'cartoon',
    badge: 'Superhero Kid',
    emoji: '⚡',
    subtitle: 'Brave superhero kid with cape & lightning emblem',
    description: 'High-energy speech sprint drills, level unlocks, and heroic motivational coaching.',
    voiceProfile: 'US Male',
    voiceLabel: 'Hero Kid Voice',
    defaultPitch: 1.30,
    type: 'puppet',
    puppetType: 'superhero',
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
    subtitle: 'Cheerful, sweet schoolgirl with twin hair buns',
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
    subtitle: 'Friendly schoolboy with cap and backpack',
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
    subtitle: 'Playful chibi tutor with big animated ribbons',
    description: 'Great for primary school learners with repetitive phonics drills and nursery rhymes.',
    voiceProfile: 'Default',
    voiceLabel: 'Cute Chibi Voice',
    defaultPitch: 1.32,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-unitychan@1.0.5/assets/unitychan.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
  wanko: {
    id: 'wanko',
    name: 'Wanko',
    gender: 'male',
    category: 'cartoon',
    badge: 'Cartoon Puppy',
    emoji: '🐶',
    subtitle: 'Playful cartoon puppy with wagging ears & tail',
    description: 'High encouragement, cheerful barking cheer-ups, and fun interactive conversations.',
    voiceProfile: 'US Male',
    voiceLabel: 'Playful Pup Voice',
    defaultPitch: 1.32,
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-wanko@1.0.5/assets/wanko.model.json',
    scaleMultiplier: 0.95,
    yOffsetRatio: 0.50,
  },
};

export const AVATAR_LIST = Object.values(AVATAR_CATALOG);

/**
 * Get catalog entry by ID with safe fallback to Haru
 */
export function getAvatarById(id) {
  if (!id) return AVATAR_CATALOG.haru;
  const key = String(id).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key.includes('motu') || key.includes('patlu')) {
    return AVATAR_CATALOG.motu;
  }
  if (key.includes('robo') || key.includes('paws') || key.includes('doraemon')) {
    return AVATAR_CATALOG.robopaws;
  }
  if (key.includes('sparky') || key.includes('hero') || key.includes('superhero') || key.includes('hibiki')) {
    return AVATAR_CATALOG.sparky;
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
  if (key.includes('wanko') || key.includes('dog') || key.includes('puppy')) {
    return AVATAR_CATALOG.wanko;
  }
  return AVATAR_CATALOG[key] || AVATAR_CATALOG.haru;
}
