/**
 * Color utility functions for HSL/Hex conversions and color generation
 */

export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert hex color to HSL
 */
export const hexToHSL = (hex: string): HSL => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

/**
 * Convert HSL to hex color
 */
export const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

/**
 * Generate a similar color with controlled variance
 */
export const generateSimilarColor = (baseHex: string, variance: number): string => {
  const hsl = hexToHSL(baseHex);

  const hueShift = (Math.random() - 0.5) * variance * 2;
  const satShift = (Math.random() - 0.5) * variance * 0.5;
  const lightShift = (Math.random() - 0.5) * variance * 0.8;

  const newH = (hsl.h + hueShift + 360) % 360;
  const newS = Math.max(10, Math.min(100, hsl.s + satShift));
  const newL = Math.max(20, Math.min(85, hsl.l + lightShift));

  return hslToHex(newH, newS, newL);
};

/**
 * Calculate perceptual distance between two colors
 */
export const colorDistance = (hex1: string, hex2: string): number => {
  const hsl1 = hexToHSL(hex1);
  const hsl2 = hexToHSL(hex2);

  // Hue wraps around, so find minimum distance
  const hDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));
  const sDiff = Math.abs(hsl1.s - hsl2.s);
  const lDiff = Math.abs(hsl1.l - hsl2.l);

  // Weighted Euclidean distance (hue is most perceptually important)
  return Math.sqrt(hDiff * hDiff + sDiff * sDiff + lDiff * lDiff);
};

/**
 * Check if a color is considered "light" (for text contrast)
 */
export const isLightColor = (hex: string): boolean => {
  const hsl = hexToHSL(hex);
  return hsl.l > 55;
};

/**
 * Generate a contrasting text color for a given background
 */
export const getContrastColor = (backgroundHex: string): string => {
  return isLightColor(backgroundHex) ? '#2D3436' : '#FFFFFF';
};

/**
 * Get the complementary color (opposite on color wheel - 180 degrees)
 */
export const getComplementaryColor = (hex: string): string => {
  const hsl = hexToHSL(hex);
  const complementaryH = (hsl.h + 180) % 360;
  return hslToHex(complementaryH, hsl.s, hsl.l);
};

/**
 * Get split-complementary colors (150 and 210 degrees from original)
 */
export const getSplitComplementary = (hex: string): [string, string] => {
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 150) % 360;
  const h2 = (hsl.h + 210) % 360;
  return [hslToHex(h1, hsl.s, hsl.l), hslToHex(h2, hsl.s, hsl.l)];
};

/**
 * Get triadic colors (120 degrees apart)
 */
export const getTriadicColors = (hex: string): [string, string] => {
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 120) % 360;
  const h2 = (hsl.h + 240) % 360;
  return [hslToHex(h1, hsl.s, hsl.l), hslToHex(h2, hsl.s, hsl.l)];
};

/**
 * Generate a random vibrant color suitable for the color wheel
 */
export const generateRandomVibrantColor = (): string => {
  const h = Math.random() * 360;
  const s = 60 + Math.random() * 30; // 60-90% saturation
  const l = 45 + Math.random() * 15; // 45-60% lightness
  return hslToHex(h, s, l);
};

/**
 * Get analogous colors (30 degrees apart on each side)
 */
export const getAnalogousColors = (hex: string, spacing: number = 30): [string, string] => {
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + spacing + 360) % 360;
  const h2 = (hsl.h - spacing + 360) % 360;
  return [hslToHex(h1, hsl.s, hsl.l), hslToHex(h2, hsl.s, hsl.l)];
};

/**
 * Get tetradic/square colors (90 degrees apart)
 */
export const getTetradicColors = (hex: string): [string, string, string] => {
  const hsl = hexToHSL(hex);
  const h1 = (hsl.h + 90) % 360;
  const h2 = (hsl.h + 180) % 360;
  const h3 = (hsl.h + 270) % 360;
  return [
    hslToHex(h1, hsl.s, hsl.l),
    hslToHex(h2, hsl.s, hsl.l),
    hslToHex(h3, hsl.s, hsl.l),
  ];
};

/**
 * Get double complementary colors (two adjacent + their complements)
 * Returns [adjacent, complement1, complement2] (base color is implicit)
 */
