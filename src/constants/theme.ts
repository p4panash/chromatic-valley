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

// ===== TIERED COLOR PALETTE SYSTEM =====
// Colors are organized by difficulty tier for progressive challenge
// EASY: Distinct, easily distinguishable colors
// MEDIUM: Colors with moderate similarity
// HARD: Similar colors that require attention
// HARDCORE: Nearly identical shades - expert level

// EASY TIER - Highly distinct colors, different hues
const EASY_PALETTE = [
  // Primary Colors - clearly distinct
  { hex: '#E8A598', name: 'Coral Dream' },
  { hex: '#9EC5E8', name: 'Morning Sky' },
  { hex: '#A8C5B5', name: 'Sage Mist' },
  { hex: '#F5E6B8', name: 'Butter Cream' },
  { hex: '#C5B5D4', name: 'Lavender Haze' },
  { hex: '#E9967A', name: 'Dark Salmon' },
  { hex: '#87CEEB', name: 'Sky Blue' },
  { hex: '#8FBC8F', name: 'Dark Sea Green' },
  { hex: '#DAA520', name: 'Goldenrod' },
  { hex: '#9370DB', name: 'Medium Purple' },

  // Secondary Colors - still very distinct
  { hex: '#CD5C5C', name: 'Indian Red' },
  { hex: '#5F9EA0', name: 'Cadet Blue' },
  { hex: '#6B8E23', name: 'Olive Drab' },
  { hex: '#F4A460', name: 'Sandy Brown' },
  { hex: '#DB7093', name: 'Pale Violet Red' },
  { hex: '#008B8B', name: 'Dark Cyan' },
  { hex: '#B5E0D5', name: 'Mint Breeze' },
  { hex: '#FFDB58', name: 'Dandelion' },
  { hex: '#8E4C5C', name: 'Wine' },
  { hex: '#4A6080', name: 'Queen Blue' },

  // Tertiary Colors - good variety
  { hex: '#FFB6C1', name: 'Light Pink' },
  { hex: '#ADD8E6', name: 'Light Blue' },
  { hex: '#9ACD32', name: 'Yellow Green' },
  { hex: '#D2B48C', name: 'Tan' },
  { hex: '#E6E6FA', name: 'Lavender' },
  { hex: '#A67B5B', name: 'Café au Lait' },
  { hex: '#708090', name: 'Slate Gray' },
  { hex: '#808000', name: 'Olive' },
  { hex: '#FFDAB9', name: 'Peach Puff' },
  { hex: '#D8BFD8', name: 'Thistle' },
];

// MEDIUM TIER - Same family colors, still distinguishable
const MEDIUM_PALETTE = [
  // Coral family
  { hex: '#F4C4B4', name: 'Peach Whisper' },
  { hex: '#E8B4A0', name: 'Sunset Glow' },
  { hex: '#D4918A', name: 'Rose Dust' },
  { hex: '#C4756C', name: 'Terra Blush' },

  // Pink family
  { hex: '#F0D4D8', name: 'Blush Pink' },
  { hex: '#E8C4C8', name: 'Rose Petal' },
  { hex: '#D8A4A8', name: 'Mauve Mist' },
  { hex: '#F4A4B4', name: 'Cherry Blossom' },

  // Rose family
  { hex: '#C77B8B', name: 'Antique Rose' },
  { hex: '#B8657A', name: 'Rose Taupe' },
  { hex: '#D4A4B4', name: 'Cameo Pink' },
  { hex: '#E6A8B8', name: 'Mellow Rose' },

  // Red/Terracotta family
  { hex: '#BC6C58', name: 'Copper Rust' },
  { hex: '#B5655A', name: 'Canyon Clay' },
  { hex: '#E07060', name: 'Soft Vermillion' },
  { hex: '#D88070', name: 'Apricot Blush' },

  // Orange family
  { hex: '#E8A060', name: 'Tangerine Dream' },
  { hex: '#D4945C', name: 'Burnt Orange' },
  { hex: '#E0906C', name: 'Melon' },
  { hex: '#E89850', name: 'Carrot' },

  // Sand family
  { hex: '#E8D5B5', name: 'Sand Dune' },
  { hex: '#DCC8A5', name: 'Golden Hour' },
  { hex: '#D0BB95', name: 'Wheat Field' },
  { hex: '#C4AE85', name: 'Amber Light' },

  // Yellow family
  { hex: '#EED9A0', name: 'Honey Glow' },
  { hex: '#E7CC88', name: 'Sunlit' },
  { hex: '#E0BF70', name: 'Golden Sand' },
  { hex: '#F0E68C', name: 'Khaki Light' },

  // Green family
  { hex: '#8BB5A0', name: 'Garden Path' },
  { hex: '#7AA894', name: 'Forest Whisper' },
  { hex: '#6B9A88', name: 'Emerald Fog' },
  { hex: '#5C8B7C', name: 'Deep Moss' },

  // Mint family
  { hex: '#A0D4C8', name: 'Sea Glass' },
  { hex: '#8BC8BB', name: 'Aqua Mist' },
  { hex: '#76BCAE', name: 'Tidal Pool' },
  { hex: '#98D8C8', name: 'Pale Robin Egg' },

  // Blue family
  { hex: '#87B5DC', name: 'Serene Blue' },
  { hex: '#70A5D0', name: 'Cloud Shadow' },
  { hex: '#5995C4', name: 'Ocean Drift' },
  { hex: '#B0C4DE', name: 'Light Steel Blue' },

  // Purple family
  { hex: '#B5A0C8', name: 'Violet Dusk' },
  { hex: '#A58BBC', name: 'Purple Dream' },
  { hex: '#9576B0', name: 'Twilight' },
  { hex: '#C8A2C8', name: 'Lilac' },
];

