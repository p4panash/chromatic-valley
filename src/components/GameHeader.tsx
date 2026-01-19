import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';
import { LivesIndicator } from './LivesIndicator';

interface GameHeaderProps {
  level: number;
  score: number;
  streak: number;
  lives: number;
  isZenMode?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ level, score, streak, lives, isZenMode = false }) => {
  const scoreScale = useSharedValue(1);
  const streakScale = useSharedValue(1);

  // Animate score on change
  useEffect(() => {
    scoreScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, [score, scoreScale]);

  // Animate streak on change
  useEffect(() => {
    if (streak > 0) {
      streakScale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    }
  }, [streak, streakScale]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>{level}</Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.label}>Score</Text>
        <Animated.Text style={[styles.value, scoreAnimatedStyle]}>
          {score}
        </Animated.Text>
      </View>

      {isZenMode ? (
        <View style={styles.zenBadge}>
          <Text style={styles.zenText}>Zen</Text>
        </View>
      ) : (
        <View style={styles.livesContainer}>
          <Text style={styles.label}>Lives</Text>
          <LivesIndicator lives={lives} />
        </View>
      )}

      <View style={styles.streakContainer}>
        <View style={styles.streakIcon}>
          <View style={styles.streakDiamond} />
          <View style={styles.streakHighlight} />
        </View>
        <Animated.Text style={[styles.streakValue, streakAnimatedStyle]}>
          {streak}
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  stat: {
    alignItems: 'center',
  },
  livesContainer: {
    alignItems: 'center',
    gap: 4,
  },
  zenBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.accent.lavender,
    borderRadius: 15,
  },
  zenText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  label: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 24,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  streakIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakDiamond: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.accent.coral,
    transform: [{ rotate: '45deg' }],
    borderRadius: 2,
  },
  streakHighlight: {
    position: 'absolute',
    top: 2,
    width: 6,
    height: 6,
    backgroundColor: COLORS.accent.sand,
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
    opacity: 0.8,
  },
  streakValue: {
    fontSize: 20,
    fontWeight: FONTS.semiBold,
    color: COLORS.accent.coral,
  },
});
