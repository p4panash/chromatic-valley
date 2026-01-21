import { useState, useCallback, useRef, useEffect } from 'react';
import { COLOR_PALETTE, GAME_CONFIG, HARMONY_CONFIG } from '../constants/theme';
import {
  generateSimilarColor,
  colorDistance,
  generateRandomVibrantColor,
  generateVibrantColorAvoidingRecent,
  getTriadicColors,
  getComplementaryColor,
  getSplitComplementary,
  getAnalogousColors,
  getTetradicColors,
  getDoubleComplementaryColors,
  getMonochromaticColors,
  hexToHSL,
  hslToHex,
  generateComplementaryDistractors,
  generateSplitCompDistractors,
  generateAnalogousDistractors,
  generateTetradicDistractors,
  generateMonochromaticDistractors,
  shuffleArray,
} from '../utils/colorUtils';
import type {
  GameState,
  FeedbackType,
  GameMode,
  UnifiedRoundState,
  ColorMatchRound,
  TriadicRound,
  ComplementaryRound,
  SplitComplementaryRound,
  AnalogousRound,
  TetradicRound,
  DoubleComplementaryRound,
  MonochromaticRound,
  HarmonyType,
  CastleProgress,
  CastleStage,
} from '../types';

// Castle score milestones
const CASTLE_MILESTONES = [500, 1500, 3000, 5000, 8000];
const CASTLE_STAGES: CastleStage[] = ['foundation', 'walls', 'tower', 'details', 'crown'];

const initialGameState: GameState = {
  level: 1,
  score: 0,
  streak: 0,
  maxStreak: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  isPlaying: false,
  processingChoice: false,
  mode: 'unified',
  wrongAnswers: 0,
  roundsSinceSwitch: 0,
  answerColors: [],
};

// Streak milestones for celebrations
export const STREAK_MILESTONES = [3, 5, 10, 15, 20, 25];

interface UseGameOptions {
  tutorialActive?: boolean;
  lifetimeScore?: number;
}

