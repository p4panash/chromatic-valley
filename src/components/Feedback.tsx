import React, { useEffect, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';
import type { FeedbackType } from '../types';

interface FeedbackProps {
  type: FeedbackType;
}

const FEEDBACK_TEXT = {
  correct: 'Perfect',
  incorrect: 'Miss',
  timeout: 'Time',
};

const PARTICLE_COUNT = 12;
const SPARKLE_COUNT = 6;

// Particle colors for correct feedback
const CORRECT_PARTICLE_COLORS = [
  COLORS.accent.sage,
  COLORS.accent.sky,
  COLORS.accent.gold,
  COLORS.white,
];

// Particle for correct answer celebration
interface SuccessParticleProps {
  index: number;
}

const SuccessParticle: React.FC<SuccessParticleProps> = memo(({ index }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const distance = 60 + Math.random() * 40;
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance;
  const color = CORRECT_PARTICLE_COLORS[index % CORRECT_PARTICLE_COLORS.length];
  const size = 6 + Math.random() * 6;

  useEffect(() => {
    const delay = index * 15;

    scale.value = withDelay(delay, withSpring(1, { damping: 6 }));
    translateX.value = withDelay(
      delay,
      withTiming(endX, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(endY, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    rotation.value = withDelay(
      delay,
      withTiming(360, { duration: 600 })
    );
    opacity.value = withDelay(
      delay + 300,
      withTiming(0, { duration: 200 })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.successParticle,
        {
          backgroundColor: color,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
});

SuccessParticle.displayName = 'SuccessParticle';

// Sparkle for correct answer
interface SparkleProps {
  index: number;
}

const FeedbackSparkle: React.FC<SparkleProps> = memo(({ index }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);

  const angle = (index / SPARKLE_COUNT) * Math.PI * 2;
  const distance = 80 + index * 15;
  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  useEffect(() => {
    const delay = 50 + index * 40;

    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.2, { damping: 4, stiffness: 200 }),
        withTiming(0, { duration: 300 })
      )
    );
    rotation.value = withDelay(
      delay,
      withTiming(90, { duration: 400 })
    );
    opacity.value = withDelay(
      delay + 250,
      withTiming(0, { duration: 150 })
    );
  }, []);

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
    <Animated.View style={[styles.sparkle, animatedStyle]}>
      <View style={styles.sparkleHorizontal} />
      <View style={styles.sparkleVertical} />
    </Animated.View>
  );
});

FeedbackSparkle.displayName = 'FeedbackSparkle';

// Ring pulse for feedback
interface PulseRingProps {
  color: string;
  delay: number;
}

const PulseRing: React.FC<PulseRingProps> = memo(({ color, delay }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withTiming(2, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pulseRing,
        { borderColor: color },
        animatedStyle,
      ]}
    />
  );
});

PulseRing.displayName = 'PulseRing';

export const Feedback: React.FC<FeedbackProps> = ({ type }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const badgeRotation = useSharedValue(0);

  useEffect(() => {
    if (type) {
      opacity.value = withTiming(1, { duration: 150 });

      if (type === 'correct') {
        // Satisfying pop animation for correct
        scale.value = withSequence(
          withSpring(1.2, { damping: 6, stiffness: 300 }),
          withSpring(1, { damping: 8, stiffness: 150 })
        );
        glowOpacity.value = withSequence(
          withTiming(0.8, { duration: 100 }),
          withTiming(0, { duration: 400 })
        );
      } else if (type === 'incorrect') {
        // Shake animation for incorrect
        scale.value = withSequence(
          withSpring(1.1, { damping: 8, stiffness: 200 }),
          withSpring(1, { damping: 10, stiffness: 150 })
        );
        shakeX.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-3, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        badgeRotation.value = withSequence(
          withTiming(-2, { duration: 50 }),
          withTiming(2, { duration: 50 }),
          withTiming(-1, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      } else {
        // Timeout - gentle pulse
        scale.value = withSequence(
          withSpring(1.05, { damping: 10, stiffness: 150 }),
          withSpring(1, { damping: 12, stiffness: 120 })
        );
        glowOpacity.value = withSequence(
          withTiming(0.4, { duration: 150 }),
          withTiming(0, { duration: 350 })
        );
      }
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.5, { duration: 200 });
      shakeX.value = 0;
      glowOpacity.value = 0;
      badgeRotation.value = 0;
    }
  }, [type, scale, opacity, shakeX, glowOpacity, badgeRotation]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: shakeX.value },
    ],
    opacity: opacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${badgeRotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!type) return null;

  const color = '#fff';
  const bgColor = type === 'correct' ? COLORS.accent.sage : COLORS.accent.coral;
  const glowColor = type === 'correct' ? COLORS.accent.sage : COLORS.accent.coral;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.contentWrapper, containerStyle]}>
        {/* Pulse rings */}
        <PulseRing color={bgColor} delay={0} />
        <PulseRing color={bgColor} delay={100} />

        {/* Success particles for correct answer */}
        {type === 'correct' && (
          <View style={styles.particleContainer}>
            {Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
              <SuccessParticle key={`particle-${index}`} index={index} />
            ))}
            {Array.from({ length: SPARKLE_COUNT }).map((_, index) => (
              <FeedbackSparkle key={`sparkle-${index}`} index={index} />
            ))}
          </View>
        )}

        {/* Background glow */}
        <Animated.View
          style={[
            styles.glow,
            { backgroundColor: glowColor },
            glowStyle,
          ]}
        />

        {/* Badge */}
        <Animated.View style={[styles.textBadge, { backgroundColor: bgColor }, badgeStyle]}>
          <Animated.Text style={[styles.text, { color }]}>
            {FEEDBACK_TEXT[type]}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successParticle: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleHorizontal: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  sparkleVertical: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 60,
    borderRadius: 20,
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 100,
    borderRadius: 50,
  },
  textBadge: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    fontSize: 48,
    fontWeight: FONTS.light,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
});
