import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';

export interface TutorialStep {
  title: string;
  description: string;
  highlight?: 'target' | 'choices' | 'timer' | 'lives';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to Chromatic Valley',
    description:
      'Match colors on a journey through the valley. Each correct match brings you closer to chromatic harmony.',
    highlight: undefined,
  },
  {
    title: 'The Target Color',
    description:
      'This is your target. Study its shade carefully - you must find its exact match among the choices below.',
    highlight: 'target',
  },
  {
    title: 'Choose Wisely',
    description:
      'Four colors await, but only one is the true match. The colors will look similar, so trust your eyes.',
    highlight: 'choices',
  },
  {
    title: 'Time Flows',
    description:
      'The timer shows your remaining time. Answer quickly for bonus points, but accuracy matters most.',
    highlight: 'timer',
  },
  {
    title: 'Your Journey',
    description:
      'You have three chances. Each mistake costs one. Preserve your lives to continue the journey.',
    highlight: 'lives',
  },
  {
    title: 'Ready to Begin',
    description:
      'Build streaks for bonus points. The path grows challenging, but so does your reward. Begin your journey!',
    highlight: undefined,
  },
];

interface TutorialOverlayProps {
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

const PulsingIndicator = memo(() => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.pulsingDot, animatedStyle]} />;
});

PulsingIndicator.displayName = 'PulsingIndicator';

const TutorialOverlayComponent: React.FC<TutorialOverlayProps> = ({
  currentStep,
  onNext,
  onSkip,
  onComplete,
}) => {
  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleContinue = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  }, [isLastStep, onComplete, onNext]);

  return (
    <Animated.View
      style={styles.overlay}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      <Pressable style={styles.backdrop} onPress={handleContinue} />

      <Animated.View
        style={styles.card}
        entering={SlideInUp.duration(400).springify()}
        exiting={SlideOutDown.duration(300)}
        key={currentStep}
      >
        <View style={styles.stepIndicator}>
          {TUTORIAL_STEPS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentStep && styles.dotActive]}
            />
          ))}
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        {step.highlight && (
          <View style={styles.highlightHint}>
            <PulsingIndicator />
            <Text style={styles.highlightText}>
              Look at the {step.highlight} area
            </Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          {!isLastStep && (
            <Pressable style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipText}>Skip Tutorial</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.nextButton, isLastStep && styles.startButton]}
            onPress={handleContinue}
          >
            <Text style={[styles.nextText, isLastStep && styles.startText]}>
              {isLastStep ? 'Start Playing' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

export const TutorialOverlay = memo(TutorialOverlayComponent);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(74, 74, 74, 0.7)',
  },
  card: {
    width: width - 40,
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.shadow.soft,
  },
  dotActive: {
    backgroundColor: COLORS.accent.coral,
    width: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  highlightHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.accent.sand + '30',
    borderRadius: 12,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent.coral,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
  },
  nextButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: COLORS.accent.sage,
    borderRadius: 25,
  },
  startButton: {
    backgroundColor: COLORS.accent.coral,
    paddingHorizontal: 40,
  },
  nextText: {
    fontSize: 15,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 1,
  },
  startText: {
    textTransform: 'uppercase',
  },
});