export const getDoubleComplementaryColors = (hex: string): [string, string, string] => {
  const hsl = hexToHSL(hex);
  const adjacentH = (hsl.h + 30) % 360;
  const complement1H = (hsl.h + 180) % 360;
  const complement2H = (adjacentH + 180) % 360;
  return [
    hslToHex(adjacentH, hsl.s, hsl.l),
    hslToHex(complement1H, hsl.s, hsl.l),
    hslToHex(complement2H, hsl.s, hsl.l),
  ];
};

/**
 * Get monochromatic colors (same hue, different saturation/lightness)
 */
export const getMonochromaticColors = (hex: string): [string, string] => {
  const hsl = hexToHSL(hex);
  // Create lighter and darker variants
  const lighterL = Math.min(85, hsl.l + 20);
  const darkerL = Math.max(25, hsl.l - 20);
  const lighterS = Math.max(30, hsl.s - 15);
  const darkerS = Math.min(100, hsl.s + 10);
  return [
    hslToHex(hsl.h, lighterS, lighterL),
    hslToHex(hsl.h, darkerS, darkerL),
  ];
};

/**
 * Generate a vibrant color from a specific hue zone
 * Zones divide the 360-degree hue wheel into equal segments
 */
export const generateColorFromZone = (zone: number, numZones: number = 6): string => {
  const zoneSize = 360 / numZones;
  const zoneStart = zone * zoneSize;
  const h = zoneStart + Math.random() * zoneSize;
  const s = 60 + Math.random() * 30; // 60-90% saturation
  const l = 45 + Math.random() * 15; // 45-60% lightness
  return hslToHex(h, s, l);
};

/**
 * Get the hue zone for a given color
 */
export const getHueZone = (hex: string, numZones: number = 6): number => {
  const hsl = hexToHSL(hex);
  const zoneSize = 360 / numZones;
  return Math.floor(hsl.h / zoneSize) % numZones;
};

/**
 * Find the least used hue zones from recent colors
 */
export const findLeastUsedZones = (
  recentColors: string[],
  numZones: number = 6
): number[] => {
  const zoneCounts = new Array(numZones).fill(0);

  recentColors.forEach((color) => {
    const zone = getHueZone(color, numZones);
    zoneCounts[zone]++;
  });

  const minCount = Math.min(...zoneCounts);
  return zoneCounts
    .map((count, index) => (count === minCount ? index : -1))
    .filter((index) => index !== -1);
};

/**
 * Generate a vibrant color avoiding recently used hue zones
 */
export const generateVibrantColorAvoidingRecent = (
  recentColors: string[],
  numZones: number = 6
): string => {
  const leastUsedZones = findLeastUsedZones(recentColors, numZones);
  const zone = leastUsedZones[Math.floor(Math.random() * leastUsedZones.length)];
  return generateColorFromZone(zone, numZones);
};

/**
 * Generate distractors for complementary challenges
 * Creates colors near but not exactly at 180 degrees
 */
export const generateComplementaryDistractors = (
  baseHex: string,
  count: number = 3
): string[] => {
  const hsl = hexToHSL(baseHex);
  const complementH = (hsl.h + 180) % 360;

  // Offsets from the true complement that look plausible
  const offsets = [25, -25, 40, -40, 15, -15].slice(0, count * 2);
  const shuffled = offsets.sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((offset) => {
    const h = (complementH + offset + 360) % 360;
    const sVariation = (Math.random() - 0.5) * 10;
    const lVariation = (Math.random() - 0.5) * 10;
    return hslToHex(
      h,
      Math.max(40, Math.min(100, hsl.s + sVariation)),
      Math.max(30, Math.min(70, hsl.l + lVariation))
    );
  });
};

/**
 * Generate distractors for split-complementary challenges
 */
