import React, { memo, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import Svg, { Rect, Polygon, Circle, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';
import type { CastleProgress, CastleStage } from '../types';

interface ProgressiveCastleProps {
  progress: CastleProgress;
}

const CASTLE_WIDTH = Math.min(Dimensions.get('window').width * 0.7, 280);
const CASTLE_HEIGHT = CASTLE_WIDTH * 1.4;

// Monument Valley colors using theme constants
const CASTLE_COLORS = {
  foundation: COLORS.accent.sand,
  walls: COLORS.accent.sage,
  tower: COLORS.accent.coral,
  windows: COLORS.accent.sky,
  flags: COLORS.accent.lavender,
  crown: COLORS.accent.gold,
};

const stageOrder: CastleStage[] = ['foundation', 'walls', 'tower', 'details', 'crown'];

const getStageIndex = (stage: CastleStage): number => {
  return stageOrder.indexOf(stage);
};

// Animated layer component that wraps SVG content
interface AnimatedLayerProps {
  children: React.ReactNode;
  scale: SharedValue<number>;
  translateY?: number;
  opacity?: SharedValue<number>;
}

const AnimatedLayer: React.FC<AnimatedLayerProps> = ({ children, scale, translateY = 0, opacity }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: interpolate(scale.value, [0, 1], [translateY, 0], Extrapolation.CLAMP) },
    ],
    opacity: opacity ? opacity.value : scale.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const CastleComponent: React.FC<ProgressiveCastleProps> = ({ progress }) => {
  const foundationScale = useSharedValue(0);
  const wallsScale = useSharedValue(0);
  const towerScale = useSharedValue(0);
  const detailsOpacity = useSharedValue(0);
  const crownScale = useSharedValue(0);
  const sparkleRotation = useSharedValue(0);

  const currentStageIndex = getStageIndex(progress.stage);

  useEffect(() => {
    const springConfig = { damping: 8, stiffness: 100 };
    const baseDelay = 150;

    // Foundation (always visible if past foundation stage)
    if (currentStageIndex >= 0) {
      foundationScale.value = withDelay(0, withSpring(1, springConfig));
    }

    // Walls
    if (currentStageIndex >= 1) {
      wallsScale.value = withDelay(baseDelay, withSpring(1, springConfig));
    } else {
      wallsScale.value = withTiming(0, { duration: 200 });
    }

    // Tower
    if (currentStageIndex >= 2) {
      towerScale.value = withDelay(baseDelay * 2, withSpring(1, springConfig));
    } else {
      towerScale.value = withTiming(0, { duration: 200 });
    }

    // Details (windows, flags)
    if (currentStageIndex >= 3) {
      detailsOpacity.value = withDelay(baseDelay * 3, withTiming(1, { duration: 400 }));
    } else {
      detailsOpacity.value = withTiming(0, { duration: 200 });
    }

    // Crown completion
    if (currentStageIndex >= 4) {
      crownScale.value = withDelay(baseDelay * 4, withSpring(1.1, { damping: 6 }));
      sparkleRotation.value = withDelay(
        baseDelay * 4,
        withSequence(
          withTiming(360, { duration: 1000 }),
          withTiming(360, { duration: 0 })
        )
      );
    } else {
      crownScale.value = withTiming(0, { duration: 200 });
    }
  }, [currentStageIndex, foundationScale, wallsScale, towerScale, detailsOpacity, crownScale, sparkleRotation]);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sparkleRotation.value}deg` }],
  }));

  const cx = CASTLE_WIDTH / 2;

  return (
    <View style={styles.container}>
      {/* Foundation Layer */}
      <AnimatedLayer scale={foundationScale} translateY={20}>
        <Svg width={CASTLE_WIDTH} height={CASTLE_HEIGHT} viewBox={`0 0 ${CASTLE_WIDTH} ${CASTLE_HEIGHT}`}>
          <Rect
            x={cx - 60}
            y={CASTLE_HEIGHT - 30}
            width={120}
            height={30}
            fill={CASTLE_COLORS.foundation}
            rx={4}
          />
          <Rect
            x={cx - 50}
            y={CASTLE_HEIGHT - 38}
            width={100}
            height={12}
            fill={CASTLE_COLORS.foundation}
            rx={2}
          />
        </Svg>
      </AnimatedLayer>

      {/* Walls Layer */}
      <AnimatedLayer scale={wallsScale} translateY={30}>
        <Svg width={CASTLE_WIDTH} height={CASTLE_HEIGHT} viewBox={`0 0 ${CASTLE_WIDTH} ${CASTLE_HEIGHT}`}>
          <Rect
            x={cx - 45}
            y={CASTLE_HEIGHT - 100}
            width={90}
            height={65}
            fill={CASTLE_COLORS.walls}
            rx={3}
          />
          <Rect
            x={cx - 50}
            y={CASTLE_HEIGHT - 115}
            width={20}
            height={20}
            fill={CASTLE_COLORS.walls}
            rx={2}
          />
          <Rect
            x={cx + 30}
            y={CASTLE_HEIGHT - 115}
            width={20}
            height={20}
            fill={CASTLE_COLORS.walls}
            rx={2}
          />
          <Rect
            x={cx - 10}
            y={CASTLE_HEIGHT - 110}
            width={20}
            height={15}
            fill={CASTLE_COLORS.walls}
            rx={2}
          />
        </Svg>
      </AnimatedLayer>

      {/* Tower Layer */}
      <AnimatedLayer scale={towerScale} translateY={40}>
        <Svg width={CASTLE_WIDTH} height={CASTLE_HEIGHT} viewBox={`0 0 ${CASTLE_WIDTH} ${CASTLE_HEIGHT}`}>
          <Rect
            x={cx - 20}
            y={CASTLE_HEIGHT - 160}
            width={40}
            height={55}
            fill={CASTLE_COLORS.tower}
            rx={3}
          />
          <Polygon
            points={`${cx},${CASTLE_HEIGHT - 185} ${cx - 25},${CASTLE_HEIGHT - 155} ${cx + 25},${CASTLE_HEIGHT - 155}`}
            fill={CASTLE_COLORS.tower}
          />
        </Svg>
      </AnimatedLayer>

      {/* Details Layer */}
      <AnimatedLayer scale={detailsOpacity} opacity={detailsOpacity}>
        <Svg width={CASTLE_WIDTH} height={CASTLE_HEIGHT} viewBox={`0 0 ${CASTLE_WIDTH} ${CASTLE_HEIGHT}`}>
          <Rect
            x={cx - 10}
            y={CASTLE_HEIGHT - 60}
            width={20}
            height={28}
            fill={CASTLE_COLORS.windows}
            rx={10}
          />
          <Rect
            x={cx - 35}
            y={CASTLE_HEIGHT - 90}
            width={12}
            height={18}
            fill={CASTLE_COLORS.windows}
            rx={6}
          />
          <Rect
            x={cx + 23}
            y={CASTLE_HEIGHT - 90}
            width={12}
            height={18}
            fill={CASTLE_COLORS.windows}
            rx={6}
          />
          <Circle
            cx={cx}
            cy={CASTLE_HEIGHT - 135}
            r={8}
            fill={CASTLE_COLORS.windows}
          />
          <Rect
            x={cx - 1}
            y={CASTLE_HEIGHT - 205}
            width={2}
            height={25}
            fill={COLORS.accent.sageDark}
          />
          <Polygon
            points={`${cx + 1},${CASTLE_HEIGHT - 205} ${cx + 18},${CASTLE_HEIGHT - 198} ${cx + 1},${CASTLE_HEIGHT - 191}`}
            fill={CASTLE_COLORS.flags}
          />
        </Svg>
      </AnimatedLayer>

      {/* Crown Layer */}
      <AnimatedLayer scale={crownScale}>
        <Svg width={CASTLE_WIDTH} height={CASTLE_HEIGHT} viewBox={`0 0 ${CASTLE_WIDTH} ${CASTLE_HEIGHT}`}>
          <Circle
            cx={cx}
            cy={CASTLE_HEIGHT - 200}
            r={15}
            fill={CASTLE_COLORS.crown}
            opacity={0.6}
          />
        </Svg>
      </AnimatedLayer>

      {/* Sparkle particles for crown completion */}
      {currentStageIndex >= 4 && (
        <Animated.View style={[styles.sparkleContainer, sparkleStyle]}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
            <View
              key={index}
              style={[
                styles.sparkle,
                {
                  transform: [
                    { rotate: `${angle}deg` },
                    { translateY: -25 },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
};

export const ProgressiveCastle = memo(CastleComponent);

const styles = StyleSheet.create({
  container: {
    width: CASTLE_WIDTH,
    height: CASTLE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 15,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent.coral,
  },
});
