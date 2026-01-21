import React, { memo, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, HARMONY_COLORS } from '../constants/theme';
import type { HarmonyConfig } from '../types';

interface HarmonyUnlockBannerProps {
  harmony: HarmonyConfig;
}

export const HarmonyUnlockBanner: React.FC<HarmonyUnlockBannerProps> = memo(({
  harmony,
}) => {
  const insets = useSafeAreaInsets();
  const colors = HARMONY_COLORS[harmony.type] || HARMONY_COLORS['color-match'];

  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    // Slide in from top with spring
    translateY.value = withSpring(0, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 200 });

    // Continuous subtle pulse glow while visible
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Repeat indefinitely
      false
    );
  }, [translateY, opacity, glowOpacity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    shadowColor: colors.base,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity.value,
    shadowRadius: 12,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        { paddingTop: insets.top + 8, backgroundColor: colors.muted + 'E6' },
      ]}
    >
      <Animated.View style={[styles.glowOverlay, glowStyle]} />
      <Text style={styles.unlockLabel}>Harmony Unlocked</Text>
      <Text style={[styles.harmonyName, { color: colors.base }]}>
        {harmony.name}
      </Text>
    </Animated.View>
  );
});

HarmonyUnlockBanner.displayName = 'HarmonyUnlockBanner';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
    zIndex: 200,
    overflow: 'hidden',
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  unlockLabel: {
    fontSize: 12,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  harmonyName: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    letterSpacing: 0.5,
  },
});
