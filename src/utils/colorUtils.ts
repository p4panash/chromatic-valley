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
