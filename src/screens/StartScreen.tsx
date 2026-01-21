import React, { useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, BackgroundShapes, SoundIcon, HarmonyPalette } from '../components';
import { useSoundContext } from '../contexts';
import { COLORS, FONTS, HARMONY_CONFIG, getEvolvingBackground, getUnlockedHarmonyColors } from '../constants/theme';

interface StartScreenProps {
  onStart: () => void;
  onStartZen: () => void;
  onHistory?: () => void;
  onStats?: () => void;
  lifetimeScore?: number;
  onResetData?: () => void;
  onSetLifetimeScore?: (score: number) => void;
}

// Preset scores for testing harmony unlocks (matches HARMONY_CONFIG thresholds)
const TEST_SCORES = [0, 500, 2000, 5000, 8000, 12000, 20000];

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, onStartZen, onHistory, onStats, lifetimeScore = 0, onResetData, onSetLifetimeScore }) => {
  const insets = useSafeAreaInsets();
  const { isMuted, toggleMute, startBgm } = useSoundContext();
  const hasInteractedRef = useRef(false);

  // Calculate unlocked harmonies for evolving background
  const unlockedCount = useMemo(() => {
    return HARMONY_CONFIG.filter((h) => h.unlockThreshold <= lifetimeScore).length;
  }, [lifetimeScore]);

  const backgroundColors = useMemo(() => {
    return getEvolvingBackground(unlockedCount);
  }, [unlockedCount]);

  // Get unlocked harmony colors for background shapes
  const unlockedColors = useMemo(() => {
    return getUnlockedHarmonyColors(lifetimeScore);
  }, [lifetimeScore]);

  const handleSoundToggle = useCallback(() => {
    // First interaction: start BGM (user interaction required for mobile audio)
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      startBgm();
    }
    toggleMute();
  }, [toggleMute, startBgm]);

  return (
    <LinearGradient
      colors={[backgroundColors.start, backgroundColors.end]}
      style={styles.container}
    >
      <BackgroundShapes unlockedColors={unlockedColors} />

      {/* Sound toggle button */}
      <TouchableOpacity
        style={[styles.soundButton, { top: insets.top + 16 }]}
        onPress={handleSoundToggle}
        activeOpacity={0.7}
      >
        <View style={styles.soundButtonInner}>
          <SoundIcon muted={isMuted} size={22} />
        </View>
      </TouchableOpacity>

      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        <Text style={styles.title}>Chromatic Valley</Text>
        <Text style={styles.subtitle}>A journey through colors</Text>

        {/* Harmony palette - visual representation of unlocked harmonies */}
        <HarmonyPalette lifetimeScore={lifetimeScore} />

        <View style={styles.buttonContainer}>
          <Button title="Play" onPress={onStart} />
          <Button title="Zen Mode" onPress={onStartZen} variant="zen" />
          <View style={styles.secondaryButtons}>
            {onStats && (
              <Button title="Stats" onPress={onStats} variant="tertiary" />
            )}
            {onHistory && (
              <Button title="History" onPress={onHistory} variant="tertiary" />
            )}
          </View>
        </View>

        {/* Dev tools */}
        {(onResetData || onSetLifetimeScore) && (
          <View style={[styles.devTools, { paddingBottom: insets.bottom + 10 }]}>
            {onSetLifetimeScore && (
              <View style={styles.scoreButtons}>
                <Text style={styles.devLabel}>Set Score:</Text>
                {TEST_SCORES.map((score) => (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.scoreButton,
                      lifetimeScore === score && styles.scoreButtonActive,
                    ]}
                    onPress={() => onSetLifetimeScore(score)}
                  >
                    <Text style={[
                      styles.scoreButtonText,
                      lifetimeScore === score && styles.scoreButtonTextActive,
                    ]}>
                      {score}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {onResetData && (
              <TouchableOpacity onPress={onResetData}>
                <Text style={styles.resetText}>Reset All Data</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
    justifyContent: 'flex-start',
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
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 80,
    gap: 16,
    alignItems: 'center',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  devTools: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  devLabel: {
    fontSize: 10,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    opacity: 0.5,
    marginRight: 4,
  },
  scoreButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  scoreButtonActive: {
    backgroundColor: COLORS.accent.sage,
  },
  scoreButtonText: {
    fontSize: 10,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    opacity: 0.6,
  },
  scoreButtonTextActive: {
    color: COLORS.white,
    opacity: 1,
  },
  resetText: {
    fontSize: 11,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    opacity: 0.5,
  },
});
