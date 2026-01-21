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

// Unified Challenge Types
export type ChallengeType = 'color-match' | 'color-wheel';

export interface ColorMatchRound {
  challengeType: 'color-match';
  targetColor: ColorOption;
  choices: string[];
  correctIndex: number;
  timeLeft: number;
}

export interface ColorWheelRound {
  challengeType: 'color-wheel';
  wheelColors: [string, string, string];
  missingIndex: number;
  correctColor: string;
  choices: string[];
  correctChoiceIndex: number;
  timeLeft: number;
}

export type UnifiedRoundState = ColorMatchRound | ColorWheelRound;

// Tutorial mechanic tracking
export type TutorialMechanic =
  | 'color-match'
  | 'color-wheel'
  | 'timer'
  | 'streak'
  | 'lives'
  | 'castle-building';

// Castle progress stages
export type CastleStage = 'foundation' | 'walls' | 'tower' | 'details' | 'crown';

export interface CastleProgress {
  stage: CastleStage;
  percentage: number;
}
