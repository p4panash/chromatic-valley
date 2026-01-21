import React, { useEffect, memo, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

// Default colors when no unlocked colors provided
const DEFAULT_COLORS = [
  COLORS.accent.coral,
  COLORS.accent.sage,
  COLORS.accent.sky,
  COLORS.accent.lavender,
  COLORS.accent.sand,
];

// Configuration for floating particles
const FLOATING_PARTICLE_COUNT = 8;
const AMBIENT_SPARKLE_COUNT = 12;

interface FloatingParticleConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  floatDistance: number;
  driftDistance: number;
}

// Generate random particle configurations with given colors
const generateParticles = (colors: string[]): FloatingParticleConfig[] => {
  return Array.from({ length: FLOATING_PARTICLE_COUNT }).map((_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 4 + Math.random() * 8,
    color: colors[i % colors.length],
    duration: 4000 + Math.random() * 3000,
    delay: i * 300,
    floatDistance: 15 + Math.random() * 20,
    driftDistance: 8 + Math.random() * 12,
  }));
};

// Stable particle positions (positions only, color applied separately)
const PARTICLE_POSITIONS = Array.from({ length: FLOATING_PARTICLE_COUNT }).map((_, i) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: 4 + Math.random() * 8,
  duration: 4000 + Math.random() * 3000,
  delay: i * 300,
  floatDistance: 15 + Math.random() * 20,
  driftDistance: 8 + Math.random() * 12,
}));

// Individual floating particle component
interface FloatingParticleProps {
  config: FloatingParticleConfig;
}

