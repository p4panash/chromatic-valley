/**
 * Unit tests for game logic
 * Tests scoring, difficulty progression, game state transitions
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { GAME_CONFIG, COLOR_PALETTE } from '../constants/theme';
import { useGame } from '../hooks/useGame';
import { resetMockTime, advanceTime } from './setup';
import type { ColorMatchRound } from '../types';

// Helper to check if round is a color-match round
const isColorMatchRound = (round: unknown): round is ColorMatchRound => {
  return (round as ColorMatchRound)?.challengeType === 'color-match';
};

describe('Game Configuration Validation', () => {
  it('has valid game configuration values', () => {
    expect(GAME_CONFIG.baseTimeMs).toBeGreaterThan(GAME_CONFIG.minTimeMs);
    expect(GAME_CONFIG.baseDifficulty).toBeGreaterThan(GAME_CONFIG.minDifficulty);
    expect(GAME_CONFIG.maxWrongAnswers).toBeGreaterThan(0);
    expect(GAME_CONFIG.choiceCount).toBeGreaterThanOrEqual(2);
    expect(GAME_CONFIG.minColorDistance).toBeGreaterThan(0);
  });

  it('has valid color palette', () => {
    expect(COLOR_PALETTE.length).toBeGreaterThan(0);
    COLOR_PALETTE.forEach((color) => {
      expect(color.hex).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color.name).toBeTruthy();
    });
  });
});

describe('Scoring System', () => {
  const calculateExpectedScore = (
    level: number,
    streak: number,
    timeLeft: number
  ): number => {
    const { basePoints, streakBonusMultiplier, timeBonusMultiplier, levelBonusMultiplier } =
      GAME_CONFIG;
    const streakBonus = (streak + 1) * streakBonusMultiplier;
    const timeBonus = Math.floor(timeLeft * timeBonusMultiplier);
    const levelBonus = level * levelBonusMultiplier;
    return basePoints + streakBonus + timeBonus + levelBonus;
  };

  it('calculates base score correctly', () => {
    const score = calculateExpectedScore(1, 0, 0);
    const expected = GAME_CONFIG.basePoints +
      1 * GAME_CONFIG.streakBonusMultiplier +
      0 +
      1 * GAME_CONFIG.levelBonusMultiplier;
    expect(score).toBe(expected);
  });

  it('increases score with streak', () => {
    const scoreStreak0 = calculateExpectedScore(1, 0, 50);
    const scoreStreak5 = calculateExpectedScore(1, 5, 50);
    expect(scoreStreak5).toBeGreaterThan(scoreStreak0);
  });

  it('increases score with time remaining', () => {
    const scoreLowTime = calculateExpectedScore(1, 0, 10);
    const scoreHighTime = calculateExpectedScore(1, 0, 90);
    expect(scoreHighTime).toBeGreaterThan(scoreLowTime);
  });

  it('increases score with level', () => {
    const scoreLevel1 = calculateExpectedScore(1, 0, 50);
    const scoreLevel10 = calculateExpectedScore(10, 0, 50);
    expect(scoreLevel10).toBeGreaterThan(scoreLevel1);
  });
});

describe('Difficulty Progression', () => {
  const getDifficulty = (level: number): number => {
    const { baseDifficulty, minDifficulty, difficultyReductionPerLevel } = GAME_CONFIG;
    const reduction = Math.min(
      level * difficultyReductionPerLevel,
      baseDifficulty - minDifficulty
    );
    return baseDifficulty - reduction;
  };

  const getTimeForLevel = (level: number): number => {
    const { baseTimeMs, minTimeMs, timeReductionPerLevel } = GAME_CONFIG;
    const reduction = Math.min(level * timeReductionPerLevel, baseTimeMs - minTimeMs);
    return baseTimeMs - reduction;
  };

  it('starts at base difficulty', () => {
    expect(getDifficulty(1)).toBe(GAME_CONFIG.baseDifficulty - GAME_CONFIG.difficultyReductionPerLevel);
  });

  it('difficulty decreases (gets harder) each level', () => {
    const diff1 = getDifficulty(1);
    const diff5 = getDifficulty(5);
    const diff10 = getDifficulty(10);

    expect(diff5).toBeLessThan(diff1);
    expect(diff10).toBeLessThan(diff5);
  });

  it('difficulty never goes below minimum', () => {
    const diffLevel100 = getDifficulty(100);
    expect(diffLevel100).toBeGreaterThanOrEqual(GAME_CONFIG.minDifficulty);
  });

  it('time starts at base time', () => {
    expect(getTimeForLevel(1)).toBe(GAME_CONFIG.baseTimeMs - GAME_CONFIG.timeReductionPerLevel);
  });

  it('time decreases each level', () => {
    const time1 = getTimeForLevel(1);
    const time5 = getTimeForLevel(5);
    const time10 = getTimeForLevel(10);

    expect(time5).toBeLessThan(time1);
    expect(time10).toBeLessThan(time5);
  });

  it('time never goes below minimum', () => {
    const timeLevel100 = getTimeForLevel(100);
    expect(timeLevel100).toBeGreaterThanOrEqual(GAME_CONFIG.minTimeMs);
  });
});

describe('useGame Hook - Initial State', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useGame());

    expect(result.current.gameState).toEqual({
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
    });
    expect(result.current.roundState).toBeNull();
    expect(result.current.feedback).toBeNull();
  });
});

describe('useGame Hook - Game Start', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts game and sets isPlaying to true', () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    expect(result.current.gameState.isPlaying).toBe(true);
  });

  it('generates round state after starting', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    // Run timers to allow round generation
    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });
  });

  it('round state has correct number of choices', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      const roundState = result.current.roundState;
      // Color-match has 4 choices, color-wheel has 3
      expect(roundState?.choices.length).toBeGreaterThanOrEqual(3);
      expect(roundState?.choices.length).toBeLessThanOrEqual(GAME_CONFIG.choiceCount);
    });
  });

  it('color-match round includes target color in choices', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      const roundState = result.current.roundState;
      if (roundState && isColorMatchRound(roundState)) {
        expect(roundState.choices).toContain(roundState.targetColor.hex);
      }
    });
  });

  it('color-match round starts with full time', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      const roundState = result.current.roundState;
      if (roundState && isColorMatchRound(roundState)) {
        expect(roundState.timeLeft).toBe(100);
      }
    });
  });
});

describe('useGame Hook - Correct Answer', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('increments score on correct answer', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState;
    const initialScore = result.current.gameState.score;

    // Handle based on challenge type
    if (roundState && isColorMatchRound(roundState)) {
      act(() => {
        result.current.handleChoice(roundState.targetColor.hex);
      });
    } else if (roundState) {
      // Color wheel round - pass correct index
      act(() => {
        result.current.handleChoice(roundState.correctChoiceIndex);
      });
    }

    expect(result.current.gameState.score).toBeGreaterThan(initialScore);
  });

  it('increments streak on correct answer', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState;

    if (roundState && isColorMatchRound(roundState)) {
      act(() => {
        result.current.handleChoice(roundState.targetColor.hex);
      });
    } else if (roundState) {
      act(() => {
        result.current.handleChoice(roundState.correctChoiceIndex);
      });
    }

    expect(result.current.gameState.streak).toBe(1);
  });

  it('increments level on correct answer', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState;

    if (roundState && isColorMatchRound(roundState)) {
      act(() => {
        result.current.handleChoice(roundState.targetColor.hex);
      });
    } else if (roundState) {
      act(() => {
        result.current.handleChoice(roundState.correctChoiceIndex);
      });
    }

    expect(result.current.gameState.level).toBe(2);
  });

  it('updates correctAnswers and totalAnswers', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState;

    if (roundState && isColorMatchRound(roundState)) {
      act(() => {
        result.current.handleChoice(roundState.targetColor.hex);
      });
    } else if (roundState) {
      act(() => {
        result.current.handleChoice(roundState.correctChoiceIndex);
      });
    }

    expect(result.current.gameState.correctAnswers).toBe(1);
    expect(result.current.gameState.totalAnswers).toBe(1);
  });

  it('sets feedback to correct', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState;

    if (roundState && isColorMatchRound(roundState)) {
      act(() => {
        result.current.handleChoice(roundState.targetColor.hex);
      });
    } else if (roundState) {
      act(() => {
        result.current.handleChoice(roundState.correctChoiceIndex);
      });
    }

    expect(result.current.feedback).toBe('correct');
  });

  it('updates maxStreak when streak exceeds it', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    // First correct answer
    const firstRound = result.current.roundState;
    if (firstRound && isColorMatchRound(firstRound)) {
      const hex = firstRound.targetColor.hex;
      act(() => {
        result.current.handleChoice(hex);
      });
    } else if (firstRound) {
      const idx = firstRound.correctChoiceIndex;
      act(() => {
        result.current.handleChoice(idx);
      });
    }

    expect(result.current.gameState.maxStreak).toBe(1);

    // Wait for next round
    act(() => {
      jest.advanceTimersByTime(GAME_CONFIG.roundTransitionMs);
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    // Second correct answer
    const secondRound = result.current.roundState;
    if (secondRound && isColorMatchRound(secondRound)) {
      const hex = secondRound.targetColor.hex;
      act(() => {
        result.current.handleChoice(hex);
      });
    } else if (secondRound) {
      const idx = secondRound.correctChoiceIndex;
      act(() => {
        result.current.handleChoice(idx);
      });
    }

    expect(result.current.gameState.maxStreak).toBe(2);
  });
});

describe('useGame Hook - Incorrect Answer', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resets streak on incorrect answer', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    // Find a wrong choice
    const roundState = result.current.roundState!;
    if (isColorMatchRound(roundState)) {
      const wrongChoice = roundState.choices.find(
        (c) => c.toUpperCase() !== roundState.targetColor.hex.toUpperCase()
      );
      act(() => {
        result.current.handleChoice(wrongChoice!);
      });
    } else {
      // Color wheel - pick wrong index
      const wrongIndex = (roundState.correctChoiceIndex + 1) % roundState.choices.length;
      act(() => {
        result.current.handleChoice(wrongIndex);
      });
    }

    expect(result.current.gameState.streak).toBe(0);
  });

  it('does not change score on incorrect answer', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const initialScore = result.current.gameState.score;
    const roundState = result.current.roundState!;

    if (isColorMatchRound(roundState)) {
      const wrongChoice = roundState.choices.find(
        (c) => c.toUpperCase() !== roundState.targetColor.hex.toUpperCase()
      );
      act(() => {
        result.current.handleChoice(wrongChoice!);
      });
    } else {
      const wrongIndex = (roundState.correctChoiceIndex + 1) % roundState.choices.length;
      act(() => {
        result.current.handleChoice(wrongIndex);
      });
    }

    expect(result.current.gameState.score).toBe(initialScore);
  });

  it('increments totalAnswers but not correctAnswers', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState!;

    if (isColorMatchRound(roundState)) {
      const wrongChoice = roundState.choices.find(
        (c) => c.toUpperCase() !== roundState.targetColor.hex.toUpperCase()
      );
      act(() => {
        result.current.handleChoice(wrongChoice!);
      });
    } else {
      const wrongIndex = (roundState.correctChoiceIndex + 1) % roundState.choices.length;
      act(() => {
        result.current.handleChoice(wrongIndex);
      });
    }

    expect(result.current.gameState.correctAnswers).toBe(0);
    expect(result.current.gameState.totalAnswers).toBe(1);
  });

  it('sets feedback to incorrect', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState!;

    if (isColorMatchRound(roundState)) {
      const wrongChoice = roundState.choices.find(
        (c) => c.toUpperCase() !== roundState.targetColor.hex.toUpperCase()
      );
      act(() => {
        result.current.handleChoice(wrongChoice!);
      });
    } else {
      const wrongIndex = (roundState.correctChoiceIndex + 1) % roundState.choices.length;
      act(() => {
        result.current.handleChoice(wrongIndex);
      });
    }

    expect(result.current.feedback).toBe('incorrect');
  });
});

describe('useGame Hook - Game Over', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ends game after maxWrongAnswers', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    // Make wrong choices until game ends
    for (let i = 0; i < GAME_CONFIG.maxWrongAnswers; i++) {
      act(() => {
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(result.current.roundState).not.toBeNull();
      });

      if (!result.current.gameState.isPlaying) break;

      const roundState = result.current.roundState!;

      if (isColorMatchRound(roundState)) {
        const wrongChoice = roundState.choices.find(
          (c) => c.toUpperCase() !== roundState.targetColor.hex.toUpperCase()
        );
        act(() => {
          result.current.handleChoice(wrongChoice!);
        });
      } else {
        const wrongIndex = (roundState.correctChoiceIndex + 1) % roundState.choices.length;
        act(() => {
          result.current.handleChoice(wrongIndex);
        });
      }

      act(() => {
        jest.advanceTimersByTime(2000);
      });
    }

    await waitFor(() => {
      expect(result.current.gameState.isPlaying).toBe(false);
    });
  });
});

describe('useGame Hook - Reset Game', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resets all game state', async () => {
    const { result } = renderHook(() => useGame());

    // Start and play
    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    // Make a correct choice
    const roundState = result.current.roundState;
    if (roundState && isColorMatchRound(roundState)) {
      act(() => {
        result.current.handleChoice(roundState.targetColor.hex);
      });
    } else if (roundState) {
      act(() => {
        result.current.handleChoice(roundState.correctChoiceIndex);
      });
    }

    // Reset
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState).toEqual({
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
    });
    expect(result.current.roundState).toBeNull();
    expect(result.current.feedback).toBeNull();
  });
});

describe('useGame Hook - Processing Choice Guard', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('ignores choices while processing', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState;
    let correctAnswer: string | number;

    if (roundState && isColorMatchRound(roundState)) {
      correctAnswer = roundState.targetColor.hex;
    } else if (roundState) {
      correctAnswer = roundState.correctChoiceIndex;
    } else {
      return;
    }

    // First choice
    act(() => {
      result.current.handleChoice(correctAnswer);
    });

    const scoreAfterFirst = result.current.gameState.score;

    // Second choice while processing (should be ignored)
    act(() => {
      result.current.handleChoice(correctAnswer);
    });

    expect(result.current.gameState.score).toBe(scoreAfterFirst);
    expect(result.current.gameState.correctAnswers).toBe(1);
  });

  it('ignores choices when not playing', () => {
    const { result } = renderHook(() => useGame());

    // Try to make choice without starting game
    act(() => {
      result.current.handleChoice('#FF0000');
    });

    expect(result.current.gameState.totalAnswers).toBe(0);
  });
});

describe('useGame Hook - Case Insensitive Color Matching', () => {
  beforeEach(() => {
    resetMockTime();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('matches colors case-insensitively', async () => {
    const { result } = renderHook(() => useGame());

    act(() => {
      result.current.startGame();
    });

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(result.current.roundState).not.toBeNull();
    });

    const roundState = result.current.roundState;

    if (roundState && isColorMatchRound(roundState)) {
      const lowercaseHex = roundState.targetColor.hex.toLowerCase();
      act(() => {
        result.current.handleChoice(lowercaseHex);
      });
      expect(result.current.gameState.correctAnswers).toBe(1);
    } else if (roundState) {
      // Color wheel uses index, not case-sensitive
      act(() => {
        result.current.handleChoice(roundState.correctChoiceIndex);
      });
      expect(result.current.gameState.correctAnswers).toBe(1);
    }
  });
});
