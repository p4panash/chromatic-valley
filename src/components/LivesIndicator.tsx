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
  size?: 'normal' | 'small';
}

const LifeOrb = memo(({ filled, index, small }: { filled: boolean; index: number; small?: boolean }) => {
  const scale = useSharedValue(filled ? 1 : 0.8);
  const opacity = useSharedValue(filled ? 1 : 0.3);
  const orbSize = small ? 12 : 18;

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
        { width: orbSize, height: orbSize, borderRadius: orbSize / 2, borderWidth: small ? 1.5 : 2 },
        filled ? styles.lifeOrbFilled : styles.lifeOrbEmpty,
        animatedStyle,
      ]}
    >
      <View style={[styles.lifeOrbInner, { width: small ? 4 : 6, height: small ? 4 : 6, borderRadius: small ? 2 : 3 }, filled && styles.lifeOrbInnerFilled]} />
    </Animated.View>
  );
});

LifeOrb.displayName = 'LifeOrb';

const LivesIndicatorComponent: React.FC<LivesIndicatorProps> = ({ lives, size = 'normal' }) => {
  const maxLives = GAME_CONFIG.maxWrongAnswers;
  const isSmall = size === 'small';

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      {Array.from({ length: maxLives }, (_, index) => (
        <LifeOrb key={index} index={index} filled={index < lives} small={isSmall} />
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
  containerSmall: {
    gap: 4,
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
