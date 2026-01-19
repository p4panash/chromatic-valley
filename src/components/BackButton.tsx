import React, { memo } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS } from '../constants/theme';

interface BackButtonProps {
  onPress: () => void;
  size?: number;
}

export const BackButton: React.FC<BackButtonProps> = memo(({
  onPress,
  size = 40,
}) => {
  const isCompact = size < 40;
  const iconSize = isCompact ? 14 : 16;
  const borderRadius = isCompact ? 8 : 10;

  return (
    <TouchableOpacity
      style={[styles.button, { width: size, height: size, borderRadius }]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15 18l-6-6 6-6"
          stroke={COLORS.text.secondary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </TouchableOpacity>
  );
});

BackButton.displayName = 'BackButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.06)',
  },
});
