import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundShapes, BackButton } from '../components';
import {
  COLORS,
  FONTS,
  HARMONY_CONFIG,
  HARMONY_COLORS,
  getEvolvingBackground,
  getUnlockedHarmonyColors,
} from '../constants/theme';
import type { DiscoveredColors } from '../hooks/useStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StatsScreenProps {
  onClose: () => void;
  lifetimeScore?: number;
  discoveredColors?: DiscoveredColors;
}

const COLOR_FACTS = [
  "The human eye can distinguish about 10 million different colors.",
  "Red is the first color a baby sees after black and white.",
  "There's no blue food in nature—blueberries are actually purple!",
  "Yellow and red together make people hungry.",
  "Bees can see ultraviolet colors that humans can't perceive.",
  "Pink was considered a masculine color until the 1940s.",
  "The color orange wasn't named until the 16th century.",
  "White is the most popular car color worldwide.",
];

export const StatsScreen: React.FC<StatsScreenProps> = ({
  onClose,
  lifetimeScore = 0,
  discoveredColors = {},
}) => {
  const insets = useSafeAreaInsets();

  // Evolving background
  const backgroundColors = useMemo(() => {
    const unlockedCount = HARMONY_CONFIG.filter((h) => h.unlockThreshold <= lifetimeScore).length;
    return getEvolvingBackground(unlockedCount);
  }, [lifetimeScore]);

  const unlockedColors = useMemo(() => {
    return getUnlockedHarmonyColors(lifetimeScore);
  }, [lifetimeScore]);

  // Calculate progress
  const unlockedHarmonies = useMemo(() => {
    return HARMONY_CONFIG.filter((h) => h.unlockThreshold <= lifetimeScore);
  }, [lifetimeScore]);

  // Get total discovered colors count
  const totalDiscoveredColors = useMemo(() => {
    return Object.values(discoveredColors).flat().length;
  }, [discoveredColors]);

  // Random fun fact (stable for the session)
  const funFact = useMemo(() => {
    const index = Math.floor(Math.random() * COLOR_FACTS.length);
    return COLOR_FACTS[index];
  }, []);

  // Next unlock info
  const nextUnlock = HARMONY_CONFIG.find((h) => h.unlockThreshold > lifetimeScore);
  const pointsToNext = nextUnlock ? nextUnlock.unlockThreshold - lifetimeScore : 0;

  return (
    <Animated.View
      style={StyleSheet.absoluteFill}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      <LinearGradient
        colors={[backgroundColors.start, backgroundColors.end]}
        style={styles.container}
      >
        <BackgroundShapes unlockedColors={unlockedColors} />

        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={onClose} size={40} />
            <Text style={styles.title}>Stats</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Lifetime Score Card */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Lifetime Score</Text>
            <Text style={styles.scoreValue}>{lifetimeScore.toLocaleString()}</Text>
            {nextUnlock && (
              <Text style={styles.nextUnlock}>
                {pointsToNext.toLocaleString()} pts to {nextUnlock.name}
              </Text>
            )}
          </View>

          {/* Harmony Progress - Compact Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Harmonies</Text>
              <Text style={styles.sectionCount}>
                {unlockedHarmonies.length}/{HARMONY_CONFIG.length}
              </Text>
            </View>
            <View style={styles.harmonyRow}>
              {HARMONY_CONFIG.map((harmony) => {
                const isUnlocked = harmony.unlockThreshold <= lifetimeScore;
                const colors = HARMONY_COLORS[harmony.type];
                return (
                  <View
                    key={harmony.type}
                    style={[
                      styles.harmonyDot,
                      { backgroundColor: isUnlocked ? colors.base : COLORS.missing.base },
                    ]}
                  >
                    {!isUnlocked && (
                      <Ionicons name="lock-closed" size={10} color={COLORS.text.secondary} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* Discovered Colors */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Colors Discovered</Text>
              <Text style={styles.sectionCount}>{totalDiscoveredColors}</Text>
            </View>
            <View style={styles.colorsContainer}>
              {unlockedHarmonies.length > 0 ? (
                unlockedHarmonies.map((harmony) => {
                  const harmonyColors = discoveredColors[harmony.type] || [];
                  const displayColors = harmonyColors.slice(-8); // Show last 8
                  const themeColor = HARMONY_COLORS[harmony.type];

                  return (
                    <View key={harmony.type} style={styles.harmonyColorRow}>
                      <View style={[styles.harmonyLabel, { backgroundColor: themeColor.muted }]}>
                        <Text style={[styles.harmonyLabelText, { color: themeColor.base }]} numberOfLines={1}>
                          {harmony.name.split(' ')[0]}
                        </Text>
                      </View>
                      <View style={styles.colorSwatches}>
                        {displayColors.length > 0 ? (
                          displayColors.map((color, idx) => (
                            <View
                              key={`${color}-${idx}`}
                              style={[styles.colorSwatch, { backgroundColor: color }]}
                            />
                          ))
                        ) : (
                          <Text style={styles.noColorsText}>Play to discover!</Text>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text style={styles.emptyText}>Start playing to discover colors!</Text>
              )}
            </View>
          </View>

          {/* Fun Fact - Compact */}
          <View style={styles.funFactCard}>
            <Ionicons name="bulb-outline" size={16} color={COLORS.accent.gold} />
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.shadow.soft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    marginTop: 2,
  },
  nextUnlock: {
    fontSize: 12,
    fontWeight: FONTS.regular,
    color: COLORS.accent.sage,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
  },
  harmonyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 12,
  },
  harmonyDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  colorsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  harmonyColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  harmonyLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 70,
  },
  harmonyLabelText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
  },
  colorSwatches: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 10,
    gap: 4,
    alignItems: 'center',
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  noColorsText: {
    fontSize: 11,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingVertical: 8,
  },
  funFactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 230, 184, 0.4)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 'auto',
  },
  funFactText: {
    flex: 1,
    fontSize: 13,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
