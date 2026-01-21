export type GameScreen = 'start' | 'game' | 'result' | 'tutorial' | 'history';

export type GameMode = 'zen' | 'unified';

export interface ColorOption {
  hex: string;
  name: string;
}

export interface GameState {
  level: number;
  score: number;
  streak: number;
  maxStreak: number;
  correctAnswers: number;
  totalAnswers: number;
  isPlaying: boolean;
  processingChoice: boolean;
  mode: GameMode;
  wrongAnswers: number;
  roundsSinceSwitch: number;
  answerColors: string[]; // Colors from correct answers for castle windows
}

// Legacy RoundState for backwards compatibility
export interface RoundState {
  targetColor: ColorOption;
  choices: string[];
  correctIndex: number;
  timeLeft: number;
}

export type FeedbackType = 'correct' | 'incorrect' | 'timeout' | null;

// Harmony Types - all color relationship challenges
export type HarmonyType =
  | 'color-match'
  | 'triadic'
  | 'complementary'
  | 'split-complementary'
  | 'analogous'
  | 'tetradic'
  | 'double-complementary'
  | 'monochromatic';

// Zen mode harmony filter - 'all' for rotation, or specific harmony type
export type ZenHarmonyFilter = 'all' | HarmonyType;

// Legacy alias for backwards compatibility
export type ChallengeType = 'color-match' | 'color-wheel';

// Harmony configuration for unlock system
export interface HarmonyConfig {
  type: HarmonyType;
  name: string;
  description: string;
  unlockThreshold: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  weight: number;
}

// Round types for each harmony
export interface ColorMatchRound {
  challengeType: 'color-match';
  targetColor: ColorOption;
  choices: string[];
  correctIndex: number;
  timeLeft: number;
}

export interface TriadicRound {
  challengeType: 'triadic';
  wheelColors: [string, string, string];
  missingIndex: number;
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

export interface ComplementaryRound {
  challengeType: 'complementary';
  baseColor: string;
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

export interface SplitComplementaryRound {
  challengeType: 'split-complementary';
  baseColor: string;
  visibleSplitColor: string;
  missingPosition: 'split1' | 'split2';
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

export interface AnalogousRound {
  challengeType: 'analogous';
  visibleColors: [string, string];
  flowDirection: 'clockwise' | 'counter-clockwise';
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

export interface TetradicRound {
  challengeType: 'tetradic';
  wheelColors: [string, string, string, string];
  missingIndex: 0 | 1 | 2 | 3;
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

export interface DoubleComplementaryRound {
  challengeType: 'double-complementary';
  visibleColors: [string, string, string];
  missingPosition: 0 | 1 | 2 | 3;
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

export interface MonochromaticRound {
  challengeType: 'monochromatic';
  baseHue: number;
  visibleShades: [string, string];
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

// Legacy alias for ColorWheelRound
export type ColorWheelRound = TriadicRound;

export type UnifiedRoundState =
  | ColorMatchRound
  | TriadicRound
  | ComplementaryRound
  | SplitComplementaryRound
  | AnalogousRound
  | TetradicRound
  | DoubleComplementaryRound
  | MonochromaticRound;

// Tutorial mechanic tracking
export type TutorialMechanic =
  | 'color-match'
  | 'triadic'
  | 'complementary'
  | 'split-complementary'
  | 'analogous'
  | 'tetradic'
  | 'double-complementary'
  | 'monochromatic'
  | 'timer'
  | 'streak'
  | 'lives'
  | 'game-rules'
  | 'zen-rules'
  | 'info-overview';

// Castle progress stages
export type CastleStage = 'foundation' | 'walls' | 'tower' | 'details' | 'crown';

export interface CastleProgress {
  stage: CastleStage;
  percentage: number;
}
