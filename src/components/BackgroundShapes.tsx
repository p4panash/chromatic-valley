import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export const BackgroundShapes: React.FC = () => {
  const shape1Y = useSharedValue(0);
  const shape2Y = useSharedValue(0);
  const shape3Y = useSharedValue(0);
  const sparkle1Scale = useSharedValue(1);
  const sparkle2Scale = useSharedValue(1);

  useEffect(() => {
    // Floating animations
    shape1Y.value = withRepeat(
      withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    shape2Y.value = withRepeat(
      withTiming(-15, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    shape3Y.value = withRepeat(
      withTiming(-25, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Sparkle animations
    sparkle1Scale.value = withRepeat(
      withTiming(1.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    sparkle2Scale.value = withRepeat(
      withTiming(1.5, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [shape1Y, shape2Y, shape3Y, sparkle1Scale, sparkle2Scale]);

  const shape1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: shape1Y.value }, { rotate: '0deg' }],
  }));

  const shape2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: shape2Y.value }, { rotate: '45deg' }],
  }));

  const shape3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: shape3Y.value }],
  }));

  const sparkle1Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle1Scale.value }],
    opacity: 0.2 + (sparkle1Scale.value - 1) * 0.8,
  }));

  const sparkle2Style = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle2Scale.value }],
    opacity: 0.2 + (sparkle2Scale.value - 1) * 0.8,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.shape1, shape1Style]} />
      <Animated.View style={[styles.shape2, shape2Style]} />
      <Animated.View style={[styles.shape3, shape3Style]} />
      <Animated.View style={[styles.sparkle1, sparkle1Style]} />
      <Animated.View style={[styles.sparkle2, sparkle2Style]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shape1: {
    position: 'absolute',
    width: 200,
    height: 200,
    top: -50,
    right: -50,
    borderRadius: 100,
    backgroundColor: COLORS.accent.coral,
    opacity: 0.15,
  },
  shape2: {
    position: 'absolute',
    width: 150,
    height: 150,
    bottom: '20%',
    left: -40,
    backgroundColor: COLORS.accent.sage,
    opacity: 0.15,
  },
  shape3: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: '40%',
    right: -20,
    borderRadius: 50,
    backgroundColor: COLORS.accent.lavender,
    opacity: 0.15,
  },
  sparkle1: {
    position: 'absolute',
    width: 8,
    height: 8,
    top: '30%',
    left: '20%',
    borderRadius: 4,
    backgroundColor: COLORS.accent.sky,
  },
  sparkle2: {
    position: 'absolute',
    width: 8,
    height: 8,
    top: '60%',
    right: '25%',
    borderRadius: 4,
    backgroundColor: COLORS.accent.sky,
  },
});
