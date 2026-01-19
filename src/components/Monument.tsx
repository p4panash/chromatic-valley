import React, { useEffect, useState, memo } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Rect, Polygon, Circle, Ellipse, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const SIZE = 100;
const SPARKLE_COUNT = 8;
const FLOATING_ORB_COUNT = 5;

// Unified colors matching MiniCastle
const MONUMENT_COLORS = {
  foundation: COLORS.accent.sand,
  walls: COLORS.accent.sage,
  tower: COLORS.accent.coral,
  windowDefault: COLORS.accent.sky,
  crown: COLORS.accent.gold,
};

// Window color cycle for the logo animation
const WINDOW_COLORS = [
  COLORS.accent.sky,
  COLORS.accent.coral,
  COLORS.accent.sage,
  COLORS.accent.lavender,
];

// Sparkle colors for magical effect
const SPARKLE_COLORS = [
  COLORS.white,
  COLORS.accent.sky,
  COLORS.accent.lavender,
  COLORS.accent.gold,
];

// Floating orb configuration
interface FloatingOrbConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const FLOATING_ORBS: FloatingOrbConfig[] = [
  { x: -40, y: 20, size: 6, color: COLORS.accent.sky, delay: 0, duration: 3000 },
  { x: 50, y: -30, size: 4, color: COLORS.accent.lavender, delay: 500, duration: 3500 },
  { x: -30, y: -40, size: 5, color: COLORS.accent.coral, delay: 200, duration: 2800 },
  { x: 55, y: 30, size: 4, color: COLORS.accent.sage, delay: 800, duration: 3200 },
  { x: 0, y: -55, size: 3, color: COLORS.accent.gold, delay: 400, duration: 2600 },
];

// Individual sparkle component with its own animation
interface SparkleProps {
  index: number;
}

const Sparkle: React.FC<SparkleProps> = memo(({ index }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Position sparkles around the monument
  const angle = (index / SPARKLE_COUNT) * Math.PI * 2;
  const radius = 45 + (index % 3) * 10;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius - 20;
  const color = SPARKLE_COLORS[index % SPARKLE_COLORS.length];
  const size = 3 + (index % 3) * 2;

  useEffect(() => {
    const delay = index * 200;
    const duration = 1500 + (index % 3) * 500;

    // Twinkling animation
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.2, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    rotation.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, { duration: duration * 2, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [index, opacity, scale, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x },
      { translateY: y },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.sparkle, { width: size, height: size }, animatedStyle]}>
      <View style={[styles.sparkleInner, { backgroundColor: color }]} />
      <View style={[styles.sparkleHorizontal, { backgroundColor: color }]} />
      <View style={[styles.sparkleVertical, { backgroundColor: color }]} />
    </Animated.View>
  );
});

Sparkle.displayName = 'Sparkle';

// Floating orb component
interface FloatingOrbProps {
  config: FloatingOrbConfig;
}

