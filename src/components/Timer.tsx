import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface TimerProps {
  timeLeft: number; // 0-100 percentage
}

export const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const timeLeftShared = useSharedValue(timeLeft);
  const pulseOpacity = useSharedValue(1);
  const isWarning = timeLeft < 30;

  // Update shared value when prop changes
  useEffect(() => {
    timeLeftShared.value = timeLeft;
  }, [timeLeft, timeLeftShared]);

  // Handle warning pulse animation
  useEffect(() => {
    if (isWarning) {
      pulseOpacity.value = withRepeat(
        withTiming(0.6, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 100 });
    }
  }, [isWarning, pulseOpacity]);

  const animatedWidth = useAnimatedStyle(() => ({
    width: `${timeLeftShared.value}%`,
  }));

  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedWidth, animatedOpacity]}>
          <LinearGradient
            colors={
              isWarning
                ? [COLORS.accent.coral, '#d47060']
                : [COLORS.accent.sage, COLORS.accent.coral]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 280,
    paddingHorizontal: 20,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(74, 74, 74, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
});
