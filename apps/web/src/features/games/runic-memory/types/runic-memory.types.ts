export type GameMode = 'solo' | 'ai' | 'pass-and-play' | 'multiplayer';

export type DifficultyLevel = 'novice' | 'apprentice' | 'master' | 'elder';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'idle' | 'playing' | 'checking' | 'completed' | 'paused';

export type ActivePlayer = 'P1' | 'P2';

export interface RuneDefinition {
  id: string;
  name: string;
  glyph: string; // Unicode Elder Futhark rune
  meaning: string;
  element: 'fire' | 'ice' | 'storm' | 'earth' | 'solar' | 'celestial';
  primaryColor: string; // Tailwind / Hex glow color
  secondaryColor: string;
  frequency: number; // Harmonic pitch for Web Audio synthesis (Hz)
}

export interface RunicCard {
  id: string; // unique card id in deck e.g. card-0-fehu
  index: number; // grid position 0..N-1
  runeId: string;
  rune: RuneDefinition;
  isFlipped: boolean;
  isMatched: boolean;
  matchedBy?: ActivePlayer;
}

export interface RunicScores {
  P1: number;
  P2: number;
}

export interface GridConfig {
  level: DifficultyLevel;
  label: string;
  columns: number;
  rows: number;
  totalCards: number;
  pairsCount: number;
  timeTargetSeconds: number;
  turnTarget: number;
}

export interface RunicGameState {
  mode: GameMode;
  difficulty: DifficultyLevel;
  aiDifficulty: AIDifficulty;
  status: GameStatus;
  turn: ActivePlayer;
  board: RunicCard[];
  selectedIndices: number[];
  scores: RunicScores;
  moves: number; // Number of flip attempts (turns)
  matches: number; // Total matched pairs found
  combo: number; // Consecutive match streak
  maxCombo: number;
  startTime: number | null;
  elapsedSeconds: number;
  isAiThinking: boolean;
  winner: ActivePlayer | 'tie' | null;
  seed: number;
}

export interface RunicStats {
  bestTime: number | null;
  leastMoves: number | null;
  totalGamesWon: number;
  totalMatchesFound: number;
  highestCombo: number;
}
