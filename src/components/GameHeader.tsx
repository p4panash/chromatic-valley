import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';
import { LivesIndicator } from './LivesIndicator';

interface GameHeaderProps {
  level: number;
  streak: number;
  lives: number;
  isZenMode?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  level,
  streak,
  lives,
  isZenMode = false,
}) => {
  const streakScale = useSharedValue(1);
  const streakGlow = useSharedValue(0);
  const levelScale = useSharedValue(1);

  // Animate streak on change
  useEffect(() => {
    if (streak > 0) {
      streakScale.value = withSequence(
        withSpring(1.25, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      streakGlow.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(0, { duration: 300 })
      );
    }
  }, [streak, streakScale, streakGlow]);

  // Animate level on change
  useEffect(() => {
    if (level > 1) {
      levelScale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
    }
  }, [level, levelScale]);

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  const streakGlowStyle = useAnimatedStyle(() => ({
    opacity: streakGlow.value * 0.4,
    transform: [{ scale: 1 + streakGlow.value * 0.3 }],
  }));

  const levelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  // Determine streak milestone styling
  const isStreakMilestone = streak > 0 && streak % 5 === 0;

  return (
    <View style={styles.container}>
      {/* Level stat card */}
      <View style={styles.statCard}>
        <View style={styles.statCardInner}>
          <Text style={styles.label}>Level</Text>
          <Animated.Text style={[styles.value, levelAnimatedStyle]}>
            {level}
          </Animated.Text>
        </View>
        <View style={styles.statCardAccent} />
      </View>

      {/* Center section: Lives or Zen badge */}
      {isZenMode ? (
        <View style={styles.zenBadge}>
          <View style={styles.zenBadgeGlow} />
          <Text style={styles.zenText}>Zen</Text>
          <View style={styles.zenDot} />
        </View>
      ) : (
        <View style={styles.livesCard}>
          <View style={styles.livesCardInner}>
            <Text style={styles.label}>Lives</Text>
            <LivesIndicator lives={lives} />
          </View>
        </View>
      )}

      {/* Streak indicator */}
      <View style={[styles.streakCard, isStreakMilestone && styles.streakCardMilestone]}>
        <View style={styles.streakCardInner}>
          {/* Glow effect for streak changes */}
          <Animated.View style={[styles.streakGlowEffect, streakGlowStyle]} />

          <View style={styles.streakIconContainer}>
            {/* Outer diamond ring */}
            <View style={styles.streakDiamondOuter} />
            {/* Main diamond */}
            <View style={[
              styles.streakDiamond,
              isStreakMilestone && styles.streakDiamondMilestone
            ]}>
              {/* Diamond inner highlight */}
              <View style={styles.streakDiamondHighlight} />
            </View>
            {/* Sparkle dots for milestone */}
            {isStreakMilestone && (
              <>
                <View style={[styles.sparkle, styles.sparkle1]} />
                <View style={[styles.sparkle, styles.sparkle2]} />
              </>
            )}
          </View>

          <Animated.Text style={[
            styles.streakValue,
            streakAnimatedStyle,
            isStreakMilestone && styles.streakValueMilestone
          ]}>
            {streak}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    paddingTop: 8,
  },
  // Stat card base styles
  statCard: {
    minWidth: 60,
    position: 'relative',
  },
  statCardInner: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.06)',
  },
  statCardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 3,
    backgroundColor: COLORS.accent.sky,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    opacity: 0.5,
  },
  // Lives card
  livesCard: {
    minWidth: 80,
  },
  livesCardInner: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.06)',
    gap: 4,
  },
  // Zen badge
  zenBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: COLORS.accent.lavender,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: COLORS.accent.lavender,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  zenBadgeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  zenText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  zenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  // Labels and values
  label: {
    fontSize: 10,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.secondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  // Streak card
  streakCard: {
    minWidth: 70,
    position: 'relative',
  },
  streakCardMilestone: {
    // Extra styling for milestone
  },
  streakCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 165, 152, 0.2)',
    gap: 8,
  },
  streakGlowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: COLORS.accent.coral,
    borderRadius: 16,
    zIndex: -1,
  },
  streakIconContainer: {
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  streakDiamondOuter: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(232, 165, 152, 0.3)',
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  streakDiamond: {
    width: 14,
    height: 14,
    backgroundColor: COLORS.accent.coral,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
    shadowColor: COLORS.accent.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  streakDiamondMilestone: {
    backgroundColor: COLORS.accent.coralLight,
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  streakDiamondHighlight: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 1,
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent.sand,
  },
  sparkle1: {
    top: -2,
    right: 0,
  },
  sparkle2: {
    bottom: -2,
    left: 0,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: FONTS.semiBold,
    color: COLORS.accent.coral,
    minWidth: 24,
    textAlign: 'center',
  },
  streakValueMilestone: {
    color: COLORS.accent.coralDark,
  },
});
