import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { Button, BackgroundShapes } from '../components';
import { COLORS, FONTS, RESULT_TITLES } from '../constants/theme';
import type { GameState } from '../types';

interface ResultScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onHome?: () => void;
  isNewHighScore?: boolean;
  previousHighScore?: number;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  gameState,
  onRestart,
  onHome,
  isNewHighScore = false,
  previousHighScore = 0,
}) => {
  const insets = useSafeAreaInsets();

  const towerY = useSharedValue(0);
  const scoreScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    // Tower floating animation
    towerY.value = withRepeat(
      withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Score entrance animation
    scoreScale.value = withDelay(
      200,
      withSpring(1, { damping: 8, stiffness: 100 })
    );

    // Stats entrance animation
    statsOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 500 })
    );
  }, [towerY, scoreScale, statsOpacity]);

  const towerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: towerY.value }],
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const statsStyle = useAnimatedStyle(() => ({
    opacity: statsOpacity.value,
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
      colors={[COLORS.background.start, COLORS.background.end]}
      style={styles.container}
    >
      <BackgroundShapes />
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        {/* Monument */}
        <Animated.View style={[styles.monumentContainer, towerStyle]}>
          <View style={styles.tower}>
            <View style={styles.towerOrb} />
            <View style={styles.towerBody}>
              <View style={styles.towerWindow} />
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>{getTitle()}</Text>

        {/* Score */}
        <Animated.View style={[styles.scoreContainer, scoreStyle]}>
          {isNewHighScore && (
            <View style={styles.newRecordBadge}>
              <Text style={styles.newRecordText}>New Record!</Text>
            </View>
          )}
          <Text style={styles.scoreLabel}>Final Score</Text>
          <Text style={styles.scoreValue}>{gameState.score}</Text>
          {previousHighScore > 0 && !isNewHighScore && (
            <Text style={styles.previousHighScore}>
              Best: {previousHighScore}
            </Text>
          )}
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsContainer, statsStyle]}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{gameState.correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{gameState.maxStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button title="New Journey" onPress={onRestart} />
          {onHome && (
            <Button title="Home" onPress={onHome} variant="secondary" />
          )}
        </View>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  monumentContainer: {
    marginBottom: 30,
  },
  tower: {
    alignItems: 'center',
  },
  towerOrb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent.coral,
    marginBottom: -5,
  },
  towerBody: {
    width: 60,
    height: 100,
    backgroundColor: COLORS.accent.lavender,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  towerWindow: {
    width: 25,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: -10,
  },
  title: {
    fontSize: 24,
    fontWeight: FONTS.light,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.text.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  newRecordBadge: {
    backgroundColor: COLORS.accent.coral,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  newRecordText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  previousHighScore: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    marginTop: 8,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: FONTS.light,
    color: COLORS.accent.coral,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 50,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 12,
    alignItems: 'center',
  },
});
