import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { StartScreen, GameScreen, ResultScreen, ScoreHistoryScreen, StatsScreen } from '../src/screens';
import { ContextualTutorial, StreakCelebration, HarmonyUnlockBanner, HarmonyIntroduction } from '../src/components';
import { useGame, useHaptics, useStorage } from '../src/hooks';
import { HARMONY_CONFIG } from '../src/constants/theme';
import { SoundProvider, useSoundContext } from '../src/contexts';
import type { GameScreen as GameScreenType, TutorialMechanic } from '../src/types';

function GameApp() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('start');
  const [activeTutorial, setActiveTutorial] = useState<TutorialMechanic | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [previousHighScore, setPreviousHighScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showHarmonyBanner, setShowHarmonyBanner] = useState(false);
  const [harmonyToIntroduce, setHarmonyToIntroduce] = useState<typeof HARMONY_CONFIG[number] | null>(null);
  const [showHarmonyIntro, setShowHarmonyIntro] = useState(false);
  const [appKey, setAppKey] = useState(0); // Used to force refresh after data reset

  const haptics = useHaptics();
  const storage = useStorage();
  const { playSound, startBgm } = useSoundContext();

  const {
    gameState,
    roundState,
    feedback,
    startGame,
    handleChoice,
    streakMilestone,
    currentChallengeType,
    newlyUnlockedHarmony,
    clearNewlyUnlockedHarmony,
  } = useGame({
    tutorialActive: activeTutorial !== null || showHarmonyIntro,
    lifetimeScore: storage.lifetimeScore,
  });
  const scoreSavedRef = useRef(false);
  const lastStreakMilestoneRef = useRef<number | null>(null);
  const triggeredTutorialsRef = useRef<Set<TutorialMechanic>>(new Set());

  // Try to start BGM on app load (works on most devices)
  // Don't set the flag here - let user interaction be the reliable trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      startBgm();
    }, 800);
    return () => clearTimeout(timer);
  }, [startBgm]);

  // Ensure BGM plays on user interaction (reliable fallback for all devices)
  const ensureBgmPlaying = useCallback(() => {
    startBgm();
  }, [startBgm]);

  // Handle streak celebrations with delay to match feedback timing
  useEffect(() => {
    if (streakMilestone && streakMilestone !== lastStreakMilestoneRef.current) {
      lastStreakMilestoneRef.current = streakMilestone;
      // Add delay before showing celebration (same timing as Perfect banner)
      const timer = setTimeout(() => {
        setShowCelebration(true);
        playSound('streak');
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [streakMilestone, playSound]);

  // Handle harmony unlock notifications (via score threshold) - show banner + intro
  useEffect(() => {
    if (newlyUnlockedHarmony && !showHarmonyBanner && !showHarmonyIntro && !harmonyToIntroduce) {
      setHarmonyToIntroduce(newlyUnlockedHarmony);
      setShowHarmonyBanner(true);
    }
  }, [newlyUnlockedHarmony, showHarmonyBanner, showHarmonyIntro, harmonyToIntroduce]);

  // Show intro on first encounter of any harmony type (no banner for already-unlocked harmonies)
  // This runs after game-rules or zen-rules tutorial is dismissed
  useEffect(() => {
    if (
      gameState.isPlaying &&
      currentScreen === 'game' &&
      !storage.isLoading &&
      activeTutorial === null &&
      !showHarmonyBanner &&
      !showHarmonyIntro &&
      !harmonyToIntroduce &&
      roundState
    ) {
      // Check if game-rules (or zen-rules for zen mode) has been seen first
      const rulesSeenKey = gameState.mode === 'zen' ? 'zen-rules' : 'game-rules';
      if (!storage.hasSeenMechanic(rulesSeenKey)) {
        return; // Wait for rules tutorial to be seen first
      }

      // Check if current challenge type has been seen
      const currentChallengeType = roundState.challengeType;
      if (!storage.hasSeenMechanic(currentChallengeType as TutorialMechanic)) {
        // Show intro for this harmony type (no banner - it's already unlocked)
        const harmony = HARMONY_CONFIG.find(h => h.type === currentChallengeType);
        if (harmony) {
          setHarmonyToIntroduce(harmony);
          setShowHarmonyIntro(true); // Show intro directly, no banner
        }
      }
    }
  }, [
    gameState.isPlaying,
    gameState.mode,
    currentScreen,
    storage,
    activeTutorial,
    showHarmonyBanner,
    showHarmonyIntro,
    harmonyToIntroduce,
    roundState,
  ]);

  // Show intro after banner has been visible for a moment (for newly unlocked harmonies)
  // This is separate to avoid cleanup race conditions
  useEffect(() => {
    if (showHarmonyBanner && harmonyToIntroduce && !showHarmonyIntro) {
      const introTimer = setTimeout(() => {
        setShowHarmonyIntro(true);
      }, 800);
      return () => clearTimeout(introTimer);
    }
  }, [showHarmonyBanner, harmonyToIntroduce, showHarmonyIntro]);

  const handleHarmonyIntroComplete = useCallback(() => {
    // Hide both banner and intro together
    setShowHarmonyBanner(false);
    setShowHarmonyIntro(false);
    if (harmonyToIntroduce) {
      storage.markMechanicSeen(harmonyToIntroduce.type as TutorialMechanic);
    }
    setHarmonyToIntroduce(null);
    clearNewlyUnlockedHarmony();
  }, [harmonyToIntroduce, storage, clearNewlyUnlockedHarmony]);

  // Play sounds on feedback
  useEffect(() => {
    if (feedback === 'correct') {
      playSound('correct');
    } else if (feedback === 'incorrect' || feedback === 'timeout') {
      playSound('incorrect');
    }
  }, [feedback, playSound]);

  // Play sound on level up
  const prevLevelRef = useRef(gameState.level);
  useEffect(() => {
    if (gameState.level > prevLevelRef.current && gameState.isPlaying) {
      playSound('levelUp');
    }
    prevLevelRef.current = gameState.level;
  }, [gameState.level, gameState.isPlaying, playSound]);

  // Track discovered colors from gameplay
  const lastRoundIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!roundState || !gameState.isPlaying || gameState.mode === 'zen') return;

    // Create a unique ID for this round to avoid duplicate saves
    const roundId = `${roundState.challengeType}-${JSON.stringify(roundState.choices)}`;
    if (roundId === lastRoundIdRef.current) return;
    lastRoundIdRef.current = roundId;

    // Extract colors based on challenge type
    const colorsToSave: string[] = [];
    const challengeType = roundState.challengeType;

    switch (challengeType) {
      case 'color-match':
        if ('targetColor' in roundState) {
          colorsToSave.push(roundState.targetColor.hex);
        }
        break;
      case 'triadic':
        if ('wheelColors' in roundState) {
          colorsToSave.push(...roundState.wheelColors);
        }
        break;
      case 'complementary':
        if ('baseColor' in roundState && 'correctColor' in roundState) {
          colorsToSave.push(roundState.baseColor, roundState.correctColor);
        }
        break;
      case 'split-complementary':
        if ('baseColor' in roundState && 'visibleSplitColor' in roundState && 'correctColor' in roundState) {
          colorsToSave.push(roundState.baseColor, roundState.visibleSplitColor, roundState.correctColor);
        }
        break;
      case 'analogous':
        if ('visibleColors' in roundState && 'correctColor' in roundState) {
          colorsToSave.push(...roundState.visibleColors, roundState.correctColor);
        }
        break;
      case 'tetradic':
        if ('wheelColors' in roundState) {
          colorsToSave.push(...roundState.wheelColors);
        }
        break;
      case 'double-complementary':
        if ('visibleColors' in roundState && 'correctColor' in roundState) {
          colorsToSave.push(...roundState.visibleColors, roundState.correctColor);
        }
        break;
      case 'monochromatic':
        if ('visibleShades' in roundState && 'correctColor' in roundState) {
          colorsToSave.push(...roundState.visibleShades, roundState.correctColor);
        }
        break;
    }

    if (colorsToSave.length > 0) {
      storage.addDiscoveredColors(challengeType, colorsToSave);
    }
  }, [roundState, gameState.isPlaying, gameState.mode, storage]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    lastStreakMilestoneRef.current = null;
  }, []);

  // Handle contextual tutorials - show on first load of each mechanic
  useEffect(() => {
    // Don't show tutorial if one is already active
    if (activeTutorial !== null) return;
    if (!gameState.isPlaying || currentScreen !== 'game' || storage.isLoading || !roundState) return;

    // Helper to check if tutorial should show (not seen in storage AND not already triggered this session)
    const shouldShowTutorial = (mechanic: TutorialMechanic): boolean => {
      return !storage.hasSeenMechanic(mechanic) && !triggeredTutorialsRef.current.has(mechanic);
    };

    // Helper to trigger a tutorial
    const triggerTutorial = (mechanic: TutorialMechanic) => {
      triggeredTutorialsRef.current.add(mechanic);
      setActiveTutorial(mechanic);
    };

    // Check for first encounter of mechanics - prioritize in order
    const checkAndShowTutorial = () => {
      // 1. Game rules first (non-zen only)
      if (gameState.mode !== 'zen' && shouldShowTutorial('game-rules')) {
        triggerTutorial('game-rules');
        return;
      }

      // 1b. Zen rules first (zen only)
      if (gameState.mode === 'zen' && shouldShowTutorial('zen-rules')) {
        triggerTutorial('zen-rules');
        return;
      }

      // 2. Info overview after first correct (non-zen only)
      if (gameState.mode !== 'zen' && gameState.correctAnswers === 1 && shouldShowTutorial('info-overview')) {
        triggerTutorial('info-overview');
        return;
      }

      // Harmony introductions are handled separately via HarmonyUnlockBanner/HarmonyIntroduction
      // The legacy harmony tutorials (color-match, triadic, etc.) are no longer triggered here
      // They are now shown through the new harmony unlock flow
    };

    // Show tutorial immediately when round is ready
    checkAndShowTutorial();
  }, [
    activeTutorial,
    gameState.isPlaying,
    gameState.mode,
    gameState.correctAnswers,
    roundState,
    currentScreen,
    storage,
  ]);

  const handleDismissTutorial = useCallback(() => {
    if (activeTutorial) {
      const wasRulesTutorial = activeTutorial === 'game-rules' || activeTutorial === 'zen-rules';

      storage.markMechanicSeen(activeTutorial);
      // Mark related mechanics as seen for consolidated tutorials
      if (activeTutorial === 'timer' || activeTutorial === 'game-rules') {
        storage.markMechanicSeen('lives');
      }
      setActiveTutorial(null);

      // After dismissing rules tutorial, show first harmony intro if not seen
      if (wasRulesTutorial && roundState && !storage.hasSeenMechanic(roundState.challengeType as TutorialMechanic)) {
        const harmony = HARMONY_CONFIG.find(h => h.type === roundState.challengeType);
        if (harmony) {
          // Small delay to let the tutorial animation finish
          setTimeout(() => {
            setHarmonyToIntroduce(harmony);
            setShowHarmonyIntro(true);
          }, 300);
        }
      }
    }
  }, [activeTutorial, storage, roundState]);

  const handleStart = useCallback(() => {
    haptics.triggerMedium();
    playSound('tap');
    ensureBgmPlaying();
    scoreSavedRef.current = false;
    startGame('unified');
    setCurrentScreen('game');
    lastStreakMilestoneRef.current = null;
  }, [startGame, haptics, playSound, ensureBgmPlaying]);

  const handleStartZen = useCallback(() => {
    haptics.triggerMedium();
    playSound('tap');
    ensureBgmPlaying();
    scoreSavedRef.current = false;
    startGame('zen');
    setCurrentScreen('game');
    lastStreakMilestoneRef.current = null;
  }, [startGame, haptics, playSound, ensureBgmPlaying]);

  const handleRestart = useCallback(() => {
    haptics.triggerMedium();
    playSound('tap');
    ensureBgmPlaying();
    scoreSavedRef.current = false;
    startGame(gameState.mode);
    setCurrentScreen('game');
    lastStreakMilestoneRef.current = null;
  }, [startGame, haptics, gameState.mode, playSound, ensureBgmPlaying]);

  const handleHome = useCallback(() => {
    haptics.triggerLight();
    playSound('tap');
    setCurrentScreen('start');
    triggeredTutorialsRef.current.clear();
  }, [haptics, playSound]);

  const handleExitGame = useCallback(async () => {
    haptics.triggerLight();
    playSound('tap');

    // Save score to history if player has made any progress
    if (gameState.totalAnswers > 0 && gameState.score > 0 && !scoreSavedRef.current) {
      scoreSavedRef.current = true;
      const accuracy = Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100);

      await storage.saveHighScore({
        score: gameState.score,
        level: gameState.level,
        streak: gameState.maxStreak,
        accuracy,
        date: new Date().toISOString(),
        mode: gameState.mode,
      });
    }

    setCurrentScreen('start');
    triggeredTutorialsRef.current.clear();
  }, [haptics, playSound, gameState, storage]);

  const handleShowHistory = useCallback(() => {
    haptics.triggerLight();
    playSound('tap');
    setShowHistory(true);
  }, [haptics, playSound]);

  const handleCloseHistory = useCallback(() => {
    setShowHistory(false);
  }, []);

  const handleShowStats = useCallback(() => {
    haptics.triggerLight();
    playSound('tap');
    setShowStats(true);
  }, [haptics, playSound]);

  const handleCloseStats = useCallback(() => {
    setShowStats(false);
  }, []);

  const handleResetData = useCallback(async () => {
    await storage.clearAllData();
    // Reset all UI state
    setCurrentScreen('start');
    setActiveTutorial(null);
    setShowHistory(false);
    setShowStats(false);
    setShowCelebration(false);
    setShowHarmonyBanner(false);
    setHarmonyToIntroduce(null);
    setShowHarmonyIntro(false);
    triggeredTutorialsRef.current.clear();
    // Force re-render to pick up cleared storage data
    setAppKey(prev => prev + 1);
  }, [storage]);

  const handleSetLifetimeScore = useCallback(async (score: number) => {
    await storage.setLifetimeScore(score);
    // Also reset harmony tutorials so intros show again when testing
    await storage.resetHarmonyTutorials();
  }, [storage]);

  // Check if game has ended and save high score
  useEffect(() => {
    if (!gameState.isPlaying && gameState.totalAnswers > 0 && currentScreen === 'game') {
      const mode = gameState.mode;
      const currentHighScore = storage.getHighScore(mode);
      const isNewRecord = storage.isNewHighScore(gameState.score, mode);

      setPreviousHighScore(currentHighScore);
      setIsNewHighScore(isNewRecord);
      scoreSavedRef.current = false;

      // Play game over sound
      playSound('gameOver');

      const timer = setTimeout(async () => {
        // Always save score to history (storage keeps top 10)
        if (gameState.score > 0 && !scoreSavedRef.current) {
          scoreSavedRef.current = true;
          const accuracy = gameState.totalAnswers > 0
            ? Math.round((gameState.correctAnswers / gameState.totalAnswers) * 100)
            : 0;

          await storage.saveHighScore({
            score: gameState.score,
            level: gameState.level,
            streak: gameState.maxStreak,
            accuracy,
            date: new Date().toISOString(),
            mode,
          });

          // Add to lifetime score only in Play mode (not Zen)
          if (mode === 'unified') {
            await storage.addToLifetimeScore(gameState.score);
          }
        }
        setCurrentScreen('result');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.isPlaying, gameState.totalAnswers, gameState.score, gameState.mode, currentScreen, storage, playSound]);

  return (
    <>
      {currentScreen === 'start' && (
        <Animated.View
          style={styles.screen}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(300)}
        >
          <StartScreen
            onStart={handleStart}
            onStartZen={handleStartZen}
            onHistory={handleShowHistory}
            onStats={handleShowStats}
            lifetimeScore={storage.lifetimeScore}
            onResetData={handleResetData}
            onSetLifetimeScore={handleSetLifetimeScore}
          />
        </Animated.View>
      )}

      {currentScreen === 'game' && (
        <Animated.View
          style={styles.screen}
          entering={SlideInRight.duration(400)}
          exiting={SlideOutLeft.duration(300)}
        >
          <GameScreen
            gameState={gameState}
            roundState={roundState}
            feedback={feedback}
            onChoice={handleChoice}
            onExit={handleExitGame}
            lifetimeScore={storage.lifetimeScore}
          />

          {/* Contextual Tutorial Overlay */}
          {activeTutorial && (
            <ContextualTutorial
              mechanic={activeTutorial}
              onDismiss={handleDismissTutorial}
            />
          )}

          {/* Streak Celebration Overlay */}
          {showCelebration && streakMilestone && (
            <StreakCelebration
              streak={streakMilestone}
              onComplete={handleCelebrationComplete}
            />
          )}

          {/* Harmony Unlock Banner */}
          {showHarmonyBanner && harmonyToIntroduce && (
            <HarmonyUnlockBanner
              harmony={harmonyToIntroduce}
            />
          )}

          {/* Harmony Introduction Modal */}
          {showHarmonyIntro && harmonyToIntroduce && (
            <HarmonyIntroduction
              harmony={harmonyToIntroduce}
              onDismiss={handleHarmonyIntroComplete}
              isFirstHarmony={harmonyToIntroduce.type === 'color-match'}
            />
          )}
        </Animated.View>
      )}

      {currentScreen === 'result' && (
        <Animated.View
          style={styles.screen}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(300)}
        >
          <ResultScreen
            gameState={gameState}
            onRestart={handleRestart}
            onHome={handleHome}
            onHistory={handleShowHistory}
            isNewHighScore={isNewHighScore}
            previousHighScore={previousHighScore}
            lifetimeScore={storage.lifetimeScore}
          />
        </Animated.View>
      )}

      {/* Score History Modal */}
      {showHistory && (
        <ScoreHistoryScreen
          highScores={storage.highScores}
          onClose={handleCloseHistory}
          lifetimeScore={storage.lifetimeScore}
        />
      )}

      {/* Stats Modal */}
      {showStats && (
        <StatsScreen
          onClose={handleCloseStats}
          lifetimeScore={storage.lifetimeScore}
          discoveredColors={storage.discoveredColors}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <SoundProvider>
      <GameApp />
    </SoundProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
  },
});
