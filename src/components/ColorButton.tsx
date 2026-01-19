import React, { useEffect, useCallback, memo } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const translateY = useSharedValue(10);
  const shakeX = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Entrance animation
  useEffect(() => {
    const delay = index * 80;
    const timer = setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
    }, delay);

    return () => clearTimeout(timer);
  }, [index, scale, opacity, translateY]);

  // Correct animation
  useEffect(() => {
    if (isCorrect) {
      pulseScale.value = withSequence(
        withTiming(1.15, { duration: 150 }),
        withSpring(1, { damping: 10 })
      );
    }
  }, [isCorrect, pulseScale]);

  // Incorrect animation
  useEffect(() => {
    if (isIncorrect) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [isIncorrect, shakeX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value * pulseScale.value },
      { translateY: translateY.value },
      { translateX: shakeX.value },
    ],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withTiming(0.95, { duration: 100 });
    }
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    }
  }, [disabled, scale]);

  return (
    <AnimatedPressable
      style={[styles.button, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      {/* Shadow layer for depth - warm architectural shadow for MV aesthetic */}
      <View style={styles.shadowLayer} />
      {/* Main color layer */}
      <View style={[styles.colorLayer, { backgroundColor: color }]}>
        {/* Highlight */}
        <View style={styles.highlight} />
      </View>
    </AnimatedPressable>
  );
};

// Memoize to prevent unnecessary re-renders
export const ColorButton = memo(ColorButtonComponent);

const styles = StyleSheet.create({
  button: {
    aspectRatio: 1,
    borderRadius: 20,
    position: 'relative',
  },
  shadowLayer: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 60, 50, 0.25)', // Warm architectural shadow
  },
  colorLayer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    width: '30%',
    height: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 50,
  },
});
