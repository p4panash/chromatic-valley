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
import { Button, BackgroundShapes, MiniCastle } from '../components';
import { COLORS, FONTS, RESULT_TITLES } from '../constants/theme';
import type { GameState, CastleProgress } from '../types';

interface ResultScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onHome?: () => void;
  isNewHighScore?: boolean;
  previousHighScore?: number;
  castleProgress?: CastleProgress;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  gameState,
  onRestart,
  onHome,
  isNewHighScore = false,
  previousHighScore = 0,
  castleProgress,
}) => {
  const insets = useSafeAreaInsets();

  const castleY = useSharedValue(0);
  const castleScale = useSharedValue(0);
  const scoreScale = useSharedValue(0);
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    // Castle entrance animation
    castleScale.value = withDelay(
      100,
      withSpring(1, { damping: 10, stiffness: 80 })
    );

    // Castle floating animation
    castleY.value = withDelay(
      600,
      withRepeat(
        withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );

    // Score entrance animation
    scoreScale.value = withDelay(
      400,
      withSpring(1, { damping: 8, stiffness: 100 })
    );

    // Stats entrance animation
    statsOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 500 })
    );
  }, [castleY, castleScale, scoreScale, statsOpacity]);

  const castleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: castleY.value },
      { scale: castleScale.value },
    ],
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
        {/* Title */}
        <Text style={styles.title}>{getTitle()}</Text>

        {/* Player's Completed Castle with integrated score */}
        <Animated.View style={[styles.castleContainer, castleStyle]}>
          {isNewHighScore && (
            <Animated.View style={[styles.newRecordBadge, scoreStyle]}>
              <Text style={styles.newRecordText}>New Record!</Text>
            </Animated.View>
          )}
          <MiniCastle
            progress={castleProgress || { stage: 'crown', percentage: 100 }}
            score={gameState.score}
            answerColors={gameState.answerColors}
            size={140}
          />
          {previousHighScore > 0 && !isNewHighScore && (
            <Animated.Text style={[styles.previousHighScore, scoreStyle]}>
              Best: {previousHighScore}
            </Animated.Text>
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
  title: {
    fontSize: 24,
    fontWeight: FONTS.light,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: COLORS.text.primary,
    marginBottom: 32,
    textAlign: 'center',
  },
  castleContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  newRecordBadge: {
    backgroundColor: COLORS.accent.coral,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: COLORS.accent.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  newRecordText: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  previousHighScore: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    marginBottom: 40,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
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
