import React, { useEffect, useState, memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ColorWheel } from './ColorWheel';
import { ColorButton } from './ColorButton';
import { Timer } from './Timer';
import { COLORS, FONTS } from '../constants/theme';
import type {
  TriadicRound,
  ComplementaryRound,
  SplitComplementaryRound,
  AnalogousRound,
  TetradicRound,
  DoubleComplementaryRound,
  MonochromaticRound,
  FeedbackType,
} from '../types';

type HarmonyRound =
  | TriadicRound
  | ComplementaryRound
  | SplitComplementaryRound
  | AnalogousRound
  | TetradicRound
  | DoubleComplementaryRound
  | MonochromaticRound;

interface HarmonyChallengeProps {
  round: HarmonyRound;
  feedback: FeedbackType;
  processingChoice: boolean;
  isZenMode: boolean;
  onChoice: (index: number) => void;
  showCorrectAnswer?: boolean;
}

const { width } = Dimensions.get('window');
const choiceSize = Math.min((width - 80) / 2, 150);

// Helper to get instruction text based on challenge type
const getInstruction = (type: HarmonyRound['challengeType']): string => {
  switch (type) {
    case 'triadic':
      return 'Complete the triadic wheel';
    case 'complementary':
      return 'Find the complement';
    case 'split-complementary':
      return 'Complete the split';
    case 'analogous':
      return 'Continue the sequence';
    case 'tetradic':
      return 'Complete the square';
    case 'double-complementary':
      return 'Complete the pairs';
    case 'monochromatic':
      return 'Find the missing shade';
    default:
      return 'Complete the harmony';
  }
};

// Helper to get visible colors for display
const getVisibleColors = (round: HarmonyRound): string[] => {
  switch (round.challengeType) {
    case 'triadic':
      return round.wheelColors.filter((_, i) => i !== round.missingIndex);
    case 'complementary':
      return [round.baseColor];
    case 'split-complementary':
      return [round.baseColor, round.visibleSplitColor];
    case 'analogous':
      return round.visibleColors;
    case 'tetradic':
      return round.wheelColors.filter((_, i) => i !== round.missingIndex);
    case 'double-complementary':
      return round.visibleColors;
    case 'monochromatic':
      return round.visibleShades;
    default:
      return [];
  }
};

// Missing color placeholder component
const MissingSlot: React.FC<{
  size: 'small' | 'medium' | 'large';
  revealColor?: string;
}> = memo(({ size, revealColor }) => {
  const sizeStyle = size === 'small' ? styles.colorSwatchSmall :
                    size === 'medium' ? styles.colorSwatchMono :
                    styles.colorSwatch;
  const questionSize = size === 'small' ? styles.questionMarkSmall : styles.questionMark;

  return (
    <View style={[sizeStyle, styles.missingSwatch, revealColor ? { backgroundColor: revealColor } : null]}>
      {!revealColor && <Text style={questionSize}>?</Text>}
    </View>
  );
});

MissingSlot.displayName = 'MissingSlot';