// HARD TIER - Similar colors requiring close attention
const HARD_PALETTE = [
  // Dusty pinks (subtle differences)
  { hex: '#E0B4B8', name: 'Dusty Rose' },
  { hex: '#D09498', name: 'Berry Cream' },
  { hex: '#E8909C', name: 'Flamingo' },
  { hex: '#C48B9F', name: 'Puce' },

  // Terracotta spectrum
  { hex: '#A85750', name: 'Brick Dust' },
  { hex: '#CC7766', name: 'Burnt Sienna Light' },
  { hex: '#C4756C', name: 'Terra Rosa' },
  { hex: '#CC8844', name: 'Bronze' },

  // Browns
  { hex: '#8B7355', name: 'Burly Wood' },
  { hex: '#967259', name: 'Cinnamon' },
  { hex: '#A0785C', name: 'Mocha' },
  { hex: '#B08060', name: 'Caramel' },
  { hex: '#946B4D', name: 'Cocoa' },

  // Sand/Khaki
  { hex: '#B8A175', name: 'Desert Glow' },
  { hex: '#C2A878', name: 'Khaki' },
  { hex: '#BDB298', name: 'Sand' },
  { hex: '#D2914C', name: 'Peru' },
  { hex: '#C8885C', name: 'Raw Sienna' },

  // Gold variations
  { hex: '#D9B258', name: 'Marigold' },
  { hex: '#F4D03F', name: 'Mustard' },
  { hex: '#F5C242', name: 'Sunflower' },

  // True greens
  { hex: '#90B494', name: 'Celadon' },
  { hex: '#7DA587', name: 'Fern' },
  { hex: '#6A9B6A', name: 'Grass' },
  { hex: '#5D8C5D', name: 'Forest' },
  { hex: '#789B6A', name: 'Artichoke' },

  // Olive greens
  { hex: '#9AA56A', name: 'Moss' },
  { hex: '#8B9A5C', name: 'Avocado' },
  { hex: '#A0A070', name: 'Pear' },
  { hex: '#8A9A5B', name: 'Asparagus' },
  { hex: '#7C8B5A', name: 'Pickle' },

  // Sage variations
  { hex: '#9DC5B4', name: 'Seafoam' },
  { hex: '#8FBCAA', name: 'Lichen' },
  { hex: '#61B0A1', name: 'Ocean Jade' },
  { hex: '#7EC8B8', name: 'Pearl Aqua' },

  // Teal variations
  { hex: '#4A8B8B', name: 'Teal Deer' },
  { hex: '#5C9A9A', name: 'Steel Teal' },
  { hex: '#6CACA9', name: 'Verdigris' },
  { hex: '#76B4B4', name: 'Moonstone' },
  { hex: '#48A4A4', name: 'Munsell' },
  { hex: '#66B2B2', name: 'Aero' },

  // Dusty blues
  { hex: '#8CAABC', name: 'Air Force Blue' },
  { hex: '#7B98A8', name: 'Shadow Blue' },
  { hex: '#6A8FA8', name: 'Rackley' },
  { hex: '#5E8298', name: 'Steel Blue Light' },
  { hex: '#7393A7', name: 'Weldon Blue' },
  { hex: '#6E8898', name: 'Slate' },

  // Navy spectrum
  { hex: '#3D5470', name: 'YInMn Blue Light' },
  { hex: '#4C6085', name: 'UCLA Blue' },
  { hex: '#5D6C7C', name: 'Payne Grey' },
  { hex: '#4B6378', name: 'Charcoal Blue' },
  { hex: '#36586B', name: 'Japanese Indigo' },

  // Violet spectrum
  { hex: '#8A7CB8', name: 'Ube' },
  { hex: '#7B68A6', name: 'Royal Lavender' },
  { hex: '#9966CC', name: 'Amethyst' },
  { hex: '#8874A3', name: 'Purple Mountain' },
  { hex: '#7851A9', name: 'Royal Purple Light' },
  { hex: '#8561A4', name: 'Deep Plum' },

  // Burgundy spectrum
  { hex: '#7B4054', name: 'Boysenberry' },
  { hex: '#A45A68', name: 'Rose Vale' },
  { hex: '#955264', name: 'Twilight Lavender' },
  { hex: '#8C506A', name: 'Mauve Taupe' },
  { hex: '#7F4A5C', name: 'Plum' },

  // Gray spectrum
  { hex: '#A9A59C', name: 'Warm Gray' },
  { hex: '#9C9890', name: 'Taupe Gray' },
  { hex: '#B5B0A8', name: 'Pale Silver' },
  { hex: '#A0998C', name: 'Grullo' },
  { hex: '#8B8680', name: 'Battleship Gray' },
  { hex: '#9CA5AB', name: 'Cadet Gray' },
  { hex: '#8E9AA5', name: 'Cool Gray' },
  { hex: '#A8B4BD', name: 'Silver Lake' },
  { hex: '#7A8690', name: 'Roman Silver' },
  { hex: '#8C959C', name: 'Manatee' },
  { hex: '#94A3B8', name: 'Pewter Blue' },
  { hex: '#8497A8', name: 'Shadow' },
  { hex: '#778899', name: 'Light Slate Gray' },
  { hex: '#6B7C8B', name: 'Aurometalsaurus' },
  { hex: '#4285B8', name: 'Deep Azure' },
];

