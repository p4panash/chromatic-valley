import React, { memo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';
import type { TutorialMechanic } from '../types';

interface ContextualTutorialProps {
  mechanic: TutorialMechanic;
  onDismiss: () => void;
}

const TUTORIAL_CONTENT: Record<TutorialMechanic, { title: string; message: string; position: 'top' | 'center' | 'bottom' }> = {
  'color-match': {
    title: 'Match the Color',
    message: 'Find the exact color shown above from the choices below',
    position: 'center',
  },
  'color-wheel': {
    title: 'Complete the Wheel',
    message: 'Find the missing color to complete the triadic harmony',
    position: 'center',
  },
  timer: {
    title: 'Beat the Clock',
    message: 'Answer quickly for bonus points!',
    position: 'bottom',
  },
  streak: {
    title: 'Build Your Streak',
    message: 'Consecutive correct answers multiply your score',
    position: 'top',
  },
  lives: {
    title: 'Three Chances',
    message: 'You have 3 lives - wrong answers cost one',
    position: 'top',
  },
  'castle-building': {
    title: 'Build Your Castle',
    message: 'Score points to grow your castle through 5 stages',
    position: 'bottom',
  },
};

const AUTO_DISMISS_MS = 5000;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ContextualTutorial: React.FC<ContextualTutorialProps> = memo(({
  mechanic,
  onDismiss,
}) => {
  const content = TUTORIAL_CONTENT[mechanic];
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(20);
  const autoDismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onDismissRef = useRef(onDismiss);

  // Keep ref updated with latest callback
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const handleDismiss = () => {
    if (autoDismissTimerRef.current) {
      clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = null;
    }

    opacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(onDismissRef.current)();
    });
    scale.value = withTiming(0.9, { duration: 200 });
    translateY.value = withTiming(20, { duration: 200 });
  };

  useEffect(() => {
    // Animate in
    opacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    scale.value = withDelay(100, withSpring(1, { damping: 12 }));
    translateY.value = withDelay(100, withSpring(0, { damping: 12 }));

    // Set up auto-dismiss timer
    autoDismissTimerRef.current = setTimeout(() => {
      handleDismiss();
    }, AUTO_DISMISS_MS);

    return () => {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
      }
    };
  }, [opacity, scale, translateY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const getPositionStyle = () => {
    switch (content.position) {
      case 'top':
        return styles.positionTop;
      case 'bottom':
        return styles.positionBottom;
      default:
        return styles.positionCenter;
    }
  };

  return (
    <View style={[styles.overlay, getPositionStyle()]} pointerEvents="box-none">
      <Pressable onPress={handleDismiss} style={styles.pressable}>
        <Animated.View style={[styles.container, containerStyle]}>
          <View style={styles.content}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.message}>{content.message}</Text>
          </View>
          <View style={styles.tapHint}>
            <Text style={styles.tapText}>Tap to continue</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
});

ContextualTutorial.displayName = 'ContextualTutorial';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100,
  },
  positionTop: {
    top: 120,
  },
  positionCenter: {
    top: '40%',
  },
  positionBottom: {
    bottom: 150,
  },
  pressable: {
    maxWidth: SCREEN_WIDTH - 40,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 280,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tapHint: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.shadow.soft,
    alignItems: 'center',
  },
  tapText: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.accent.sage,
  },
});
