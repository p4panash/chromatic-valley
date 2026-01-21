import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BackgroundShapes, MiniCastle, Button } from '../components';
import { COLORS, FONTS, HARMONY_CONFIG, getEvolvingBackground, getUnlockedHarmonyColors } from '../constants/theme';
import type { GameMode } from '../types';

type SortMode = 'score' | 'date';

interface HighScore {
  score: number;
  level: number;
  streak: number;
  accuracy: number;
  date: string;
  mode: GameMode;
}

interface ScoreHistoryScreenProps {
  highScores: HighScore[];
  onClose: () => void;
  lifetimeScore?: number;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  const currentYear = now.getFullYear();

  return year === currentYear ? `${month} ${day}` : `${month} ${day}, ${year}`;
};

const getRankStyle = (rank: number) => {
  if (rank === 1) return { backgroundColor: '#FFD700' }; // Gold
  if (rank === 2) return { backgroundColor: '#C0C0C0' }; // Silver
  if (rank === 3) return { backgroundColor: '#CD7F32' }; // Bronze
  return { backgroundColor: COLORS.accent.sage + '40' };
};

export const ScoreHistoryScreen: React.FC<ScoreHistoryScreenProps> = ({
  highScores,
  onClose,
  lifetimeScore = 0,
}) => {
  const insets = useSafeAreaInsets();
  const [sortMode, setSortMode] = useState<SortMode>('score');

  // Evolving background and unlocked colors
  const backgroundColors = useMemo(() => {
    const unlockedCount = HARMONY_CONFIG.filter((h) => h.unlockThreshold <= lifetimeScore).length;
    return getEvolvingBackground(unlockedCount);
  }, [lifetimeScore]);

  const unlockedColors = useMemo(() => {
    return getUnlockedHarmonyColors(lifetimeScore);
  }, [lifetimeScore]);

  const sortedScores = useMemo(() => {
    if (sortMode === 'date') {
      return [...highScores].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    // Already sorted by score from storage
    return highScores;
  }, [highScores, sortMode]);

  const isEmpty = highScores.length === 0;

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
            <Text style={styles.title}>Score History</Text>
          </View>

          {isEmpty ? (
            /* Empty state */
            <View style={styles.emptyState}>
              <MiniCastle
                progress={{ stage: 'foundation', percentage: 0 }}
                answerColors={[]}
                size={100}
              />
              <Text style={styles.emptyTitle}>No adventures yet</Text>
              <Text style={styles.emptySubtitle}>
                Complete your first game to start{'\n'}recording your achievements
              </Text>
              <View style={styles.emptyButtonContainer}>
                <Button title="Start Playing" onPress={onClose} />
              </View>
            </View>
          ) : (
            <>
              {/* Sort pills */}
              <View style={styles.sortContainer}>
                <Pressable
                  style={[styles.sortPill, sortMode === 'score' && styles.sortPillActive]}
                  onPress={() => setSortMode('score')}
                >
                  <Text style={[styles.sortPillText, sortMode === 'score' && styles.sortPillTextActive]}>
                    By Score
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.sortPill, sortMode === 'date' && styles.sortPillActive]}
                  onPress={() => setSortMode('date')}
                >
                  <Text style={[styles.sortPillText, sortMode === 'date' && styles.sortPillTextActive]}>
                    By Date
                  </Text>
                </Pressable>
              </View>

              {/* Score list */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {sortedScores.map((score, index) => {
                  const rank = sortMode === 'score' ? index + 1 : highScores.indexOf(score) + 1;
                  return (
                    <View key={`${score.date}-${index}`} style={styles.card}>
                      {/* Rank badge */}
                      <View style={[styles.rankBadge, getRankStyle(rank)]}>
                        <Text style={styles.rankText}>#{rank}</Text>
                      </View>

                      {/* Score info */}
                      <View style={styles.cardContent}>
                        <View style={styles.cardTop}>
                          <Text style={styles.scoreText}>{score.score.toLocaleString()}</Text>
                          <View style={[styles.modeBadge, score.mode === 'zen' ? styles.zenBadge : styles.unifiedBadge]}>
                            <Text style={[styles.modeText, score.mode === 'zen' ? styles.zenText : styles.unifiedText]}>
                              {score.mode === 'zen' ? 'Zen' : 'Classic'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.cardStats}>
                          <Text style={styles.statText}>Lvl {score.level}</Text>
                          <Text style={styles.statDivider}>•</Text>
                          <Text style={styles.statText}>{score.accuracy}%</Text>
                          <Text style={styles.statDivider}>•</Text>
                          <Text style={styles.statText}>x{score.streak}</Text>
                        </View>

                        <Text style={styles.dateText}>{formatDate(score.date)}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {/* Back Button */}
              <View style={styles.backButtonContainer}>
                <Button title="Back" onPress={onClose} variant="tertiary" fullWidth />
              </View>
            </>
          )}
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
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'center',
  },
  sortPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    borderColor: COLORS.accent.sage,
  },
  sortPillActive: {
    backgroundColor: COLORS.accent.sage,
  },
  sortPillText: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.accent.sage,
    letterSpacing: 0.5,
  },
  sortPillTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 74, 74, 0.06)',
    shadowColor: COLORS.shadow.soft,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rankText: {
    fontSize: 13,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
  },
  cardContent: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
  },
  modeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  zenBadge: {
    backgroundColor: COLORS.accent.sage + '30',
  },
  unifiedBadge: {
    backgroundColor: COLORS.accent.coral + '30',
  },
  modeText: {
    fontSize: 11,
    fontWeight: FONTS.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  zenText: {
    color: COLORS.accent.sage,
  },
  unifiedText: {
    color: COLORS.accent.coral,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.text.secondary,
  },
  statDivider: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginHorizontal: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButtonContainer: {
    marginTop: 40,
  },
  backButtonContainer: {
    paddingTop: 16,
  },
});
