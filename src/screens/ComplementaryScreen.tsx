import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { ColorWheel, GameHeader, BackgroundShapes } from '../components';
import { useHaptics } from '../hooks';
import { COLORS, GAME_CONFIG } from '../constants/theme';
import {
  generateRandomVibrantColor,
  getTriadicColors,
  hexToHSL,
  hslToHex,
} from '../utils/colorUtils';
import type { GameState } from '../types';

interface ComplementaryScreenProps {
  gameState: GameState;
  onChoice: (isCorrect: boolean) => void;
  feedback: 'correct' | 'incorrect' | null;
}

interface RoundData {
  wheelColors: [string, string, string];
  missingIndex: number;
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
}

const CHOICE_SIZE = 70;

const generateRound = (): RoundData => {
  // Generate a base color
  const baseColor = generateRandomVibrantColor();
  const [triad1, triad2] = getTriadicColors(baseColor);

  // Decide which segment is missing (0, 1, or 2)
  const missingIndex = Math.floor(Math.random() * 3);

  // The three wheel colors
  const wheelColors: [string, string, string] = [baseColor, triad1, triad2];
  const correctColor = wheelColors[missingIndex];

  // Generate wrong choices - similar colors but not correct
  const hsl = hexToHSL(correctColor);
  const wrongChoices: string[] = [];

  // Generate 2 wrong choices with different hues
  const offsets = [60, -60]; // 60 degrees away
  for (const offset of offsets) {
    const wrongH = (hsl.h + offset + 360) % 360;
    wrongChoices.push(hslToHex(wrongH, hsl.s, hsl.l));
  }

  // Create choices array with correct answer at random position
  const correctChoiceIndex = Math.floor(Math.random() * 3);
  const choices = [...wrongChoices];
  choices.splice(correctChoiceIndex, 0, correctColor);

  return {
    wheelColors,
    missingIndex,
    correctColor,
    choices,
    correctChoiceIndex,
  };
};

export const ComplementaryScreen: React.FC<ComplementaryScreenProps> = ({
  gameState,
  onChoice,
  feedback,
}) => {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const [round, setRound] = useState<RoundData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const processingRef = useRef(false);

  // Generate new round when game starts or after correct answer
  useEffect(() => {
    if (gameState.isPlaying && !round) {
      setRound(generateRound());
      setSelectedIndex(null);
      processingRef.current = false;
    }
  }, [gameState.isPlaying, round]);

  // Handle feedback changes
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (feedback === 'correct') {
      haptics.triggerSuccess();
      // Generate new round after delay
      timer = setTimeout(() => {
        setRound(null);
      }, 1200);
    } else if (feedback === 'incorrect') {
      haptics.triggerError();
      // Generate new round after delay
      timer = setTimeout(() => {
        setRound(null);
      }, 1500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [feedback, haptics]);

  const handleChoice = useCallback((index: number) => {
    if (!round || processingRef.current || gameState.processingChoice) return;

    processingRef.current = true;
    setSelectedIndex(index);
    haptics.triggerLight();

    const isCorrect = index === round.correctChoiceIndex;
    onChoice(isCorrect);
  }, [round, gameState.processingChoice, haptics, onChoice]);

  if (!round) {
    return (
      <LinearGradient
        colors={[COLORS.background.start, COLORS.background.end]}
        style={styles.container}
      />
    );
  }

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
        <GameHeader
          level={gameState.level}
          score={gameState.score}
          streak={gameState.streak}
          lives={GAME_CONFIG.maxWrongAnswers - (gameState.totalAnswers - gameState.correctAnswers)}
          isZenMode={false}
        />

        <View style={styles.gameArea}>
          {/* Color Wheel */}
          <Animated.View entering={FadeIn.duration(400)}>
            <ColorWheel
              colors={round.wheelColors}
              missingIndex={round.missingIndex}
            />
          </Animated.View>

          {/* Choice buttons */}
          <View style={styles.choicesContainer}>
            {round.choices.map((color, index) => (
              <ChoiceButton
                key={`${color}-${index}`}
                color={color}
                index={index}
                onPress={() => handleChoice(index)}
                disabled={processingRef.current || gameState.processingChoice}
                isSelected={selectedIndex === index}
                isCorrect={feedback === 'correct' && index === round.correctChoiceIndex}
                isIncorrect={feedback === 'incorrect' && selectedIndex === index}
              />
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

interface ChoiceButtonProps {
  color: string;
  index: number;
  onPress: () => void;
  disabled: boolean;
  isSelected: boolean;
  isCorrect: boolean;
  isIncorrect: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  color,
  onPress,
  disabled,
  isSelected,
  isCorrect,
  isIncorrect,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isCorrect) {
      scale.value = withSpring(1.15, { damping: 8 });
    } else if (isIncorrect) {
      scale.value = withSpring(0.9, { damping: 8 });
    } else {
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [isCorrect, isIncorrect, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.92, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !isCorrect && !isIncorrect) {
      scale.value = withSpring(1, { damping: 10 });
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.choiceButton,
          { backgroundColor: color },
          isCorrect && styles.choiceCorrect,
          isIncorrect && styles.choiceIncorrect,
        ]}
      >
        <View style={styles.choiceInner} />
      </Pressable>
    </Animated.View>
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
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50,
  },
  choicesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 25,
  },
  choiceButton: {
    width: CHOICE_SIZE,
    height: CHOICE_SIZE,
    borderRadius: CHOICE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  choiceInner: {
    width: CHOICE_SIZE * 0.4,
    height: CHOICE_SIZE * 0.4,
    borderRadius: CHOICE_SIZE * 0.2,
    backgroundColor: COLORS.white,
  },
  choiceCorrect: {
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  choiceIncorrect: {
    borderWidth: 4,
    borderColor: '#F44336',
    opacity: 0.7,
  },
});
