import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, G, Filter, FeGaussianBlur } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  useSharedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { COLORS, HARMONY_CONFIG, HARMONY_COLORS } from '../constants/theme';

interface HarmonyPaletteProps {
  lifetimeScore: number;
  variant?: 'home' | 'result';
}

// Organic positions - clustered by color temperature
// Warm tones (coral, gold, tetradic) cluster upper-left
// Cool tones (blue, aqua, sage) cluster lower-right
// Purple/violet drift toward edges
// MORE DRAMATIC scale variation for visual weight
const POSITIONS: Record<string, { x: number; y: number; scale: number; rotation: number }> = {
  'color-match': { x: -5, y: 8, scale: 1.45, rotation: 12 },         // Center-ish, warm, LARGEST
  'triadic': { x: 52, y: -25, scale: 0.95, rotation: -8 },           // Upper right, cool
  'complementary': { x: 35, y: 38, scale: 1.15, rotation: 22 },      // Lower right, sage
  'split-complementary': { x: -58, y: 18, scale: 0.75, rotation: -15 }, // Left, purple, smaller
  'analogous': { x: -35, y: -38, scale: 1.25, rotation: 5 },         // Upper left, warm gold
  'tetradic': { x: -50, y: -5, scale: 0.68, rotation: -25 },         // Left, warm coral, tiny
  'double-complementary': { x: 58, y: 15, scale: 0.72, rotation: 18 }, // Right, aqua
  'monochromatic': { x: 8, y: 58, scale: 0.65, rotation: -10 },      // Bottom, violet, smallest
};

// Hand-crafted asymmetric blob paths - each DRAMATICALLY different
// Varying silhouettes: bulbous, elongated, lumpy, offset-round, spiky-soft
const BLOB_PATHS: Record<string, string> = {
  // Bulbous, dominant - like a drop of paint just landed
  'color-match': 'M25,2 C38,0 48,10 50,24 C52,38 46,48 32,52 C18,56 4,48 1,34 C-2,20 8,6 22,2 C23,2 24,2 25,2Z',
  // Stretched horizontally - like paint dragged by brush
  'triadic': 'M12,12 C24,4 40,6 50,16 C56,24 54,36 44,44 C32,52 16,50 6,40 C-2,30 0,18 12,12Z',
  // Lumpy, organic - like a puddle with irregular edges
  'complementary': 'M20,4 C28,2 38,6 45,14 C52,22 50,34 46,42 C40,50 28,54 16,50 C6,46 0,36 2,26 C4,14 12,6 20,4Z',
  // Tall and thin - dripping paint
  'split-complementary': 'M22,0 C32,2 40,12 42,26 C44,40 40,52 30,56 C20,58 10,50 6,36 C2,22 8,8 18,2 C20,1 21,0 22,0Z',
  // Wide and flat - smeared pigment
  'analogous': 'M8,16 C20,6 36,4 48,12 C56,20 54,34 46,42 C36,50 18,52 8,44 C-2,36 -2,26 8,16Z',
  // Almost round but offset - a near-perfect drop
  'tetradic': 'M24,4 C36,4 46,14 48,26 C50,38 42,50 28,52 C14,54 2,44 0,30 C-2,16 10,4 24,4Z',
  // Irregular, blobby - like spilled ink
  'double-complementary': 'M16,6 C28,0 44,8 50,20 C56,34 48,50 34,54 C20,58 4,48 0,34 C-4,20 6,10 16,6Z',
  // Delicate, small form - watercolor mist
  'monochromatic': 'M24,6 C34,4 44,14 46,26 C48,38 40,48 28,50 C16,52 6,44 4,32 C2,20 14,8 24,6Z',
};

// Different animation timings for each - MORE stagger for organic feel
const ANIM_TIMINGS: Record<string, { breathe: number; delay: number }> = {
  'color-match': { breathe: 2900, delay: 0 },
  'triadic': { breathe: 2550, delay: 280 },
  'complementary': { breathe: 3100, delay: 450 },
  'split-complementary': { breathe: 2400, delay: 150 },
  'analogous': { breathe: 2750, delay: 380 },
  'tetradic': { breathe: 3200, delay: 520 },
  'double-complementary': { breathe: 2650, delay: 320 },
  'monochromatic': { breathe: 2850, delay: 480 },
};