// HARDCORE TIER - Nearly identical colors, expert difficulty
// Groups of 4-6 colors with <5 color distance between them
const HARDCORE_PALETTE = [
  // Coral micro-variations (nearly identical)
  { hex: '#E8A598', name: 'Coral Whisper 1' },
  { hex: '#E6A396', name: 'Coral Whisper 2' },
  { hex: '#E4A194', name: 'Coral Whisper 3' },
  { hex: '#E2A092', name: 'Coral Whisper 4' },
  { hex: '#E0A090', name: 'Coral Whisper 5' },

  // Blush pink micro-variations
  { hex: '#F0D4D8', name: 'Blush Shade 1' },
  { hex: '#EED2D6', name: 'Blush Shade 2' },
  { hex: '#ECD0D4', name: 'Blush Shade 3' },
  { hex: '#EACED2', name: 'Blush Shade 4' },
  { hex: '#E8CCD0', name: 'Blush Shade 5' },

  // Sage green micro-variations
  { hex: '#A8C5B5', name: 'Sage Tone 1' },
  { hex: '#A6C3B3', name: 'Sage Tone 2' },
  { hex: '#A4C1B1', name: 'Sage Tone 3' },
  { hex: '#A2BFAF', name: 'Sage Tone 4' },
  { hex: '#A0BDAD', name: 'Sage Tone 5' },

  // Sky blue micro-variations
  { hex: '#9EC5E8', name: 'Sky Hint 1' },
  { hex: '#9CC3E6', name: 'Sky Hint 2' },
  { hex: '#9AC1E4', name: 'Sky Hint 3' },
  { hex: '#98BFE2', name: 'Sky Hint 4' },
  { hex: '#96BDE0', name: 'Sky Hint 5' },

  // Lavender micro-variations
  { hex: '#C5B5D4', name: 'Lavender Note 1' },
  { hex: '#C3B3D2', name: 'Lavender Note 2' },
  { hex: '#C1B1D0', name: 'Lavender Note 3' },
  { hex: '#BFAFCE', name: 'Lavender Note 4' },
  { hex: '#BDADCC', name: 'Lavender Note 5' },

  // Gold/cream micro-variations
  { hex: '#F5E6B8', name: 'Cream Tint 1' },
  { hex: '#F3E4B6', name: 'Cream Tint 2' },
  { hex: '#F1E2B4', name: 'Cream Tint 3' },
  { hex: '#EFE0B2', name: 'Cream Tint 4' },
  { hex: '#EDDEB0', name: 'Cream Tint 5' },

  // Warm gray micro-variations
  { hex: '#A9A59C', name: 'Stone Gray 1' },
  { hex: '#A7A39A', name: 'Stone Gray 2' },
  { hex: '#A5A198', name: 'Stone Gray 3' },
  { hex: '#A39F96', name: 'Stone Gray 4' },
  { hex: '#A19D94', name: 'Stone Gray 5' },

  // Teal micro-variations
  { hex: '#5F9EA0', name: 'Teal Breath 1' },
  { hex: '#5D9C9E', name: 'Teal Breath 2' },
  { hex: '#5B9A9C', name: 'Teal Breath 3' },
  { hex: '#59989A', name: 'Teal Breath 4' },
  { hex: '#579698', name: 'Teal Breath 5' },

  // Terracotta micro-variations
  { hex: '#C4756C', name: 'Terra Shade 1' },
  { hex: '#C2736A', name: 'Terra Shade 2' },
  { hex: '#C07168', name: 'Terra Shade 3' },
  { hex: '#BE6F66', name: 'Terra Shade 4' },
  { hex: '#BC6D64', name: 'Terra Shade 5' },

  // Dusty blue micro-variations
  { hex: '#7B98A8', name: 'Mist Blue 1' },
  { hex: '#7996A6', name: 'Mist Blue 2' },
  { hex: '#7794A4', name: 'Mist Blue 3' },
  { hex: '#7592A2', name: 'Mist Blue 4' },
  { hex: '#7390A0', name: 'Mist Blue 5' },

  // Mauve micro-variations
  { hex: '#C48B9F', name: 'Mauve Touch 1' },
  { hex: '#C2899D', name: 'Mauve Touch 2' },
  { hex: '#C0879B', name: 'Mauve Touch 3' },
  { hex: '#BE8599', name: 'Mauve Touch 4' },
  { hex: '#BC8397', name: 'Mauve Touch 5' },

  // Forest green micro-variations
  { hex: '#6B9A88', name: 'Forest Shade 1' },
  { hex: '#699886', name: 'Forest Shade 2' },
  { hex: '#679684', name: 'Forest Shade 3' },
  { hex: '#659482', name: 'Forest Shade 4' },
  { hex: '#639280', name: 'Forest Shade 5' },
];

