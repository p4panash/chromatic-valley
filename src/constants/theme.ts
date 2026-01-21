export const COLORS = {
  // Monument Valley inspired palette
  background: {
    start: '#fef5e7',
    end: '#f8e1c8',
  },
  accent: {
    coral: '#e8a598',
    coralDark: '#d47060',
    coralDeep: '#c45a4a',
    coralLight: '#e89888',
    coralMuted: '#d4918a',
    sage: '#a8c5b5',
    sageDark: '#6B9A88',
    sky: '#9ec5e8',
    lavender: '#c5b5d4',
    sand: '#e8d5b5',
    gold: '#F5E6B8',
  },
  text: {
    primary: '#4a4a4a',
    secondary: '#5a5a5a',
    dark: '#2D3436',
  },
  white: '#ffffff',
  shadow: {
    soft: 'rgba(74, 74, 74, 0.1)',
    medium: 'rgba(74, 74, 74, 0.15)',
    dark: 'rgba(74, 74, 74, 0.25)',
  },
  // UI element colors
  missing: {
    base: '#E5E0DB',
    pattern: '#D8D3CE',
  },
  gradient: {
    sageMid: '#9ec5b8',
  },
};

export const FONTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
} as const;

export const GAME_CONFIG = {
  baseTimeMs: 8000,
  minTimeMs: 4000,
  timeReductionPerLevel: 100,
  basePoints: 100,
  streakBonusMultiplier: 10,
  timeBonusMultiplier: 0.5,
  levelBonusMultiplier: 5,
  maxWrongAnswers: 3,
  choiceCount: 4,
  animationDelayMs: 80,
  feedbackDurationMs: 600,
  roundTransitionMs: 800,
  wrongAnswerDelayMs: 2500, // Extra time to see correct answer reveal
  minColorDistance: 10,
  baseDifficulty: 60,
  minDifficulty: 15,
  difficultyReductionPerLevel: 3,
};

// Monument Valley inspired color palette with poetic names
export const COLOR_PALETTE = [
  // Warm sunset colors
  { hex: '#E8A598', name: 'Coral Dream' },
  { hex: '#F4C4B4', name: 'Peach Whisper' },
  { hex: '#E8B4A0', name: 'Sunset Glow' },
  { hex: '#D4918A', name: 'Rose Dust' },
  { hex: '#C4756C', name: 'Terra Blush' },

  // Cool sage/teal colors
  { hex: '#A8C5B5', name: 'Sage Mist' },
  { hex: '#8BB5A0', name: 'Garden Path' },
  { hex: '#7AA894', name: 'Forest Whisper' },
  { hex: '#6B9A88', name: 'Emerald Fog' },
  { hex: '#5C8B7C', name: 'Deep Moss' },

  // Sky blues
  { hex: '#9EC5E8', name: 'Morning Sky' },
  { hex: '#87B5DC', name: 'Serene Blue' },
  { hex: '#70A5D0', name: 'Cloud Shadow' },
  { hex: '#5995C4', name: 'Ocean Drift' },
  { hex: '#4285B8', name: 'Deep Azure' },

  // Lavender/purple
  { hex: '#C5B5D4', name: 'Lavender Haze' },
  { hex: '#B5A0C8', name: 'Violet Dusk' },
  { hex: '#A58BBC', name: 'Purple Dream' },
  { hex: '#9576B0', name: 'Twilight' },
  { hex: '#8561A4', name: 'Deep Plum' },

  // Sandy/warm neutrals
  { hex: '#E8D5B5', name: 'Sand Dune' },
  { hex: '#DCC8A5', name: 'Golden Hour' },
  { hex: '#D0BB95', name: 'Wheat Field' },
  { hex: '#C4AE85', name: 'Amber Light' },
  { hex: '#B8A175', name: 'Desert Glow' },

  // Soft pinks
  { hex: '#F0D4D8', name: 'Blush Pink' },
  { hex: '#E8C4C8', name: 'Rose Petal' },
  { hex: '#E0B4B8', name: 'Dusty Rose' },
  { hex: '#D8A4A8', name: 'Mauve Mist' },
  { hex: '#D09498', name: 'Berry Cream' },

  // Mint/aqua
  { hex: '#B5E0D5', name: 'Mint Breeze' },
  { hex: '#A0D4C8', name: 'Sea Glass' },
  { hex: '#8BC8BB', name: 'Aqua Mist' },
  { hex: '#76BCAE', name: 'Tidal Pool' },
  { hex: '#61B0A1', name: 'Ocean Jade' },

  // Warm yellows
  { hex: '#F5E6B8', name: 'Butter Cream' },
  { hex: '#EED9A0', name: 'Honey Glow' },
  { hex: '#E7CC88', name: 'Sunlit' },
  { hex: '#E0BF70', name: 'Golden Sand' },
  { hex: '#D9B258', name: 'Marigold' },
];

export const RESULT_TITLES = {
  masterful: 'A Harmonious Journey',
  wellDone: 'Colors Remember You',
  goodTry: 'The Path Continues',
  keepPracticing: 'Return to the Valley',
};
