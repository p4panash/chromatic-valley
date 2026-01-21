import React, { memo, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, HARMONY_COLORS, HARMONY_CONFIG } from '../constants/theme';
import type { ZenHarmonyFilter, HarmonyType } from '../types';

interface ZenModeSelectorProps {
  visible: boolean;
  onSelect: (filter: ZenHarmonyFilter) => void;
  onCancel: () => void;
  lifetimeScore: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ZenModeSelector: React.FC<ZenModeSelectorProps> = memo(({
  visible,
  onSelect,
  onCancel,
  lifetimeScore,
}) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<ZenHarmonyFilter>('all');

  // Animation values
  const blurOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(50);
  const cardOpacity = useSharedValue(0);

  // Get unlocked harmonies
  const unlockedHarmonies = useMemo(() => {
    return HARMONY_CONFIG.filter((h) => h.unlockThreshold <= lifetimeScore);
  }, [lifetimeScore]);

  useEffect(() => {
    if (visible) {
      // Reset selection when modal opens
      setSelectedFilter('all');

      // Animate in
      blurOpacity.value = withTiming(1, { duration: 200 });
      cardTranslateY.value = withDelay(50, withSpring(0, { damping: 15, stiffness: 150 }));
      cardOpacity.value = withDelay(50, withTiming(1, { duration: 200 }));
    } else {
      // Animate out
      blurOpacity.value = withTiming(0, { duration: 150 });
      cardTranslateY.value = withTiming(50, { duration: 150 });
      cardOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const handleSelect = (filter: ZenHarmonyFilter) => {
    setSelectedFilter(filter);
  };

  const handleStart = () => {
    // Animate out then call onSelect
    cardOpacity.value = withTiming(0, { duration: 150 });
    blurOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onSelect)(selectedFilter);
    });
  };

  const handleCancel = () => {
    // Animate out then call onCancel
    cardOpacity.value = withTiming(0, { duration: 150 });
    blurOpacity.value = withTiming(0, { duration: 150 }, () => {
      runOnJS(onCancel)();
    });
  };

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <Pressable style={styles.fullScreenOverlay} onPress={handleCancel}>
      <Animated.View style={[styles.blurContainer, blurStyle]}>
        <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.dimOverlay} />
      </Animated.View>

      <View style={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <Text style={styles.title}>Choose Your Focus</Text>
            <Text style={styles.subtitle}>Practice a specific harmony or play them all</Text>

            {/* Options */}
            <ScrollView
              style={styles.optionsContainer}
              contentContainerStyle={styles.optionsContent}
              showsVerticalScrollIndicator={false}
            >
              {/* All Harmonies option */}
              <Pressable
                style={[
                  styles.option,
                  selectedFilter === 'all' && styles.optionSelected,
                ]}
                onPress={() => handleSelect('all')}
              >
                <View style={styles.optionContent}>
                  <View style={styles.allHarmoniesGrid}>
                    {unlockedHarmonies.map((h) => (
                      <View
                        key={h.type}
                        style={[
                          styles.gridSwatch,
                          { backgroundColor: HARMONY_COLORS[h.type].base },
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionName,
                      selectedFilter === 'all' && styles.optionNameSelected,
                    ]}>
                      All Harmonies
                    </Text>
                    <Text style={styles.optionDescription}>
                      Rotate through {unlockedHarmonies.length} harmony types
                    </Text>
                  </View>
                </View>
                {selectedFilter === 'all' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Individual harmonies */}
              {unlockedHarmonies.map((harmony) => {
                const colors = HARMONY_COLORS[harmony.type];
                const isSelected = selectedFilter === harmony.type;

                return (
                  <Pressable
                    key={harmony.type}
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(harmony.type as HarmonyType)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[styles.swatch, { backgroundColor: colors.base }]} />
                      <View style={styles.optionTextContainer}>
                        <Text style={[
                          styles.optionName,
                          isSelected && styles.optionNameSelected,
                        ]}>
                          {harmony.name}
                        </Text>
                        <Text style={styles.optionDescription} numberOfLines={1}>
                          {harmony.description}
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Start button */}
            <Pressable style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start Zen Mode</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </View>
    </Pressable>
  );
});

ZenModeSelector.displayName = 'ZenModeSelector';

const styles = StyleSheet.create({
  fullScreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  title: {
    fontSize: 22,
    fontWeight: FONTS.semiBold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  optionsContent: {
    paddingBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  optionSelected: {
    backgroundColor: `${COLORS.accent.sage}15`,
    borderWidth: 1.5,
    borderColor: COLORS.accent.sage,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  allHarmoniesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 44,
    gap: 3,
  },
  gridSwatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  optionName: {
    fontSize: 16,
    fontWeight: FONTS.medium,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  optionNameSelected: {
    color: COLORS.accent.sageDark,
  },
  optionDescription: {
    fontSize: 12,
    fontWeight: FONTS.regular,
    color: COLORS.text.secondary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.shadow.soft,
    marginVertical: 8,
  },
  startButton: {
    backgroundColor: COLORS.accent.sage,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: COLORS.accent.sage,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: FONTS.semiBold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
