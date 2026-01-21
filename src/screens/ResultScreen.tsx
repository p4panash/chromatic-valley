import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Button, BackgroundShapes, HarmonyPalette } from '../components';
import { COLORS, FONTS, RESULT_TITLES, HARMONY_CONFIG, getEvolvingBackground, getUnlockedHarmonyColors } from '../constants/theme';
import type { GameState } from '../types';

interface ResultScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onHome?: () => void;
  onHistory?: () => void;
  isNewHighScore?: boolean;
  previousHighScore?: number;
  lifetimeScore?: number;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  gameState,
  onRestart,
  onHome,
  onHistory,
  isNewHighScore = false,
  previousHighScore = 0,
  lifetimeScore = 0,
}) => {
  const insets = useSafeAreaInsets();

  const titleOpacity = useSharedValue(0);
  const scoreScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);
  const paletteScale = useSharedValue(0.8);
  const paletteOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  // Individual stat animations
  const stat1Opacity = useSharedValue(0);
  const stat2Opacity = useSharedValue(0);
  const stat3Opacity = useSharedValue(0);

  const harmoniesUnlocked = useMemo(() => {
    return HARMONY_CONFIG.filter((h) => h.unlockThreshold <= lifetimeScore).length;
  }, [lifetimeScore]);

  // Evolving background and unlocked colors
  const backgroundColors = useMemo(() => {
    return getEvolvingBackground(harmoniesUnlocked);
  }, [harmoniesUnlocked]);

  const unlockedColors = useMemo(() => {
    return getUnlockedHarmonyColors(lifetimeScore);
  }, [lifetimeScore]);

  useEffect(() => {
    // Staggered entrance animations
    titleOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));

    scoreScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 100 })
    );

    // Staggered stats
    stat1Opacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    stat2Opacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    stat3Opacity.value = withDelay(700, withTiming(1, { duration: 400 }));

    // Palette as the hero moment
    paletteOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
    paletteScale.value = withDelay(
      900,
      withSpring(1, { damping: 12, stiffness: 80 })
    );

    buttonsOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const stat1Style = useAnimatedStyle(() => ({ opacity: stat1Opacity.value }));
  const stat2Style = useAnimatedStyle(() => ({ opacity: stat2Opacity.value }));
  const stat3Style = useAnimatedStyle(() => ({ opacity: stat3Opacity.value }));

  const paletteStyle = useAnimatedStyle(() => ({
    opacity: paletteOpacity.value,
    transform: [{ scale: paletteScale.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const accuracy = gameState.totalAnswers > 0
    ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100)
    : 0;

  const getTitle = () => {
    if (accuracy >= 90) return RESULT_TITLES.masterful;
    if (accuracy >= 70) return RESULT_TITLES.wellDone;
    if (accuracy >= 50) return RESULT_TITLES.goodTry;
    return RESULT_TITLES.keepPracticing;
  };

  return (
    <LinearGradient
      colors={[backgroundColors.start, backgroundColors.end]}
      style={styles.container}
    >
      <BackgroundShapes unlockedColors={unlockedColors} />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 32,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>
          {getTitle()}
        </Animated.Text>

        {/* Score Display - prominent but elegant */}
        <Animated.View style={[styles.scoreSection, scoreStyle]}>
          {isNewHighScore && (
            <View style={styles.newRecordBadge}>
              <Text style={styles.newRecordText}>New Record</Text>
            </View>
          )}
          <Text style={styles.scoreValue}>{gameState.score}</Text>
          {previousHighScore > 0 && !isNewHighScore && (
            <Text style={styles.previousHighScore}>Best: {previousHighScore}</Text>
          )}
        </Animated.View>

        {/* Stats - cleaner, more visual */}
        <View style={styles.statsRow}>
          <Animated.View style={[styles.stat, stat1Style]}>
            <Text style={styles.statValue}>{gameState.correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </Animated.View>
          <View style={styles.statDivider} />
          <Animated.View style={[styles.stat, stat2Style]}>
            <Text style={styles.statValue}>{gameState.maxStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </Animated.View>
          <View style={styles.statDivider} />
          <Animated.View style={[styles.stat, stat3Style]}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </Animated.View>
        </View>

        {/* Harmony Palette - the visual reward */}
        <Animated.View style={[styles.paletteSection, paletteStyle]}>
          <HarmonyPalette lifetimeScore={lifetimeScore} variant="result" />
          <Text style={styles.paletteCaption}>
            {harmoniesUnlocked} of {HARMONY_CONFIG.length} harmonies discovered
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttonContainer, buttonsStyle]}>
          <Button title="New Journey" onPress={onRestart} />
          <View style={styles.secondaryButtonsRow}>
            {onHome && (
              <Button title="Home" onPress={onHome} variant="secondary" />
            )}
            {onHistory && (
              <TouchableOpacity
                style={styles.historyButton}
                onPress={onHistory}
                activeOpacity={0.7}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke={COLORS.text.secondary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: FONTS.light,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: FONTS.light,
    color: COLORS.text.primary,
    letterSpacing: 2,
  },
  newRecordBadge: {
    backgroundColor: COLORS.accent.coral,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  newRecordText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  previousHighScore: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(90, 90, 90, 0.15)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: FONTS.medium,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  paletteSection: {
    alignItems: 'center',
  },
  paletteCaption: {
    fontSize: 12,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 0.5,
    marginTop: 8,
  },
  buttonContainer: {
    gap: 12,
    alignItems: 'center',
  },
  secondaryButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(90, 90, 90, 0.1)',
  },
});
