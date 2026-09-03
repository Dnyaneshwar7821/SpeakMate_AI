/**
 * SpeakMate AI Mobile Master Avatar Catalog
 * Central registry for all 10 verified native AI speaking tutor avatars.
 * 3 Core Coaches + 7 Cartoon Companions.
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
    subtitle: 'Warm, clear, and encouraging anime coach',
    description: 'Calm, patient guidance for daily conversation and foundational fluency.',
    voiceProfile: 'Default',
    voiceLabel: 'System Default Voice',
    defaultPitch: 1.05,
    themeColor: '#EC4899', // Pink / Fuchsia
    glowColor: 'rgba(236, 72, 153, 0.45)',
    ringColor: '#F472B6',
  },
  chitose: {
    id: 'chitose',
    name: 'Chitose',
    gender: 'male',
    category: 'human',
    badge: 'Business Pro',
    emoji: '👨',
    subtitle: 'Confident, articulate, and supportive male coach',
    description: 'Structured English for professional interviews, presentations, and workplace chats.',
    voiceProfile: 'US Male',
    voiceLabel: 'American Male Voice',
    defaultPitch: 0.98,
    themeColor: '#3B82F6', // Blue
    glowColor: 'rgba(59, 130, 246, 0.45)',
    ringColor: '#60A5FA',
  },

  // ── 2. Kids & Students Cartoon Avatars (7 Companions + Robo-Paws) ──
  robopaws: {
    id: 'robopaws',
    name: 'Robo-Paws',
    gender: 'robopaws',
    category: 'cartoon',
    badge: 'Doraemon Buddy',
    emoji: '🤖',
    subtitle: 'Cute Robot Cat / Doraemon-Style Mascot',
    description: 'High-energy 3D mascot with red nose & golden bell for fun, stress-free practice.',
    voiceProfile: 'Robo-Paws',
    voiceLabel: 'Cute Cartoon Voice',
    defaultPitch: 1.35,
    themeColor: '#0284C7', // Sky Blue
    glowColor: 'rgba(2, 132, 199, 0.45)',
    ringColor: '#38BDF8',
  },
  motu: {
    id: 'motu',
    name: 'Motu',
    gender: 'male',
    category: 'cartoon',
    badge: 'Furfuri Friend',
    emoji: '🥟',
    subtitle: 'Jolly samosa-loving cartoon friend from Furfuri Nagar',
    description: 'Enthusiastic and funny friend! Builds everyday confidence through storytelling, laughter, and dialogues.',
    voiceProfile: 'US Male',
    voiceLabel: 'Jolly Motu Voice',
    defaultPitch: 1.15,
    themeColor: '#EA580C', // Orange
    glowColor: 'rgba(234, 88, 12, 0.45)',
    ringColor: '#FB923C',
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
    themeColor: '#EF4444', // Red
    glowColor: 'rgba(239, 68, 68, 0.45)',
    ringColor: '#F87171',
  },
  wanko: {
    id: 'wanko',
    name: 'Wanko',
    gender: 'male',
    category: 'cartoon',
    badge: 'Shiba Buddy',
    emoji: '🐶',
    subtitle: 'Playful cartoon Shiba puppy with perky ears',
    description: 'High encouragement, cheerful ear wiggles, and interactive friendly conversations.',
    voiceProfile: 'US Male',
    voiceLabel: 'Playful Pup Voice',
    defaultPitch: 1.30,
    themeColor: '#D97706', // Amber
    glowColor: 'rgba(217, 119, 6, 0.45)',
    ringColor: '#FBBF24',
  },
  koharu: {
    id: 'koharu',
    name: 'Koharu',
    gender: 'female',
    category: 'cartoon',
    badge: 'Chibi Student',
    emoji: '🎀',
    subtitle: 'Cheerful, sweet schoolgirl with twin ribbon buns',
    description: 'Loves celebrating streaks, storytelling, and building everyday speaking confidence.',
    voiceProfile: 'Default',
    voiceLabel: 'Youth Female Voice',
    defaultPitch: 1.28,
    themeColor: '#F43F5E', // Rose
    glowColor: 'rgba(244, 63, 94, 0.45)',
    ringColor: '#FB7185',
  },
  haruto: {
    id: 'haruto',
    name: 'Haruto',
    gender: 'male',
    category: 'cartoon',
    badge: 'Junior Explorer',
    emoji: '🧢',
    subtitle: 'Friendly schoolboy with backwards cap and headset',
    description: 'Casual chats, school dialogues, sports, gaming, and interactive vocabulary games.',
    voiceProfile: 'US Male',
    voiceLabel: 'Youth Male Voice',
    defaultPitch: 1.25,
    themeColor: '#2563EB', // Indigo Blue
    glowColor: 'rgba(37, 99, 235, 0.45)',
    ringColor: '#60A5FA',
  },
  tororo: {
    id: 'tororo',
    name: 'Tororo',
    gender: 'female',
    category: 'cartoon',
    badge: 'Sakura Kitty',
    emoji: '🐱',
    subtitle: 'Fluffy white kitten with pink bow and bell',
    description: 'Gentle, soothing mentor for slow-paced pronunciation drills and comforting practice.',
    voiceProfile: 'Default',
    voiceLabel: 'Soft Kitty Voice',
    defaultPitch: 1.32,
    themeColor: '#A855F7', // Purple
    glowColor: 'rgba(168, 85, 247, 0.45)',
    ringColor: '#C084FC',
  },
  rexy: {
    id: 'rexy',
    name: 'Rexy',
    gender: 'male',
    category: 'cartoon',
    badge: 'Baby Dinosaur',
    emoji: '🦖',
    subtitle: 'Playful baby green T-Rex with a friendly grin',
    description: 'Fun-filled practice, prehistoric adventures, and high-energy vocabulary games.',
    voiceProfile: 'US Male',
    voiceLabel: 'Cheerful Dino Voice',
    defaultPitch: 1.28,
    themeColor: '#10B981', // Emerald Green
    glowColor: 'rgba(168, 185, 129, 0.45)',
    ringColor: '#34D399',
  },
};

export const AVATAR_LIST = Object.values(AVATAR_CATALOG);

/**
 * Get catalog entry by ID with safe fallback to Haru
 */
export function getAvatarById(id) {
  if (!id) return AVATAR_CATALOG.haru;
  const key = String(id).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key.includes('motu') || key.includes('patlu')) return AVATAR_CATALOG.motu;
  if (key.includes('robo') || key.includes('paws') || key.includes('doraemon') || key.includes('hijiki')) return AVATAR_CATALOG.robopaws;
  if (key.includes('sparky') || key.includes('hero') || key.includes('superhero')) return AVATAR_CATALOG.sparky;
  if (key.includes('chitose') || key === 'male') return AVATAR_CATALOG.chitose;
  if (key.includes('wanko') || key.includes('dog') || key.includes('puppy') || key.includes('shiba')) return AVATAR_CATALOG.wanko;
  if (key.includes('koharu') || key.includes('ribbon')) return AVATAR_CATALOG.koharu;
  if (key.includes('haruto') || key.includes('cap') || key.includes('explorer')) return AVATAR_CATALOG.haruto;
  if (key.includes('tororo') || key.includes('cat') || key.includes('kitty') || key.includes('sakura')) return AVATAR_CATALOG.tororo;
  if (key.includes('rexy') || key.includes('dino') || key.includes('trex')) return AVATAR_CATALOG.rexy;
  if (key.includes('shizuku') || key.includes('mao')) return AVATAR_CATALOG.koharu;
  return AVATAR_CATALOG[key] || AVATAR_CATALOG.haru;
}
