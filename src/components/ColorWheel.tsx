import React, { memo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ColorWheelProps {
  colors: [string, string, string]; // Three segments of the wheel
  missingIndex: number; // Which segment is gray/missing (0, 1, or 2)
}

const WHEEL_SIZE = Math.min(Dimensions.get('window').width - 80, 280);

// SVG path for pie segments (120 degrees each)
const createArcPath = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

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

const ColorWheelComponent: React.FC<ColorWheelProps> = ({ colors, missingIndex }) => {
  const center = WHEEL_SIZE / 2;
  const radius = WHEEL_SIZE / 2 - 5;

  // Segment angles: top-right (0), top-left (1), bottom (2)
  const segments = [
    { start: -30, end: 90 },   // Top-right
    { start: 90, end: 210 },   // Top-left
    { start: 210, end: 330 },  // Bottom (missing)
  ];

  return (
    <View style={styles.container}>
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
        {segments.map((segment, index) => {
          const color = index === missingIndex ? '#CCCCCC' : colors[index];
          return (
            <Path
              key={index}
              d={createArcPath(center, center, radius, segment.start, segment.end)}
              fill={color}
            />
          );
        })}
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
});
