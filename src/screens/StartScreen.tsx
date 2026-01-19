import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Monument, Button, BackgroundShapes } from '../components';
import { COLORS, FONTS } from '../constants/theme';

interface StartScreenProps {
  onStart: () => void;
  onStartZen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onStartZen }) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[COLORS.background.start, COLORS.background.end]}
      style={styles.container}
    >
      <BackgroundShapes />
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <Monument />
        <Text style={styles.title}>Chromatic Valley</Text>
        <Text style={styles.subtitle}>A journey through colors</Text>
        <View style={styles.buttonContainer}>
          <Button title="Play" onPress={onStart} />
          <Button title="Zen Mode" onPress={onStartZen} variant="secondary" />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: FONTS.light,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: COLORS.text.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    letterSpacing: 2,
    marginBottom: 60,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 16,
    alignItems: 'center',
  },
});
