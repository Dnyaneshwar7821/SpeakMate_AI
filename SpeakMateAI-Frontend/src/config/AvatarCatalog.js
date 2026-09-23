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
    voiceProfile: 'Haru',
    voiceLabel: 'Anime Coach Voice',
    defaultPitch: 1.16,
    previewGreeting: "Hello! I'm Haru, your AI speaking coach. Let's practice speaking English together!",
    themeColor: "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-500",
    type: 'live2d',
    modelPath: '/models/avatar/haru/haru_greeter_t03.model3.json',
    scaleMultiplier: 3.1,
    yOffsetRatio: -0.13,
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
    previewGreeting: "Hello! I'm Chitose, your AI speaking coach for professional presentations and interviews.",
    themeColor: "from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-500",
    type: 'live2d',
    modelPath: '/models/avatar/chitose/chitose.model.json',
    scaleMultiplier: 3.1,
    yOffsetRatio: -0.13,
  },
  shizuku: {
    id: 'shizuku',
    name: 'Shizuku',
    gender: 'female',
    category: 'human',
    badge: 'Academic Mentor',
    emoji: '🌸',
    subtitle: 'Gentle, thoughtful, and analytical academic mentor',
    description: 'Specializes in grammar explanations, vocabulary enrichment, and structured academic fluency.',
    voiceProfile: 'Shizuku',
    voiceLabel: 'Academic Mentor Voice',
    defaultPitch: 1.06,
    previewGreeting: "Hello! I am Shizuku. Together we will master English grammar and conversational fluency step by step.",
    themeColor: "from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-500",
    type: 'live2d',
    modelPath: '/models/avatar/shizuku/shizuku.model.json',
    scaleMultiplier: 1.18,
    yOffsetRatio: 0.02,
  },

  // ── 2. Kids & Students Cartoon Avatars (Unique Live2D & 2D Models) ──
  robopaws: {
    id: 'robopaws',
    name: 'Robo-Paws',
    gender: 'cartoon',
    category: 'cartoon',
    badge: 'Doraemon Buddy',
    emoji: '🤖',
    subtitle: 'Cute Robot Cat / Doraemon-Style Mascot',
    description: 'High-energy 2D mascot with red nose & golden bell for fun, stress-free practice.',
    voiceProfile: 'Robo-Paws',
    voiceLabel: 'Cute Cartoon Voice',
    defaultPitch: 1.54,
    previewGreeting: "Beep-boop! Hello superstar! I'm Robo-Paws, your friendly robot cat English buddy!",
    themeColor: "from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-500",
    type: 'puppet',
    puppetType: 'doraemon',
    modelPath: null,
    scaleMultiplier: 1.0,
    yOffsetRatio: 0.50,
  },
  motu: {
    id: 'motu',
    name: 'Motu',
    gender: 'cartoon',
    category: 'cartoon',
    badge: 'Motu Patlu',
    emoji: '🥟',
    subtitle: 'Jolly samosa-loving cartoon friend from Furfuri Nagar',
    description: 'Enthusiastic and funny friend! Builds everyday confidence through storytelling, laughter, and dialogues.',
    voiceProfile: 'Motu',
    voiceLabel: 'Jolly Cartoon Voice',
    defaultPitch: 1.22,
    previewGreeting: "Arey wah, dost! I am Motu from Furfuri Nagar! Let's practice English together with lots of fun and laughter!",
    themeColor: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-500",
    type: 'puppet',
    puppetType: 'motu',
    modelPath: null,
    scaleMultiplier: 1.0,
    yOffsetRatio: 0.50,
  },
  sparky: {
    id: 'sparky',
    name: 'Sparky',
    gender: 'kid',
    category: 'cartoon',
    badge: 'Superhero Kid',
    emoji: '⚡',
    subtitle: 'Brave superhero kid with cape & lightning emblem',
    description: 'High-energy speech sprint drills, level unlocks, and heroic motivational coaching.',
    voiceProfile: 'Sparky',
    voiceLabel: 'Hero Kid Voice',
    defaultPitch: 1.42,
    previewGreeting: "Power up! I'm Sparky, your superhero English training partner! Let's conquer our daily goal!",
    themeColor: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-500",
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
    voiceProfile: 'Koharu',
    voiceLabel: 'Youth Girl Voice',
    defaultPitch: 1.40,
    previewGreeting: "Yay! Hello! I'm Koharu! Let's practice speaking English happily together today!",
    themeColor: "from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30 text-fuchsia-500",
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-koharu@1.0.5/assets/koharu.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
  haruto: {
    id: 'haruto',
    name: 'Haruto',
    gender: 'kid',
    category: 'cartoon',
    badge: 'Cartoon Explorer',
    emoji: '🧢',
    subtitle: 'Friendly schoolboy with cap and backpack',
    description: 'Casual chats, school dialogues, sports, gaming, and interactive vocabulary games.',
    voiceProfile: 'Haruto',
    voiceLabel: 'Youth Boy Voice',
    defaultPitch: 1.35,
    previewGreeting: "Hey there explorer! I'm Haruto! Grab your backpack and let's practice cool English words!",
    themeColor: "from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-500",
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
    voiceProfile: 'Mao',
    voiceLabel: 'Cute Chibi Voice',
    defaultPitch: 1.52,
    previewGreeting: "Hi! I'm Mao! Let's learn fun new English words and speaking drills together!",
    themeColor: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500",
    type: 'live2d',
    modelPath: 'https://cdn.jsdelivr.net/npm/live2d-widget-model-unitychan@1.0.5/assets/unitychan.model.json',
    scaleMultiplier: 1.25,
    yOffsetRatio: 0.06,
  },
  puppy: {
    id: 'puppy',
    name: 'Puppy',
    gender: 'cartoon',
    category: 'cartoon',
    badge: 'Cute Puppy',
    emoji: '🐶',
    subtitle: 'Adorable cartoon puppy pal with floppy ears & real-time lip-syncing',
    description: 'High encouragement, playful cheer-ups, and fun interactive conversations with dynamic lip-syncing.',
    voiceProfile: 'Puppy',
    voiceLabel: 'Playful Pup Voice',
    defaultPitch: 1.46,
    previewGreeting: "Woof! Hello best friend! I'm your puppy pal! Let's play and speak cheerful English every day!",
    themeColor: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-600",
    type: 'puppet',
    puppetType: 'puppy',
    modelPath: null,
    scaleMultiplier: 1.0,
    yOffsetRatio: 0.48,
  },
  wanko: {
    id: 'puppy',
    name: 'Puppy',
    gender: 'cartoon',
    category: 'cartoon',
    badge: 'Cute Puppy',
    emoji: '🐶',
    subtitle: 'Adorable cartoon puppy pal with floppy ears & real-time lip-syncing',
    description: 'High encouragement, playful cheer-ups, and fun interactive conversations with dynamic lip-syncing.',
    voiceProfile: 'Puppy',
    voiceLabel: 'Playful Pup Voice',
    defaultPitch: 1.46,
    previewGreeting: "Woof! Hello best friend! I'm your puppy pal! Let's play and speak cheerful English every day!",
    themeColor: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-600",
    type: 'puppet',
    puppetType: 'puppy',
    modelPath: null,
    scaleMultiplier: 1.0,
    yOffsetRatio: 0.48,
  },
};

export const AVATAR_LIST = Object.values(AVATAR_CATALOG).filter(
  (av, index, self) => index === self.findIndex((a) => a.id === av.id)
);

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
    return AVATAR_CATALOG.puppy;
  }
  return AVATAR_CATALOG[key] || AVATAR_CATALOG.haru;
}