const FloatingParticle: React.FC<FloatingParticleProps> = memo(({ config }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    // Fade in
    opacity.value = withDelay(
      config.delay,
      withTiming(0.4, { duration: 1000 })
    );
    scale.value = withDelay(
      config.delay,
      withTiming(1, { duration: 1000 })
    );

    // Floating animation - up and down
    translateY.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(-config.floatDistance, {
            duration: config.duration,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: config.duration,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      )
    );

    // Horizontal drift
    translateX.value = withDelay(
      config.delay + 500,
      withRepeat(
        withSequence(
          withTiming(config.driftDistance, {
            duration: config.duration * 1.3,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(-config.driftDistance, {
            duration: config.duration * 1.3,
            easing: Easing.inOut(Easing.sin),
          })
        ),
        -1,
        true
      )
    );
  }, [config]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        {
          left: config.x,
          top: config.y,
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

FloatingParticle.displayName = 'FloatingParticle';

// Ambient sparkle configuration
interface AmbientSparkleConfig {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const generateSparkles = (): AmbientSparkleConfig[] => {
  return Array.from({ length: AMBIENT_SPARKLE_COUNT }).map((_, i) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 3 + Math.random() * 4,
    duration: 2000 + Math.random() * 2000,
    delay: i * 200,
  }));
};

const SPARKLES = generateSparkles();

// Individual ambient sparkle component
interface AmbientSparkleProps {
  config: AmbientSparkleConfig;
}

const AmbientSparkle: React.FC<AmbientSparkleProps> = memo(({ config }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    // Twinkling animation
    opacity.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(0.6, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.1, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.6, { duration: config.duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [config]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ambientSparkle,
        {
          left: config.x,
          top: config.y,
          width: config.size,
          height: config.size,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.sparkleHorizontal, { width: config.size }]} />
      <View style={[styles.sparkleVertical, { height: config.size }]} />
    </Animated.View>
  );
});

AmbientSparkle.displayName = 'AmbientSparkle';

// Large background shape component
interface BackgroundShapeProps {
  baseStyle: object;
  color: string;
  opacity: number;
  floatDistance: number;
  duration: number;
  delay: number;
  rotationAmount?: number;
}

const BackgroundShape: React.FC<BackgroundShapeProps> = memo(({
  baseStyle,
  color,
  opacity,
  floatDistance,
  duration,
  delay,
  rotationAmount = 0,
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Vertical float
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(-floatDistance, { duration, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );

    // Subtle horizontal drift
    translateX.value = withDelay(
      delay + 200,
      withRepeat(
        withSequence(
          withTiming(floatDistance * 0.3, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) }),
          withTiming(-floatDistance * 0.3, { duration: duration * 1.2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    // Subtle rotation
    if (rotationAmount > 0) {
      rotation.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(rotationAmount, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) }),
            withTiming(-rotationAmount, { duration: duration * 1.5, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
    }

    // Breathing scale
    scale.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.98, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, [floatDistance, duration, delay, rotationAmount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        baseStyle,
        { backgroundColor: color, opacity },
        animatedStyle
      ]}
    />
  );
});

BackgroundShape.displayName = 'BackgroundShape';

// Shape configurations (position/size only, color applied separately)
const SHAPE_CONFIGS = [
  { style: 'shape1', floatDistance: 20, duration: 4000, delay: 0, rotationAmount: 3, defaultOpacity: 0.12 },
  { style: 'shape2', floatDistance: 15, duration: 5000, delay: 500, rotationAmount: 5, defaultOpacity: 0.12 },
  { style: 'shape3', floatDistance: 25, duration: 6000, delay: 200, rotationAmount: 0, defaultOpacity: 0.12 },
  { style: 'shape4', floatDistance: 18, duration: 4500, delay: 800, rotationAmount: 4, defaultOpacity: 0.1 },
  { style: 'shape5', floatDistance: 12, duration: 5500, delay: 400, rotationAmount: 0, defaultOpacity: 0.1 },
];

interface BackgroundShapesProps {
  unlockedColors?: string[];
}

export const BackgroundShapes: React.FC<BackgroundShapesProps> = ({ unlockedColors }) => {
  // Use unlocked colors if provided, otherwise use defaults
  const colors = useMemo(() => {
    if (unlockedColors && unlockedColors.length > 0) {
      return unlockedColors;
    }
    return DEFAULT_COLORS;
  }, [unlockedColors]);

  // Generate particle configs with current colors
  const particles = useMemo(() => {
    return PARTICLE_POSITIONS.map((pos, i) => ({
      ...pos,
      color: colors[i % colors.length],
    }));
  }, [colors]);

  // Shape base styles (without color/opacity)
  const shapeStyles: Record<string, object> = {
    shape1: styles.shape1Base,
    shape2: styles.shape2Base,
    shape3: styles.shape3Base,
    shape4: styles.shape4Base,
    shape5: styles.shape5Base,
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Large background shapes with dynamic colors */}
      {SHAPE_CONFIGS.map((config, index) => (
        <BackgroundShape
          key={`shape-${index}`}
          baseStyle={shapeStyles[config.style]}
          color={colors[index % colors.length]}
          opacity={config.defaultOpacity}
          floatDistance={config.floatDistance}
          duration={config.duration}
          delay={config.delay}
          rotationAmount={config.rotationAmount}
        />
      ))}

      {/* Floating particles with dynamic colors */}
      {particles.map((config, index) => (
        <FloatingParticle key={`particle-${index}`} config={config} />
      ))}

      {/* Ambient sparkles */}
      {SPARKLES.map((config, index) => (
        <AmbientSparkle key={`sparkle-${index}`} config={config} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  // Base styles for shapes (position/size only, no color/opacity)
  shape1Base: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -50,
    right: -50,
    borderRadius: 100,
  },
  shape2Base: {
    position: 'absolute',
    width: 150,
    height: 150,
    bottom: '20%',
    left: -40,
    borderRadius: 8,
  },
  shape3Base: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: '40%',
    right: -20,
    borderRadius: 50,
  },
  shape4Base: {
    position: 'absolute',
    width: 80,
    height: 80,
    top: '15%',
    left: '10%',
    borderRadius: 40,
  },
  shape5Base: {
    position: 'absolute',
    width: 120,
    height: 120,
    bottom: '10%',
    right: '5%',
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
  },
  // Floating particles
  floatingParticle: {
    position: 'absolute',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  // Ambient sparkles
  ambientSparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleHorizontal: {
    position: 'absolute',
    height: 1,
    backgroundColor: COLORS.accent.sky,
    borderRadius: 0.5,
  },
  sparkleVertical: {
    position: 'absolute',
    width: 1,
    backgroundColor: COLORS.accent.sky,
    borderRadius: 0.5,
  },
});