const FloatingOrb: React.FC<FloatingOrbProps> = memo(({ config }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    opacity.value = withDelay(
      config.delay + 500,
      withTiming(0.7, { duration: 800 })
    );
    scale.value = withDelay(
      config.delay + 500,
      withSpring(1, { damping: 10 })
    );

    // Floating animation
    translateY.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(-12, { duration: config.duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: config.duration, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Subtle horizontal drift
    translateX.value = withDelay(
      config.delay + 200,
      withRepeat(
        withSequence(
          withTiming(5, { duration: config.duration * 1.2, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: config.duration * 1.2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [config, translateY, translateX, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: config.x + translateX.value },
      { translateY: config.y + translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.floatingOrb,
        {
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
        animatedStyle,
      ]}
    />
  );
});

FloatingOrb.displayName = 'FloatingOrb';

// Glow pulse component
const GlowPulse: React.FC = memo(() => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.glowPulse, animatedStyle]} />;
});

GlowPulse.displayName = 'GlowPulse';

export const Monument: React.FC = () => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);

  const [windowColorIndex, setWindowColorIndex] = useState(0);

  useEffect(() => {
    // Overall entrance scale
    scale.value = withDelay(
      100,
      withSpring(1, { damping: 12, stiffness: 80 })
    );

    // Floating animation
    translateY.value = withDelay(
      600,
      withRepeat(
        withTiming(-8, {
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      )
    );

    // Cycle window colors every 3 seconds
    const colorInterval = setInterval(() => {
      setWindowColorIndex((prev) => (prev + 1) % WINDOW_COLORS.length);
    }, 3000);

    return () => clearInterval(colorInterval);
  }, [translateY, scale]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handlePress = () => {
    // Playful bounce on tap
    scale.value = withSequence(
      withSpring(1.1, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  };

  const cx = SIZE / 2;
  const baseY = SIZE;
  const windowColor = WINDOW_COLORS[windowColorIndex];

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.wrapper}>
        {/* Background glow pulse */}
        <GlowPulse />

        {/* Floating orbs around the monument */}
        {FLOATING_ORBS.map((config, index) => (
          <FloatingOrb key={`orb-${index}`} config={config} />
        ))}

        {/* Animated sparkles */}
        {Array.from({ length: SPARKLE_COUNT }).map((_, index) => (
          <Sparkle key={`sparkle-${index}`} index={index} />
        ))}

        <Animated.View style={[styles.container, containerStyle]}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Shadow/ground indicator */}
            <Ellipse cx={cx} cy={baseY - 2} rx={35} ry={5} fill="rgba(0,0,0,0.08)" />

            {/* Foundation */}
            <Rect
              x={cx - 35}
              y={baseY - 18}
              width={70}
              height={18}
              fill={MONUMENT_COLORS.foundation}
              rx={3}
            />

            {/* Walls with turrets - matching MiniCastle style */}
            <G>
              <Rect
                x={cx - 28}
                y={baseY - 55}
                width={56}
                height={40}
                fill={MONUMENT_COLORS.walls}
                rx={3}
              />
              {/* Turrets */}
              <Rect x={cx - 32} y={baseY - 68} width={14} height={16} fill={MONUMENT_COLORS.walls} rx={2} />
              <Rect x={cx + 18} y={baseY - 68} width={14} height={16} fill={MONUMENT_COLORS.walls} rx={2} />

              {/* Main arched window */}
              <Rect
                x={cx - 8}
                y={baseY - 42}
                width={16}
                height={24}
                fill={windowColor}
                rx={8}
                opacity={0.8}
              />
              {/* Window glow */}
              <Rect
                x={cx - 10}
                y={baseY - 44}
                width={20}
                height={28}
                fill="none"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={1.5}
                rx={10}
              />
            </G>

            {/* Tower */}
            <G>
              <Rect
                x={cx - 15}
                y={baseY - 82}
                width={30}
                height={30}
                fill={MONUMENT_COLORS.tower}
                rx={3}
              />
              <Polygon
                points={`${cx},${baseY - 98} ${cx - 18},${baseY - 80} ${cx + 18},${baseY - 80}`}
                fill={MONUMENT_COLORS.tower}
              />
              {/* Tower window */}
              <Circle cx={cx} cy={baseY - 70} r={6} fill={windowColor} opacity={0.8} />
              <Circle cx={cx} cy={baseY - 70} r={8} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
            </G>

            {/* Crown glow and sparkles */}
            <G>
              <Circle
                cx={cx}
                cy={baseY - 95}
                r={10}
                fill={MONUMENT_COLORS.crown}
                opacity={0.7}
              />
              {/* Sparkle effects */}
              <Circle cx={cx - 6} cy={baseY - 100} r={2} fill={COLORS.white} opacity={0.8} />
              <Circle cx={cx + 6} cy={baseY - 92} r={1.5} fill={COLORS.white} opacity={0.6} />
              <Circle cx={cx} cy={baseY - 103} r={1} fill={COLORS.white} opacity={0.7} />
            </G>
          </Svg>
        </Animated.View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE + 80,
    height: SIZE + 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  container: {
    alignItems: 'center',
    width: SIZE,
    height: SIZE,
    zIndex: 10,
  },
  glowPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent.lavender,
  },
  sparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  sparkleInner: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
  },
  sparkleHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
    borderRadius: 0.5,
  },
  sparkleVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
    borderRadius: 0.5,
  },
  floatingOrb: {
    position: 'absolute',
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 5,
  },
});
