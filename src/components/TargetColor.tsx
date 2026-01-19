import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';

interface TargetColorProps {
  color: string;
  name: string;
}

export const TargetColor: React.FC<TargetColorProps> = ({ color, name }) => {
  const shadowScale = useSharedValue(1);

  useEffect(() => {
    shadowScale.value = withRepeat(
      withTiming(0.9, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [shadowScale]);

  const shadowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: shadowScale.value }],
    opacity: 0.2 + (1 - shadowScale.value) * 0.2,
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Match this color</Text>
      <View style={styles.colorContainer}>
        {/* Glow effect */}
        <View style={[styles.glow, { backgroundColor: color }]} />
        {/* Depth shadow */}
        <View style={[styles.depthShadow, { backgroundColor: color }]} />
        {/* Main circle */}
        <View style={[styles.circle, { backgroundColor: color }]} />
      </View>
      {/* Ground shadow */}
      <Animated.View style={[styles.groundShadow, shadowAnimatedStyle]} />
      <Text style={styles.colorName}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  instruction: {
    fontSize: 15,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    marginBottom: 20,
  },
  colorContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    marginBottom: 15,
  },
  glow: {
    position: 'absolute',
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    borderRadius: 75,
    opacity: 0.25,
  },
  depthShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.4,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  groundShadow: {
    width: 80,
    height: 15,
    backgroundColor: COLORS.shadow.soft,
    borderRadius: 40,
    marginTop: 10,
  },
  colorName: {
    fontSize: 16,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    marginTop: 10,
  },
});
