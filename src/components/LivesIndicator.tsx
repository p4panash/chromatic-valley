import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, GAME_CONFIG } from '../constants/theme';

interface LivesIndicatorProps {
  lives: number;
}

const LifeOrb = memo(({ filled, index }: { filled: boolean; index: number }) => {
  const scale = useSharedValue(filled ? 1 : 0.8);
  const opacity = useSharedValue(filled ? 1 : 0.3);

  useEffect(() => {
    if (!filled) {
      // Animate loss of life
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withSpring(0.8, { damping: 10 })
      );
      opacity.value = withTiming(0.3, { duration: 300 });
    } else {
      scale.value = withSpring(1, { damping: 10 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [filled, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.lifeOrb,
        filled ? styles.lifeOrbFilled : styles.lifeOrbEmpty,
        animatedStyle,
      ]}
    >
      <View style={[styles.lifeOrbInner, filled && styles.lifeOrbInnerFilled]} />
    </Animated.View>
  );
});

LifeOrb.displayName = 'LifeOrb';

const LivesIndicatorComponent: React.FC<LivesIndicatorProps> = ({ lives }) => {
  const maxLives = GAME_CONFIG.maxWrongAnswers;

  return (
    <View style={styles.container}>
      {Array.from({ length: maxLives }, (_, index) => (
        <LifeOrb key={index} index={index} filled={index < lives} />
      ))}
    </View>
  );
};

export const LivesIndicator = memo(LivesIndicatorComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lifeOrb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  lifeOrbFilled: {
    borderColor: COLORS.accent.coral,
    backgroundColor: COLORS.accent.coral,
  },
  lifeOrbEmpty: {
    borderColor: COLORS.shadow.medium,
    backgroundColor: 'transparent',
  },
  lifeOrbInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  lifeOrbInnerFilled: {
    backgroundColor: COLORS.white,
  },
});
