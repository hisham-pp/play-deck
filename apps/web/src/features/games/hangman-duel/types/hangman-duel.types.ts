export type HangmanMode = 'classic' | 'speed' | 'battle' | 'solo';

export type HangmanStatus =
  'setup' | 'word-select' | 'countdown' | 'guessing' | 'paused' | 'round-over' | 'finished';

export type HangmanCategory = 'animals' | 'movies' | 'food' | 'places' | 'professions' | 'objects';

export type HangmanDifficulty = 'easy' | 'medium' | 'hard';

export interface HangmanBankWord {
  word: string;
  category: HangmanCategory;
  difficulty: HangmanDifficulty;
}

export interface HangmanPlayer {
  id: string;
  name: string;
  score: number;
  roundsWon: number;
  lettersFound: number;
  wordsSolved: number;
  /** Rounds this player set a word nobody cracked. */
  roundsDefended: number;
}

/**
 * One guessing surface. Classic, speed and solo share a single board; battle
 * mode gives every guesser their own, so a wrong letter only costs its author.
 */
export interface HangmanBoard {
  guessedLetters: string[];
  wrongLetters: string[];
  wrongCount: number;
  solved: boolean;
  /** Battle mode only — this guesser used every allowed miss. */
  out: boolean;
}

export type HangmanRejection =
  | 'not-a-letter'
  | 'already-guessed'
  | 'too-short'
  | 'too-long'
  | 'letters-only'
  | 'wrong-length'
  | 'not-your-turn';

export interface HangmanRules {
  mode: HangmanMode;
  category: HangmanCategory | null;
  difficulty: HangmanDifficulty | null;
  /** Wrong guesses allowed before the round is lost. */
  allowedMisses: number;
  totalRounds: number;
  /** Seconds a guess may take in speed mode. */
  turnSeconds: number;
  showCategory: boolean;
  revealFirstLetter: boolean;
}

export interface HangmanRoundOutcome {
  word: string;
  category: HangmanCategory | null;
  setterId: string | null;
  setterName: string | null;
  solvedById: string | null;
  solvedByName: string | null;
  /** Letters still hidden when the round ended. */
  unrevealed: number;
  awarded: Record<string, number>;
}

export interface HangmanState {
  status: HangmanStatus;
  rules: HangmanRules;
  players: HangmanPlayer[];
  round: number;
  /** Index into `players` of the word setter, or -1 in solo mode. */
  setterIndex: number;
  /** Index into `players` of whoever guesses next. */
  turnIndex: number;
  secret: string;
  category: HangmanCategory | null;
  /** Letters handed over for free by the first-letter hint. */
  freeLetters: string[];
  boards: Record<string, HangmanBoard>;
  turnStartedAt: number;
  lastRejection: HangmanRejection | null;
  message: string;
  roundOutcome: HangmanRoundOutcome | null;
  winnerIds: string[];
}

export interface HangmanStats {
  gamesPlayed: number;
  roundsWon: number;
  wordsSolved: number;
  bestScore: number;
  /** Fewest misses used on a solved word. */
  cleanestSolve: number | null;
  lastMode: HangmanMode | null;
  lastPlayedAt: string;
}

export interface HangmanSetupPlayer {
  name: string;
}
