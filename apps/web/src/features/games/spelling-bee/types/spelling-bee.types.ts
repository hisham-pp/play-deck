export type SpellingBeeMode = 'solo' | 'race' | 'relay' | 'daily';

export type SpellingBeeRank =
  'Beginner' | 'Good' | 'Solid' | 'Great' | 'Amazing' | 'Genius' | 'Queen Bee';

export interface HoneycombPuzzle {
  id: string;
  centerLetter: string; // single uppercase character, e.g. 'A'
  outerLetters: string[]; // 6 uppercase characters, e.g. ['C', 'T', 'L', 'O', 'M', 'N']
  pangrams: string[]; // words using all 7 letters
  validWords: string[]; // all legal words of length >= 4 containing center letter
  maxScore: number;
}

export interface FoundWord {
  word: string;
  score: number;
  isPangram: boolean;
  discoveredAt: number;
}

export interface SpellingBeePlayer {
  id: string;
  displayName: string;
  avatar: string;
  isHost: boolean;
  isBot: boolean;
  score: number;
  foundWords: FoundWord[];
  rank: SpellingBeeRank;
}

export interface SpellingBeeState {
  puzzle: HoneycombPuzzle;
  mode: SpellingBeeMode;
  status: 'lobby' | 'playing' | 'game-over';
  timeRemaining: number; // in seconds for race mode
  roundDuration: number;
  currentInput: string;
  feedbackMessage?: string;
  feedbackType?: 'valid' | 'invalid' | 'pangram' | 'already-found';
  players: SpellingBeePlayer[];
  activePlayerIndex?: number; // for relay mode
}

export interface WordValidationResult {
  isValid: boolean;
  reason?:
    'too-short' | 'missing-center' | 'invalid-letter' | 'not-in-dictionary' | 'already-found';
  score: number;
  isPangram: boolean;
}
