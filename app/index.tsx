import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { StartScreen, GameScreen, ResultScreen } from '../src/screens';
import { ContextualTutorial, StreakCelebration } from '../src/components';
import { useGame, useHaptics, useStorage } from '../src/hooks';
import { SoundProvider, useSoundContext } from '../src/contexts';
import type { GameScreen as GameScreenType, TutorialMechanic } from '../src/types';

function GameApp() {
  const [currentScreen, setCurrentScreen] = useState<GameScreenType>('start');
  const [activeTutorial, setActiveTutorial] = useState<TutorialMechanic | null>(null);

  const {
    gameState,
    roundState,
    feedback,
    startGame,
    handleChoice,
    castleProgress,
    streakMilestone,
    currentChallengeType,
  } = useGame({ tutorialActive: activeTutorial !== null });
  const haptics = useHaptics();
  const storage = useStorage();
  const { playSound, startBgm } = useSoundContext();

  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [previousHighScore, setPreviousHighScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
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

  // Handle streak celebrations
  useEffect(() => {
    if (streakMilestone && streakMilestone !== lastStreakMilestoneRef.current) {
      lastStreakMilestoneRef.current = streakMilestone;
      setShowCelebration(true);
      playSound('streak');
    }
  }, [streakMilestone, playSound]);

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
      // Color match tutorial - first time seeing this challenge type
      if (roundState.challengeType === 'color-match' && shouldShowTutorial('color-match')) {
        triggerTutorial('color-match');
        return;
      }

      // Color wheel tutorial - first time seeing this challenge type
      if (roundState.challengeType === 'color-wheel' && shouldShowTutorial('color-wheel')) {
        triggerTutorial('color-wheel');
        return;
      }

      // Game Rules tutorial (timer + lives combined) - show on first game after seeing color-match (non-zen)
      if (
        gameState.mode !== 'zen' &&
        storage.hasSeenMechanic('color-match') &&
        shouldShowTutorial('timer')
      ) {
        triggerTutorial('timer');
        return;
      }

      // Streak tutorial (includes castle info) - show after first correct answer
      if (gameState.streak === 1 && shouldShowTutorial('streak')) {
        triggerTutorial('streak');
        return;
      }
    };

    // Show tutorial immediately when round is ready
    checkAndShowTutorial();
  }, [
    activeTutorial,
    gameState.isPlaying,
    gameState.mode,
    gameState.streak,
    roundState,
    currentScreen,
    storage,
  ]);

  const handleDismissTutorial = useCallback(() => {
    if (activeTutorial) {
      storage.markMechanicSeen(activeTutorial);
      // Mark related mechanics as seen for consolidated tutorials
      if (activeTutorial === 'timer') {
        storage.markMechanicSeen('lives');
      }
      if (activeTutorial === 'streak') {
        storage.markMechanicSeen('castle-building');
      }
      setActiveTutorial(null);
    }
  }, [activeTutorial, storage]);

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

  const handleExitGame = useCallback(() => {
    haptics.triggerLight();
    playSound('tap');
    setCurrentScreen('start');
    triggeredTutorialsRef.current.clear();
  }, [haptics, playSound]);

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
        if (isNewRecord && !scoreSavedRef.current) {
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
            castleProgress={castleProgress}
            onChoice={handleChoice}
            onExit={handleExitGame}
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
            isNewHighScore={isNewHighScore}
            previousHighScore={previousHighScore}
            castleProgress={castleProgress}
          />
        </Animated.View>
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