// Render the harmony visualization
const HarmonyVisualization: React.FC<{
  round: HarmonyRound;
  revealColor?: string;
}> = memo(({ round, revealColor }) => {
  // For triadic, use the color wheel
  if (round.challengeType === 'triadic') {
    return (
      <ColorWheel
        colors={round.wheelColors}
        missingIndex={round.missingIndex}
        revealCorrectColor={revealColor}
      />
    );
  }

  // For other types, show optimized layouts
  const visibleColors = getVisibleColors(round);

  // Complementary: Two circles connected by a line
  if (round.challengeType === 'complementary') {
    return (
      <View style={styles.complementaryContainer}>
        <View style={[styles.colorSwatch, { backgroundColor: visibleColors[0] }]} />
        <View style={styles.complementaryLine} />
        <MissingSlot size="large" revealColor={revealColor} />
      </View>
    );
  }

  // Split-complementary: Y-shaped layout with base at top
  if (round.challengeType === 'split-complementary') {
    return (
      <View style={styles.splitContainer}>
        <View style={[styles.colorSwatch, { backgroundColor: visibleColors[0] }]} />
        <View style={styles.splitConnector}>
          <View style={styles.splitLineLeft} />
          <View style={styles.splitLineRight} />
        </View>
        <View style={styles.splitRow}>
          <View style={[styles.colorSwatchSmall, { backgroundColor: visibleColors[1] }]} />
          <MissingSlot size="small" revealColor={revealColor} />
        </View>
      </View>
    );
  }

  // Analogous: Flowing sequence with gradient hint
  if (round.challengeType === 'analogous') {
    return (
      <View style={styles.analogousContainer}>
        <View style={styles.analogousFlow}>
          <View style={[styles.analogousSwatch, { backgroundColor: visibleColors[0] }]} />
          <View style={[styles.analogousSwatch, styles.analogousMiddle, { backgroundColor: visibleColors[1] }]} />
          <View style={[styles.analogousSwatch, styles.missingSwatch, revealColor ? { backgroundColor: revealColor } : null]}>
            {!revealColor && <Text style={styles.questionMark}>?</Text>}
          </View>
        </View>
        <Text style={styles.flowHint}>
          {round.flowDirection === 'clockwise' ? '→ clockwise' : '← counter-clockwise'}
        </Text>
      </View>
    );
  }

  // Monochromatic: Vertical gradient-style stack
  if (round.challengeType === 'monochromatic') {
    return (
      <View style={styles.monochromeContainer}>
        <View style={[styles.monoSwatch, { backgroundColor: visibleColors[0] }]} />
        <MissingSlot size="medium" revealColor={revealColor} />
        <View style={[styles.monoSwatch, { backgroundColor: visibleColors[1] }]} />
        <Text style={styles.monoHint}>Same hue, different shade</Text>
      </View>
    );
  }

  // Tetradic/Square: Diamond arrangement
  if (round.challengeType === 'tetradic') {
    const colors = [...round.wheelColors.filter((_, i) => i !== round.missingIndex)];
    colors.splice(round.missingIndex, 0, 'missing');

    return (
      <View style={styles.tetradicContainer}>
        {/* Top */}
        {colors[0] === 'missing' ? (
          <MissingSlot size="small" revealColor={revealColor} />
        ) : (
          <View style={[styles.colorSwatchSmall, { backgroundColor: colors[0] }]} />
        )}
        {/* Middle row */}
        <View style={styles.tetradicMiddle}>
          {colors[3] === 'missing' ? (
            <MissingSlot size="small" revealColor={revealColor} />
          ) : (
            <View style={[styles.colorSwatchSmall, { backgroundColor: colors[3] }]} />
          )}
          <View style={styles.tetradicCenter} />
          {colors[1] === 'missing' ? (
            <MissingSlot size="small" revealColor={revealColor} />
          ) : (
            <View style={[styles.colorSwatchSmall, { backgroundColor: colors[1] }]} />
          )}
        </View>
        {/* Bottom */}
        {colors[2] === 'missing' ? (
          <MissingSlot size="small" revealColor={revealColor} />
        ) : (
          <View style={[styles.colorSwatchSmall, { backgroundColor: colors[2] }]} />
        )}
      </View>
    );
  }

  // Double-complementary: Two pairs
  if (round.challengeType === 'double-complementary') {
    const colors = [...visibleColors];
    colors.splice(round.missingPosition, 0, 'missing');

    return (
      <View style={styles.doubleCompContainer}>
        <View style={styles.doubleCompPair}>
          {colors[0] === 'missing' ? (
            <MissingSlot size="small" revealColor={revealColor} />
          ) : (
            <View style={[styles.colorSwatchSmall, { backgroundColor: colors[0] }]} />
          )}
          <View style={styles.pairLine} />
          {colors[2] === 'missing' ? (
            <MissingSlot size="small" revealColor={revealColor} />
          ) : (
            <View style={[styles.colorSwatchSmall, { backgroundColor: colors[2] }]} />
          )}
        </View>
        <View style={styles.doubleCompPair}>
          {colors[1] === 'missing' ? (
            <MissingSlot size="small" revealColor={revealColor} />
          ) : (
            <View style={[styles.colorSwatchSmall, { backgroundColor: colors[1] }]} />
          )}
          <View style={styles.pairLine} />
          {colors[3] === 'missing' ? (
            <MissingSlot size="small" revealColor={revealColor} />
          ) : (
            <View style={[styles.colorSwatchSmall, { backgroundColor: colors[3] }]} />
          )}
        </View>
      </View>
    );
  }

  // Fallback: simple row of visible colors
  return (
    <View style={styles.simpleRow}>
      {visibleColors.map((color, i) => (
        <View key={i} style={[styles.colorSwatch, { backgroundColor: color }]} />
      ))}
      <MissingSlot size="large" revealColor={revealColor} />
    </View>
  );
});

