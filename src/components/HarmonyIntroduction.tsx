import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, HARMONY_COLORS } from '../constants/theme';
import type { HarmonyConfig } from '../types';

interface HarmonyIntroductionProps {
  harmony: HarmonyConfig;
  onDismiss: () => void;
  isFirstHarmony?: boolean;
}

const AUTO_DISMISS_MS = 4000;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const HarmonyIntroduction: React.FC<HarmonyIntroductionProps> = memo(({
  harmony,
  onDismiss,
  isFirstHarmony = false,
}) => {
  const colors = HARMONY_COLORS[harmony.type] || HARMONY_COLORS['color-match'];
  const onDismissRef = useRef(onDismiss);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation values
  const blurOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const swatchOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const descOpacity = useSharedValue(0);
  const tapOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  // Keep ref updated
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const handleDismiss = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    // Animate out
    cardOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismissRef.current)();
    });
    blurOpacity.value = withTiming(0, { duration: 200 });
    cardScale.value = withTiming(0.9, { duration: 200 });
  };

  useEffect(() => {
    // Staggered animation sequence
    // 0ms: Blur background fades in (200ms)
    blurOpacity.value = withTiming(1, { duration: 200 });

    // 100ms: Card scales up with spring
    cardScale.value = withDelay(100, withSpring(1, { damping: 12 }));
    cardOpacity.value = withDelay(100, withTiming(1, { duration: 200 }));

    // 200ms: Harmony color swatch animates in
    swatchOpacity.value = withDelay(200, withTiming(1, { duration: 200 }));
    glowOpacity.value = withDelay(200, withTiming(0.4, { duration: 300 }));

    // 300ms: Title fades in
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 200 }));

    // 400ms: Description fades in
    descOpacity.value = withDelay(400, withTiming(1, { duration: 200 }));

    // 500ms: "Tap to continue" appears
    tapOpacity.value = withDelay(500, withTiming(1, { duration: 200 }));

    // Auto-dismiss after 4s
    autoDismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, []);

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const swatchStyle = useAnimatedStyle(() => ({
    opacity: swatchOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }));

  const tapStyle = useAnimatedStyle(() => ({
    opacity: tapOpacity.value,
  }));

  return (
    <Pressable style={styles.fullScreenOverlay} onPress={handleDismiss}>
      <Animated.View style={[styles.blurContainer, blurStyle]}>
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.dimOverlay} />
      </Animated.View>

      <View style={styles.contentContainer}>
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Gentle glow ring */}
          <Animated.View
            style={[
              styles.glowRing,
              glowStyle,
              { backgroundColor: colors.glow, shadowColor: colors.glow },
            ]}
          />

          {/* Color swatch demo */}
          <Animated.View style={[styles.swatchContainer, swatchStyle]}>
            <View style={[styles.swatch, { backgroundColor: colors.base }]} />
          </Animated.View>

          {/* Harmony name */}
          <Animated.Text style={[styles.harmonyName, titleStyle, { color: colors.base }]}>
            {harmony.name}
          </Animated.Text>

          {/* Description */}
          <Animated.Text style={[styles.description, descStyle]}>
            {harmony.description}
          </Animated.Text>

          {/* First harmony welcome text */}
          {isFirstHarmony && (
            <Animated.Text style={[styles.welcomeText, descStyle]}>
              This is your first color harmony. More unlock as you play!
            </Animated.Text>
          )}

          {/* Divider and tap to continue */}
          <Animated.View style={[styles.footer, tapStyle]}>
            <View style={styles.divider} />
            <Text style={styles.tapText}>Tap to continue</Text>
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
});

HarmonyIntroduction.displayName = 'HarmonyIntroduction';

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 150,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    minWidth: Math.min(SCREEN_WIDTH - 48, 320),
    maxWidth: 340,
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    top: -30,
    left: -30,
    right: -30,
    height: 100,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  swatchContainer: {
    marginBottom: 16,
  },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  harmonyName: {
    fontSize: 24,
    fontWeight: FONTS.semiBold,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: COLORS.shadow.soft,
    marginBottom: 12,
  },
  tapText: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.accent.sage,
  },
});
