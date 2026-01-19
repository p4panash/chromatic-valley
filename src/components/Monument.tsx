import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

export const Monument: React.FC = () => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-10, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.tower}>
        <View style={styles.towerTop}>
          <View style={styles.towerTopWindow} />
        </View>
        <View style={styles.towerBody}>
          <View style={styles.towerBodyWindow} />
        </View>
        <View style={styles.towerBase} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    alignItems: 'center',
  },
  tower: {
    alignItems: 'center',
  },
  towerTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.accent.coral,
    position: 'relative',
  },
  towerTopWindow: {
    position: 'absolute',
    top: 15,
    left: -8,
    width: 16,
    height: 16,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    opacity: 0.8,
  },
  towerBody: {
    width: 50,
    height: 80,
    backgroundColor: COLORS.accent.sage,
    position: 'relative',
  },
  towerBodyWindow: {
    position: 'absolute',
    top: 20,
    left: 15,
    width: 20,
    height: 30,
    backgroundColor: COLORS.white,
    opacity: 0.6,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  towerBase: {
    width: 70,
    height: 30,
    backgroundColor: COLORS.accent.sand,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
