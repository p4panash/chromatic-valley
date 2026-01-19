import React from 'react';
import Svg, { Path, G } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface SoundIconProps {
  muted: boolean;
  size?: number;
  color?: string;
}

export const SoundIcon: React.FC<SoundIconProps> = ({
  muted,
  size = 24,
  color = COLORS.text.secondary,
}) => {
  if (muted) {
    // Speaker with X (muted)
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <G>
          {/* Speaker body */}
          <Path
            d="M11 5L6 9H2v6h4l5 4V5z"
            fill={color}
            opacity={0.6}
          />
          {/* X mark */}
          <Path
            d="M23 9l-6 6M17 9l6 6"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    );
  }

  // Speaker with sound waves (unmuted)
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G>
        {/* Speaker body */}
        <Path
          d="M11 5L6 9H2v6h4l5 4V5z"
          fill={color}
        />
        {/* Sound waves */}
        <Path
          d="M15.54 8.46a5 5 0 010 7.07"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.7}
        />
        <Path
          d="M19.07 4.93a10 10 0 010 14.14"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.4}
        />
      </G>
    </Svg>
  );
};
