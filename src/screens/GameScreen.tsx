import React, { useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GameHeader,
  Feedback,
  BackgroundShapes,
  ColorMatchChallenge,
  ColorWheelChallenge,
  MiniCastle,
  BackButton,
} from '../components';
import { useHaptics } from '../hooks';
import { COLORS, GAME_CONFIG } from '../constants/theme';
import type { GameState, UnifiedRoundState, FeedbackType, CastleProgress } from '../types';

interface GameScreenProps {
  gameState: GameState;
  roundState: UnifiedRoundState | null;
  feedback: FeedbackType;
  castleProgress: CastleProgress;
  onChoice: (value: string | number) => void;
  onExit?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  gameState,
  roundState,
  feedback,
  castleProgress,
  onChoice,
  onExit,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const haptics = useHaptics();

  const isCompact = width < 400;
  const backButtonSize = isCompact ? 36 : 40;
  const castleSize = isCompact ? 60 : 70;

  // Trigger haptics on feedback
  useEffect(() => {
    if (feedback === 'correct') {
      haptics.triggerSuccess();
    } else if (feedback === 'incorrect' || feedback === 'timeout') {
      haptics.triggerError();
    }
  }, [feedback, haptics]);

  // Handle choice with haptic feedback
  const handleColorMatchChoice = (color: string) => {
    haptics.triggerLight();
    onChoice(color);
  };

  const handleColorWheelChoice = (index: number) => {
    haptics.triggerLight();
    onChoice(index);
  };

  if (!roundState) {
    return (
      <LinearGradient
        colors={[COLORS.background.start, COLORS.background.end]}
        style={styles.container}
      />
    );
  }

  const isZenMode = gameState.mode === 'zen';
  const lives = GAME_CONFIG.maxWrongAnswers - gameState.wrongAnswers;

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
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        {/* Thin header bar */}
        <View style={styles.headerBar}>
          {onExit && (
            <BackButton onPress={onExit} size={backButtonSize} />
          )}
          <GameHeader
            level={gameState.level}
            streak={gameState.streak}
            score={gameState.score}
            lives={lives}
            isZenMode={isZenMode}
          />
        </View>

        {/* Castle positioned absolutely, below header aligned with score */}
        <View style={[styles.castleAbsolute, { top: insets.top + (isCompact ? 52 : 58) }]}>
          <MiniCastle
            progress={castleProgress}
            answerColors={gameState.answerColors}
            size={castleSize}
          />
        </View>

        {/* Challenge area */}
        <View style={styles.gameArea}>
          {roundState.challengeType === 'color-match' ? (
            <ColorMatchChallenge
              round={roundState}
              feedback={feedback}
              isZenMode={isZenMode}
              processingChoice={gameState.processingChoice}
              onChoice={handleColorMatchChoice}
            />
          ) : (
            <ColorWheelChallenge
              round={roundState}
              feedback={feedback}
              processingChoice={gameState.processingChoice}
              isZenMode={isZenMode}
              onChoice={handleColorWheelChoice}
            />
          )}
        </View>
      </View>

      <Feedback type={feedback} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  castleAbsolute: {
    position: 'absolute',
    right: 20,
  },
  gameArea: {
    flex: 1,
  },
});
