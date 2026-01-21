import React, { memo, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';

interface StreakCelebrationProps {
  streak: number;
  onComplete: () => void;
}

const CELEBRATION_MESSAGES: Record<number, string> = {
  3: 'Nice!',
  5: 'Great!',
  10: 'Amazing!',
  15: 'Incredible!',
  20: 'On Fire!',
  25: 'Legendary!',
};

const CONFETTI_COLORS = [
  COLORS.accent.coral,
  COLORS.accent.sage,
  COLORS.accent.sky,
  COLORS.accent.lavender,
  COLORS.accent.sand,
  COLORS.accent.gold,
  COLORS.white,
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FACE_SIZE = 80;
const CONFETTI_COUNT = 24;
const STAR_COUNT = 8;
const RING_COUNT = 3;

interface FaceProps {
  size: number;
}

const HappyFace: React.FC<FaceProps> = memo(({ size }) => {
  const eyeSize = size * 0.12;
  const eyeSpacing = size * 0.22;

  return (
    <View style={[styles.face, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={styles.eyesContainer}>
        <View
          style={[
            styles.eye,
            {
              width: eyeSize,
              height: eyeSize * 1.2,
              borderRadius: eyeSize / 2,
              marginRight: eyeSpacing,
              transform: [{ translateY: -2 }],
            },
          ]}
        />
        <View
          style={[
            styles.eye,
            {
              width: eyeSize,
              height: eyeSize * 1.2,
              borderRadius: eyeSize / 2,
              transform: [{ translateY: -2 }],
            },
          ]}
        />
      </View>
      <View style={styles.mouthHappy} />
    </View>
  );
});

HappyFace.displayName = 'HappyFace';

interface ConfettiParticleProps {
  index: number;
  color: string;
  total: number;
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = memo(({ index, color, total }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const rotationY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  // Create more spread-out explosion pattern
  const angle = (index / total) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
  const distance = 100 + Math.random() * 80;
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance + 120 + Math.random() * 40;

  // Randomize particle shape
  const isRectangle = index % 3 === 0;
  const isCircle = index % 3 === 1;
  const particleWidth = isCircle ? 10 : (isRectangle ? 6 : 10);
  const particleHeight = isCircle ? 10 : (isRectangle ? 14 : 6);
  const borderRadius = isCircle ? 5 : 2;

  useEffect(() => {
    const delay = index * 20;

    scale.value = withDelay(delay, withSpring(1, { damping: 6, stiffness: 200 }));
    translateX.value = withDelay(
      delay + 50,
      withTiming(endX, { duration: 900, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay + 50,
      withTiming(endY, { duration: 900, easing: Easing.in(Easing.quad) })
    );
    rotation.value = withDelay(
      delay,
      withTiming(720 + Math.random() * 720, { duration: 1100 })
    );
    // 3D flip effect
    rotationY.value = withDelay(
      delay,
      withTiming(360 * (2 + Math.floor(Math.random() * 3)), { duration: 1100 })
    );
    opacity.value = withDelay(
      delay + 700,
      withTiming(0, { duration: 400 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { rotateY: `${rotationY.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        {
          backgroundColor: color,
          width: particleWidth,
          height: particleHeight,
          borderRadius: borderRadius,
        },
        animatedStyle,
      ]}
    />
  );
});

ConfettiParticle.displayName = 'ConfettiParticle';

// Star burst component for extra celebration
interface StarBurstProps {
  index: number;
}

const StarBurst: React.FC<StarBurstProps> = memo(({ index }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const angle = (index / STAR_COUNT) * Math.PI * 2;
  const distance = 60 + index * 10;
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];

  useEffect(() => {
    const delay = 100 + index * 50;

    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.5, { damping: 4, stiffness: 150 }),
        withTiming(0, { duration: 600 })
      )
    );
    translateX.value = withDelay(
      delay,
      withTiming(endX, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(endY, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    rotation.value = withDelay(
      delay,
      withTiming(180, { duration: 800 })
    );
    opacity.value = withDelay(
      delay + 500,
      withTiming(0, { duration: 300 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.star, animatedStyle]}>
      <View style={[styles.starPoint, { backgroundColor: color }]} />
      <View style={[styles.starPointHorizontal, { backgroundColor: color }]} />
      <View style={[styles.starPointDiagonal1, { backgroundColor: color }]} />
      <View style={[styles.starPointDiagonal2, { backgroundColor: color }]} />
    </Animated.View>
  );
});

StarBurst.displayName = 'StarBurst';

// Expanding ring component
interface ExpandingRingProps {
  index: number;
}

const ExpandingRing: React.FC<ExpandingRingProps> = memo(({ index }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.8);

  const color = [COLORS.accent.coral, COLORS.accent.sky, COLORS.accent.lavender][index];

  useEffect(() => {
    const delay = index * 150;

    scale.value = withDelay(
      delay,
      withTiming(3, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.expandingRing,
        { borderColor: color },
        animatedStyle,
      ]}
    />
  );
});

ExpandingRing.displayName = 'ExpandingRing';

// Shimmer effect on the face
const FaceShimmer: React.FC = memo(() => {
  const translateX = useSharedValue(-50);

  useEffect(() => {
    translateX.value = withDelay(
      300,
      withTiming(50, { duration: 600, easing: Easing.inOut(Easing.ease) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { rotate: '-20deg' }],
  }));

  return <Animated.View style={[styles.shimmer, animatedStyle]} />;
});

FaceShimmer.displayName = 'FaceShimmer';

export const StreakCelebration: React.FC<StreakCelebrationProps> = memo(({
  streak,
  onComplete,
}) => {
  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const textScale = useSharedValue(0);
  const bounceY = useSharedValue(0);
  const faceRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const message = CELEBRATION_MESSAGES[streak] || 'Amazing!';

  // Memoize confetti particles to prevent recalculation
  const confettiParticles = useMemo(() =>
    Array.from({ length: CONFETTI_COUNT }).map((_, index) => ({
      index,
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    })),
    []
  );

  useEffect(() => {
    // Animate in
    containerOpacity.value = withTiming(1, { duration: 200 });
    containerScale.value = withSequence(
      withSpring(1.15, { damping: 5, stiffness: 150 }),
      withSpring(1, { damping: 8 })
    );

    // Bounce animation with wiggle
    bounceY.value = withSequence(
      withTiming(-15, { duration: 200, easing: Easing.out(Easing.quad) }),
      withSpring(0, { damping: 4 })
    );

    // Subtle face rotation wiggle
    faceRotation.value = withDelay(
      200,
      withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-3, { duration: 100 }),
        withTiming(3, { duration: 100 }),
        withTiming(0, { duration: 100 })
      )
    );

    // Glow pulse
    glowOpacity.value = withSequence(
      withTiming(0.6, { duration: 200 }),
      withTiming(0.3, { duration: 400 }),
      withTiming(0.5, { duration: 300 }),
      withTiming(0, { duration: 300 })
    );

    // Text scale with bounce
    textScale.value = withDelay(
      150,
      withSequence(
        withSpring(1.1, { damping: 4, stiffness: 200 }),
        withSpring(1, { damping: 10 })
      )
    );

    // Auto-dismiss after 1.5 seconds
    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      });
      containerScale.value = withTiming(0.8, { duration: 300 });
    }, 1400);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [
      { scale: containerScale.value },
      { translateY: bounceY.value },
    ],
  }));

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${faceRotation.value}deg` }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Expanding rings */}
        {Array.from({ length: RING_COUNT }).map((_, index) => (
          <ExpandingRing key={`ring-${index}`} index={index} />
        ))}

        {/* Star bursts */}
        {Array.from({ length: STAR_COUNT }).map((_, index) => (
          <StarBurst key={`star-${index}`} index={index} />
        ))}

        {/* Confetti particles */}
        <View style={styles.confettiContainer}>
          {confettiParticles.map(({ index, color }) => (
            <ConfettiParticle
              key={`confetti-${index}`}
              index={index}
              color={color}
              total={CONFETTI_COUNT}
            />
          ))}
        </View>

        {/* Background glow */}
        <Animated.View style={[styles.faceGlow, glowStyle]} />

        {/* Face with shimmer */}
        <Animated.View style={faceStyle}>
          <View style={styles.faceWrapper}>
            <HappyFace size={FACE_SIZE} />
            <FaceShimmer />
          </View>
        </Animated.View>

        {/* Celebration text with badge background */}
        <Animated.View style={[styles.textBadge, textStyle]}>
          <Text style={styles.streakText}>{streak} Streak!</Text>
          <Text style={styles.messageText}>{message}</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
});

StreakCelebration.displayName = 'StreakCelebration';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    width: FACE_SIZE,
    height: FACE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiParticle: {
    position: 'absolute',
  },
  face: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  faceWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: FACE_SIZE / 2,
  },
  faceGlow: {
    position: 'absolute',
    width: FACE_SIZE + 40,
    height: FACE_SIZE + 40,
    borderRadius: (FACE_SIZE + 40) / 2,
    backgroundColor: COLORS.accent.lavender,
  },
  eyesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eye: {
    backgroundColor: COLORS.text.dark,
  },
  mouthHappy: {
    backgroundColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: COLORS.text.dark,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    borderRightWidth: 4,
    borderRightColor: 'transparent',
    borderRadius: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    width: 35,
    height: 18,
  },
  textBadge: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: COLORS.accent.sage,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  streakText: {
    fontSize: 24,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 18,
    fontWeight: FONTS.medium,
    color: COLORS.white,
    opacity: 0.9,
  },
  // Star styles
  star: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starPoint: {
    position: 'absolute',
    width: 3,
    height: 16,
    borderRadius: 1.5,
  },
  starPointHorizontal: {
    position: 'absolute',
    width: 16,
    height: 3,
    borderRadius: 1.5,
  },
  starPointDiagonal1: {
    position: 'absolute',
    width: 3,
    height: 12,
    borderRadius: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  starPointDiagonal2: {
    position: 'absolute',
    width: 3,
    height: 12,
    borderRadius: 1.5,
    transform: [{ rotate: '-45deg' }],
  },
  // Expanding ring styles
  expandingRing: {
    position: 'absolute',
    width: FACE_SIZE,
    height: FACE_SIZE,
    borderRadius: FACE_SIZE / 2,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  // Shimmer style
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
});
