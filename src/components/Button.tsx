import React from 'react';
import { Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'zen';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, style, variant = 'primary', fullWidth = false }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    translateY.value = withSpring(2, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    translateY.value = withSpring(0, { damping: 10, stiffness: 150 });
  };

  const isZen = variant === 'zen';
  const isTertiary = variant === 'tertiary';
  const isSecondary = variant === 'secondary';

  return (
    <AnimatedPressable
      style={[
        styles.container,
        (isSecondary || isZen) && styles.containerSecondary,
        isTertiary && styles.containerTertiary,
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {isTertiary ? (
        <Animated.View style={[styles.tertiaryInner, fullWidth && styles.fullWidth]}>
          <Text style={styles.textTertiary}>{title}</Text>
        </Animated.View>
      ) : isZen ? (
        <LinearGradient
          colors={['#B5A0C8', '#9576B0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.zenGradient}
        >
          <Text style={styles.textZen}>{title}</Text>
        </LinearGradient>
      ) : isSecondary ? (
        <Animated.View style={styles.secondaryInner}>
          <Text style={styles.textSecondary}>{title}</Text>
        </Animated.View>
      ) : (
        <LinearGradient
          colors={[COLORS.accent.coral, COLORS.accent.coralMuted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.text}>{title}</Text>
        </LinearGradient>
      )}
    </AnimatedPressable>
  );
};

const BUTTON_WIDTH = 200;

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  containerSecondary: {
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gradient: {
    width: BUTTON_WIDTH,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zenGradient: {
    width: BUTTON_WIDTH,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryInner: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.accent.sage,
  },
  text: {
    fontSize: 16,
    fontWeight: FONTS.medium,
    color: COLORS.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textZen: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.white,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  textSecondary: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.accent.sage,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  containerTertiary: {
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tertiaryInner: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1.5,
    borderColor: COLORS.text.secondary,
  },
  textTertiary: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  fullWidth: {
    width: '100%',
    paddingHorizontal: 0,
  },
});
