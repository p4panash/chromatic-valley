import React, { useEffect, useState, memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { TargetColor } from './TargetColor';
import { ColorButton } from './ColorButton';
import { Timer } from './Timer';
import type { ColorMatchRound, FeedbackType } from '../types';

interface ColorMatchChallengeProps {
  round: ColorMatchRound;
  feedback: FeedbackType;
  isZenMode: boolean;
  processingChoice: boolean;
  onChoice: (color: string) => void;
}

const { width } = Dimensions.get('window');
const choiceSize = Math.min((width - 80) / 2, 150);

export const ColorMatchChallenge: React.FC<ColorMatchChallengeProps> = memo(({
  round,
  feedback,
  isZenMode,
  processingChoice,
  onChoice,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Reset selected index on new round
  useEffect(() => {
    setSelectedIndex(null);
  }, [round.targetColor.hex]);

  const handleChoice = (color: string, index: number) => {
    if (processingChoice) return;
    setSelectedIndex(index);
    onChoice(color);
  };

  const isCorrectChoice = (index: number) =>
    selectedIndex === index && feedback === 'correct';
  const isIncorrectChoice = (index: number) =>
    selectedIndex === index && feedback === 'incorrect';

  return (
    <View style={styles.container}>
      <TargetColor
        color={round.targetColor.hex}
        name={round.targetColor.name}
      />

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

ColorMatchChallenge.displayName = 'ColorMatchChallenge';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
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
