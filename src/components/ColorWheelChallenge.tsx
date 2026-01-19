import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ColorWheel } from './ColorWheel';
import { ColorButton } from './ColorButton';
import { Timer } from './Timer';
import { COLORS, FONTS } from '../constants/theme';
import type { ColorWheelRound, FeedbackType } from '../types';

interface ColorWheelChallengeProps {
  round: ColorWheelRound;
  feedback: FeedbackType;
  processingChoice: boolean;
  isZenMode: boolean;
  onChoice: (index: number) => void;
}

const { width } = Dimensions.get('window');
const choiceSize = Math.min((width - 80) / 2, 150);

export const ColorWheelChallenge: React.FC<ColorWheelChallengeProps> = memo(({
  round,
  feedback,
  processingChoice,
  isZenMode,
  onChoice,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset on new round
  useEffect(() => {
    setSelectedIndex(null);
  }, [round.correctColor]);

  const handleChoice = (color: string, index: number) => {
    if (processingChoice) return;
    setSelectedIndex(index);
    onChoice(index);
  };

  const isCorrectChoice = (index: number) =>
    selectedIndex === index && feedback === 'correct';
  const isIncorrectChoice = (index: number) =>
    selectedIndex === index && feedback === 'incorrect';

  return (
    <View style={styles.container}>
      {/* Instruction text */}
      <Text style={styles.instruction}>Complete the wheel</Text>

      {/* Color Wheel display */}
      <Animated.View entering={FadeIn.duration(400)}>
        <ColorWheel
          colors={round.wheelColors}
          missingIndex={round.missingIndex}
        />
      </Animated.View>

      {/* 2x2 Choice Grid - same as color match */}
      <View style={styles.choicesContainer}>
        <View style={styles.choicesGrid}>
          {round.choices.map((color, index) => (
            <View key={`${color}-${index}`} style={styles.choiceWrapper}>
              <ColorButton
                color={color}
                index={index}
                onPress={() => handleChoice(color, index)}
                disabled={processingChoice}
                isCorrect={isCorrectChoice(index)}
                isIncorrect={isIncorrectChoice(index)}
              />
            </View>
          ))}
        </View>
      </View>

      {!isZenMode && <Timer timeLeft={round.timeLeft} />}
    </View>
  );
});

ColorWheelChallenge.displayName = 'ColorWheelChallenge';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 15,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1,
  },
  choicesContainer: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  choiceWrapper: {
    width: choiceSize,
    height: choiceSize,
  },
});