export const generateSplitCompDistractors = (
  correctHex: string,
  otherVisibleHex: string,
  count: number = 3
): string[] => {
  const correctHsl = hexToHSL(correctHex);
  const otherHsl = hexToHSL(otherVisibleHex);

  const distractors: string[] = [];
  const usedHues: number[] = [correctHsl.h, otherHsl.h];

  // Generate distractors at various offsets
  const offsets = [20, -20, 35, -35, 50, -50];

  for (const offset of offsets) {
    if (distractors.length >= count) break;

    const h = (correctHsl.h + offset + 360) % 360;

    // Check it's not too close to used hues
    const tooClose = usedHues.some((usedH) => {
      const diff = Math.min(Math.abs(h - usedH), 360 - Math.abs(h - usedH));
      return diff < 15;
    });

    if (!tooClose) {
      const sVariation = (Math.random() - 0.5) * 15;
      const lVariation = (Math.random() - 0.5) * 10;
      distractors.push(
        hslToHex(
          h,
          Math.max(40, Math.min(100, correctHsl.s + sVariation)),
          Math.max(30, Math.min(70, correctHsl.l + lVariation))
        )
      );
      usedHues.push(h);
    }
  }

  return distractors;
};

/**
 * Generate distractors for analogous challenges (subtle hue differences)
 */
export const generateAnalogousDistractors = (
  correctHex: string,
  flowDirection: 'clockwise' | 'counter-clockwise',
  count: number = 3
): string[] => {
  const hsl = hexToHSL(correctHex);

  // For analogous, distractors should be subtle - slightly off in the flow
  const baseOffset = flowDirection === 'clockwise' ? 1 : -1;
  const offsets = [15, -10, 25, -20, 8, -5].map((o) => o * baseOffset);
  const shuffled = offsets.sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((offset) => {
    const h = (hsl.h + offset + 360) % 360;
    const sVariation = (Math.random() - 0.5) * 8;
    const lVariation = (Math.random() - 0.5) * 8;
    return hslToHex(
      h,
      Math.max(50, Math.min(100, hsl.s + sVariation)),
      Math.max(35, Math.min(65, hsl.l + lVariation))
    );
  });
};

/**
 * Generate distractors for tetradic challenges
 */
export const generateTetradicDistractors = (
  correctHex: string,
  visibleHexes: string[],
  count: number = 3
): string[] => {
  const correctHsl = hexToHSL(correctHex);
  const visibleHues = visibleHexes.map((h) => hexToHSL(h).h);

  const distractors: string[] = [];
  const usedHues = [correctHsl.h, ...visibleHues];

  // Generate distractors at offsets from the correct answer
  const offsets = [15, -15, 30, -30, 45, -45];

  for (const offset of offsets) {
    if (distractors.length >= count) break;

    const h = (correctHsl.h + offset + 360) % 360;

    const tooClose = usedHues.some((usedH) => {
      const diff = Math.min(Math.abs(h - usedH), 360 - Math.abs(h - usedH));
      return diff < 12;
    });

    if (!tooClose) {
      const sVariation = (Math.random() - 0.5) * 12;
      const lVariation = (Math.random() - 0.5) * 10;
      distractors.push(
        hslToHex(
          h,
          Math.max(45, Math.min(95, correctHsl.s + sVariation)),
          Math.max(35, Math.min(65, correctHsl.l + lVariation))
        )
      );
      usedHues.push(h);
    }
  }

  return distractors;
};

/**
 * Generate distractors for monochromatic challenges (same hue, different S/L)
 */
export const generateMonochromaticDistractors = (
  correctHex: string,
  baseHue: number,
  count: number = 3
): string[] => {
  const correctHsl = hexToHSL(correctHex);

  const distractors: string[] = [];
  const usedSL: Array<{ s: number; l: number }> = [{ s: correctHsl.s, l: correctHsl.l }];

  // Generate variations at different S/L combinations
  const variations = [
    { sOffset: 15, lOffset: 10 },
    { sOffset: -15, lOffset: 10 },
    { sOffset: 15, lOffset: -10 },
    { sOffset: -15, lOffset: -10 },
    { sOffset: 25, lOffset: 15 },
    { sOffset: -25, lOffset: -15 },
  ];

  for (const { sOffset, lOffset } of variations) {
    if (distractors.length >= count) break;

    const newS = Math.max(30, Math.min(100, correctHsl.s + sOffset));
    const newL = Math.max(25, Math.min(75, correctHsl.l + lOffset));

    // Check it's not too similar to existing
    const tooSimilar = usedSL.some(
      ({ s, l }) => Math.abs(s - newS) < 10 && Math.abs(l - newL) < 8
    );

    if (!tooSimilar) {
      distractors.push(hslToHex(baseHue, newS, newL));
      usedSL.push({ s: newS, l: newL });
    }
  }

  return distractors;
};

/**
 * Shuffle an array (Fisher-Yates)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
