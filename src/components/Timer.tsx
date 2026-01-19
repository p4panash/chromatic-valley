import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

interface TimerProps {
  timeLeft: number; // 0-100 percentage
}

const TICK_COUNT = 10;
const TRACK_HEIGHT = 8;
const TRACK_WIDTH = 280;

export const Timer: React.FC<TimerProps> = ({ timeLeft }) => {
  const timeLeftShared = useSharedValue(timeLeft);
  const pulseOpacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const isWarning = timeLeft < 30;
  const isCritical = timeLeft < 15;

  // Generate tick marks
  const ticks = useMemo(() => {
    return Array.from({ length: TICK_COUNT + 1 }, (_, i) => ({
      position: (i / TICK_COUNT) * 100,
      isMajor: i % 5 === 0,
    }));
  }, []);

  // Update shared value when prop changes
  useEffect(() => {
    timeLeftShared.value = timeLeft;
  }, [timeLeft, timeLeftShared]);

  // Handle warning pulse animation
  useEffect(() => {
    if (isCritical) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 200 }),
          withTiming(0.3, { duration: 200 })
        ),
        -1,
        false
      );
    } else if (isWarning) {
      pulseOpacity.value = withRepeat(
        withTiming(0.7, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      glowOpacity.value = withTiming(0.5, { duration: 200 });
    } else {
      pulseOpacity.value = withTiming(1, { duration: 100 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isWarning, isCritical, pulseOpacity, glowOpacity]);

  const animatedWidth = useAnimatedStyle(() => ({
    width: `${timeLeftShared.value}%`,
  }));

  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Determine gradient colors based on time state
  const gradientColors: [string, string, ...string[]] = isCritical
    ? [COLORS.accent.coralDark, COLORS.accent.coralDeep]
    : isWarning
    ? [COLORS.accent.coral, COLORS.accent.coralDark]
    : [COLORS.accent.sage, COLORS.gradient.sageMid, COLORS.accent.sky];

  return (
    <View style={styles.container}>
      {/* Decorative end caps */}
      <View style={styles.endCapLeft} />
      <View style={styles.endCapRight} />

      {/* Main track container */}
      <View style={styles.trackContainer}>
        {/* Background track with subtle texture */}
        <View style={styles.track}>
          {/* Inner shadow for depth */}
          <View style={styles.trackInnerShadow} />

          {/* Tick marks */}
          <View style={styles.tickContainer}>
            {ticks.map((tick, index) => (
              <View
                key={index}
                style={[
                  styles.tick,
                  tick.isMajor ? styles.tickMajor : styles.tickMinor,
                  { left: `${tick.position}%` },
                ]}
              />
            ))}
          </View>

          {/* Warning glow effect */}
          {(isWarning || isCritical) && (
            <Animated.View style={[styles.warningGlow, animatedGlow]} />
          )}

          {/* Animated fill bar */}
          <Animated.View style={[styles.fill, animatedWidth, animatedOpacity]}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            />
            {/* Shine effect on fill */}
            <View style={styles.fillShine} />
            {/* Rounded end indicator */}
            <View style={styles.fillEndIndicator} />
          </Animated.View>
        </View>

        {/* Subtle outer border */}
        <View style={styles.trackBorder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: TRACK_WIDTH,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  trackContainer: {
    width: '100%',
    position: 'relative',
  },
  endCapLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(74, 74, 74, 0.15)',
  },
  endCapRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(74, 74, 74, 0.15)',
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: 'rgba(74, 74, 74, 0.08)',
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  trackInnerShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(74, 74, 74, 0.05)',
    borderTopLeftRadius: TRACK_HEIGHT / 2,
    borderTopRightRadius: TRACK_HEIGHT / 2,
  },
  trackBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: (TRACK_HEIGHT + 2) / 2,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.06)',
  },
  tickContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    marginLeft: -0.5,
  },
  tickMajor: {
    backgroundColor: 'rgba(74, 74, 74, 0.12)',
  },
  tickMinor: {
    backgroundColor: 'rgba(74, 74, 74, 0.06)',
  },
  warningGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.accent.coral,
  },
  fill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
    position: 'relative',
  },
  gradient: {
    flex: 1,
  },
  fillShine: {
    position: 'absolute',
    top: 1,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 1,
  },
  fillEndIndicator: {
    position: 'absolute',
    right: 2,
    top: '50%',
    marginTop: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
