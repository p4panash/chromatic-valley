import React, { memo, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import Svg, {
  Rect,
  Polygon,
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
  Path,
  Ellipse,
} from 'react-native-svg';
import { COLORS, FONTS } from '../constants/theme';
import type { CastleProgress, CastleStage } from '../types';

interface MiniCastleProps {
  progress: CastleProgress;
  score?: number;
  answerColors: string[];
  size?: number;
  showScore?: boolean;
}

const DEFAULT_SIZE = 80;

const stageOrder: CastleStage[] = ['foundation', 'walls', 'tower', 'details', 'crown'];

const getStageIndex = (stage: CastleStage): number => {
  return stageOrder.indexOf(stage);
};

// Use theme constants for colors with enhanced palette
const CASTLE_COLORS = {
  foundation: COLORS.accent.sand,
  foundationDark: '#d4c4a0',
  foundationLight: '#f5e8d0',
  walls: COLORS.accent.sage,
  wallsDark: '#8fb5a0',
  wallsLight: '#c0d8c8',
  tower: COLORS.accent.coral,
  towerDark: '#d08878',
  towerLight: '#f5bab0',
  windowDefault: COLORS.accent.sky,
  crown: COLORS.accent.gold,
  crownGlow: '#FFF8E0',
  shadow: COLORS.shadow.medium,
  shadowDark: COLORS.shadow.dark,
};

const MiniCastleComponent: React.FC<MiniCastleProps> = ({ progress, score = 0, answerColors, size = DEFAULT_SIZE, showScore = false }) => {
  const scale = useSharedValue(1);
  const scoreScale = useSharedValue(1);

  const currentStageIndex = getStageIndex(progress.stage);

  // Memoize reversed colors for performance
  // Order: 0=main door (stage 1), 1=tower (stage 2), 2=left side (stage 3), 3=right side (stage 3)
  const reversedColors = useMemo(
    () => [...answerColors].reverse(),
    [answerColors]
  );

  // Get color for a specific window slot
  const getWindowColor = (slot: number): string => {
    return reversedColors[slot] || CASTLE_COLORS.windowDefault;
  };

  // Pulse animation when stage changes
  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, [currentStageIndex, scale]);

  // Animate score on change
  useEffect(() => {
    scoreScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 200 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );
  }, [score, scoreScale]);

  const castleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  // Use viewBox for consistent rendering at any size
  const viewBoxSize = DEFAULT_SIZE;
  const cx = viewBoxSize / 2;
  const baseY = viewBoxSize;

  // Check if a window has a player-assigned color (not default)
  const hasPlayerColor = (index: number): boolean => {
    return reversedColors[index] !== undefined;
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`Castle progress: ${progress.stage} stage. Score: ${score} points. ${answerColors.length} colors collected.`}
    >
      <Animated.View style={[styles.castleWrapper, { width: size, height: size }, castleAnimatedStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}>
          {/* Gradient and Effect Definitions */}
          <Defs>
            {/* Foundation gradient */}
            <LinearGradient id="foundationGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={CASTLE_COLORS.foundationLight} />
              <Stop offset="100%" stopColor={CASTLE_COLORS.foundationDark} />
            </LinearGradient>
            {/* Walls gradient */}
            <LinearGradient id="wallsGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={CASTLE_COLORS.wallsLight} />
              <Stop offset="60%" stopColor={CASTLE_COLORS.walls} />
              <Stop offset="100%" stopColor={CASTLE_COLORS.wallsDark} />
            </LinearGradient>
            {/* Tower gradient */}
            <LinearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={CASTLE_COLORS.towerLight} />
              <Stop offset="50%" stopColor={CASTLE_COLORS.tower} />
              <Stop offset="100%" stopColor={CASTLE_COLORS.towerDark} />
            </LinearGradient>
            {/* Tower roof gradient */}
            <LinearGradient id="roofGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={CASTLE_COLORS.towerLight} />
              <Stop offset="100%" stopColor={CASTLE_COLORS.towerDark} />
            </LinearGradient>
            {/* Window glow gradient */}
            <RadialGradient id="windowGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={COLORS.white} stopOpacity="0.8" />
              <Stop offset="60%" stopColor={COLORS.white} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={COLORS.white} stopOpacity="0" />
            </RadialGradient>
            {/* Crown glow gradient */}
            <RadialGradient id="crownGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={CASTLE_COLORS.crownGlow} stopOpacity="1" />
              <Stop offset="40%" stopColor={CASTLE_COLORS.crown} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={CASTLE_COLORS.crown} stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* Ground shadow */}
          <Ellipse
            cx={cx}
            cy={baseY - 2}
            rx={32}
            ry={4}
            fill={CASTLE_COLORS.shadowDark}
            opacity={0.4}
          />

          {/* Foundation - always visible */}
          <G>
            {/* Foundation base with gradient */}
            <Rect
              x={cx - 30}
              y={baseY - 14}
              width={60}
              height={14}
              fill="url(#foundationGrad)"
              rx={3}
            />
            {/* Foundation detail line */}
            <Rect
              x={cx - 28}
              y={baseY - 12}
              width={56}
              height={1.5}
              fill={CASTLE_COLORS.foundationLight}
              opacity={0.6}
            />
            {/* Foundation shadow */}
            <Rect
              x={cx - 28}
              y={baseY - 4}
              width={56}
              height={2}
              fill={CASTLE_COLORS.foundationDark}
              opacity={0.4}
            />
          </G>

          {/* Walls */}
          {currentStageIndex >= 1 && (
            <G>
              {/* Main wall body with gradient */}
              <Rect
                x={cx - 24}
                y={baseY - 46}
                width={48}
                height={34}
                fill="url(#wallsGrad)"
                rx={2}
              />

              {/* Wall shadow on left */}
              <Rect
                x={cx - 24}
                y={baseY - 46}
                width={4}
                height={34}
                fill={CASTLE_COLORS.wallsDark}
                opacity={0.3}
                rx={2}
              />

              {/* Battlements on main wall */}
              <Rect x={cx - 24} y={baseY - 50} width={8} height={6} fill="url(#wallsGrad)" rx={1} />
              <Rect x={cx - 12} y={baseY - 50} width={8} height={6} fill="url(#wallsGrad)" rx={1} />
              <Rect x={cx} y={baseY - 50} width={8} height={6} fill="url(#wallsGrad)" rx={1} />
              <Rect x={cx + 12} y={baseY - 50} width={8} height={6} fill="url(#wallsGrad)" rx={1} />

              {/* Left turret */}
              <Rect x={cx - 28} y={baseY - 56} width={14} height={14} fill="url(#wallsGrad)" rx={1} />
              {/* Left turret battlements */}
              <Rect x={cx - 28} y={baseY - 60} width={4} height={5} fill={CASTLE_COLORS.walls} rx={0.5} />
              <Rect x={cx - 22} y={baseY - 60} width={4} height={5} fill={CASTLE_COLORS.walls} rx={0.5} />
              <Rect x={cx - 16} y={baseY - 60} width={4} height={5} fill={CASTLE_COLORS.walls} rx={0.5} />

              {/* Right turret */}
              <Rect x={cx + 14} y={baseY - 56} width={14} height={14} fill="url(#wallsGrad)" rx={1} />
              {/* Right turret battlements */}
              <Rect x={cx + 14} y={baseY - 60} width={4} height={5} fill={CASTLE_COLORS.walls} rx={0.5} />
              <Rect x={cx + 20} y={baseY - 60} width={4} height={5} fill={CASTLE_COLORS.walls} rx={0.5} />
              <Rect x={cx + 26} y={baseY - 60} width={4} height={5} fill={CASTLE_COLORS.walls} rx={0.5} />

              {/* Main arched door frame */}
              <Path
                d={`M${cx - 7} ${baseY - 12}
                   L${cx - 7} ${baseY - 28}
                   Q${cx - 7} ${baseY - 34} ${cx} ${baseY - 34}
                   Q${cx + 7} ${baseY - 34} ${cx + 7} ${baseY - 28}
                   L${cx + 7} ${baseY - 12} Z`}
                fill={CASTLE_COLORS.wallsDark}
              />
              {/* Main door/window */}
              <Path
                d={`M${cx - 5} ${baseY - 12}
                   L${cx - 5} ${baseY - 26}
                   Q${cx - 5} ${baseY - 31} ${cx} ${baseY - 31}
                   Q${cx + 5} ${baseY - 31} ${cx + 5} ${baseY - 26}
                   L${cx + 5} ${baseY - 12} Z`}
                fill={getWindowColor(0)}
              />
              {/* Door inner glow when colored */}
              {hasPlayerColor(0) && (
                <>
                  <Circle cx={cx} cy={baseY - 22} r={8} fill="url(#windowGlow)" />
                  <Path
                    d={`M${cx - 6} ${baseY - 12}
                       L${cx - 6} ${baseY - 27}
                       Q${cx - 6} ${baseY - 33} ${cx} ${baseY - 33}
                       Q${cx + 6} ${baseY - 33} ${cx + 6} ${baseY - 27}
                       L${cx + 6} ${baseY - 12} Z`}
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={1.5}
                  />
                </>
              )}
              {/* Door threshold */}
              <Rect
                x={cx - 6}
                y={baseY - 14}
                width={12}
                height={2}
                fill={CASTLE_COLORS.foundationDark}
              />
            </G>
          )}

          {/* Tower */}
          {currentStageIndex >= 2 && (
            <G>
              {/* Tower body with gradient */}
              <Rect
                x={cx - 13}
                y={baseY - 68}
                width={26}
                height={26}
                fill="url(#towerGrad)"
                rx={2}
              />
              {/* Tower side shadow */}
              <Rect
                x={cx - 13}
                y={baseY - 68}
                width={4}
                height={26}
                fill={CASTLE_COLORS.towerDark}
                opacity={0.3}
                rx={2}
              />
              {/* Tower roof with gradient */}
              <Polygon
                points={`${cx},${baseY - 82} ${cx - 16},${baseY - 66} ${cx + 16},${baseY - 66}`}
                fill="url(#roofGrad)"
              />
              {/* Roof highlight edge */}
              <Path
                d={`M${cx} ${baseY - 82} L${cx + 16} ${baseY - 66}`}
                stroke={CASTLE_COLORS.towerLight}
                strokeWidth={1}
                opacity={0.6}
              />
              {/* Tower window frame */}
              <Circle cx={cx} cy={baseY - 56} r={6} fill={CASTLE_COLORS.towerDark} />
              {/* Tower window */}
              <Circle cx={cx} cy={baseY - 56} r={5} fill={getWindowColor(1)} />
              {/* Tower window glow */}
              {hasPlayerColor(1) && (
                <>
                  <Circle cx={cx} cy={baseY - 56} r={8} fill="url(#windowGlow)" />
                  <Circle cx={cx} cy={baseY - 56} r={6.5} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
                </>
              )}
              {/* Tower decorative band */}
              <Rect
                x={cx - 13}
                y={baseY - 45}
                width={26}
                height={2}
                fill={CASTLE_COLORS.towerDark}
                opacity={0.4}
              />
            </G>
          )}

          {/* Side windows - appear with details stage */}
          {currentStageIndex >= 3 && (
            <G>
              {/* Left window frame */}
              <Circle cx={cx - 14} cy={baseY - 35} r={6} fill={CASTLE_COLORS.wallsDark} />
              {/* Left window */}
              <Circle cx={cx - 14} cy={baseY - 35} r={5} fill={getWindowColor(2)} />
              {/* Left window glow */}
              {hasPlayerColor(2) && (
                <>
                  <Circle cx={cx - 14} cy={baseY - 35} r={8} fill="url(#windowGlow)" />
                  <Circle cx={cx - 14} cy={baseY - 35} r={6.5} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
                </>
              )}

              {/* Right window frame */}
              <Circle cx={cx + 14} cy={baseY - 35} r={6} fill={CASTLE_COLORS.wallsDark} />
              {/* Right window */}
              <Circle cx={cx + 14} cy={baseY - 35} r={5} fill={getWindowColor(3)} />
              {/* Right window glow */}
              {hasPlayerColor(3) && (
                <>
                  <Circle cx={cx + 14} cy={baseY - 35} r={8} fill="url(#windowGlow)" />
                  <Circle cx={cx + 14} cy={baseY - 35} r={6.5} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
                </>
              )}

              {/* Small decorative windows on turrets */}
              <Rect x={cx - 22} y={baseY - 52} width={3} height={4} fill={CASTLE_COLORS.wallsDark} rx={1.5} />
              <Rect x={cx + 19} y={baseY - 52} width={3} height={4} fill={CASTLE_COLORS.wallsDark} rx={1.5} />
            </G>
          )}

          {/* Crown glow and flag */}
          {currentStageIndex >= 4 && (
            <G>
              {/* Outer glow ring */}
              <Circle
                cx={cx}
                cy={baseY - 82}
                r={14}
                fill="url(#crownGlow)"
              />
              {/* Inner bright core */}
              <Circle
                cx={cx}
                cy={baseY - 82}
                r={6}
                fill={CASTLE_COLORS.crownGlow}
                opacity={0.9}
              />

              {/* Flag pole */}
              <Rect
                x={cx - 0.75}
                y={baseY - 95}
                width={1.5}
                height={15}
                fill={CASTLE_COLORS.towerDark}
              />
              {/* Flag */}
              <Path
                d={`M${cx + 0.75} ${baseY - 95}
                   L${cx + 10} ${baseY - 91}
                   L${cx + 0.75} ${baseY - 87} Z`}
                fill={CASTLE_COLORS.tower}
              />
              {/* Flag highlight */}
              <Path
                d={`M${cx + 0.75} ${baseY - 95}
                   L${cx + 8} ${baseY - 92}`}
                stroke={CASTLE_COLORS.towerLight}
                strokeWidth={1}
                opacity={0.7}
              />

              {/* Sparkle effects - starburst pattern */}
              <Circle cx={cx - 8} cy={baseY - 86} r={2} fill={COLORS.white} opacity={0.9} />
              <Circle cx={cx + 8} cy={baseY - 78} r={2} fill={COLORS.white} opacity={0.8} />
              <Circle cx={cx - 4} cy={baseY - 90} r={1.5} fill={COLORS.white} opacity={0.85} />
              <Circle cx={cx + 5} cy={baseY - 88} r={1.5} fill={COLORS.white} opacity={0.75} />
              <Circle cx={cx} cy={baseY - 76} r={1.5} fill={COLORS.white} opacity={0.7} />

              {/* Small star rays */}
              <Path
                d={`M${cx} ${baseY - 82} L${cx} ${baseY - 86} M${cx} ${baseY - 82} L${cx} ${baseY - 78}
                   M${cx} ${baseY - 82} L${cx - 4} ${baseY - 82} M${cx} ${baseY - 82} L${cx + 4} ${baseY - 82}
                   M${cx} ${baseY - 82} L${cx - 3} ${baseY - 85} M${cx} ${baseY - 82} L${cx + 3} ${baseY - 85}
                   M${cx} ${baseY - 82} L${cx - 3} ${baseY - 79} M${cx} ${baseY - 82} L${cx + 3} ${baseY - 79}`}
                stroke={COLORS.white}
                strokeWidth={0.75}
                opacity={0.6}
              />
            </G>
          )}
        </Svg>

      </Animated.View>

      {/* Score display with elegant card styling - only shown if showScore is true */}
      {showScore && (
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCard}>
            <Animated.Text style={[styles.score, scoreAnimatedStyle]}>
              {score}
            </Animated.Text>
            {/* Progress bar inside card */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, (currentStageIndex + 1) * 20)}%` }
                ]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export const MiniCastle = memo(MiniCastleComponent);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  castleWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  scoreCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.06)',
    shadowColor: COLORS.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 70,
  },
  score: {
    fontSize: 22,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    letterSpacing: 0.5,
  },
  progressBar: {
    width: 44,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 1.5,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.sage,
    borderRadius: 1.5,
  },
});
