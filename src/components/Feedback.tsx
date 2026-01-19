import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../constants/theme';
import type { FeedbackType } from '../types';

interface FeedbackProps {
  type: FeedbackType;
}

const FEEDBACK_TEXT = {
  correct: 'Perfect',
  incorrect: 'Miss',
  timeout: 'Time',
};

export const Feedback: React.FC<FeedbackProps> = ({ type }) => {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (type) {
      opacity.value = withTiming(1, { duration: 150 });
      scale.value = withSequence(
        withSpring(1.1, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.5, { duration: 200 });
    }
  }, [type, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!type) return null;

  const color = type === 'correct' ? '#fff' : '#fff';
  const bgColor = type === 'correct' ? COLORS.accent.sage : COLORS.accent.coral;

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      <Animated.View style={[styles.textBadge, { backgroundColor: bgColor }]}>
        <Animated.Text style={[styles.text, { color }]}>
          {FEEDBACK_TEXT[type]}
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  textBadge: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 20,
  },
  text: {
    fontSize: 48,
    fontWeight: FONTS.light,
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
});
