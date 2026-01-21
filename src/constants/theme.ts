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
  // Hue zone configuration for color variety
  hueZones: 6,
  minHueDistance: 30,
};

// Harmony unlock configuration
// Unlock thresholds are based on lifetime score (cumulative across all Play mode games)
export const HARMONY_CONFIG = [
  {
    type: 'color-match' as const,
    name: 'Color Match',
    description: 'Match the color you see',
    unlockThreshold: 0,
    difficulty: 1 as const,
    weight: 35,
  },
  {
    type: 'triadic' as const,
    name: 'Triadic Harmony',
    description: 'Three colors equally spaced on the wheel',
    unlockThreshold: 0,
    difficulty: 2 as const,
    weight: 25,
  },
  {
    type: 'complementary' as const,
    name: 'Complementary',
    description: 'Colors opposite on the wheel',
    unlockThreshold: 500,
    difficulty: 2 as const,
    weight: 15,
  },
  {
    type: 'split-complementary' as const,
    name: 'Split Complementary',
    description: 'One color plus two flanking its opposite',
    unlockThreshold: 2000,
    difficulty: 3 as const,
    weight: 10,
  },
  {
    type: 'analogous' as const,
    name: 'Analogous',
    description: 'Neighboring colors on the wheel',
    unlockThreshold: 5000,
    difficulty: 4 as const,
    weight: 8,
  },
  {
    type: 'tetradic' as const,
    name: 'Tetradic Square',
    description: 'Four colors forming a square',
    unlockThreshold: 8000,
    difficulty: 3 as const,
    weight: 8,
  },
  {
    type: 'double-complementary' as const,
    name: 'Double Complementary',
    description: 'Two pairs of opposite colors',
    unlockThreshold: 12000,
    difficulty: 4 as const,
    weight: 5,
  },
  {
    type: 'monochromatic' as const,
    name: 'Monochromatic',
    description: 'Shades and tints of one hue',
    unlockThreshold: 20000,
    difficulty: 5 as const,
    weight: 4,
  },
];

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

// Harmony colors for visual progression system
// These are the signature colors for each harmony type
export const HARMONY_COLORS: Record<string, { base: string; glow: string; muted: string }> = {
  'color-match': { base: '#E8A598', glow: '#F4D4CC', muted: '#E8D8D4' },      // Coral
  'triadic': { base: '#9EC5E8', glow: '#C4DCF4', muted: '#D0DCE8' },          // Sky blue
  'complementary': { base: '#A8C5B5', glow: '#C8DDD0', muted: '#D0DCD4' },    // Sage
  'split-complementary': { base: '#C5B5D4', glow: '#DDD0E8', muted: '#DCD4E0' }, // Lavender
  'analogous': { base: '#F5E6B8', glow: '#FAF0D8', muted: '#F4ECD8' },        // Gold
  'tetradic': { base: '#E89888', glow: '#F4C0B8', muted: '#E8D4D0' },         // Warm coral
  'double-complementary': { base: '#8BC8BB', glow: '#B8DDD4', muted: '#C8DCD8' }, // Aqua
  'monochromatic': { base: '#B5A0C8', glow: '#D4C8E0', muted: '#D8D0DC' },    // Purple
};

/**
 * Get array of base colors for unlocked harmonies.
 * Returns colors in unlock order for visual consistency.
 */
export const getUnlockedHarmonyColors = (lifetimeScore: number): string[] => {
  return HARMONY_CONFIG
    .filter((h) => h.unlockThreshold <= lifetimeScore)
    .map((h) => HARMONY_COLORS[h.type].base);
};

// Golden Hour Warmth - background evolves with harmony unlocks
// Non-linear interpolation, warmth accelerates at 5-8 unlocks
const EVOLVING_BACKGROUND = {
  // Base colors (0 unlocks) - original cream/peach
  startBase: '#fef5e7',
  endBase: '#f8e1c8',
  // Target colors (8 unlocks) - warm golden hour glow
  startTarget: '#fef0c8',  // Noticeably more golden
  endTarget: '#f5d0a0',    // Warm amber/honey tone
};

// easeInQuad: progress accelerates toward the end
// 4 unlocks = ~20%, 6 unlocks = ~50%, 8 unlocks = 100%
const easeInQuad = (t: number): number => t * t;

// Interpolate between two hex colors
const lerpColor = (color1: string, color2: string, t: number): string => {
  const r1 = parseInt(color1.slice(1, 3), 16);
  const g1 = parseInt(color1.slice(3, 5), 16);
  const b1 = parseInt(color1.slice(5, 7), 16);

  const r2 = parseInt(color2.slice(1, 3), 16);
  const g2 = parseInt(color2.slice(3, 5), 16);
  const b2 = parseInt(color2.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Get evolving background colors based on harmony unlock progress.
 * As more harmonies unlock, the background gains a subtle golden warmth.
 * Uses easeInQuad for non-linear progression (warmth accelerates at higher unlocks).
 *
 * @param unlockedCount - Number of unlocked harmonies (0-8)
 * @returns { start: string, end: string } - Gradient colors
 */
export const getEvolvingBackground = (unlockedCount: number): { start: string; end: string } => {
  // Normalize to 0-1 range (8 harmonies total)
  const normalizedProgress = Math.min(unlockedCount, 8) / 8;

  // Apply easing - warmth accelerates in final unlocks
  const easedProgress = easeInQuad(normalizedProgress);

  return {
    start: lerpColor(EVOLVING_BACKGROUND.startBase, EVOLVING_BACKGROUND.startTarget, easedProgress),
    end: lerpColor(EVOLVING_BACKGROUND.endBase, EVOLVING_BACKGROUND.endTarget, easedProgress),
  };
};
