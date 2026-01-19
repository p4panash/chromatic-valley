/**
 * Unit tests for color utility functions
 * Tests hexToHSL, hslToHex, colorDistance, generateSimilarColor
 */

// Extract utility functions for testing (they're private in useGame, so we recreate them)
interface HSL {
  h: number;
  s: number;
  l: number;
}

const hexToHSL = (hex: string): HSL => {
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

const hslToHex = (h: number, s: number, l: number): string => {
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

const generateSimilarColor = (baseHex: string, variance: number): string => {
  const hsl = hexToHSL(baseHex);

  const hueShift = (Math.random() - 0.5) * variance * 2;
  const satShift = (Math.random() - 0.5) * variance * 0.5;
  const lightShift = (Math.random() - 0.5) * variance * 0.8;

  const newH = (hsl.h + hueShift + 360) % 360;
  const newS = Math.max(10, Math.min(100, hsl.s + satShift));
  const newL = Math.max(20, Math.min(85, hsl.l + lightShift));

  return hslToHex(newH, newS, newL);
};

const colorDistance = (hex1: string, hex2: string): number => {
  const hsl1 = hexToHSL(hex1);
  const hsl2 = hexToHSL(hex2);

  const hDiff = Math.min(Math.abs(hsl1.h - hsl2.h), 360 - Math.abs(hsl1.h - hsl2.h));
  const sDiff = Math.abs(hsl1.s - hsl2.s);
  const lDiff = Math.abs(hsl1.l - hsl2.l);

  return Math.sqrt(hDiff * hDiff + sDiff * sDiff + lDiff * lDiff);
};

describe('hexToHSL', () => {
  it('converts pure red correctly', () => {
    const hsl = hexToHSL('#FF0000');
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts pure green correctly', () => {
    const hsl = hexToHSL('#00FF00');
    expect(hsl.h).toBeCloseTo(120, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts pure blue correctly', () => {
    const hsl = hexToHSL('#0000FF');
    expect(hsl.h).toBeCloseTo(240, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts white correctly', () => {
    const hsl = hexToHSL('#FFFFFF');
    expect(hsl.s).toBeCloseTo(0, 0);
    expect(hsl.l).toBeCloseTo(100, 0);
  });

  it('converts black correctly', () => {
    const hsl = hexToHSL('#000000');
    expect(hsl.s).toBeCloseTo(0, 0);
    expect(hsl.l).toBeCloseTo(0, 0);
  });

  it('converts gray correctly', () => {
    const hsl = hexToHSL('#808080');
    expect(hsl.s).toBeCloseTo(0, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts coral from game palette correctly', () => {
    const hsl = hexToHSL('#E8A598');
    expect(hsl.h).toBeGreaterThan(0);
    expect(hsl.h).toBeLessThan(30); // Coral is in red-orange range
    expect(hsl.s).toBeGreaterThan(40);
    expect(hsl.l).toBeGreaterThan(60);
  });

  it('handles lowercase hex values', () => {
    const hsl = hexToHSL('#ff0000');
    expect(hsl.h).toBeCloseTo(0, 0);
    expect(hsl.s).toBeCloseTo(100, 0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });
});

describe('hslToHex', () => {
  it('converts red HSL to hex correctly', () => {
    const hex = hslToHex(0, 100, 50);
    expect(hex).toBe('#FF0000');
  });

  it('converts green HSL to hex correctly', () => {
    const hex = hslToHex(120, 100, 50);
    expect(hex).toBe('#00FF00');
  });

  it('converts blue HSL to hex correctly', () => {
    const hex = hslToHex(240, 100, 50);
    expect(hex).toBe('#0000FF');
  });

  it('converts white correctly', () => {
    const hex = hslToHex(0, 0, 100);
    expect(hex).toBe('#FFFFFF');
  });

  it('converts black correctly', () => {
    const hex = hslToHex(0, 0, 0);
    expect(hex).toBe('#000000');
  });

  it('returns uppercase hex', () => {
    const hex = hslToHex(180, 50, 50);
    expect(hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('hexToHSL and hslToHex roundtrip', () => {
  const testColors = [
    '#E8A598', // Coral Dream
    '#A8C5B5', // Sage Mist
    '#9EC5E8', // Morning Sky
    '#C5B5D4', // Lavender Haze
    '#E8D5B5', // Sand Dune
    '#FF0000',
    '#00FF00',
    '#0000FF',
  ];

  testColors.forEach((originalHex) => {
    it(`roundtrips ${originalHex} correctly`, () => {
      const hsl = hexToHSL(originalHex);
      const resultHex = hslToHex(hsl.h, hsl.s, hsl.l);
      expect(resultHex.toUpperCase()).toBe(originalHex.toUpperCase());
    });
  });
});

describe('colorDistance', () => {
  it('returns 0 for identical colors', () => {
    expect(colorDistance('#FF0000', '#FF0000')).toBe(0);
    expect(colorDistance('#E8A598', '#E8A598')).toBe(0);
  });

  it('returns same distance regardless of argument order', () => {
    const dist1 = colorDistance('#FF0000', '#00FF00');
    const dist2 = colorDistance('#00FF00', '#FF0000');
    expect(dist1).toBeCloseTo(dist2, 5);
  });

  it('identifies very similar colors as close', () => {
    const distance = colorDistance('#E8A598', '#E8A599'); // Off by 1 in blue
    expect(distance).toBeLessThan(5);
  });

  it('identifies very different colors as far', () => {
    const distance = colorDistance('#FF0000', '#00FF00'); // Red vs Green
    expect(distance).toBeGreaterThan(100);
  });

  it('handles hue wrap-around correctly', () => {
    // Red at 0 degrees and red at 359 degrees should be close
    const hsl1 = { h: 0, s: 100, l: 50 };
    const hsl2 = { h: 359, s: 100, l: 50 };
    const hex1 = hslToHex(hsl1.h, hsl1.s, hsl1.l);
    const hex2 = hslToHex(hsl2.h, hsl2.s, hsl2.l);
    const distance = colorDistance(hex1, hex2);
    expect(distance).toBeLessThan(5); // Should be close due to hue wrap
  });

  it('case insensitive comparison', () => {
    const dist1 = colorDistance('#ff0000', '#FF0000');
    expect(dist1).toBe(0);
  });
});

describe('generateSimilarColor', () => {
  beforeEach(() => {
    jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns valid hex format', () => {
    const result = generateSimilarColor('#E8A598', 30);
    expect(result).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('generates color within expected distance for low variance', () => {
    // Test multiple times due to randomness
    for (let i = 0; i < 10; i++) {
      const base = '#E8A598';
      const variance = 15;
      const similar = generateSimilarColor(base, variance);
      const distance = colorDistance(base, similar);
      // Distance should be reasonable for the variance
      expect(distance).toBeLessThan(100);
    }
  });

  it('generates color within expected distance for high variance', () => {
    for (let i = 0; i < 10; i++) {
      const base = '#E8A598';
      const variance = 60;
      const similar = generateSimilarColor(base, variance);
      // Should still produce valid color
      expect(similar).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('clamps saturation within 10-100', () => {
    // Mock random to return extreme values
    (Math.random as jest.Mock).mockReturnValue(0); // Will produce -0.5 after (random - 0.5)

    const base = '#808080'; // Gray with low saturation
    const result = generateSimilarColor(base, 100);
    const resultHsl = hexToHSL(result);

    // Use tolerance to account for floating-point precision in hex roundtrip
    expect(resultHsl.s).toBeCloseTo(10, 0);
    expect(resultHsl.s).toBeLessThanOrEqual(100);
  });

  it('clamps lightness within 20-85', () => {
    (Math.random as jest.Mock).mockReturnValue(0);

    const base = '#000000'; // Black
    const result = generateSimilarColor(base, 100);
    const resultHsl = hexToHSL(result);

    expect(resultHsl.l).toBeGreaterThanOrEqual(20);
    expect(resultHsl.l).toBeLessThanOrEqual(85);
  });

  it('handles hue wrap-around', () => {
    (Math.random as jest.Mock).mockReturnValue(0);

    const base = '#FF0000'; // Red at hue 0
    const result = generateSimilarColor(base, 100);
    const resultHsl = hexToHSL(result);

    // Hue should wrap around, staying in 0-360 range
    expect(resultHsl.h).toBeGreaterThanOrEqual(0);
    expect(resultHsl.h).toBeLessThan(360);
  });

  it('produces different colors on consecutive calls', () => {
    jest.restoreAllMocks(); // Restore real Math.random

    const base = '#E8A598';
    const results = new Set<string>();

    for (let i = 0; i < 20; i++) {
      results.add(generateSimilarColor(base, 30));
    }

    // Should generate mostly unique colors (allowing some collisions)
    expect(results.size).toBeGreaterThan(10);
  });
});

describe('colorDistance game-specific scenarios', () => {
  const { GAME_CONFIG } = require('../constants/theme');

  it('minColorDistance threshold works for distinct colors', () => {
    // Two reasonably different colors should exceed minColorDistance
    const coral = '#E8A598';
    const sage = '#A8C5B5';
    const distance = colorDistance(coral, sage);
    expect(distance).toBeGreaterThan(GAME_CONFIG.minColorDistance);
  });

  it('similar palette colors can be distinguished', () => {
    // Colors in same family should still be distinguishable
    const coralDream = '#E8A598';
    const peachWhisper = '#F4C4B4';
    const distance = colorDistance(coralDream, peachWhisper);
    expect(distance).toBeGreaterThan(5); // Should be noticeably different
  });
});