HarmonyVisualization.displayName = 'HarmonyVisualization';

export const HarmonyChallenge: React.FC<HarmonyChallengeProps> = memo(({
  round,
  feedback,
  processingChoice,
  isZenMode,
  onChoice,
  showCorrectAnswer = false,
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
  const shouldShowAsCorrect = (index: number) =>
    showCorrectAnswer && index === round.correctChoiceIndex && feedback !== 'correct';
  const revealColor = showCorrectAnswer && feedback !== 'correct' ? round.correctColor : undefined;

  return (
    <View style={styles.container}>
      {/* Instruction text */}
      <Text style={styles.instruction}>{getInstruction(round.challengeType)}</Text>

      {/* Harmony visualization */}
      <Animated.View entering={FadeIn.duration(400)}>
        <HarmonyVisualization round={round} revealColor={revealColor} />
      </Animated.View>

      {/* 2x2 Choice Grid */}
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
                showAsCorrectAnswer={shouldShowAsCorrect(index)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Timer at bottom */}
      {!isZenMode && (
        <View style={styles.timerContainer}>
          <Timer timeLeft={round.timeLeft} />
        </View>
      )}
    </View>
  );
});

HarmonyChallenge.displayName = 'HarmonyChallenge';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 10,
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
  // Base swatch styles
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  colorSwatchSmall: {
    width: 60,
    height: 60,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  colorSwatchMono: {
    width: 70,
    height: 70,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  missingSwatch: {
    backgroundColor: COLORS.missing.base,
    borderWidth: 2,
    borderColor: COLORS.missing.pattern,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    fontSize: 32,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.secondary,
    opacity: 0.5,
  },
  questionMarkSmall: {
    fontSize: 24,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.secondary,
    opacity: 0.5,
  },
  // Complementary styles
  complementaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  complementaryLine: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.text.secondary,
    opacity: 0.3,
    marginHorizontal: 8,
  },
  // Split-complementary styles
  splitContainer: {
    alignItems: 'center',
  },
  splitConnector: {
    flexDirection: 'row',
    height: 30,
    width: 100,
    justifyContent: 'center',
  },
  splitLineLeft: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.text.secondary,
    opacity: 0.3,
    transform: [{ rotate: '-30deg' }],
    marginRight: 20,
  },
  splitLineRight: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.text.secondary,
    opacity: 0.3,
    transform: [{ rotate: '30deg' }],
    marginLeft: 20,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 40,
  },
  // Analogous styles
  analogousContainer: {
    alignItems: 'center',
  },
  analogousFlow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analogousSwatch: {
    width: 70,
    height: 70,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginHorizontal: 4,
  },
  analogousMiddle: {
    transform: [{ scale: 1.05 }],
  },
  flowHint: {
    fontSize: 12,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    opacity: 0.7,
    marginTop: 12,
  },
  // Monochromatic styles
  monochromeContainer: {
    alignItems: 'center',
  },
  monoSwatch: {
    width: 70,
    height: 70,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 6,
  },
  monoHint: {
    fontSize: 11,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    opacity: 0.6,
    marginTop: 10,
  },
  // Tetradic styles
  tetradicContainer: {
    alignItems: 'center',
  },
  tetradicMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  tetradicCenter: {
    width: 30,
    height: 30,
  },
  // Double complementary styles
  doubleCompContainer: {
    flexDirection: 'row',
    gap: 30,
  },
  doubleCompPair: {
    alignItems: 'center',
  },
  pairLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.text.secondary,
    opacity: 0.3,
    marginVertical: 6,
  },
  // Fallback simple row
  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
});
