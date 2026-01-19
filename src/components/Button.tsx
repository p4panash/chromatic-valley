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
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ title, onPress, style, variant = 'primary' }) => {
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

  const isSecondary = variant === 'secondary';

  return (
    <AnimatedPressable
      style={[styles.container, isSecondary && styles.containerSecondary, animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {isSecondary ? (
        <Animated.View style={styles.secondaryInner}>
          <Text style={styles.textSecondary}>{title}</Text>
        </Animated.View>
      ) : (
        <LinearGradient
          colors={[COLORS.accent.coral, '#d4918a']}
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
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  gradient: {
    paddingVertical: 20,
    paddingHorizontal: 60,
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
  textSecondary: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.accent.sage,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
