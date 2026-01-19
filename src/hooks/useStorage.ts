import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TutorialMechanic } from '../types';

const STORAGE_KEYS = {
  HIGH_SCORES: '@chromatic_valley:high_scores',
  HAS_SEEN_TUTORIAL: '@chromatic_valley:has_seen_tutorial',
  MECHANICS_SEEN: '@chromatic_valley:mechanics_seen',
} as const;

export interface HighScore {
  score: number;
  level: number;
  streak: number;
  accuracy: number;
  date: string;
  mode: 'classic' | 'zen' | 'unified';
}

export interface StoredData {
  highScores: HighScore[];
  hasSeenTutorial: boolean;
  mechanicsSeen: TutorialMechanic[];
}

const DEFAULT_DATA: StoredData = {
  highScores: [],
  hasSeenTutorial: false,
  mechanicsSeen: [],
};

export const useStorage = () => {
  const [data, setData] = useState<StoredData>(DEFAULT_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [scoresJson, tutorialSeen, mechanicsJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.HIGH_SCORES),
          AsyncStorage.getItem(STORAGE_KEYS.HAS_SEEN_TUTORIAL),
          AsyncStorage.getItem(STORAGE_KEYS.MECHANICS_SEEN),
        ]);

        setData({
          highScores: scoresJson ? JSON.parse(scoresJson) : [],
          hasSeenTutorial: tutorialSeen === 'true',
          mechanicsSeen: mechanicsJson ? JSON.parse(mechanicsJson) : [],
        });
      } catch (error) {
        console.warn('Failed to load storage data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const saveHighScore = useCallback(async (score: HighScore) => {
    try {
      const newScores = [...data.highScores, score]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // Keep top 10

      await AsyncStorage.setItem(
        STORAGE_KEYS.HIGH_SCORES,
        JSON.stringify(newScores)
      );

      setData((prev) => ({ ...prev, highScores: newScores }));
      return true;
    } catch (error) {
      console.warn('Failed to save high score:', error);
      return false;
    }
  }, [data.highScores]);

  const markTutorialSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_TUTORIAL, 'true');
      setData((prev) => ({ ...prev, hasSeenTutorial: true }));
    } catch (error) {
      console.warn('Failed to save tutorial status:', error);
    }
  }, []);

  // Check if a specific mechanic tutorial has been seen
  const hasSeenMechanic = useCallback((mechanic: TutorialMechanic): boolean => {
    return data.mechanicsSeen.includes(mechanic);
  }, [data.mechanicsSeen]);

  // Mark a mechanic tutorial as seen
  const markMechanicSeen = useCallback(async (mechanic: TutorialMechanic) => {
    if (data.mechanicsSeen.includes(mechanic)) return;

    try {
      const newMechanics = [...data.mechanicsSeen, mechanic];
      await AsyncStorage.setItem(
        STORAGE_KEYS.MECHANICS_SEEN,
        JSON.stringify(newMechanics)
      );
      setData((prev) => ({ ...prev, mechanicsSeen: newMechanics }));
    } catch (error) {
      console.warn('Failed to save mechanic seen status:', error);
    }
  }, [data.mechanicsSeen]);

  const getHighScore = useCallback((mode?: 'classic' | 'zen' | 'unified'): number => {
    const filtered = mode
      ? data.highScores.filter((s) => s.mode === mode)
      : data.highScores;
    return filtered.length > 0 ? filtered[0].score : 0;
  }, [data.highScores]);

  const isNewHighScore = useCallback((score: number, mode: 'classic' | 'zen' | 'unified'): boolean => {
    const currentHigh = getHighScore(mode);
    return score > currentHigh;
  }, [getHighScore]);

  const clearAllData = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      setData(DEFAULT_DATA);
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }, []);

  // Reset just the tutorial/mechanics seen state (for testing)
  const resetTutorials = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.HAS_SEEN_TUTORIAL,
        STORAGE_KEYS.MECHANICS_SEEN,
      ]);
      setData((prev) => ({
        ...prev,
        hasSeenTutorial: false,
        mechanicsSeen: [],
      }));
    } catch (error) {
      console.warn('Failed to reset tutorials:', error);
    }
  }, []);

  return {
    highScores: data.highScores,
    hasSeenTutorial: data.hasSeenTutorial,
    mechanicsSeen: data.mechanicsSeen,
    isLoading,
    saveHighScore,
    markTutorialSeen,
    hasSeenMechanic,
    markMechanicSeen,
    getHighScore,
    isNewHighScore,
    clearAllData,
    resetTutorials,
  };
};
