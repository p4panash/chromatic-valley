import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface ColorWheelProps {
  colors: [string, string, string]; // Three segments of the wheel
  missingIndex: number; // Which segment is gray/missing (0, 1, or 2)
}

const WHEEL_SIZE = Math.min(Dimensions.get('window').width - 80, 280);
const GAP_ANGLE = 2; // Small gap between segments for visual separation

// SVG path for pie segments with gap
const createArcPath = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  innerRadius: number = 0
): string => {
  // Add small gap to start and end
  const adjustedStart = startAngle + GAP_ANGLE / 2;
  const adjustedEnd = endAngle - GAP_ANGLE / 2;

  const start = polarToCartesian(cx, cy, r, adjustedEnd);
  const end = polarToCartesian(cx, cy, r, adjustedStart);
  const largeArcFlag = adjustedEnd - adjustedStart <= 180 ? '0' : '1';

  if (innerRadius > 0) {
    // Create donut segment
    const innerStart = polarToCartesian(cx, cy, innerRadius, adjustedEnd);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, adjustedStart);
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z',
    ].join(' ');
  }

  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
};

const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angle: number
): { x: number; y: number } => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
};

// Calculate centroid of a segment for positioning effects
const getSegmentCentroid = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): { x: number; y: number } => {
  const midAngle = (startAngle + endAngle) / 2;
  const centroidRadius = r * 0.6;
  return polarToCartesian(cx, cy, centroidRadius, midAngle);
};

const ColorWheelComponent: React.FC<ColorWheelProps> = ({ colors, missingIndex }) => {
  const center = WHEEL_SIZE / 2;
  const outerRadius = WHEEL_SIZE / 2 - 12;
  const innerRadius = 25; // Small center hole for elegance

  // Segment angles: top-right (0), top-left (1), bottom (2)
  const segments = [
    { start: -30, end: 90 },   // Top-right
    { start: 90, end: 210 },   // Top-left
    { start: 210, end: 330 },  // Bottom (missing)
  ];

  // Missing segment styling
  const missingColor = COLORS.missing.base;
  const missingPatternColor = COLORS.missing.pattern;

  return (
    <View style={styles.container}>
      {/* Soft outer shadow */}
      <View style={styles.shadowOuter} />
      <View style={styles.shadowInner} />

      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} style={styles.svg}>
        <Defs>
          {/* Radial gradient for center glow */}
          <RadialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={COLORS.white} stopOpacity="0.9" />
            <Stop offset="70%" stopColor={COLORS.white} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={COLORS.white} stopOpacity="0" />
          </RadialGradient>

          {/* Highlight gradient for each segment */}
          <RadialGradient id="segmentHighlight" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={COLORS.white} stopOpacity="0.25" />
            <Stop offset="100%" stopColor={COLORS.white} stopOpacity="0" />
          </RadialGradient>

          {/* Missing segment pattern gradient */}
          <RadialGradient id="missingGradient" cx="50%" cy="50%" r="60%">
            <Stop offset="0%" stopColor={missingColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={missingPatternColor} stopOpacity="1" />
          </RadialGradient>
        </Defs>

        {/* Outer ring for polish */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius + 4}
          fill="none"
          stroke="rgba(74, 74, 74, 0.08)"
          strokeWidth={1}
        />

        {/* Main segments */}
        <G>
          {segments.map((segment, index) => {
            const isMissing = index === missingIndex;
            const color = isMissing ? 'url(#missingGradient)' : colors[index];

            return (
              <G key={index}>
                {/* Main segment */}
                <Path
                  d={createArcPath(center, center, outerRadius, segment.start, segment.end, innerRadius)}
                  fill={color}
                />

                {/* Highlight overlay for colored segments */}
                {!isMissing && (
                  <Path
                    d={createArcPath(center, center, outerRadius, segment.start, segment.end, innerRadius)}
                    fill="url(#segmentHighlight)"
                  />
                )}

                {/* Question mark indicator for missing segment */}
                {isMissing && (
                  <G>
                    {/* Subtle dashed border effect */}
                    <Path
                      d={createArcPath(center, center, outerRadius - 2, segment.start, segment.end, innerRadius + 2)}
                      fill="none"
                      stroke="rgba(74, 74, 74, 0.15)"
                      strokeWidth={2}
                      strokeDasharray="8,6"
                    />
                  </G>
                )}
              </G>
            );
          })}
        </G>

        {/* Center circle with glow */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="url(#centerGlow)"
        />

        {/* Inner ring accent */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius - 2}
          fill="none"
          stroke="rgba(74, 74, 74, 0.05)"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
};

export const ColorWheel = memo(ColorWheelComponent);

const styles = StyleSheet.create({
  container: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowOuter: {
    position: 'absolute',
    width: WHEEL_SIZE - 16,
    height: WHEEL_SIZE - 16,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: 'transparent',
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  shadowInner: {
    position: 'absolute',
    width: WHEEL_SIZE - 24,
    height: WHEEL_SIZE - 24,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: 'transparent',
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  svg: {
    zIndex: 1,
  },
});
