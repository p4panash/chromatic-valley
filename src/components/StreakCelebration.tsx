import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
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
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FACE_SIZE = 80;

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
}

const ConfettiParticle: React.FC<ConfettiParticleProps> = memo(({ index, color }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0);

  const angle = (index / 10) * Math.PI * 2;
  const distance = 80 + Math.random() * 60;
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance + 100;

  useEffect(() => {
    const delay = index * 30;

    scale.value = withDelay(delay, withSpring(1, { damping: 8 }));
    translateX.value = withDelay(
      delay + 100,
      withTiming(endX, { duration: 800, easing: Easing.out(Easing.quad) })
    );
    translateY.value = withDelay(
      delay + 100,
      withTiming(endY, { duration: 800, easing: Easing.in(Easing.quad) })
    );
    rotation.value = withDelay(
      delay,
      withTiming(360 + Math.random() * 360, { duration: 1000 })
    );
    opacity.value = withDelay(
      delay + 600,
      withTiming(0, { duration: 400 })
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
    <Animated.View
      style={[
        styles.confettiParticle,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
});

ConfettiParticle.displayName = 'ConfettiParticle';

export const StreakCelebration: React.FC<StreakCelebrationProps> = memo(({
  streak,
  onComplete,
}) => {
  const containerScale = useSharedValue(0);
  const containerOpacity = useSharedValue(0);
  const textScale = useSharedValue(0);
  const bounceY = useSharedValue(0);

  const message = CELEBRATION_MESSAGES[streak] || 'Amazing!';

  useEffect(() => {
    // Animate in
    containerOpacity.value = withTiming(1, { duration: 200 });
    containerScale.value = withSequence(
      withSpring(1.1, { damping: 6 }),
      withSpring(1, { damping: 10 })
    );

    // Bounce animation
    bounceY.value = withSequence(
      withTiming(-10, { duration: 200 }),
      withSpring(0, { damping: 6 })
    );

    // Text scale
    textScale.value = withDelay(200, withSpring(1, { damping: 8 }));

    // Auto-dismiss after 1.5 seconds
    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      });
      containerScale.value = withTiming(0.8, { duration: 300 });
    }, 1200);

    return () => clearTimeout(timeout);
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [
      { scale: containerScale.value },
      { translateY: bounceY.value },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: textScale.value }],
  }));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View style={[styles.container, containerStyle]}>
        {/* Confetti particles */}
        <View style={styles.confettiContainer}>
          {Array.from({ length: 10 }).map((_, index) => (
            <ConfettiParticle
              key={index}
              index={index}
              color={CONFETTI_COLORS[index % CONFETTI_COLORS.length]}
            />
          ))}
        </View>

        {/* Face */}
        <HappyFace size={FACE_SIZE} />

        {/* Celebration text */}
        <Animated.View style={[styles.textContainer, textStyle]}>
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
    width: 8,
    height: 8,
    borderRadius: 2,
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
  eyesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eye: {
    backgroundColor: '#2D3436',
  },
  mouthHappy: {
    backgroundColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: '#2D3436',
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
  textContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  streakText: {
    fontSize: 24,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 18,
    fontWeight: FONTS.medium,
    color: COLORS.accent.coral,
  },
});
