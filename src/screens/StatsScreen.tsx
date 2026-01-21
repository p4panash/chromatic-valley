import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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

interface StatsScreenProps {
  onClose: () => void;
  lifetimeScore?: number;
}

const COLOR_FACTS = [
  "The human eye can distinguish about 10 million different colors.",
  "Purple was the color of royalty because the dye was extremely expensive to produce.",
  "Pink was considered a masculine color until the 1940s.",
  "Mosquitoes are attracted to the color blue twice as much as any other color.",
  "The color orange wasn't named until the 16th century. Before that, it was called 'geoluhread' (yellow-red).",
  "Chromophobia is the fear of colors.",
  "Red is the first color a baby sees after black and white.",
  "There's no blue food in nature—blueberries are actually purple!",
  "Ancient Greeks didn't have a word for blue. Homer described the sea as 'wine-dark.'",
  "Yellow and red together make people hungry—that's why many fast food logos use them.",
  "White is the most popular car color worldwide.",
  "Bees can see ultraviolet colors that humans can't perceive.",
];

export const StatsScreen: React.FC<StatsScreenProps> = ({
  onClose,
  lifetimeScore = 0,
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

  const lockedHarmonies = useMemo(() => {
    return HARMONY_CONFIG.filter((h) => h.unlockThreshold > lifetimeScore);
  }, [lifetimeScore]);

  // Random fun fact (stable for the session)
  const funFact = useMemo(() => {
    const index = Math.floor(Math.random() * COLOR_FACTS.length);
    return COLOR_FACTS[index];
  }, []);

  // Next unlock info
  const nextUnlock = lockedHarmonies[0];
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
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <BackButton onPress={onClose} size={40} />
            <Text style={styles.title}>Color Stats</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Lifetime Score */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Lifetime Score</Text>
              <Text style={styles.scoreValue}>{lifetimeScore.toLocaleString()}</Text>
              {nextUnlock && (
                <Text style={styles.nextUnlock}>
                  {pointsToNext.toLocaleString()} points to unlock {nextUnlock.name}
                </Text>
              )}
            </View>

            {/* Harmony Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Harmony Progress</Text>
              <Text style={styles.sectionSubtitle}>
                {unlockedHarmonies.length} of {HARMONY_CONFIG.length} discovered
              </Text>

              <View style={styles.harmonyGrid}>
                {HARMONY_CONFIG.map((harmony) => {
                  const isUnlocked = harmony.unlockThreshold <= lifetimeScore;
                  const colors = HARMONY_COLORS[harmony.type];

                  return (
                    <View
                      key={harmony.type}
                      style={[
                        styles.harmonyCard,
                        !isUnlocked && styles.harmonyCardLocked,
                      ]}
                    >
                      <View
                        style={[
                          styles.harmonyColorDot,
                          {
                            backgroundColor: isUnlocked ? colors.base : COLORS.missing.base,
                          },
                        ]}
                      >
                        {!isUnlocked && (
                          <Ionicons name="lock-closed" size={14} color={COLORS.text.secondary} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.harmonyName,
                          !isUnlocked && styles.harmonyNameLocked,
                        ]}
                        numberOfLines={1}
                      >
                        {harmony.name}
                      </Text>
                      {isUnlocked ? (
                        <Text style={styles.harmonyUnlocked}>Unlocked</Text>
                      ) : (
                        <Text style={styles.harmonyThreshold}>
                          {harmony.unlockThreshold.toLocaleString()} pts
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Discovered Palettes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Color Palettes</Text>
              <Text style={styles.sectionSubtitle}>
                Your discovered harmony colors
              </Text>

              {unlockedHarmonies.length > 0 ? (
                <View style={styles.paletteContainer}>
                  {unlockedHarmonies.map((harmony) => {
                    const colors = HARMONY_COLORS[harmony.type];
                    return (
                      <View key={harmony.type} style={styles.paletteRow}>
                        <View style={styles.paletteSwatches}>
                          <View style={[styles.paletteSwatch, { backgroundColor: colors.base }]} />
                          <View style={[styles.paletteSwatch, styles.paletteSwatchSmall, { backgroundColor: colors.glow }]} />
                          <View style={[styles.paletteSwatch, styles.paletteSwatchSmall, { backgroundColor: colors.muted }]} />
                        </View>
                        <Text style={styles.paletteName}>{harmony.name}</Text>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyPalette}>
                  <Text style={styles.emptyPaletteText}>
                    Start playing to discover color palettes!
                  </Text>
                </View>
              )}
            </View>

            {/* Fun Fact */}
            <View style={styles.funFactCard}>
              <View style={styles.funFactHeader}>
                <Ionicons name="bulb-outline" size={18} color={COLORS.accent.gold} />
                <Text style={styles.funFactLabel}>Did you know?</Text>
              </View>
              <Text style={styles.funFactText}>{funFact}</Text>
            </View>
          </ScrollView>
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
    marginBottom: 20,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.shadow.soft,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  nextUnlock: {
    fontSize: 13,
    fontWeight: FONTS.regular,
    color: COLORS.accent.sage,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    marginBottom: 16,
  },
  harmonyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  harmonyCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: COLORS.shadow.soft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  harmonyCardLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  harmonyColorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  harmonyName: {
    fontSize: 13,
    fontWeight: FONTS.medium,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  harmonyNameLocked: {
    color: COLORS.text.secondary,
  },
  harmonyUnlocked: {
    fontSize: 11,
    fontWeight: FONTS.medium,
    color: COLORS.accent.sage,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  harmonyThreshold: {
    fontSize: 11,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
  },
  paletteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadow.soft,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 74, 74, 0.06)',
  },
  paletteSwatches: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  paletteSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: -8,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  paletteSwatchSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  paletteName: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  emptyPalette: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyPaletteText: {
    fontSize: 14,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  funFactCard: {
    backgroundColor: 'rgba(245, 230, 184, 0.5)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(245, 230, 184, 0.8)',
  },
  funFactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  funFactLabel: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  funFactText: {
    fontSize: 14,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
});