const ColorBlob: React.FC<{
  harmonyType: string;
  colors: { base: string; glow: string; muted: string };
  isUnlocked: boolean;
  position: { x: number; y: number; scale: number; rotation: number };
  variant: 'home' | 'result';
}> = memo(({ harmonyType, colors, isUnlocked, position, variant }) => {
  const breatheAnim = useSharedValue(1);
  const timing = ANIM_TIMINGS[harmonyType];

  React.useEffect(() => {
    if (isUnlocked) {
      breatheAnim.value = withDelay(
        timing.delay,
        withRepeat(
          withSequence(
            withTiming(1.04, {
              duration: timing.breathe * 0.5,
              easing: Easing.bezier(0.4, 0, 0.2, 1)
            }),
            withTiming(1, {
              duration: timing.breathe * 0.5,
              easing: Easing.bezier(0.4, 0, 0.6, 1)
            })
          ),
          -1,
          true
        )
      );
    }
  }, [isUnlocked, timing, breatheAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: isUnlocked ? breatheAnim.value * position.scale : position.scale * 0.2 },
      { rotate: `${position.rotation}deg` },
    ],
    opacity: isUnlocked ? 1 : 0.15,
  }));

  const baseSize = variant === 'home' ? 52 : 46;
  const blobPath = BLOB_PATHS[harmonyType];

  return (
    <Animated.View
      style={[
        styles.blobContainer,
        {
          left: '50%',
          top: '50%',
          marginLeft: position.x - baseSize / 2,
          marginTop: position.y - baseSize / 2,
          zIndex: isUnlocked ? 10 : 1,
        },
        animatedStyle,
      ]}
    >
      {/* Soft glow underneath - like light through paper */}
      {isUnlocked && (
        <View
          style={[
            styles.softGlow,
            {
              width: baseSize * 1.5,
              height: baseSize * 1.5,
              borderRadius: baseSize * 0.75,
              backgroundColor: colors.glow,
              left: -baseSize * 0.25,
              top: -baseSize * 0.25,
            },
          ]}
        />
      )}

      <Svg width={baseSize} height={baseSize} viewBox="0 0 50 54">
        <Defs>
          <RadialGradient
            id={`grad-${harmonyType}`}
            cx="45%"
            cy="40%"
            rx="55%"
            ry="55%"
          >
            <Stop offset="0%" stopColor={isUnlocked ? colors.base : colors.muted} stopOpacity={isUnlocked ? "1" : "0.4"} />
            <Stop offset="50%" stopColor={isUnlocked ? colors.base : colors.muted} stopOpacity={isUnlocked ? "0.85" : "0.3"} />
            <Stop offset="85%" stopColor={isUnlocked ? colors.glow : colors.muted} stopOpacity={isUnlocked ? "0.6" : "0.2"} />
            <Stop offset="100%" stopColor={isUnlocked ? colors.glow : colors.muted} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Path
          d={blobPath}
          fill={`url(#grad-${harmonyType})`}
        />
      </Svg>
    </Animated.View>
  );
});

ColorBlob.displayName = 'ColorBlob';

export const HarmonyPalette: React.FC<HarmonyPaletteProps> = memo(({ lifetimeScore, variant = 'home' }) => {
  const unlockedTypes = useMemo(() => {
    const unlocked = HARMONY_CONFIG.filter((h) => h.unlockThreshold <= lifetimeScore);
    return new Set(unlocked.map((h) => h.type));
  }, [lifetimeScore]);

  const containerSize = variant === 'home' ? 180 : 160;

  return (
    <View style={[styles.container, { height: containerSize + 50 }]}>
      <View style={[styles.constellation, { width: containerSize, height: containerSize }]}>
        {HARMONY_CONFIG.map((harmony) => (
          <ColorBlob
            key={harmony.type}
            harmonyType={harmony.type}
            colors={HARMONY_COLORS[harmony.type]}
            isUnlocked={unlockedTypes.has(harmony.type)}
            position={POSITIONS[harmony.type]}
            variant={variant}
          />
        ))}
      </View>

      {/* Minimal indicator row */}
      <View style={styles.dotsRow}>
        {HARMONY_CONFIG.map((harmony) => {
          const isUnlocked = unlockedTypes.has(harmony.type);
          return (
            <View
              key={harmony.type}
              style={[
                styles.indicatorDot,
                {
                  backgroundColor: isUnlocked
                    ? HARMONY_COLORS[harmony.type].base
                    : COLORS.missing.pattern,
                  opacity: isUnlocked ? 0.9 : 0.25,
                  width: isUnlocked ? 7 : 5,
                  height: isUnlocked ? 7 : 5,
                  borderRadius: isUnlocked ? 3.5 : 2.5,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
});

HarmonyPalette.displayName = 'HarmonyPalette';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  constellation: {
    position: 'relative',
  },
  blobContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  softGlow: {
    position: 'absolute',
    opacity: 0.28,
    zIndex: -1,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
  },
  indicatorDot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