export const useGame = (options: UseGameOptions = {}) => {
  const { tutorialActive = false, lifetimeScore = 0 } = options;

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [roundState, setRoundState] = useState<UnifiedRoundState | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);
  const [currentChallengeType, setCurrentChallengeType] = useState<HarmonyType>('color-match');
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);
  const [timerPendingStart, setTimerPendingStart] = useState(false);

  // Keep lifetime score in a ref for use in callbacks
  const lifetimeScoreRef = useRef(lifetimeScore);
  useEffect(() => {
    lifetimeScoreRef.current = lifetimeScore;
  }, [lifetimeScore]);

  const tutorialActiveRef = useRef(tutorialActive);

  // Keep tutorial ref in sync
  useEffect(() => {
    tutorialActiveRef.current = tutorialActive;
  }, [tutorialActive]);

  // Refs to hold latest values and avoid stale closures
  const timerRef = useRef<number | null>(null);
  const timerActiveRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const pendingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gameStateRef = useRef<GameState>(gameState);
  const roundStateRef = useRef<UnifiedRoundState | null>(roundState);

  // Keep refs in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    roundStateRef.current = roundState;
  }, [roundState]);

  // Calculate castle progress based on score
  const getCastleProgress = useCallback((score: number): CastleProgress => {
    let stageIndex = 0;
    let percentage = 0;

    for (let i = 0; i < CASTLE_MILESTONES.length; i++) {
      if (score >= CASTLE_MILESTONES[i]) {
        stageIndex = i + 1;
      } else {
        const prevMilestone = i > 0 ? CASTLE_MILESTONES[i - 1] : 0;
        const currentMilestone = CASTLE_MILESTONES[i];
        const progressInStage = score - prevMilestone;
        const stageRange = currentMilestone - prevMilestone;
        percentage = Math.min(100, ((stageIndex * 20) + (progressInStage / stageRange) * 20));
        break;
      }
    }

    if (stageIndex >= CASTLE_STAGES.length) {
      stageIndex = CASTLE_STAGES.length - 1;
      percentage = 100;
    }

    return {
      stage: CASTLE_STAGES[Math.min(stageIndex, CASTLE_STAGES.length - 1)],
      percentage,
    };
  }, []);

  const getDifficulty = useCallback((level: number): number => {
    const { baseDifficulty, minDifficulty, difficultyReductionPerLevel } = GAME_CONFIG;
    const reduction = Math.min(level * difficultyReductionPerLevel, baseDifficulty - minDifficulty);
    return baseDifficulty - reduction;
  }, []);

  const getTimeForLevel = useCallback((level: number): number => {
    const { baseTimeMs, minTimeMs, timeReductionPerLevel } = GAME_CONFIG;
    const reduction = Math.min(level * timeReductionPerLevel, baseTimeMs - minTimeMs);
    return baseTimeMs - reduction;
  }, []);

  const generateChoices = useCallback(
    (targetHex: string, numChoices: number, variance: number): string[] => {
      const choices: string[] = [];
      const usedColors = new Set([targetHex]);
      const maxAttempts = 100;
      let attempts = 0;

      while (choices.length < numChoices - 1 && attempts < maxAttempts) {
        attempts++;
        const newColor = generateSimilarColor(targetHex, variance);

        let tooSimilar = false;
        for (const usedColor of usedColors) {
          if (colorDistance(newColor, usedColor) < GAME_CONFIG.minColorDistance) {
            tooSimilar = true;
            break;
          }
        }

        if (!tooSimilar) {
          choices.push(newColor);
          usedColors.add(newColor);
          attempts = 0;
        }
      }

      while (choices.length < numChoices - 1) {
        choices.push(generateSimilarColor(targetHex, variance * 1.5));
      }

      return choices;
    },
    []
  );

  const clearAllTimeouts = useCallback(() => {
    pendingTimeoutsRef.current.forEach((id) => clearTimeout(id));
    pendingTimeoutsRef.current = [];
  }, []);

  const scheduleTimeout = useCallback((callback: () => void, delay: number): ReturnType<typeof setTimeout> => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current = pendingTimeoutsRef.current.filter((t) => t !== id);
      callback();
    }, delay);
    pendingTimeoutsRef.current.push(id);
    return id;
  }, []);

  const stopTimer = useCallback(() => {
    timerActiveRef.current = false;
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Generate a color match round
  const generateColorMatchRound = useCallback((level: number): ColorMatchRound => {
    const targetIndex = Math.floor(Math.random() * COLOR_PALETTE.length);
    const targetColor = COLOR_PALETTE[targetIndex];
    const difficulty = getDifficulty(level);
    const wrongChoices = generateChoices(targetColor.hex, GAME_CONFIG.choiceCount, difficulty);
    const correctIndex = Math.floor(Math.random() * GAME_CONFIG.choiceCount);
    const choices = [...wrongChoices];
    choices.splice(correctIndex, 0, targetColor.hex);
    if (choices.length > GAME_CONFIG.choiceCount) {
      choices.pop();
    }

    return {
      challengeType: 'color-match',
      targetColor,
      choices,
      correctIndex,
      timeLeft: 100,
    };
  }, [getDifficulty, generateChoices]);

  // Generate a triadic round (120 degrees apart)
  const generateTriadicRound = useCallback((): TriadicRound => {
    const recentColors = gameStateRef.current.answerColors;
    const baseColor = recentColors.length > 0
      ? generateVibrantColorAvoidingRecent(recentColors, GAME_CONFIG.hueZones)
      : generateRandomVibrantColor();
    const [triad1, triad2] = getTriadicColors(baseColor);
    const missingIndex = Math.floor(Math.random() * 3);
    const wheelColors: [string, string, string] = [baseColor, triad1, triad2];
    const correctColor = wheelColors[missingIndex];

    // Generate 3 wrong choices - colors at different hue offsets
    const hsl = hexToHSL(correctColor);
    const wrongChoices: string[] = [];
    const offsets = [45, -45, 90];
    for (const offset of offsets) {
      const wrongH = (hsl.h + offset + 360) % 360;
      wrongChoices.push(hslToHex(wrongH, hsl.s, hsl.l));
    }

    // Insert correct answer at random position (4 total choices)
    const correctChoiceIndex = Math.floor(Math.random() * 4);
    const choices = [...wrongChoices];
    choices.splice(correctChoiceIndex, 0, correctColor);

    return {
      challengeType: 'triadic',
      wheelColors,
      missingIndex,
      correctColor,
      choices,
      correctChoiceIndex,
      timeLeft: 100,
    };
  }, []);

  // Generate a complementary round (180 degrees apart)
  const generateComplementaryRound = useCallback((): ComplementaryRound => {
    const recentColors = gameStateRef.current.answerColors;
    const baseColor = recentColors.length > 0
      ? generateVibrantColorAvoidingRecent(recentColors, GAME_CONFIG.hueZones)
      : generateRandomVibrantColor();
    const correctColor = getComplementaryColor(baseColor);

    // Generate 3 wrong choices near but not exactly at 180 degrees
    const wrongChoices = generateComplementaryDistractors(baseColor, 3);

    // Insert correct answer at random position
    const correctChoiceIndex = Math.floor(Math.random() * 4);
    const choices = [...wrongChoices];
    choices.splice(correctChoiceIndex, 0, correctColor);

    return {
      challengeType: 'complementary',
      baseColor,
      correctColor,
      choices,
      correctChoiceIndex,
      timeLeft: 100,
    };
  }, []);

  // Generate a split-complementary round
  const generateSplitComplementaryRound = useCallback((): SplitComplementaryRound => {
    const recentColors = gameStateRef.current.answerColors;
    const baseColor = recentColors.length > 0
      ? generateVibrantColorAvoidingRecent(recentColors, GAME_CONFIG.hueZones)
      : generateRandomVibrantColor();
    const [split1, split2] = getSplitComplementary(baseColor);

    // Randomly choose which split color to hide
    const missingPosition: 'split1' | 'split2' = Math.random() < 0.5 ? 'split1' : 'split2';
    const correctColor = missingPosition === 'split1' ? split1 : split2;
    const visibleSplitColor = missingPosition === 'split1' ? split2 : split1;

    // Generate distractors
    const wrongChoices = generateSplitCompDistractors(correctColor, visibleSplitColor, 3);

    // Insert correct answer at random position
    const correctChoiceIndex = Math.floor(Math.random() * 4);
    const choices = [...wrongChoices];
    choices.splice(correctChoiceIndex, 0, correctColor);

    return {
      challengeType: 'split-complementary',
      baseColor,
      visibleSplitColor,
      missingPosition,
      correctColor,
      choices,
      correctChoiceIndex,
      timeLeft: 100,
    };
  }, []);

  // Generate an analogous round (30 degrees apart)
  const generateAnalogousRound = useCallback((): AnalogousRound => {
    const recentColors = gameStateRef.current.answerColors;
    const centerColor = recentColors.length > 0
      ? generateVibrantColorAvoidingRecent(recentColors, GAME_CONFIG.hueZones)
      : generateRandomVibrantColor();
    const [analog1, analog2] = getAnalogousColors(centerColor, 30);

    // Show two colors, ask for the third
    // Randomly decide direction and which is missing
    const flowDirection: 'clockwise' | 'counter-clockwise' = Math.random() < 0.5 ? 'clockwise' : 'counter-clockwise';

    // In clockwise: analog2 -> center -> analog1
    // In counter-clockwise: analog1 -> center -> analog2
    let visibleColors: [string, string];
    let correctColor: string;

    if (flowDirection === 'clockwise') {
      // Show analog2 and center, ask for analog1
      visibleColors = [analog2, centerColor];
      correctColor = analog1;
    } else {
      // Show analog1 and center, ask for analog2
      visibleColors = [analog1, centerColor];
      correctColor = analog2;
    }

    // Generate subtle distractors
    const wrongChoices = generateAnalogousDistractors(correctColor, flowDirection, 3);

    // Insert correct answer at random position
    const correctChoiceIndex = Math.floor(Math.random() * 4);
    const choices = [...wrongChoices];
    choices.splice(correctChoiceIndex, 0, correctColor);

    return {
      challengeType: 'analogous',
      visibleColors,
      flowDirection,
      correctColor,
      choices,
      correctChoiceIndex,
      timeLeft: 100,
    };
  }, []);

  // Generate a tetradic/square round (90 degrees apart)
  const generateTetradicRound = useCallback((): TetradicRound => {
    const recentColors = gameStateRef.current.answerColors;
    const baseColor = recentColors.length > 0
      ? generateVibrantColorAvoidingRecent(recentColors, GAME_CONFIG.hueZones)
      : generateRandomVibrantColor();
    const [tetra1, tetra2, tetra3] = getTetradicColors(baseColor);
    const wheelColors: [string, string, string, string] = [baseColor, tetra1, tetra2, tetra3];

    // Randomly choose which to hide
    const missingIndex = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
    const correctColor = wheelColors[missingIndex];
    const visibleColors = wheelColors.filter((_, i) => i !== missingIndex);

    // Generate distractors
    const wrongChoices = generateTetradicDistractors(correctColor, visibleColors, 3);

    // Insert correct answer at random position
    const correctChoiceIndex = Math.floor(Math.random() * 4);
    const choices = [...wrongChoices];
    choices.splice(correctChoiceIndex, 0, correctColor);

    return {
      challengeType: 'tetradic',
      wheelColors,
      missingIndex,
      correctColor,
      choices,
      correctChoiceIndex,
      timeLeft: 100,
    };
  }, []);

  // Generate a double-complementary round
  const generateDoubleComplementaryRound = useCallback((): DoubleComplementaryRound => {
    const recentColors = gameStateRef.current.answerColors;
    const baseColor = recentColors.length > 0
      ? generateVibrantColorAvoidingRecent(recentColors, GAME_CONFIG.hueZones)
      : generateRandomVibrantColor();
    const [adjacent, complement1, complement2] = getDoubleComplementaryColors(baseColor);

    // All 4 colors: base, adjacent, complement1, complement2
    const allColors = [baseColor, adjacent, complement1, complement2];

    // Randomly choose which to hide
    const missingPosition = Math.floor(Math.random() * 4) as 0 | 1 | 2 | 3;
    const correctColor = allColors[missingPosition];
    const visibleColors = allColors.filter((_, i) => i !== missingPosition) as [string, string, string];

    // Generate distractors
    const wrongChoices = generateTetradicDistractors(correctColor, visibleColors, 3);

    // Insert correct answer at random position
    const correctChoiceIndex = Math.floor(Math.random() * 4);
    const choices = [...wrongChoices];
    choices.splice(correctChoiceIndex, 0, correctColor);

    return {
      challengeType: 'double-complementary',
      visibleColors,
      missingPosition,
      correctColor,
      choices,
      correctChoiceIndex,
      timeLeft: 100,
    };
  }, []);

  // Generate a monochromatic round (same hue, different S/L)
  const generateMonochromaticRound = useCallback((): MonochromaticRound => {
    const recentColors = gameStateRef.current.answerColors;
    const baseColor = recentColors.length > 0
      ? generateVibrantColorAvoidingRecent(recentColors, GAME_CONFIG.hueZones)
      : generateRandomVibrantColor();
    const baseHsl = hexToHSL(baseColor);
    const baseHue = baseHsl.h;

    const [lighter, darker] = getMonochromaticColors(baseColor);

    // All 3 shades: lighter, base, darker
    const allShades = [lighter, baseColor, darker];

    // Randomly choose which to hide
    const missingIndex = Math.floor(Math.random() * 3);
    const correctColor = allShades[missingIndex];
    const visibleShades = allShades.filter((_, i) => i !== missingIndex) as [string, string];

    // Generate distractors - same hue, different S/L
    const wrongChoices = generateMonochromaticDistractors(correctColor, baseHue, 3);

    // Insert correct answer at random position
    const correctChoiceIndex = Math.floor(Math.random() * 4);
    const choices = [...wrongChoices];
    choices.splice(correctChoiceIndex, 0, correctColor);

    return {
      challengeType: 'monochromatic',
      baseHue,
      visibleShades,
      correctColor,
      choices,
      correctChoiceIndex,
      timeLeft: 100,
    };
  }, []);

  // Get unlocked harmonies based on lifetime score
  const getUnlockedHarmonies = useCallback((score: number) => {
    return HARMONY_CONFIG.filter((h) => h.unlockThreshold <= score);
  }, []);

  // Select next harmony type using weighted random selection
  const selectNextHarmony = useCallback((): HarmonyType => {
    const currentLifetimeScore = lifetimeScoreRef.current;
    const unlockedHarmonies = getUnlockedHarmonies(currentLifetimeScore);

    // Calculate total weight of unlocked harmonies
    const totalWeight = unlockedHarmonies.reduce((sum, h) => sum + h.weight, 0);

    // Weighted random selection
    let random = Math.random() * totalWeight;
    for (const harmony of unlockedHarmonies) {
      random -= harmony.weight;
      if (random <= 0) {
        return harmony.type;
      }
    }

    // Fallback to color-match
    return 'color-match';
  }, [getUnlockedHarmonies]);

  // Decide which challenge type to use next
  const getNextChallengeType = useCallback((currentType: HarmonyType, roundsSinceSwitch: number): HarmonyType => {
    // Switch challenge type every 3-5 rounds
    const switchThreshold = 3 + Math.floor(Math.random() * 3);
    if (roundsSinceSwitch >= switchThreshold) {
      // Select a new harmony type (can be the same, but weighted selection gives variety)
      return selectNextHarmony();
    }
    return currentType;
  }, [selectNextHarmony]);

  // Refs for circular dependency avoidance
  const nextRoundRef = useRef<() => void>(() => {});
  const handleTimeoutRef = useRef<() => void>(() => {});

  // Internal function to start the timer (defined before nextRound to avoid stale closure)
  const startTimerInternal = useCallback((level: number) => {
    const totalTime = getTimeForLevel(level);
    startTimeRef.current = performance.now();
    timerActiveRef.current = true;

    const tick = (currentTime: number) => {
      if (!timerRef.current || !timerActiveRef.current) return;

      // Pause if tutorial is active
      if (tutorialActiveRef.current) {
        timerRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = currentTime - startTimeRef.current;
      const remaining = Math.max(0, totalTime - elapsed);
      const timeLeft = (remaining / totalTime) * 100;

      setRoundState((prev) => {
        if (prev) {
          return { ...prev, timeLeft };
        }
        return prev;
      });

      if (remaining <= 0) {
        if (timerActiveRef.current) {
          timerActiveRef.current = false;
          handleTimeoutRef.current();
        }
      } else if (timerActiveRef.current) {
        timerRef.current = requestAnimationFrame(tick);
      }
    };

    timerRef.current = requestAnimationFrame(tick);
  }, [getTimeForLevel]);

  // Generate a round based on the harmony type
  const generateRoundForHarmony = useCallback((harmonyType: HarmonyType, level: number): UnifiedRoundState => {
    switch (harmonyType) {
      case 'color-match':
        return generateColorMatchRound(level);
      case 'triadic':
        return generateTriadicRound();
      case 'complementary':
        return generateComplementaryRound();
      case 'split-complementary':
        return generateSplitComplementaryRound();
      case 'analogous':
        return generateAnalogousRound();
      case 'tetradic':
        return generateTetradicRound();
      case 'double-complementary':
        return generateDoubleComplementaryRound();
      case 'monochromatic':
        return generateMonochromaticRound();
      default:
        return generateColorMatchRound(level);
    }
  }, [
    generateColorMatchRound,
    generateTriadicRound,
    generateComplementaryRound,
    generateSplitComplementaryRound,
    generateAnalogousRound,
    generateTetradicRound,
    generateDoubleComplementaryRound,
    generateMonochromaticRound,
  ]);

  const nextRound = useCallback(() => {
    setGameState((prev) => ({ ...prev, processingChoice: false }));

    const currentState = gameStateRef.current;
    const isZenMode = currentState.mode === 'zen';
    const isUnifiedMode = currentState.mode === 'unified';

    // Determine challenge type for unified and zen modes (both get variety)
    let harmonyType: HarmonyType = 'color-match';
    if (isUnifiedMode || isZenMode) {
      harmonyType = getNextChallengeType(currentChallengeType, currentState.roundsSinceSwitch);
      if (harmonyType !== currentChallengeType) {
        setCurrentChallengeType(harmonyType);
        setGameState((prev) => ({ ...prev, roundsSinceSwitch: 0 }));
      } else {
        setGameState((prev) => ({ ...prev, roundsSinceSwitch: prev.roundsSinceSwitch + 1 }));
      }
    }

    // Generate appropriate round
    const newRound = generateRoundForHarmony(harmonyType, currentState.level);
    setRoundState(newRound);

    // Timer for all challenge types in non-zen modes
    if (!isZenMode) {
      // If tutorial is active, wait to start timer
      if (tutorialActiveRef.current) {
        setTimerPendingStart(true);
      } else {
        startTimerInternal(currentState.level);
      }
    }
  }, [currentChallengeType, generateRoundForHarmony, getNextChallengeType, startTimerInternal]);

  // Start timer when tutorial becomes inactive and timer is pending
  useEffect(() => {
    if (!tutorialActive && timerPendingStart && roundState) {
      setTimerPendingStart(false);
      startTimerInternal(gameStateRef.current.level);
    }
  }, [tutorialActive, timerPendingStart, roundState, startTimerInternal]);

  // Reset timer start time when tutorial becomes inactive (to not count tutorial time)
  useEffect(() => {
    if (!tutorialActive && timerActiveRef.current) {
      startTimeRef.current = performance.now();
    }
  }, [tutorialActive]);

  // Keep nextRoundRef updated
  useEffect(() => {
    nextRoundRef.current = nextRound;
  }, [nextRound]);

  const handleTimeout = useCallback(() => {
    stopTimer();

    setGameState((prev) => {
      const newWrongAnswers = prev.wrongAnswers + 1;
      const newState = {
        ...prev,
        totalAnswers: prev.totalAnswers + 1,
        streak: 0,
        wrongAnswers: newWrongAnswers,
      };

      if (newWrongAnswers >= GAME_CONFIG.maxWrongAnswers) {
        scheduleTimeout(() => {
          setGameState((p) => ({ ...p, isPlaying: false }));
        }, GAME_CONFIG.wrongAnswerDelayMs);
      } else {
        scheduleTimeout(() => nextRoundRef.current(), GAME_CONFIG.wrongAnswerDelayMs);
      }

      return newState;
    });

    setFeedback('timeout');
    scheduleTimeout(() => setFeedback(null), GAME_CONFIG.wrongAnswerDelayMs);
  }, [stopTimer, scheduleTimeout]);

  // Keep handleTimeoutRef updated
  useEffect(() => {
    handleTimeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  // Unified choice handler that works with both challenge types
  const handleChoice = useCallback(
    (selectedValue: string | number) => {
      const currentGameState = gameStateRef.current;
      const currentRoundState = roundStateRef.current;

      if (!currentGameState.isPlaying || currentGameState.processingChoice || !currentRoundState) {
        return;
      }

      setGameState((prev) => ({ ...prev, processingChoice: true }));
      stopTimer();

      let isCorrect = false;

      if (currentRoundState.challengeType === 'color-match') {
        // Color match: selectedValue is a hex string
        const selectedHex = selectedValue as string;
        isCorrect = selectedHex.toUpperCase() === currentRoundState.targetColor.hex.toUpperCase();
      } else {
        // Color wheel: selectedValue is an index
        const selectedIndex = selectedValue as number;
        isCorrect = selectedIndex === currentRoundState.correctChoiceIndex;
      }

      if (isCorrect) {
        const { basePoints, streakBonusMultiplier, timeBonusMultiplier, levelBonusMultiplier } =
          GAME_CONFIG;
        const newStreak = currentGameState.streak + 1;
        const streakBonus = newStreak * streakBonusMultiplier;

        // Time bonus only for color-match challenges
        let timeBonus = 0;
        if (currentRoundState.challengeType === 'color-match') {
          timeBonus = Math.floor(currentRoundState.timeLeft * timeBonusMultiplier);
        }

        const levelBonus = currentGameState.level * levelBonusMultiplier;
        const points = basePoints + streakBonus + timeBonus + levelBonus;

        // Check for streak milestone
        if (STREAK_MILESTONES.includes(newStreak)) {
          setStreakMilestone(newStreak);
          scheduleTimeout(() => setStreakMilestone(null), 1500);
        }

        // Extract the correct answer color for castle windows
        const answerColor = currentRoundState.challengeType === 'color-match'
          ? currentRoundState.targetColor.hex
          : currentRoundState.correctColor;

        setGameState((prev) => ({
          ...prev,
          score: prev.score + points,
          streak: newStreak,
          maxStreak: Math.max(prev.maxStreak, newStreak),
          correctAnswers: prev.correctAnswers + 1,
          totalAnswers: prev.totalAnswers + 1,
          level: prev.level + 1,
          answerColors: [...prev.answerColors, answerColor].slice(-10), // Keep last 10 colors
        }));

        setFeedback('correct');
        scheduleTimeout(() => setFeedback(null), GAME_CONFIG.feedbackDurationMs);
        scheduleTimeout(() => nextRoundRef.current(), GAME_CONFIG.roundTransitionMs);
      } else {
        const isZenMode = currentGameState.mode === 'zen';

        setGameState((prev) => {
          const newWrongAnswers = prev.wrongAnswers + 1;
          const newState = {
            ...prev,
            streak: 0,
            totalAnswers: prev.totalAnswers + 1,
            wrongAnswers: newWrongAnswers,
          };

          if (!isZenMode && newWrongAnswers >= GAME_CONFIG.maxWrongAnswers) {
            scheduleTimeout(() => {
              setGameState((p) => ({ ...p, isPlaying: false }));
            }, GAME_CONFIG.wrongAnswerDelayMs);
          } else {
            scheduleTimeout(() => nextRoundRef.current(), GAME_CONFIG.wrongAnswerDelayMs);
          }

          return newState;
        });

        setFeedback('incorrect');
        scheduleTimeout(() => setFeedback(null), GAME_CONFIG.wrongAnswerDelayMs);
      }
    },
    [stopTimer, scheduleTimeout]
  );

  const startGame = useCallback((mode: GameMode = 'unified') => {
    clearAllTimeouts();
    stopTimer();
    setGameState({ ...initialGameState, isPlaying: true, mode });
    setRoundState(null);
    setFeedback(null);
    setCurrentChallengeType('color-match');
    setStreakMilestone(null);
  }, [clearAllTimeouts, stopTimer]);

  const resetGame = useCallback(() => {
    clearAllTimeouts();
    stopTimer();
    setGameState(initialGameState);
    setRoundState(null);
    setFeedback(null);
    setCurrentChallengeType('color-match');
    setStreakMilestone(null);
  }, [clearAllTimeouts, stopTimer]);

  // Start first round when game begins
  useEffect(() => {
    if (gameState.isPlaying && !roundState) {
      nextRound();
    }
  }, [gameState.isPlaying, roundState, nextRound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
      stopTimer();
    };
  }, [clearAllTimeouts, stopTimer]);

  const castleProgress = getCastleProgress(gameState.score);

  return {
    gameState,
    roundState,
    feedback,
    startGame,
    resetGame,
    handleChoice,
    castleProgress,
    streakMilestone,
    currentChallengeType,
  };
};