// Combined palette for backward compatibility
export const COLOR_PALETTE = [
  ...EASY_PALETTE,
  ...MEDIUM_PALETTE,
  ...HARD_PALETTE,
  ...HARDCORE_PALETTE,
];

// Export tiers for progressive difficulty
export const COLOR_TIERS = {
  easy: EASY_PALETTE,
  medium: MEDIUM_PALETTE,
  hard: HARD_PALETTE,
  hardcore: HARDCORE_PALETTE,
};

/**
 * Get the appropriate color palette based on current level.
 * Progressive difficulty: easy colors first, harder colors introduced over time.
 *
 * Level 1-3: Easy only (30 distinct colors)
 * Level 4-7: Easy + Medium (74 colors)
 * Level 8-12: Easy + Medium + Hard (150+ colors)
 * Level 13+: All tiers including Hardcore (200+ colors)
 *
 * @param level - Current game level
 * @returns Array of colors available for that level
 */
export const getColorsForLevel = (level: number): typeof COLOR_PALETTE => {
  if (level <= 3) {
    return [...EASY_PALETTE];
  } else if (level <= 7) {
    return [...EASY_PALETTE, ...MEDIUM_PALETTE];
  } else if (level <= 12) {
    return [...EASY_PALETTE, ...MEDIUM_PALETTE, ...HARD_PALETTE];
  } else {
    return [...EASY_PALETTE, ...MEDIUM_PALETTE, ...HARD_PALETTE, ...HARDCORE_PALETTE];
  }
};

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

/**
 * Get array of unlocked harmony types for a given score.
 */
export const getUnlockedHarmonyTypes = (score: number): string[] => {
  return HARMONY_CONFIG
    .filter((h) => h.unlockThreshold <= score)
    .map((h) => h.type);
};

/**
 * Check if a specific score crosses a harmony unlock threshold.
 * Returns the newly unlocked harmony type, or null if no new unlock.
 *
 * @param previousScore - Score before the action
 * @param currentScore - Score after the action
 * @returns The newly unlocked harmony type, or null
 */
export const getNewlyUnlockedHarmony = (
  previousScore: number,
  currentScore: number
): typeof HARMONY_CONFIG[number] | null => {
  // Find harmonies that are now unlocked but weren't before
  const previouslyUnlocked = new Set(
    HARMONY_CONFIG.filter((h) => h.unlockThreshold <= previousScore).map((h) => h.type)
  );

  const newlyUnlocked = HARMONY_CONFIG.find(
    (h) => h.unlockThreshold <= currentScore && !previouslyUnlocked.has(h.type)
  );

  return newlyUnlocked || null;
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
