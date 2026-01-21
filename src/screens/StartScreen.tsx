import React, { useCallback, useRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, BackgroundShapes, SoundIcon, HarmonyPalette, ZenModeSelector } from '../components';
import { useSoundContext } from '../contexts';
import { COLORS, FONTS, HARMONY_CONFIG, getEvolvingBackground, getUnlockedHarmonyColors } from '../constants/theme';
import type { ZenHarmonyFilter } from '../types';

interface StartScreenProps {
  onStart: () => void;
  onStartZen: (harmonyFilter?: ZenHarmonyFilter) => void;
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
  const { height } = useWindowDimensions();
  const { isMuted, toggleMute, startBgm } = useSoundContext();
  const hasInteractedRef = useRef(false);
  const [showZenSelector, setShowZenSelector] = useState(false);

  // Responsive spacing based on screen height
  const isSmallScreen = height < 750;
  const topPadding = isSmallScreen ? 60 : 100;
  const buttonTopMargin = isSmallScreen ? 40 : 80;

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

  const handleZenModePress = useCallback(() => {
    setShowZenSelector(true);
  }, []);

  const handleZenSelect = useCallback((filter: ZenHarmonyFilter) => {
    setShowZenSelector(false);
    onStartZen(filter);
  }, [onStartZen]);

  const handleZenCancel = useCallback(() => {
    setShowZenSelector(false);
  }, []);

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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + topPadding, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Chromatic Valley</Text>
        <Text style={styles.subtitle}>A journey through colors</Text>

        {/* Harmony palette - visual representation of unlocked harmonies */}
        <HarmonyPalette lifetimeScore={lifetimeScore} />

        <View style={[styles.buttonContainer, { marginTop: buttonTopMargin }]}>
          <Button title="Play" onPress={onStart} />
          <Button title="Zen Mode" onPress={handleZenModePress} variant="zen" />
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
          <View style={styles.devTools}>
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
      </ScrollView>

      {/* Zen Mode Harmony Selector */}
      <ZenModeSelector
        visible={showZenSelector}
        onSelect={handleZenSelect}
        onCancel={handleZenCancel}
        lifetimeScore={lifetimeScore}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
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
    gap: 16,
    alignItems: 'center',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  devTools: {
    marginTop: 'auto',
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
