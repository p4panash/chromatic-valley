import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONTS } from '../constants/theme';
import { LivesIndicator } from './LivesIndicator';

interface GameHeaderProps {
  level: number;
  streak: number;
  score: number;
  lives: number;
  isZenMode?: boolean;
}

const CARD_HEIGHT = 40;
const COMPACT_CARD_HEIGHT = 36;
const COMPACT_BREAKPOINT = 400;

export const GameHeader: React.FC<GameHeaderProps> = ({
  level,
  streak,
  score,
  lives,
  isZenMode = false,
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_BREAKPOINT;
  const streakScale = useSharedValue(1);
  const levelScale = useSharedValue(1);
  const scoreScale = useSharedValue(1);

  // Animate streak on change
  useEffect(() => {
    if (streak > 0) {
      streakScale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    }
  }, [streak, streakScale]);

  // Animate level on change
  useEffect(() => {
    if (level > 1) {
      levelScale.value = withSequence(
        withSpring(1.1, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
    }
  }, [level, levelScale]);

  // Animate score on change
  useEffect(() => {
    if (score > 0) {
      scoreScale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    }
  }, [score, scoreScale]);

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  const levelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const isStreakMilestone = streak > 0 && streak % 5 === 0;

  // Dynamic styles based on screen width
  const cardStyle = useMemo(() => [
    styles.card,
    isCompact && styles.cardCompact,
  ], [isCompact]);

  const cardHeight = isCompact ? COMPACT_CARD_HEIGHT : CARD_HEIGHT;

  return (
    <View style={[styles.container, isCompact && styles.containerCompact]}>
      {/* Level */}
      <View style={[cardStyle, { height: cardHeight }]}>
        {!isCompact && <Text style={styles.label}>Lvl</Text>}
        <Animated.Text style={[styles.value, isCompact && styles.valueCompact, levelAnimatedStyle]}>
          {level}
        </Animated.Text>
      </View>

      {/* Lives or Zen badge */}
      {isZenMode ? (
        <View style={[cardStyle, styles.zenCard, { height: cardHeight }]}>
          <Text style={[styles.zenText, isCompact && styles.zenTextCompact]}>
            {isCompact ? '∞' : 'Zen'}
          </Text>
        </View>
      ) : (
        <View style={[cardStyle, { height: cardHeight }]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="#E53935">
            <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </Svg>
          <LivesIndicator lives={lives} size="small" />
        </View>
      )}

      {/* Combo/Streak */}
      <View style={[cardStyle, styles.streakCard, { height: cardHeight }]}>
        {!isCompact && <Text style={styles.label}>Combo</Text>}
        <View style={[styles.streakDiamond, isStreakMilestone && styles.streakDiamondMilestone]} />
        <Animated.Text style={[styles.streakValue, isCompact && styles.streakValueCompact, streakAnimatedStyle, isStreakMilestone && styles.streakValueMilestone]}>
          {streak}
        </Animated.Text>
      </View>

      {/* Score */}
      <View style={[cardStyle, styles.scoreCard, { height: cardHeight }]}>
        <Animated.Text style={[styles.scoreValue, isCompact && styles.scoreValueCompact, scoreAnimatedStyle]}>
          {score}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  containerCompact: {
    gap: 4,
  },
  card: {
    height: CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.06)',
    gap: 6,
  },
  cardCompact: {
    paddingHorizontal: 8,
    gap: 4,
    borderRadius: 8,
  },
  zenCard: {
    backgroundColor: COLORS.accent.lavender,
    paddingHorizontal: 14,
  },
  zenText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  zenTextCompact: {
    fontSize: 16,
    letterSpacing: 0,
  },
  label: {
    fontSize: 9,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.secondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  valueCompact: {
    fontSize: 16,
  },
  // Streak card
  streakCard: {
    borderColor: 'rgba(232, 165, 152, 0.2)',
  },
  streakDiamond: {
    width: 10,
    height: 10,
    backgroundColor: COLORS.accent.coral,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  streakDiamondMilestone: {
    backgroundColor: COLORS.accent.coralLight,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: FONTS.semiBold,
    color: COLORS.accent.coral,
    minWidth: 16,
    textAlign: 'center',
  },
  streakValueCompact: {
    fontSize: 14,
    minWidth: 14,
  },
  streakValueMilestone: {
    color: COLORS.accent.coralDark,
  },
  // Score card
  scoreCard: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    borderColor: 'rgba(168, 197, 181, 0.3)',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    minWidth: 36,
    textAlign: 'center',
  },
  scoreValueCompact: {
    fontSize: 16,
    minWidth: 28,
  },
});
