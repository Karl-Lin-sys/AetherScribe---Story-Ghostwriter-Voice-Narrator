import { PresetScene } from '../types';

export const PRESET_SCENES: PresetScene[] = [
  {
    id: 'obsidian-lighthouse',
    name: 'The Obsidian Beacon',
    genre: 'Gothic Mystery / Nautical Fantasy',
    tone: 'Dark, Foreboding, Salt-Stained & Lyrical',
    description: 'A solitary monolithic beacon atop churning crags where the tide conceals centuries of shipwrecks and drowned hymns.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cyberpunk-neon-rain',
    name: 'Sector 9 Underbelly',
    genre: 'Cyberpunk Noir / Dystopian Speculative',
    tone: 'Gritty, Electric, Melancholic & Tense',
    description: 'Rain-soaked cobblestones bathed in fractured neon signage, steam rising from subterranean vents, and shadows hiding clandestine deals.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ancient-monastery-library',
    name: 'The Scriptorium of Whispers',
    genre: 'Dark Academia / Occult Realism',
    tone: 'Hushed, Scholarly, Enigmatic & Reverent',
    description: 'Towering cedar shelves groaning beneath centuries of leatherbound grimoires, illuminated by amber lanterns and floating dust motes.',
    imageUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sunken-temple-mist',
    name: 'The Emerald Reliquary',
    genre: 'Mythic Fantasy / Ancient Ruins',
    tone: 'Wondrous, Solitary, Ancient & Reverent',
    description: 'Colossal stone arches reclaimed by cascading moss and prehistoric vines, where forgotten deity statues gaze into misty mountain air.',
    imageUrl: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=1200&q=80',
  },
];

export const GENRE_OPTIONS = [
  'Atmospheric Speculative Fiction',
  'Gothic Mystery & Suspense',
  'Cyberpunk & Dystopian Noir',
  'Mythic High Fantasy',
  'Cosmic & Psychological Horror',
  'Magical Realism & Folklore',
  'Dark Academia & Occult',
  'Historical Thriller',
  'Sci-Fi Planetary Exploration',
];

export const TONE_OPTIONS = [
  'Dark, Foreboding & Tense',
  'Melancholic, Lyrical & Poetic',
  'Wondrous, Ethereal & Enigmatic',
  'Gritty, Hardboiled & Cinematic',
  'Whimsical, Bittersweet & Haunting',
  'Quietly Unsettling & Surreal',
];

export const VOICE_PROFILES = [
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'Masculine',
    badge: 'Deep & Gravitas',
    desc: 'Deep, resonant, and cinematic. Ideal for gothic lore, mysteries, and historical epics.',
    defaultStyle: 'Dramatic, resonant audiobook narrator with rich cadence and cinematic pauses',
  },
  {
    id: 'Kore',
    name: 'Kore',
    gender: 'Feminine',
    badge: 'Warm & Evocative',
    desc: 'Lyrical, nuanced, and emotionally attuned. Perfect for character-driven prose and fantasy.',
    defaultStyle: 'Warm, lyrical storyteller with gentle suspense and expressive emotional intimacy',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'Masculine',
    badge: 'Grit & Tension',
    desc: 'Commanding, husky, and edged with danger. Built for cyberpunk noir, thrillers, and survival.',
    defaultStyle: 'Gravelly, sharp noir narrator with tense restraint and calculated intensity',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'Neutral/Soft',
    badge: 'Ethereal & Serene',
    desc: 'Calm, contemplative, and atmospheric. Perfect for cosmic horror, magical realism, and poetry.',
    defaultStyle: 'Hushed, wondrous narrator speaking as if revealing ancient cosmic secrets',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'Masculine/Dynamic',
    badge: 'Whimsical & Enigmatic',
    desc: 'Playful, unpredictable, and rhythmic. Great for folklore, witty banter, and fable tales.',
    defaultStyle: 'Spirited, enigmatic storyteller with lively inflections and sly intrigue',
  },
];
