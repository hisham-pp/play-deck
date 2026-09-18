export type WordChainMode = 'classic' | 'points' | 'team' | 'solo';

export type WordChainVariant =
  'last-letter' | 'last-two-letters' | 'category-lock' | 'escalating-timer' | 'length-requirement';

export type WordChainStatus = 'setup' | 'countdown' | 'playing' | 'paused' | 'finished';

export type WordChainCategory = 'animals' | 'food' | 'places' | 'objects';

export type WordChainTeam = 'a' | 'b';

export interface WordChainPlayer {
  id: string;
  name: string;
  team: WordChainTeam;
  lives: number;
  score: number;
  wordsPlayed: number;
  longestWord: string;
  eliminated: boolean;
}

export interface WordChainEntry {
  word: string;
  playerId: string;
  playerName: string;
  points: number;
  /** Milliseconds the player took to answer, used for the speed bonus. */
  elapsedMs: number;
  isSpeedBonus: boolean;
}

export type WordChainRejection =
  | 'too-short'
  | 'wrong-start'
  | 'repeated'
  | 'not-a-word'
  | 'too-short-for-round'
  | 'wrong-category';

export interface WordChainRules {
  mode: WordChainMode;
  variant: WordChainVariant;
  category: WordChainCategory | null;
  /** Lives each player starts with. Ignored by the points mode. */
  lives: number;
  /** Seconds allowed on the first turn. */
  startingSeconds: number;
  /** Fixed number of rounds played in the points mode. */
  totalRounds: number;
  minWordLength: number;
}

export interface WordChainState {
  status: WordChainStatus;
  rules: WordChainRules;
  players: WordChainPlayer[];
  /** Index into `players` of whoever must answer now. */
  turnIndex: number;
  /** Completed turns so far — drives the escalating timer and round counting. */
  turnCount: number;
  round: number;
  chain: WordChainEntry[];
  usedWords: string[];
  /** The prefix the next word must start with, already lower-cased. */
  requiredPrefix: string;
  turnSeconds: number;
  turnStartedAt: number;
  lastRejection: WordChainRejection | null;
  /** Free-form line announced to screen readers and shown under the input. */
  message: string;
  winnerIds: string[];
  winningTeam: WordChainTeam | null;
}

export interface WordChainStats {
  gamesPlayed: number;
  gamesWon: number;
  longestChain: number;
  bestScore: number;
  longestWord: string;
  lastMode: WordChainMode | null;
  lastPlayedAt: string;
}

export interface WordChainSetupPlayer {
  name: string;
  team: WordChainTeam;
}
