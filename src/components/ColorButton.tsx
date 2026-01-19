import React, { useEffect, useCallback, memo } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

interface ColorButtonProps {
  color: string;
  index: number;
  onPress: () => void;
  disabled?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}

const ColorButtonComponent: React.FC<ColorButtonProps> = ({
  color,
  index,
  onPress,
  disabled = false,
  isCorrect = false,
  isIncorrect = false,
}) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);
  const shakeX = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const shadowDepth = useSharedValue(1);
  const correctRingScale = useSharedValue(0);
  const incorrectOverlay = useSharedValue(0);

  // Entrance animation with staggered delay
  useEffect(() => {
    const delay = index * 100;
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 12, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.ease) });
      translateY.value = withSpring(0, { damping: 14, stiffness: 160 });
    }, delay);

    return () => clearTimeout(timer);
  }, [index, scale, opacity, translateY]);

  // Correct animation - celebratory pulse with ring
  useEffect(() => {
    if (isCorrect) {
      // Pulse the button
      pulseScale.value = withSequence(
        withTiming(1.12, { duration: 120, easing: Easing.out(Easing.ease) }),
        withSpring(1.05, { damping: 8, stiffness: 150 }),
        withSpring(1, { damping: 10, stiffness: 120 })
      );
      // Show success glow
      glowOpacity.value = withSequence(
        withTiming(0.8, { duration: 150 }),
        withTiming(0.3, { duration: 400 })
      );
      // Expand ring animation
      correctRingScale.value = withSequence(
        withTiming(1.4, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(1.5, { duration: 200 })
      );
      // Lift shadow effect
      shadowDepth.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
    } else {
      correctRingScale.value = withTiming(0, { duration: 100 });
    }
  }, [isCorrect, pulseScale, glowOpacity, correctRingScale, shadowDepth]);

  // Incorrect animation - shake with visual feedback
  useEffect(() => {
    if (isIncorrect) {
      // Shake animation
      shakeX.value = withSequence(
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(-6, { duration: 40 }),
        withTiming(6, { duration: 40 }),
        withTiming(-4, { duration: 40 }),
        withTiming(4, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
      // Show error overlay
      incorrectOverlay.value = withSequence(
        withTiming(0.4, { duration: 100 }),
        withTiming(0.15, { duration: 300 })
      );
      // Depress shadow
      shadowDepth.value = withSequence(
        withTiming(0.3, { duration: 50 }),
        withDelay(200, withSpring(1, { damping: 10 }))
      );
    } else {
      incorrectOverlay.value = withTiming(0, { duration: 200 });
    }
  }, [isIncorrect, shakeX, incorrectOverlay, shadowDepth]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
      { translateY: translateY.value },
      { translateX: shakeX.value },
    ],
    opacity: opacity.value,
  }));

  const shadowAnimatedStyle = useAnimatedStyle(() => {
    const depth = shadowDepth.value;
    return {
      top: interpolate(depth, [0, 1], [2, 4]),
      right: interpolate(depth, [0, 1], [-2, -5]),
      bottom: interpolate(depth, [0, 1], [-2, -5]),
      opacity: interpolate(depth, [0, 1], [0.15, 0.22]),
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: 1 + glowOpacity.value * 0.1 }],
  }));

  const correctRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: correctRingScale.value }],
    opacity: interpolate(correctRingScale.value, [0, 1, 1.4, 1.5], [0, 0.6, 0.3, 0]),
  }));

  const incorrectOverlayStyle = useAnimatedStyle(() => ({
    opacity: incorrectOverlay.value,
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withTiming(0.92, { duration: 80 });
      shadowDepth.value = withTiming(0.4, { duration: 80 });
    }
  }, [disabled, scale, shadowDepth]);

  const handlePressOut = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      shadowDepth.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [disabled, scale, shadowDepth]);

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      {/* Success ring animation */}
      <AnimatedView style={[styles.successRing, correctRingStyle]} />

      {/* Multi-layer shadow for depth */}
      <AnimatedView style={[styles.shadowLayerOuter, shadowAnimatedStyle]} />
      <View style={styles.shadowLayerInner} />

      {/* Success glow effect */}
      <AnimatedView
        style={[
          styles.glowLayer,
          { backgroundColor: COLORS.accent.sage },
          glowAnimatedStyle,
        ]}
      />

      {/* Main color layer */}
      <View style={[styles.colorLayer, { backgroundColor: color }]}>
        {/* Top highlight - soft light reflection */}
        <View style={styles.highlightTop} />
        {/* Secondary highlight for dimensionality */}
        <View style={styles.highlightSecondary} />
        {/* Subtle inner shadow at bottom */}
        <View style={styles.innerShadow} />

        {/* Incorrect overlay */}
        <AnimatedView style={[styles.incorrectOverlay, incorrectOverlayStyle]} />

        {/* Subtle border for definition */}
        <View style={styles.borderOverlay} />
      </View>
    </AnimatedPressable>
  );
};

// Memoize to prevent unnecessary re-renders
export const ColorButton = memo(ColorButtonComponent);

const styles = StyleSheet.create({
  button: {
    aspectRatio: 1,
    borderRadius: 22,
    position: 'relative',
  },
  // Success ring that expands outward
  successRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: COLORS.accent.sage,
  },
  // Outer shadow - softer, larger
  shadowLayerOuter: {
    position: 'absolute',
    left: 0,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 55, 45, 0.22)',
    // Dynamic values set by animated style
    top: 4,
    right: -5,
    bottom: -5,
  },
  // Inner shadow - sharper, closer
  shadowLayerInner: {
    position: 'absolute',
    top: 2,
    left: 1,
    right: -2,
    bottom: -2,
    borderRadius: 21,
    backgroundColor: 'rgba(74, 55, 45, 0.12)',
  },
  // Glow effect for correct answer
  glowLayer: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 30,
  },
  // Main color surface
  colorLayer: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  // Primary highlight - top left corner
  highlightTop: {
    position: 'absolute',
    top: '8%',
    left: '12%',
    width: '35%',
    height: '18%',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 50,
    transform: [{ rotate: '-5deg' }],
  },
  // Secondary smaller highlight
  highlightSecondary: {
    position: 'absolute',
    top: '28%',
    left: '8%',
    width: '15%',
    height: '8%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 50,
  },
  // Subtle inner shadow at bottom for depth
  innerShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    // Gradient effect via opacity
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  // Incorrect answer overlay
  incorrectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.accent.coral,
    borderRadius: 22,
  },
  // Subtle border for definition against similar backgrounds
  borderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.08)',
  },
});
