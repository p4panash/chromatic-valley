import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Monument, Button, BackgroundShapes, SoundIcon } from '../components';
import { useSoundContext } from '../contexts';
import { COLORS, FONTS } from '../constants/theme';

interface StartScreenProps {
  onStart: () => void;
  onStartZen: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onStartZen }) => {
  const insets = useSafeAreaInsets();
  const { isMuted, toggleMute } = useSoundContext();

  return (
    <LinearGradient
      colors={[COLORS.background.start, COLORS.background.end]}
      style={styles.container}
    >
      <BackgroundShapes />

      {/* Sound toggle button */}
      <TouchableOpacity
        style={[styles.soundButton, { top: insets.top + 16 }]}
        onPress={toggleMute}
        activeOpacity={0.7}
      >
        <View style={styles.soundButtonInner}>
          <SoundIcon muted={isMuted} size={22} />
        </View>
      </TouchableOpacity>

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
  soundButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  soundButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.1)',
    shadowColor: COLORS.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
